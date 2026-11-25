const { randomUUID } = require('node:crypto');
const svg = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8"/></svg>';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/hocAAAAASUVORK5CYII=', 'base64');
const pdf = Buffer.from('%PDF-1.7\n%%EOF\n');

async function savedFile(data, name, type) {
    const db = require('../../config/db');
    const [row] = await db.execute('INSERT INTO files (filename, mime_type, size, data) VALUES (?, ?, ?, ?)',
        [name, type, data.length, data]);
    return '/files/' + row.insertId;
}

async function publish(path) {
    const db = require('../../config/db');
    await db.execute("INSERT INTO assets (asset_key, asset_type, category, file_url, file_name) VALUES (?, 'image', 'test', ?, 'fixture')",
        [randomUUID(), path]);
}

function multipart(content, type, name) {
    const body = new FormData();
    body.set('file', new Blob([content], { type }), name);
    return body;
}

module.exports = { svg, png, pdf, savedFile, publish, multipart };
