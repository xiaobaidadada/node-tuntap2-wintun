/// <reference types="node" />
/// <reference types="node" />
import { TuntapBase } from './TuntapBase';
import { TuntapI } from './TuntapI';
export declare class Tuntap extends TuntapBase implements TuntapI {
    writableNeedDrain: boolean;
    closed: boolean;
    errored: Error;
    /**
     * Return the value of `highWaterMark`
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableHighWaterMark(): number;
    /**
     * This property contains the number of bytes  in the queue
     * ready to be written. The value provides introspection data regarding
     * the status of the `highWaterMark`.
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableLength(): number;
    /**
     * Getter for the property `objectMode`
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableObjectMode(): boolean;
    /**
     *
     * Number of times `writable.uncork()` needs to be
     * called in order to fully uncork the stream.
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     *
     * @readonly
     * @type {number}
     * @memberof Tuntap
     * @since v0.1.0
     */
    get writableCorked(): number;
    /**
     *
     * always `false`
     * @readonly
     * @type {boolean}
     * @memberof Tuntap
     */
    get allowHalfOpen(): boolean;
    /**
     *
     *
     * This method is a function wrapper of the same name method in `fs.WriteStream`
     * It will pass all arguments to `fs.WriteStream._write`
     * @see fs.WriteStream for details
     *
     * @inheritdoc
     * @param {*} chunk
     * @param {BufferEncoding} encoding
     * @param {(error?: Error) => void} callback
     * @return {*}  {void}
     * @memberof Tuntap
     */
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error) => void): void;
    /**
     * This methods is not allowed for tuntap.
     * @throws `'Method not implemented.'`
     *
     * @inheritdoc
     * @param {{ chunk: any; encoding: BufferEncoding; }[]} chunks
     * @param {(error?: Error) => void} callback
     * @memberof Tuntap
     */
    _writev?(chunks: {
        chunk: any;
        encoding: BufferEncoding;
    }[], callback: (error?: Error) => void): void;
    /**
     *
     * Recommend: call `release()` and use once('close',callback);
     * @param {Error} error this argument will be ignored
     * @param {(error: Error) => void} callback will be called after tuntap devices successfully closed.
     * @memberof Tuntap
     */
    _destroy(error: Error, callback: (error: Error) => void): void;
    /**
     *
     * This method is a function wrapper of the same name method in `fs.WriteStream`
     * It will pass all arguments to `fs.WriteStream._final`
     * @see fs.WriteStream for details
     *
     * @param {(error?: Error) => void} callback
     * @memberof Tuntap
     */
    _final(callback: (error?: Error) => void): void;
    /**
     * @inheritdoc
     * This method is a function wrapper of the same name method in `fs.WriteStream`
     * It will pass all arguments to `fs.WriteStream.write`
     * the `encoding` will be ignored
     * @see fs.WriteStream for details
     *
     * @param {*} chunk
     * @param {BufferEncoding} [encoding] will be ignored
     * @param {(error: Error) => void} [cb]
     * @return {*}  {boolean}
     * @memberof Tuntap
     * @since 0.1.0
     */
    write(chunk: any, encoding?: BufferEncoding, cb?: (error: Error) => void): boolean;
    write(chunk: any, cb?: (error: Error) => void): boolean;
    /**
     * @throws `Method is not allowed.`
     * This method is not implemented and not allowed.
     *
     * @param {BufferEncoding} encoding
     * @return {*}  {this}
     * @memberof Tuntap
     * @since 0.1.0
     */
    setDefaultEncoding(encoding: BufferEncoding): this;
    end(cb?: () => void): this;
    end(chunk: any, cb?: () => void): this;
    /**
     * The encoding parameter will be ignored
     *
     * @inheritdoc
     *
     *
     * @param {*} chunk
     * @param {BufferEncoding} [encoding] will be ignored
     * @param {() => void} [cb]
     * @return {*}  {this}
     * @memberof Tuntap
     * @since 0.1.0
     */
    end(chunk: any, encoding?: BufferEncoding, cb?: () => void): this;
    cork(): void;
    uncork(): void;
    get readableAborted(): boolean;
    get readable(): boolean;
    get readableDidRead(): boolean;
    get readableEncoding(): BufferEncoding;
    get readableEnded(): boolean;
    get readableFlowing(): boolean;
    get readableHighWaterMark(): number;
    get readableLength(): number;
    get readableObjectMode(): boolean;
    get destroyed(): boolean;
    _read(size: number): void;
    read(...rests: any[]): any;
    /**
     * this method is not allowed and not implemented
     * @throws 'Method is not allowed.'
     *
     * @param {BufferEncoding} encoding
     * @return {*}  {this}
     * @memberof Tuntap
     */
    setEncoding(encoding: BufferEncoding): this;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    unpipe(destination?: NodeJS.WritableStream): this;
    /**
     *
     * The encoding parameter will be ignored
     *
     * @inheritdoc
     *
     * @param {*} chunk
     * @param {BufferEncoding} [encoding] will be ignored
     * @memberof Tuntap
     */
    unshift(chunk: any, encoding?: BufferEncoding): void;
    wrap(stream: NodeJS.ReadableStream): this;
    /**
     * The encoding parameter will be ignored
     * @inheritdoc
     *
     * @param {*} chunk
     * @param {BufferEncoding} [encoding]
     * @return {*}  {boolean}
     * @memberof Tuntap
     */
    push(chunk: any, encoding?: BufferEncoding): boolean;
    /**
     *
     * @inheritdoc
     * @param {Error} [error] will be ignored
     * @return {*}  {this}
     * @memberof Tuntap
     */
    destroy(error?: Error): this;
    addListener(event: 'close', listener: () => void): this;
    addListener(event: 'data', listener: (chunk: any) => void): this;
    addListener(event: 'end', listener: () => void): this;
    addListener(event: 'error', listener: (err: Error) => void): this;
    addListener(event: 'pause', listener: () => void): this;
    addListener(event: 'readable', listener: () => void): this;
    addListener(event: 'resume', listener: () => void): this;
    addListener(event: 'drain', listener: () => void): this;
    addListener(event: 'pipe', listener: () => void): this;
    addListener(event: 'ready', listener: () => void): this;
    addListener(event: 'unpipe', listener: () => void): this;
    addListener(event: 'open', listener: () => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: 'close'): boolean;
    emit(event: 'data', chunk: any): boolean;
    emit(event: 'end'): boolean;
    emit(event: 'error', err: Error): boolean;
    emit(event: 'pause'): boolean;
    emit(event: 'readable'): boolean;
    emit(event: 'resume'): boolean;
    emit(event: 'drain'): boolean;
    emit(event: 'pipe'): boolean;
    emit(event: 'ready'): boolean;
    emit(event: 'unpipe'): boolean;
    emit(event: 'open'): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
    on(event: 'close', listener: () => void): this;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'pause', listener: () => void): this;
    on(event: 'readable', listener: () => void): this;
    on(event: 'resume', listener: () => void): this;
    on(event: 'drain', listener: () => void): this;
    on(event: 'pipe', listener: () => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'unpipe', listener: () => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: 'close', listener: () => void): this;
    once(event: 'data', listener: (chunk: any) => void): this;
    once(event: 'end', listener: () => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'pause', listener: () => void): this;
    once(event: 'readable', listener: () => void): this;
    once(event: 'resume', listener: () => void): this;
    once(event: 'drain', listener: () => void): this;
    once(event: 'pipe', listener: () => void): this;
    once(event: 'ready', listener: () => void): this;
    once(event: 'unpipe', listener: () => void): this;
    once(event: 'open', listener: () => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: 'close', listener: () => void): this;
    prependListener(event: 'data', listener: (chunk: any) => void): this;
    prependListener(event: 'end', listener: () => void): this;
    prependListener(event: 'error', listener: (err: Error) => void): this;
    prependListener(event: 'pause', listener: () => void): this;
    prependListener(event: 'readable', listener: () => void): this;
    prependListener(event: 'resume', listener: () => void): this;
    prependListener(event: 'drain', listener: () => void): this;
    prependListener(event: 'pipe', listener: () => void): this;
    prependListener(event: 'ready', listener: () => void): this;
    prependListener(event: 'unpipe', listener: () => void): this;
    prependListener(event: 'open', listener: () => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: 'close', listener: () => void): this;
    prependOnceListener(event: 'data', listener: (chunk: any) => void): this;
    prependOnceListener(event: 'end', listener: () => void): this;
    prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    prependOnceListener(event: 'pause', listener: () => void): this;
    prependOnceListener(event: 'readable', listener: () => void): this;
    prependOnceListener(event: 'resume', listener: () => void): this;
    prependOnceListener(event: 'drain', listener: () => void): this;
    prependOnceListener(event: 'pipe', listener: () => void): this;
    prependOnceListener(event: 'ready', listener: () => void): this;
    prependOnceListener(event: 'unpipe', listener: () => void): this;
    prependOnceListener(event: 'open', listener: () => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: 'close', listener: () => void): this;
    removeListener(event: 'data', listener: (chunk: any) => void): this;
    removeListener(event: 'end', listener: () => void): this;
    removeListener(event: 'error', listener: (err: Error) => void): this;
    removeListener(event: 'pause', listener: () => void): this;
    removeListener(event: 'readable', listener: () => void): this;
    removeListener(event: 'resume', listener: () => void): this;
    removeListener(event: 'drain', listener: () => void): this;
    removeListener(event: 'pipe', listener: () => void): this;
    removeListener(event: 'ready', listener: () => void): this;
    removeListener(event: 'unpipe', listener: () => void): this;
    removeListener(event: 'open', listener: () => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: {
        end?: boolean;
    }): T;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    rawListeners(eventName: string | symbol): Function[];
    listenerCount(eventName: string | symbol): number;
    eventNames(): (string | symbol)[];
    get writable(): boolean;
    get writableEnded(): boolean;
    get writableFinished(): boolean;
}
