"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const node_child_process_1 = require("node:child_process");
const MacTunAddon = os.platform() === 'darwin'
    ? require("../../../../build/Release/tuntap2Addon")
    : undefined;
// === 全局代理，指定 mask ===
function applyGlobalMask(rule, tunName) {
    if (!(rule === null || rule === void 0 ? void 0 : rule.subnet))
        throw new Error('subnet is required');
    if (!tunName)
        throw new Error('tunName is required');
    // 删除旧路由（忽略错误）
    try {
        (0, node_child_process_1.execSync)(`sudo route delete -net ${rule.subnet} -interface ${tunName}`);
    }
    catch (_a) { }
    // 添加路由，让指定 mask 流量走 TUN
    (0, node_child_process_1.execSync)(`sudo route add -net ${rule.subnet} -interface ${tunName}`);
    console.log(`[Global TUN] Route ${rule.subnet} via ${tunName} applied`);
}
// === 删除 mask 路由 ===
function removeGlobalMask(rule, tunName) {
    if (!(rule === null || rule === void 0 ? void 0 : rule.subnet) || !tunName)
        return;
    try {
        (0, node_child_process_1.execSync)(`sudo route delete -net ${rule.subnet} -interface ${tunName}`);
        console.log(`[Global TUN] Route ${rule.subnet} via ${tunName} removed`);
    }
    catch (_a) { }
}
// === 注入新方法 ===
if (MacTunAddon) {
    MacTunAddon.applyGlobalMask = applyGlobalMask;
    MacTunAddon.removeGlobalMask = removeGlobalMask;
}
exports.default = MacTunAddon;
//# sourceMappingURL=MacTun.js.map