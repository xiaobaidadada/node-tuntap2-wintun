import { Tuntap } from './src/ts/linux/Tuntap';
import MacTunAddon from "./src/ts/mac/MacTun";
/**
 * Tun interface, a Layer 2 virtual interface.
 * @class LinuxTun
 * @extends {TuntapB}
 */
declare class LinuxTun extends Tuntap {
    constructor();
    /**
     * setting the mac of a Tun interface is illegal as tun devices is running on layer 3
     * @throws 'method not support by a tun device.'
     * @memberof LinuxTun
     * @since 0.1.0
     */
    set mac(mac: string);
}
/**
 * Tap interface, a Layer 2 virtual interface.
 * The tap device allows
 * @class LinuxTap
 * @extends {TuntapB}
 */
declare class LinuxTap extends Tuntap {
    constructor();
}
declare const LinuxTunTap: (options: any) => Tuntap;
declare const Wintun: import("./src/ts/win/WintunAddon").WintunAddonTypes;
export { LinuxTap, LinuxTun, LinuxTunTap, Wintun, MacTunAddon };
