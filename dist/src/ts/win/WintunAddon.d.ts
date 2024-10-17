/// <reference types="node" />
export interface WintunAddonTypes {
    /**
     * 初始化wintun 并返回 wintun句柄
     */
    wintunInit: () => number;
    /**
     * 设置Ip并返回适配器
     * @param name 适配器名字
     * @param ip ip
     * @param mask ip的掩码
     */
    wintunSetIpv4: (name: string, ip: string, mask: number) => number;
    /**
     *  开始，并监适配器ip包数据，并返回线程句柄
     * @param sessionHandle
     * @param handler
     */
    wintunUpOn: (handler: (data: Buffer) => void) => number;
    /**
     * 关闭所有句柄
     * @param threadHandle
     * @param adapter
     * @param Session
     * @param Wintun
     */
    wintunClose: () => number;
    /**
     * 发送数据到网卡session
     * @param Session
     * @param data
     */
    wintunSend: (data: Buffer) => number;
    /**
     * 设置dll路径
     * @param dllPath
     */
    wintunSetPath(dllPath: string): void;
    /**
     * 获取dll的路径
     */
    get_wintun_dll_path(): string;
}
declare const WintunAddon: WintunAddonTypes;
export default WintunAddon;
