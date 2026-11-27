const { rows, one, insert, update, transaction } = require('./sql');
const { assets } = require('./fields');
const { fileId, reclaimAssetFile } = require('./file-links');
const { saveFile } = require('./files');

async function patchAsset(column, key, changes) {
    const where = column + ' = ?';
    return transaction(async conn => {
        const old = await one('SELECT id, file_url FROM assets WHERE ' + where + ' FOR UPDATE', [key], conn);
        await update('assets', changes, assets, 'id = ?', [old.id], conn);
        const updated = await one('SELECT * FROM assets WHERE id = ?', [old.id], conn);
        if (fileId(old.file_url) !== fileId(updated.file_url)) await reclaimAssetFile(conn, old.file_url);
        return updated;
    }, { readCommitted: true });
}

async function removeAsset(id) {
    return transaction(async conn => {
        const old = await one('SELECT file_url FROM assets WHERE id = ? FOR UPDATE', [id], conn);
        await rows('DELETE FROM assets WHERE id = ?', [id], conn);
        await reclaimAssetFile(conn, old.file_url);
    }, { readCommitted: true });
}

async function saveAssetOnce(file, { asset_key, category, title, description }) {
    return transaction(async conn => {
        const [old] = await rows('SELECT id, file_url FROM assets WHERE asset_key = ? FOR UPDATE', [asset_key], conn);
        const family = file.mimetype.split('/')[0];
        const asset_type = ['image', 'video', 'audio'].includes(family) ? family : 'document';
        const changes = {
            category, file_url: await saveFile(file, conn), file_name: file.originalname,
            file_size: file.size, mime_type: file.mimetype, asset_type,
            title: title || file.originalname, description: description || '',
        };
        let id;
        if (old) {
            id = old.id;
            await update('assets', changes, assets, 'id = ?', [id], conn);
            await reclaimAssetFile(conn, old.file_url);
        } else {
            id = await insert('assets', { ...changes, asset_key }, assets, conn);
        }
        return { record: await one('SELECT * FROM assets WHERE id = ?', [id], conn), status: old ? 200 : 201 };
    }, { readCommitted: true });
}

async function saveAsset(file, fields) {
    try {
        return await saveAssetOnce(file, fields);
    } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
        return saveAssetOnce(file, fields);
    }
}

module.exports = { patchAsset, removeAsset, saveAsset };
