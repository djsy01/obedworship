const assert = require('node:assert/strict');
const { test } = require('node:test');
const { serve } = require('./support/http.cjs');

test('protected routes reject unauthenticated requests before accessing MySQL', async t => {
    const request = await serve(t);
    const routes = [
        ['POST', '/members'], ['PATCH', '/members/1'], ['DELETE', '/members/1'],
        ['POST', '/members/upload-photo'], ['POST', '/worship'],
        ['POST', '/assets/upload'], ['PATCH', '/assets/key/logo'],
        ['POST', '/scores/upload'], ['GET', '/scores/download/1'],
        ['POST', '/tickets'], ['POST', '/photos/upload'],
        ['POST', '/worship-photos/upload-multiple'], ['POST', '/worship-songs'],
        ['POST', '/worship-videos'], ['POST', '/worship-scores'],
        ['GET', '/mypage/1/profile'], ['PATCH', '/mypage/1/profile'],
        ['GET', '/mypage/1/dashboard'], ['GET', '/ticket-applications'],
        ['POST', '/qna'], ['PATCH', '/qna/1/answer'], ['DELETE', '/qna/1'],
    ];
    for (const [method, path] of routes) {
        await t.test(method + ' ' + path, async () => {
            const response = await request(path, { method });
            assert.equal(response.status, 401);
            await response.text();
        });
    }
    const response = await request('/mypage/1/profile', { token: 'invalid-session' });
    assert.equal(response.status, 401);
    await response.text();
});
