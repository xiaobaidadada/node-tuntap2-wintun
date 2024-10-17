
const fs = require('fs');
const path = require('path');
let cpuArch = process.arch;

switch (cpuArch) {
    case 'arm':
    case 'arm64':
        break;
    case 'ia32':
        cpuArch = "x86";
        break;
    case 'x64':
        cpuArch = "amd64";
        break;
    default:
        // console.log('未知架构:', arch);
        break;
}
const p = path.join(__dirname, "..","wintun_dll")
const file_list = fs.readdirSync(p);
for (const file of file_list) {
    if (process.platform === 'win32') {
        const fullPath = path.join(__dirname, "..","wintun_dll", file);
        fs.unlinkSync(fullPath);
        continue;
    }
    if (!file.includes(cpuArch)) {
        const fullPath = path.join(__dirname, "..","wintun_dll", file);
        fs.unlinkSync(fullPath);
    }
}
