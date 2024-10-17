/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs';
/**
 *
 * @class TuntapBase
 */
export declare class TuntapBase {
    _deviceMode: 'tun' | 'tap';
    _fd: number;
    _ifName: string;
    _isUp: boolean;
    protected readonly readStream: fs.ReadStream;
    protected readonly writeStream: fs.WriteStream;
    /**
     * Creates an instance of TuntapBase.
     * @param {('tun' | 'tap')} mode
     * @memberof TuntapBase
     * @since 0.0.1
     */
    constructor(mode: 'tun' | 'tap');
    /**
     * release writeStreams, readStreams and the file descriptor.
     * @memberof TuntapBase
     */
    release(callback?: (err?: NodeJS.ErrnoException) => void): void;
    /**
     * many get methods, like ipv4, ipv6 ...
     * implemented via `os.networkInterfaces()`
     * The device needs to set 'up' to be visible in the `os.networkInterfaces()`
     * @private
     * @memberof TuntapBase
     */
    private makeSureIsUp;
    get name(): string;
    get isTap(): boolean;
    get isTun(): boolean;
    get isUp(): boolean;
    set isUp(activate: boolean);
    get mac(): string;
    set mac(mac: string);
    get mtu(): number;
    set mtu(mtu: number);
    get ipv4(): string;
    set ipv4(ip: string);
    get ipv6(): string;
    set ipv6(ip: string);
    /**
     * @deprecated Please use on('data',callback);
     * @memberof TuntapBase
     */
    onReceive(): void;
    /**
     * @deprecated Please use write(chunk,callback);
     * @memberof TuntapBase
     */
    writePacket(): void;
}
