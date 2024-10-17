"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuntapBase = void 0;
const Tuntap2Addon_1 = require("./Tuntap2Addon");
const fs = require("fs");
const os = require("os");
const jmespath = require("jmespath");
/**
 *
 * @class TuntapBase
 */
class TuntapBase {
    /**
     * Creates an instance of TuntapBase.
     * @param {('tun' | 'tap')} mode
     * @memberof TuntapBase
     * @since 0.0.1
     */
    constructor(mode) {
        this._isUp = false;
        this._deviceMode = mode;
        const fd = fs.openSync(`/dev/net/tun`, 'r+');
        this._fd = fd;
        this._ifName = Tuntap2Addon_1.default.tuntapInit(this._fd, mode == 'tap');
        this.readStream = fs.createReadStream('', {
            fd: this._fd,
            autoClose: true,
            emitClose: true
        });
        this.writeStream = fs.createWriteStream('', {
            fd: this._fd,
            autoClose: true,
            emitClose: true,
            fs: {
                write: fs.write,
                open: () => { return fd; },
                close: (fd, callback) => { callback(); }
            }
        });
        // const readStreamEvents = ['open', 'close', 'data', 'end', 'error', 'readable', 'pause', 'ready', 'resume']
        //transfer all events from writeStream to readStream
        //except open
        const writeStreamEvents = ['drain', 'error', 'finish', 'pipe', 'ready', 'unpipe', 'close', 'open'];
        writeStreamEvents.forEach((event) => {
            this.writeStream.addListener(event, (...rests) => {
                this.readStream.emit(event, ...rests);
            });
        });
    }
    /**
     * release writeStreams, readStreams and the file descriptor.
     * @memberof TuntapBase
     */
    release(callback) {
        this.writeStream.close(() => {
            //close two stream one by one
            this.readStream.close((error) => {
                if (callback) {
                    callback();
                }
            });
        });
    }
    ;
    /**
     * many get methods, like ipv4, ipv6 ...
     * implemented via `os.networkInterfaces()`
     * The device needs to set 'up' to be visible in the `os.networkInterfaces()`
     * @private
     * @memberof TuntapBase
     */
    makeSureIsUp() {
        if (!this.isUp) {
            throw `you must set isUp = true in order to access this method`;
        }
    }
    get name() {
        return this._ifName;
    }
    get isTap() {
        return this._deviceMode == 'tap';
    }
    get isTun() {
        return !this.isTap;
    }
    get isUp() {
        return this._isUp;
    }
    set isUp(activate) {
        if (activate) {
            Tuntap2Addon_1.default.tuntapSetUp(this._ifName);
        }
        else {
            Tuntap2Addon_1.default.tuntapSetDown(this._ifName);
        }
        this._isUp = activate;
    }
    get mac() {
        this.makeSureIsUp();
        const ifInfo = os.networkInterfaces();
        const mac = jmespath.search(ifInfo, `${this._ifName}[*].[mac]|[0]`);
        return mac;
    }
    set mac(mac) {
        Tuntap2Addon_1.default.tuntapSetMac(this._ifName, mac);
    }
    get mtu() {
        return Tuntap2Addon_1.default.tuntapGetMtu(this._ifName);
    }
    set mtu(mtu) {
        Tuntap2Addon_1.default.tuntapSetMtu(this._ifName, mtu);
    }
    get ipv4() {
        this.makeSureIsUp();
        const ifInfo = os.networkInterfaces();
        return jmespath.search(ifInfo, `${this._ifName}[?family=='IPv4'].cidr|[0]`);
    }
    set ipv4(ip) {
        const cirdArray = ip.split('/');
        if (cirdArray.length != 2) {
            throw `incorrect ip address: ${ip}`;
        }
        const ipv4Addr = cirdArray[0];
        const ipv4NetMask = Number.parseInt(cirdArray[1]);
        Tuntap2Addon_1.default.tuntapSetIpv4(this._ifName, ipv4Addr, ipv4NetMask);
    }
    get ipv6() {
        this.makeSureIsUp();
        const ifInfo = os.networkInterfaces();
        return jmespath.search(ifInfo, `${this._ifName}[?family=='IPv6'].cidr|[0]`);
    }
    set ipv6(ip) {
        const cirdArray = ip.split('/');
        if (cirdArray.length != 2) {
            throw `incorrect ipv6 address: ${ip}`;
        }
        const addr = cirdArray[0];
        const prefix = Number.parseInt(cirdArray[1]);
        const ifIndex = Tuntap2Addon_1.default.tuntapGetIfIndex(this._ifName);
        Tuntap2Addon_1.default.tuntapSetIpv6(ifIndex, addr, prefix);
    }
    /**
     * @deprecated Please use on('data',callback);
     * @memberof TuntapBase
     */
    onReceive() {
    }
    /**
     * @deprecated Please use write(chunk,callback);
     * @memberof TuntapBase
     */
    writePacket() {
    }
}
exports.TuntapBase = TuntapBase;
//# sourceMappingURL=TuntapBase.js.map