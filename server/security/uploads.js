const multer = require('multer');
const { error } = require('../utils/sql');
const { isStaticSvg, svgMime } = require('./svg');

const images = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', svgMime];
const media = [...images, 'application/pdf', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg',
    'audio/flac', 'audio/aac', 'video/mp4', 'video/webm', 'video/quicktime'];
async function detect(buffer) {
    const { fileTypeFromBuffer } = await import('file-type');
    try {
        const type = await fileTypeFromBuffer(buffer);
        return type?.mime === 'audio/x-wav' ? 'audio/wav' : type?.mime;
    } catch {
        return undefined;
    }
}
function upload(field, allowed, megabytes, count = 1) {
    const limits = { fileSize: megabytes * 1024 * 1024, files: count, fields: 6,
        parts: count + 7, fieldSize: 16384 };
    const parser = multer({ storage: multer.memoryStorage(), defParamCharset: 'utf8', limits });
    const parse = count === 1 ? parser.single(field) : parser.array(field, count);
    const validate = async (req, res, next) => {
        const files = req.files || (req.file ? [req.file] : []);
        if (!files.length) throw error(400, '파일을 선택해주세요.');
        for (const file of files) {
            const detected = await detect(file.buffer);
            const type = detected === 'application/xml' || !detected
                ? (isStaticSvg(file.buffer) ? svgMime : undefined)
                : detected;
            if (!allowed.includes(type)) throw error(415, '지원하지 않는 파일 형식입니다.');
            file.mimetype = type;
        }
        next();
    };
    return [parse, validate];
}
function oneAssetUpload() {
    let active = false;
    return (req, res, next) => {
        if (active) return res.status(429).json({ message: '파일 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.' });
        active = true;
        res.once('close', () => { active = false; });
        next();
    };
}
module.exports = { images, media, detect, upload, oneAssetUpload };
