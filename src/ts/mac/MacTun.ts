import * as os from 'os';
import * as fs from "node:fs";
import { execSync } from "node:child_process";

export interface MaskRule {
    subnet: string; // 例如 "192.168.100.0/24" 或单个 IP
}

export interface MacTunTypes {
    createTun(): { fd: number; name: string };
    setIPv4(ip: string, peer: string): number;
    closeTun(): number;
    applyGlobalMask(rule: MaskRule, tunName: string): void;
    removeGlobalMask(rule: MaskRule, tunName: string): void;
}

const MacTunAddon: MacTunTypes = os.platform() === 'darwin'
    ? require("../../../../build/Release/tuntap2Addon")
    : undefined;

// === 全局代理，指定 mask ===
function applyGlobalMask(rule: MaskRule, tunName: string) {
    if (!rule?.subnet) throw new Error('subnet is required');
    if (!tunName) throw new Error('tunName is required');

    // 删除旧路由（忽略错误）
    try {
        execSync(`sudo route delete -net ${rule.subnet} -interface ${tunName}`);
    } catch {}

    // 添加路由，让指定 mask 流量走 TUN
    execSync(`sudo route add -net ${rule.subnet} -interface ${tunName}`);

    console.log(`[Global TUN] Route ${rule.subnet} via ${tunName} applied`);
}

// === 删除 mask 路由 ===
function removeGlobalMask(rule: MaskRule, tunName: string) {
    if (!rule?.subnet || !tunName) return;

    try {
        execSync(`sudo route delete -net ${rule.subnet} -interface ${tunName}`);
        console.log(`[Global TUN] Route ${rule.subnet} via ${tunName} removed`);
    } catch {}
}

// === 注入新方法 ===
if (MacTunAddon) {
    MacTunAddon.applyGlobalMask = applyGlobalMask;
    MacTunAddon.removeGlobalMask = removeGlobalMask;
}

export default MacTunAddon;

