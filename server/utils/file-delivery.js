const { createHash } = require('node:crypto');
const { pipeline } = require('node:stream/promises');
const { one } = require('./sql');
const { detect, media } = require('../security/uploads');
const { isStaticSvg, looksLikeXml, maxSvgSize, svgMime } = require('../security/svg');

const chunkSize = 4 * 1024 * 1024;
const read = async (id, start, size) => (await one(
    'SELECT SUBSTRING(data, ?, ?) AS chunk FROM files WHERE id = ?', [start + 1, size, id]
)).chunk;

async function formatFile(id, file) {
    const sample = await read(id, 0, Math.min(file.size, 4100));
    const binaryType = await detect(sample);
    if (media.includes(binaryType)) return { type: binaryType };
    if (file.size <= maxSvgSize && looksLikeXml(sample)) {
        const data = file.size === sample.length ? sample : await read(id, 0, file.size);
        if (isStaticSvg(data)) return { type: svgMime, data };
    }
    return { type: 'application/octet-stream' };
}

function fileTag(id, file) {
    const source = JSON.stringify([id, file.filename, file.mime_type, file.size, file.created_at]);
    return '"' + createHash('sha256').update(source).digest('base64url') + '"';
}

function matchesTag(header, tag) {
    return Boolean(header?.split(',').some(value => ['*', tag].includes(value.trim().replace(/^W\//, ''))));
}

async function transferFile(res, id, start, end, data) {
    if (data) return res.end(data.subarray(start, end + 1));
    async function* chunks() {
        for (let offset = start; offset <= end; offset += chunkSize) {
            const length = Math.min(chunkSize, end + 1 - offset);
            const chunk = await read(id, offset, length);
            if (chunk.length !== length) throw new Error('Unexpected file length');
            yield chunk;
        }
    }
    try {
        await pipeline(chunks(), res);
    } catch (err) {
        if (err.code !== 'ERR_STREAM_PREMATURE_CLOSE') throw err;
    }
}

module.exports = { fileTag, matchesTag, formatFile, transferFile };
