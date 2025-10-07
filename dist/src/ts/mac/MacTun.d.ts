export interface MaskRule {
    subnet: string;
}
export interface MacTunTypes {
    createTun(): {
        fd: number;
        name: string;
    };
    setIPv4(ip: string, peer: string): number;
    closeTun(): number;
    applyGlobalMask(rule: MaskRule, tunName: string): void;
    removeGlobalMask(rule: MaskRule, tunName: string): void;
}
declare const MacTunAddon: MacTunTypes;
export default MacTunAddon;
