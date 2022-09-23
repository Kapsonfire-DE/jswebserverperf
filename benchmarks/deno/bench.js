import {
    readdirSync,
    mkdirSync,
    existsSync,
    writeFileSync,
    appendFileSync,
    readFileSync
} from 'fs'
import rimraf from 'rimraf'
import { $ } from 'zx'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import systeminfo from "../systeminfo.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsPath = '../results/deno';
let frameworks = JSON.parse(readFileSync(__dirname+'/frameworks.json', 'utf-8'))



const port = '3000';

const commands = [
    `bombardier --fasthttp -c 500 -d 10s http://localhost:${port}/`,
    `bombardier --fasthttp -c 500 -d 10s http://localhost:${port}/id/1?name=deno`,
    `bombardier --fasthttp -c 500 -d 10s -m POST -H 'Content-Type: application/json' -f ${__dirname}/../body.json http://localhost:${port}/json`
]

const catchNumber = /Reqs\/sec\s+(\d+[.|,]\d+)/m
const format = Intl.NumberFormat('en-US').format


if (existsSync(resultsPath + '/')) rimraf.sync(resultsPath + '/')
mkdirSync(resultsPath + '/', {recursive: true})

const sleep = (s = 1) => new Promise((resolve) => setTimeout(resolve, s * 1000))

writeFileSync(
    resultsPath +'/results.md',
    `
|  Framework       |  Get (/)    |  Params, query & header | Post JSON  |
| ---------------- | ----------- | ----------------------- | ---------- |
`
)
const versions = JSON.parse((await $`npm ls --json`.quiet()).stdout);
const denoVersion = ((await $`deno --version | grep deno | cut -b 6-`.quiet())+'').trim();
frameworks = frameworks.sort((a,b) => a.name.localeCompare(b.name));
versions.dependencies['Deno'] = {version: denoVersion};
let jsonResults = {};
for (const framework of frameworks) {
    let frameWorkResult = [];
    let name = framework.name;
    let npmVersion = versions.dependencies[framework.npmName]?.version ?? 'unknown';


    console.log(`\n${name}: ${framework.npmName}@${npmVersion}\n`)


    writeFileSync(resultsPath+`/${name}.txt`, '')
    appendFileSync(resultsPath+'/results.md', `| ${framework.npmName}@${npmVersion} `)

    const server = $`ENV=production PORT=${port} deno run --allow-env --import-map=${__dirname}/import-map.json ${__dirname}/${framework.entryPoint}`.quiet().nothrow()

    // Wait 5 second for server to bootup
    await sleep(5)

    for (const command of commands) {
        appendFileSync(resultsPath +`/${name}.txt`, `${command}\n`)

        const results = (await $([command])) + ''


        appendFileSync(resultsPath +`/${name}.txt`, results + '\n')
        appendFileSync(
            resultsPath +'/results.md',
            `| ${format(catchNumber.exec(results)[1])} `
        )
        frameWorkResult.push(Number((catchNumber.exec(results)[1])));
    }
    jsonResults[framework.npmName] = {
        version: npmVersion,
        results: frameWorkResult
    };
    appendFileSync(resultsPath+'/results.md', `|\n`)

    await server.kill()
}


appendFileSync(
    resultsPath +'/results.md',
    `
    
    
    
|  SystemInfo       |  Value |
| ----------------  | ---------- |
`
)

systeminfo['runtime'] = `deno ${denoVersion}`;
systeminfo['date'] = (new Date()).toUTCString();


for(let k in systeminfo) {
    appendFileSync(
        resultsPath +'/results.md',
        `| ${k} | ${systeminfo[k]} |
`
    )
}

writeFileSync(resultsPath +'/results.json', JSON.stringify({
                                                               systeminfo,
                                                               results: jsonResults
                                                           }));
