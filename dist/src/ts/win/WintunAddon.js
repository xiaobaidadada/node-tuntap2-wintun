"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("node:path");
const os = require("os");
function get_wintun_dll_path() {
    let cpuArch = os.arch();
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
    const winfilename = `wintun${cpuArch ? `-${cpuArch}` : ''}.dll`;
    return path.join(__dirname, "../../../../wintun_dll", winfilename);
}
const WintunAddon = os.platform() === 'win32' ? require("../../../../build/Debug/tuntap2Addon") : undefined;
if (WintunAddon) {
    WintunAddon.get_wintun_dll_path = get_wintun_dll_path;
}
exports.default = WintunAddon;
//# sourceMappingURL=WintunAddon.js.map