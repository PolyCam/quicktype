"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_stream_1 = require("./buffer-stream");
function getStream(inputStream, opts = {}) {
    if (!inputStream) {
        return Promise.reject(new Error("Expected a stream"));
    }
    opts = Object.assign({ maxBuffer: Infinity }, opts);
    const maxBuffer = opts.maxBuffer || Infinity;
    let stream;
    let clean;
    const p = new Promise((resolve, reject) => {
        const error = (err) => {
            if (err) {
                // null check
                err.bufferedData = stream.getBufferedValue();
            }
            reject(err);
        };
        stream = buffer_stream_1.default(opts);
        inputStream.once("error", error);
        inputStream.pipe(stream);
        stream.on("data", () => {
            if (stream.getBufferedLength() > maxBuffer) {
                reject(new Error("maxBuffer exceeded"));
            }
        });
        stream.once("error", error);
        stream.on("end", resolve);
        clean = () => {
            // some streams doesn't implement the `stream.Readable` interface correctly
            if (inputStream.unpipe) {
                inputStream.unpipe(stream);
            }
        };
    });
    p.then(clean, clean);
    return p.then(() => stream.getBufferedValue());
}
exports.getStream = getStream;
function buffer(stream, opts = {}) {
    getStream(stream, Object.assign({}, opts, { encoding: "buffer" }));
}
exports.buffer = buffer;
function array(stream, opts = {}) {
    getStream(stream, Object.assign({}, opts, { array: true }));
}
exports.array = array;
