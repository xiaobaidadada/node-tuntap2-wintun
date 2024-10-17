"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tuntap = void 0;
const TuntapBase_1 = require("./TuntapBase");
class Tuntap extends TuntapBase_1.TuntapBase {
    /**
     * Return the value of `highWaterMark`
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableHighWaterMark() {
        return this.writeStream.writableHighWaterMark;
    }
    ;
    /**
     * This property contains the number of bytes  in the queue
     * ready to be written. The value provides introspection data regarding
     * the status of the `highWaterMark`.
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableLength() {
        return this.writeStream.writableLength;
    }
    ;
    /**
     * Getter for the property `objectMode`
     *
     * This method just returns the same name property of `fs.WriteStream`
     * @see fs.WriteStream for implementation details
     * @since v0.1.0
     */
    get writableObjectMode() {
        return this.writeStream.writableObjectMode;
    }
    ;
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
    get writableCorked() {
        return this.writeStream.writableCorked;
    }
    ;
    /**
     *
     * always `false`
     * @readonly
     * @type {boolean}
     * @memberof Tuntap
     */
    get allowHalfOpen() {
        return false;
    }
    ;
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
    _write(chunk, encoding, callback) {
        return this.writeStream._write(chunk, encoding, callback);
    }
    /**
     * This methods is not allowed for tuntap.
     * @throws `'Method not implemented.'`
     *
     * @inheritdoc
     * @param {{ chunk: any; encoding: BufferEncoding; }[]} chunks
     * @param {(error?: Error) => void} callback
     * @memberof Tuntap
     */
    _writev(chunks, callback) {
        throw new Error('Method not implemented.');
    }
    /**
     *
     * Recommend: call `release()` and use once('close',callback);
     * @param {Error} error this argument will be ignored
     * @param {(error: Error) => void} callback will be called after tuntap devices successfully closed.
     * @memberof Tuntap
     */
    _destroy(error, callback) {
        this.readStream.once('close', callback);
        this.release();
    }
    /**
     *
     * This method is a function wrapper of the same name method in `fs.WriteStream`
     * It will pass all arguments to `fs.WriteStream._final`
     * @see fs.WriteStream for details
     *
     * @param {(error?: Error) => void} callback
     * @memberof Tuntap
     */
    _final(callback) {
        this.writeStream._final(callback);
    }
    /**
     *
     * @inheritdoc
     * This method is a function wrapper of the same name method in `fs.WriteStream`
     * It will pass all arguments to `fs.WriteStream.write`
     * the `encoding` will be ignored
     * @see fs.WriteStream for details
     * @param {*} chunk
     * @param {*} [encoding] will be ignored
     * @param {*} [cb]
     * @return {*}  {boolean}
     * @memberof Tuntap
     * @since 0.1.0
     */
    write(chunk, encoding, cb) {
        return this.writeStream.write(chunk, cb);
    }
    /**
     * @throws `Method is not allowed.`
     * This method is not implemented and not allowed.
     *
     * @param {BufferEncoding} encoding
     * @return {*}  {this}
     * @memberof Tuntap
     * @since 0.1.0
     */
    setDefaultEncoding(encoding) {
        throw new Error('Method is not allowed.');
    }
    end(chunk, encoding, cb) {
        this.writeStream.end(chunk, cb);
        return this;
    }
    cork() {
        this.writeStream.cork();
    }
    uncork() {
        this.writeStream.uncork();
    }
    get readableAborted() {
        return this.readStream.readableAborted;
    }
    ;
    get readable() {
        return this.readStream.readable;
    }
    get readableDidRead() {
        return this.readStream.readableDidRead;
    }
    get readableEncoding() {
        return this.readStream.readableEncoding;
    }
    get readableEnded() {
        return this.readStream.readableEnded;
    }
    get readableFlowing() {
        return this.readStream.readableFlowing;
    }
    get readableHighWaterMark() {
        return this.readStream.readableHighWaterMark;
    }
    get readableLength() {
        return this.readStream.readableLength;
    }
    get readableObjectMode() {
        return this.readStream.readableObjectMode;
    }
    get destroyed() {
        return this.readStream.destroyed;
    }
    _read(size) {
        return this.readStream._read(size);
    }
    read(...rests) {
        return this.readStream.read(...rests);
    }
    /**
     * this method is not allowed and not implemented
     * @throws 'Method is not allowed.'
     *
     * @param {BufferEncoding} encoding
     * @return {*}  {this}
     * @memberof Tuntap
     */
    setEncoding(encoding) {
        throw new Error('Method is not allowed.');
    }
    pause() {
        this.readStream.pause();
        return this;
    }
    resume() {
        this.readStream.resume();
        return this;
    }
    isPaused() {
        return this.readStream.isPaused();
    }
    unpipe(destination) {
        this.readStream.unpipe(destination);
        return this;
    }
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
    unshift(chunk, encoding) {
        this.readStream.unshift(chunk);
    }
    wrap(stream) {
        this.readStream.wrap(stream);
        return this;
    }
    /**
     * The encoding parameter will be ignored
     * @inheritdoc
     *
     * @param {*} chunk
     * @param {BufferEncoding} [encoding]
     * @return {*}  {boolean}
     * @memberof Tuntap
     */
    push(chunk, encoding) {
        return this.readStream.push(chunk);
    }
    /**
     *
     * @inheritdoc
     * @param {Error} [error] will be ignored
     * @return {*}  {this}
     * @memberof Tuntap
     */
    destroy(error) {
        this.release();
        return this;
    }
    /**
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     * @param {*} event
     * @param {*} listener
     * @return {*}  {this}
     * @memberof Tuntap
     */
    addListener(event, listener) {
        this.readStream.addListener(event, listener);
        return this;
    }
    /**
     *
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     *
     * @param {*} event
     * @param {*} [err]
     * @param {...any[]} rest
     * @return {*}  {boolean}
     * @memberof Tuntap
     */
    emit(event, err, ...rest) {
        return this.readStream.emit(event, err, ...rest);
    }
    on(event, listener) {
        this.readStream.on(event, listener);
        return this;
    }
    /**
     *
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     *
     * @param {*} event
     * @param {*} listener
     * @return {*}  {this}
     * @memberof Tuntap
     */
    once(event, listener) {
        this.readStream.once(event, listener);
        return this;
    }
    /**
     *
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     *
     * @param {*} event
     * @param {*} listener
     * @return {*}  {this}
     * @memberof Tuntap
     */
    prependListener(event, listener) {
        this.readStream.prependListener(event, listener);
        return this;
    }
    /**
     *
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     *
     * @param {*} event
     * @param {*} listener
     * @return {*}  {this}
     * @memberof Tuntap
     */
    prependOnceListener(event, listener) {
        this.readStream.prependOnceListener(event, listener);
        return this;
    }
    /**
     *
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     * 8. drain
     * 9. pipe
     * 10. ready
     * 11. unpipe
     * 12. open
     *
     * @param {*} event
     * @param {*} listener
     * @return {*}  {this}
     * @memberof Tuntap
     */
    removeListener(event, listener) {
        this.readStream.removeListener(event, listener);
        return this;
    }
    [Symbol.asyncIterator]() {
        throw new Error('Method not implemented.');
    }
    pipe(destination, options) {
        return this.readStream.pipe(destination, options);
    }
    off(eventName, listener) {
        this.writeStream.off(eventName, listener);
        this.readStream.off(eventName, listener);
        return this;
    }
    removeAllListeners(event) {
        this.readStream.removeAllListeners(event);
        return this;
    }
    setMaxListeners(n) {
        this.readStream.setMaxListeners(n);
        return this;
    }
    getMaxListeners() {
        return this.readStream.getMaxListeners();
    }
    listeners(eventName) {
        return [...this.readStream.listeners(eventName)];
    }
    rawListeners(eventName) {
        return [...this.readStream.rawListeners(eventName)];
    }
    listenerCount(eventName) {
        return this.readStream.listenerCount(eventName);
    }
    eventNames() {
        return this.readStream.eventNames();
    }
    get writable() {
        return this.writeStream.writable;
    }
    get writableEnded() {
        return this.writeStream.writableEnded;
    }
    get writableFinished() {
        return this.writeStream.writableFinished;
    }
}
exports.Tuntap = Tuntap;
//# sourceMappingURL=Tuntap.js.map