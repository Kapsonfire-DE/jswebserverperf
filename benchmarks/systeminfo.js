import os from "os"
const systemCpuCores = os.cpus();

const systeminfo = {
    cpuModel: `${systemCpuCores[0].model}`,
    cpuCount: `${systemCpuCores.length}`,
    cpuSpeed: `${systemCpuCores[0].speed} Mhz`,
    kernel: os.release(),
    arch: os.arch(),
    platform: os.platform(),
    memTotal: (os.totalmem()/Math.pow(1024,3)).toFixed(2) + 'G',
    memFree: (os.freemem()/Math.pow(1024,3)).toFixed(2) + 'G'
};

export default systeminfo;