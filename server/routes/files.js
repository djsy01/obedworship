const router = require('express').Router();
const { one } = require('../utils/sql');
const { authorizeFile } = require('../security/file-access');
const { fileTag, matchesTag, formatFile, transferFile } = require('../utils/file-delivery');

router.get('/:id', async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    const rawId = req.params.id;
    const id = /^0*[1-9]\d{0,9}$/.test(rawId) ? Number(rawId) : rawId;
    const access = await authorizeFile(id, req.user);
    const file = await one('SELECT filename, mime_type, size, created_at FROM files WHERE id = ?', [id]);
    const tag = fileTag(id, file);
    if (access === 'public' && !req.get('Authorization')) {
        res.set('Cache-Control', 'public, no-cache');
        res.set('ETag', tag);
        if (matchesTag(req.get('If-None-Match'), tag)) return res.status(304).end();
    }

    let start = 0;
    let end = file.size - 1;
    const ifRange = req.get('If-Range');
    const range = ifRange && ifRange !== tag ? undefined : req.range(file.size);
    if (req.method === 'GET' && range === -1) {
        return res.status(416).set('Content-Range', 'bytes */' + file.size).end();
    }
    if (req.method === 'GET' && range?.type === 'bytes' && range.length === 1) {
        [{ start, end }] = range;
        res.status(206).set('Content-Range', `bytes ${start}-${end}/${file.size}`);
    }

    const { type, data } = await formatFile(id, file);
    const inline = !['application/pdf', 'application/octet-stream'].includes(type);
    const encoded = encodeURIComponent(file.filename).replace(/['()*]/g, char => '%' + char.charCodeAt(0).toString(16));
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "sandbox; default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
        'Content-Type': type,
        'Content-Disposition': (inline ? 'inline' : 'attachment') + "; filename*=UTF-8''" + encoded,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes',
    });
    if (req.method === 'HEAD') return res.end();
    await transferFile(res, id, start, end, data);
});
module.exports = router;
