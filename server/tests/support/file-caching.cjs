const assert = require('node:assert/strict');
const { png, savedFile, publish } = require('./file-fixtures.cjs');

module.exports = async function fileCaching(t, request) {
    await t.test('public downloads revalidate access before returning a cached file', async () => {
        const db = require('../../config/db');
        const path = await savedFile(png, 'public.png', 'image/png');
        await publish(path);
        const response = await request(path);
        assert.equal(response.status, 200);
        const tag = response.headers.get('etag');
        assert.ok(tag);
        assert.match(response.headers.get('cache-control'), /no-cache/);
        await response.arrayBuffer();
        const headers = { 'If-None-Match': tag };
        assert.equal((await request(path, { headers })).status, 304);
        await db.execute('UPDATE assets SET is_active = 0 WHERE file_url = ?', [path]);
        assert.equal((await request(path, { headers })).status, 404);
    });

    await t.test('large asset downloads and byte ranges return the stored bytes', async () => {
        const wav = Buffer.alloc(9 * 1024 * 1024, 42);
        wav.write('RIFF', 0);
        wav.writeUInt32LE(wav.length - 8, 4);
        wav.write('WAVE', 8);
        const path = await savedFile(wav, 'audio.wav', 'audio/wav');
        await publish(path);
        const response = await request(path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /^audio\/wav/);
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), wav);
        const range = await request(path, { headers: { Range: 'bytes=4194298-4194310' } });
        assert.equal(range.status, 206);
        assert.equal(range.headers.get('content-range'), 'bytes 4194298-4194310/' + wav.length);
        assert.deepEqual(Buffer.from(await range.arrayBuffer()), wav.subarray(4194298, 4194311));
    });
};
