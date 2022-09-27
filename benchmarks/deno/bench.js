import {
    readdirSync,
    mkdirSync,
    existsSync,
    writeFileSync,
    appendFileSync,
    readFileSync
}                          from 'fs'
import rimraf              from 'rimraf'
import { $ }               from 'zx'
import { dirname }         from 'path';
import { fileURLToPath }   from 'url';
import systeminfo                      from "../systeminfo.js";
import {getResults, shrinkPackageName} from "../helpers.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsPath = __dirname + '/../../results/deno';
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

function strReplacer(inp) {
    return inp.replaceAll('$__dirname', __dirname);
}

for (const framework of frameworks) {
    let frameWorkResult = [];
    let name = framework.name;
    let npmVersion = versions.dependencies[shrinkPackageName(framework.npmName)]?.version ?? 'unknown';


    console.log(`\n${name}: ${framework.npmName}@${npmVersion}\n`)


    writeFileSync(resultsPath+`/${name}.txt`, '')
    appendFileSync(resultsPath+'/results.md', `| ${framework.npmName}@${npmVersion} `)

    let server;
    try {


        server = $`ENV=production PORT=${port} deno run ${strReplacer(framework.entryPointFlags ?? '')} --unstable --allow-all --allow-env ${__dirname}/${framework.entryPoint}`.nothrow();

        console.log(server._command);
        // Wait 5 second for server to bootup
        await sleep(5)

        for (const command of commands) {
            appendFileSync(resultsPath + `/${name}.txt`, `${command}\n`)

            const results = (await $([command])) + ''
            let result = getResults(results);

            appendFileSync(resultsPath + `/${name}.txt`, results + '\n')
            appendFileSync(
                resultsPath + '/results.md',
                `| ${result} `
            )
            frameWorkResult.push(Number(result));
        }
    } catch(ex) {
        console.error(ex);
    } finally {
        await server.kill()
    }
    jsonResults[framework.npmName] = {
        version: npmVersion,
        results: frameWorkResult
    };
    appendFileSync(resultsPath+'/results.md', `|\n`)


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
