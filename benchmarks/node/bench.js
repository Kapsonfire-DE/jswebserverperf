import {
    readdirSync,
    mkdirSync,
    existsSync,
    writeFileSync,
    appendFileSync,
    readFileSync
}                                      from 'fs'
import rimraf                          from 'rimraf'
import {$}                             from 'zx'
import {dirname}                       from 'path';
import {fileURLToPath}                 from 'url';
import systeminfo                      from "../systeminfo.js";
import {shrinkPackageName, getResults} from "../helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsPath = __dirname + '/../../results/node';
let frameworks = JSON.parse(readFileSync(__dirname + '/frameworks.json', 'utf-8'))

const port = '3000';

const commands = [
    `bombardier --fasthttp -c 500 -p r  -d 10s http://localhost:${port}/`,
    `bombardier --fasthttp -c 500 -p r  -d 10s http://localhost:${port}/id/1?name=node`,
    `bombardier --fasthttp -c 500 -p r  -d 10s -m POST -H 'Content-Type: application/json' -f ${__dirname}/../body.json http://localhost:${port}/json`
]

const catchNumber = /Reqs\/sec\s+(\d+[.|,]\d+)/m
const format = Intl.NumberFormat('en-US').format


if (existsSync(resultsPath + '/')) {
    rimraf.sync(resultsPath + '/')
}
mkdirSync(resultsPath + '/', {recursive: true})

const sleep = (s = 1) => new Promise((resolve) => setTimeout(resolve, s * 1000))

writeFileSync(
    resultsPath + '/results.md',
    `
|  Framework       |  Get (/)    |  Params, query & header | Post JSON  |
| ---------------- | ----------- | ----------------------- | ---------- |
`
)
const versions = JSON.parse((await $`npm ls --json`.quiet()).stdout);
const nodeVersion = ((await $`node --version`.quiet()) + '').trim();
frameworks = frameworks.sort((a, b) => a.name.localeCompare(b.name));
versions.dependencies['Node'] = {version: nodeVersion};
let jsonResults = {};

systeminfo['runtime'] = `node ${nodeVersion}`;
systeminfo['date'] = (new Date()).toUTCString();
console.log(JSON.stringify(systeminfo));

for (const framework of frameworks) {
    let frameWorkResult = [];
    let name = framework.name;
    let npmVersion = versions.dependencies[shrinkPackageName(framework.npmName)]?.version ?? 'unknown';


    console.log(`\n${name}: ${framework.npmName}@${npmVersion}\n`)


    writeFileSync(resultsPath + `/${name}.txt`, '')
    appendFileSync(resultsPath + '/results.md', `| ${framework.npmName}@${npmVersion} `)
    let server;
    try {
        server = $`ENV=production PORT=${port} node ${__dirname}/${framework.entryPoint}`.quiet().nothrow()

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
    } catch (ex) {
        console.error(ex);
    } finally {
        await server.kill()
    }
    jsonResults[framework.npmName] = {
        version: npmVersion,
        results: frameWorkResult
    };
    appendFileSync(resultsPath + '/results.md', `|\n`)
}


appendFileSync(
    resultsPath + '/results.md',
    `
    
    
    
|  SystemInfo       |  Value |
| ----------------  | ---------- |
`
)


for (let k in systeminfo) {
    appendFileSync(
        resultsPath + '/results.md',
        `| ${k} | ${systeminfo[k]} |
`
    )
}

writeFileSync(resultsPath + '/results.json', JSON.stringify({
                                                                systeminfo,
                                                                results: jsonResults
                                                            }));
