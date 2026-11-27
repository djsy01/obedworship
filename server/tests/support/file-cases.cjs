const assert = require('node:assert/strict');
const { svg, png, pdf, savedFile, publish, multipart } = require('./file-fixtures.cjs');
const caching = require('./file-caching.cjs');
const scoreFiles = require('./score-files.cjs');

module.exports = async function fileCases(t, request, { user, other, operator, admin }) {
    await t.test('staff can upload valid SVG and legacy SVG is served safely', async () => {
        const db = require('../../config/db');
        const upload = (xml, type) => request('/photos/upload', { method: 'POST', token: operator.token,
            body: multipart(xml, type, 'logo.svg') });
        const approved = await upload(svg, 'image/svg+xml');
        assert.equal(approved.status, 200, await approved.clone().text());
        assert.equal((await upload('invalid image', 'image/svg+xml')).status, 415);

        const path = await savedFile(Buffer.from(svg), 'legacy.svg', 'image/svg+xml');
        await publish(path);
        const response = await request(path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /^image\/svg\+xml/);
        assert.match(response.headers.get('content-disposition'), /^inline/);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.match(response.headers.get('content-security-policy'), /sandbox/);
        assert.equal(await response.text(), svg);
        const { url } = await approved.json();
        assert.equal((await request(url)).status, 404);
        assert.equal((await request(url, { token: admin.token })).status, 200);
        assert.equal((await db.execute('SELECT mime_type FROM files WHERE id = ?', [url.split('/').pop()]))[0][0].mime_type, 'image/svg+xml');
    });

    await t.test('only the owner can retrieve a profile-only image', async () => {
        const db = require('../../config/db');
        const path = await savedFile(png, 'profile.png', 'image/png');
        await db.execute('UPDATE users SET profile_photo_url = ? WHERE id = ?', [path, user.id]);
        assert.equal((await request(path)).status, 404);
        assert.equal((await request(path, { token: other.token })).status, 404);
        const profile = await request(path, { token: user.token });
        assert.equal(profile.status, 200);
        assert.match(profile.headers.get('cache-control'), /private, no-store/);
        assert.deepEqual(Buffer.from(await profile.arrayBuffer()), png);
    });

    await scoreFiles(t, request, { user, operator, admin });
    await caching(t, request);
};
