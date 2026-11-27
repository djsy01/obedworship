const { insert } = require('./sql');
async function saveFile(file, conn) {
    const id = await insert('files', {
        filename: file.originalname, mime_type: file.mimetype, size: file.size, data: file.buffer,
    }, 'filename mime_type size data', conn);
    return '/files/' + id;
}
function uploadInfo(file, url) {
    return { filename: file.originalname, savedFilename: file.originalname, size: file.size,
        mimetype: file.mimetype, url };
}
module.exports = { saveFile, uploadInfo };
