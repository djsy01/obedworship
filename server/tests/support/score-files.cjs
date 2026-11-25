const assert = require('node:assert/strict');
const { pdf, savedFile, multipart } = require('./file-fixtures.cjs');

module.exports = async function scoreFiles(t, request, { user, operator, admin }) {
    await t.test('sheet files require sign-in and private scores require staff', async () => {
        const db = require('../../config/db');
        for (const [visible, expected] of [[1, [401, 200]], [0, [404, 404]]]) {
            const path = await savedFile(pdf, 'score.pdf', 'application/pdf');
            const [score] = await db.execute('INSERT INTO scores (title, song_key, bpm, category, file_url, filename, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['Test', 'C', 100, 'Test', path, 'score.pdf', visible]);
            assert.equal((await request(path)).status, expected[0]);
            assert.equal((await request(path, { token: user.token })).status, expected[1]);
            assert.equal((await request(path, { token: admin.token })).status, 200);
            const download = await request('/scores/download/' + score.insertId, { token: user.token });
            assert.equal(download.status, expected[1]);
            if (!visible) continue;
            assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf);
            const [history] = await db.execute('SELECT user_id FROM score_downloads WHERE score_id = ?', [score.insertId]);
            assert.equal(history[0].user_id, String(user.id));
        }
    });

    await t.test('download history preserves exact ownership for legacy string IDs', async () => {
        const db = require('../../config/db');
        const [{ insertId }] = await db.execute(
            "INSERT INTO scores (title, song_key, bpm, category, file_url, filename) VALUES ('History','C',100,'Test','/files/1','score.pdf')"
        );
        await db.execute('INSERT INTO score_downloads (score_id, user_id) VALUES (?, ?), (?, ?)',
            [insertId, String(user.id), insertId, user.id + '-legacy']);
        const response = await request('/mypage/' + user.id + '/downloads', { token: user.token });
        assert.equal(response.status, 200);
        const records = (await response.json()).filter(record => record.score_id === insertId);
        assert.deepEqual(records.map(record => record.user_id), [String(user.id)]);
    });

    await t.test('worship sheet uploads are restricted to staff and available to signed-in readers', async () => {
        const token = operator.token;
        const form = () => multipart(pdf, 'application/pdf', 'worship.pdf');
        assert.equal((await request('/scores/upload', { method: 'POST', token: user.token, body: form() })).status, 403);
        const response = await request('/scores/upload', { method: 'POST', token, body: form() });
        assert.equal(response.status, 200);
        const { url, filename } = await response.json();
        const worshipResponse = await request('/worship', { method: 'POST', token,
            body: { title: 'Test worship', date: '2026-11-26', year: 2026,
                preacher: 'Speaker', worship_team: 'Band', description: 'Test worship', opening_songs: ['Test song'] } });
        assert.equal(worshipResponse.status, 201, await worshipResponse.clone().text());
        const worship = await worshipResponse.json();
        assert.deepEqual(worship.opening_songs, ['Test song']);
        const linked = await request('/worship-scores', { method: 'POST', token,
            body: { worship_id: worship.id, filename, file_url: url } });
        assert.equal(linked.status, 201, await linked.clone().text());
        assert.equal((await request(url)).status, 401);
        const download = await request(url, { token: user.token });
        assert.equal(download.status, 200);
        assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf);
    });
};
