"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacTun = exports.Wintun = exports.LinuxTunTap = exports.LinuxTun = exports.LinuxTap = void 0;
const Tuntap_1 = require("./src/ts/linux/Tuntap");
const WintunAddon_1 = require("./src/ts/win/WintunAddon");
const MacTun_1 = require("./src/ts/mac/MacTun");
// this file only contains wrapper class for tuntap class.
/**
 * Tun interface, a Layer 2 virtual interface.
 * @class LinuxTun
 * @extends {TuntapB}
 */
class LinuxTun extends Tuntap_1.Tuntap {
    constructor() {
        super('tun');
    }
    /**
     * setting the mac of a Tun interface is illegal as tun devices is running on layer 3
     * @throws 'method not support by a tun device.'
     * @memberof LinuxTun
     * @since 0.1.0
     */
    set mac(mac) {
        throw new Error('method not support by a tun device.');
    }
}
exports.LinuxTun = LinuxTun;
/**
 * Tap interface, a Layer 2 virtual interface.
 * The tap device allows
 * @class LinuxTap
 * @extends {TuntapB}
 */
class LinuxTap extends Tuntap_1.Tuntap {
    constructor() {
        super('tap');
    }
}
exports.LinuxTap = LinuxTap;
const LinuxTunTap = function (options) {
    if (options.name) {
        throw `setting a name of a tuntap device is not supported`;
    }
    if (options.type != 'tun' && options.type != 'tap') {
        throw `illegal type ${options.type}`;
    }
    const device = new Tuntap_1.Tuntap(options.type);
    if (options.mtu) {
        device.mtu = options.mtu;
    }
    let mask = 32;
    if (options.mask) {
        const maskSplited = options.mask.split('.');
        if (maskSplited.length != 4) {
            throw `illegal net mask!`;
        }
        mask = 0;
        maskSplited.forEach(((segment) => {
            let numberSegment = parseInt(segment) & 0xff;
            let hasOne = false;
            for (let i = 0; i < 8; i++) {
                if (numberSegment & 0x01) {
                    hasOne = true;
                    mask++;
                }
                else {
                    if (hasOne == true) {
                        throw `illegal netmask`;
                    }
                }
                numberSegment = numberSegment >> 1;
            }
        }));
    }
    if (options.addr) {
        let addr = [options.addr, mask].join('/');
        device.ipv4 = addr;
    }
    if (options.up) {
        device.isUp = true;
    }
    return device;
};
exports.LinuxTunTap = LinuxTunTap;
const Wintun = WintunAddon_1.default;
exports.Wintun = Wintun;
const MacTun = MacTun_1.default;
exports.MacTun = MacTun;
//# sourceMappingURL=index.js.map