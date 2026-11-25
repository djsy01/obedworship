const { isStaff } = require('./access');
const { one, error } = require('../utils/sql');

// Legacy records may contain an absolute API URL or query string.
const visibility = `SELECT
    EXISTS(SELECT 1 FROM scores WHERE (file_url REGEXP ? OR thumbnail_url REGEXP ?)
        AND COALESCE(is_public, 0) = 0) AS privateScore,
    EXISTS(SELECT 1 FROM members WHERE photo_url REGEXP ? AND COALESCE(is_active, 0) = 0) AS inactiveMember,
    (EXISTS(SELECT 1 FROM scores WHERE file_url REGEXP ?) OR
     EXISTS(SELECT 1 FROM worship_scores WHERE file_url REGEXP ?)) AS sheet,
    (EXISTS(SELECT 1 FROM assets WHERE file_url REGEXP ? AND is_active = 1) OR
     EXISTS(SELECT 1 FROM members WHERE photo_url REGEXP ? AND is_active = 1) OR
     EXISTS(SELECT 1 FROM worship_logs WHERE poster_url REGEXP ?) OR
     EXISTS(SELECT 1 FROM tickets WHERE poster_url REGEXP ?) OR
     EXISTS(SELECT 1 FROM worship_photos WHERE photo_url REGEXP ? OR thumbnail_url REGEXP ?) OR
     EXISTS(SELECT 1 FROM worship_scores WHERE thumbnail_url REGEXP ?) OR
     EXISTS(SELECT 1 FROM scores WHERE thumbnail_url REGEXP ? AND is_public = 1)) AS publicMedia,
    EXISTS(SELECT 1 FROM users WHERE id = ? AND profile_photo_url REGEXP ?) AS ownPhoto`;

async function authorizeFile(id, user, conn) {
    if (!/^[1-9]\d{0,9}$/.test(String(id))) throw error(404, '파일을 찾을 수 없습니다.');
    if (isStaff(user)) return 'private';
    const pattern = '/files/0*' + id + '/?([?#].*)?[[:space:]]*$';
    const acl = await one(visibility, [...Array(13).fill(pattern), user?.id ?? null, pattern], conn);
    if (acl.privateScore || acl.inactiveMember || (!acl.sheet && !acl.publicMedia && !acl.ownPhoto)) {
        throw error(404, '파일을 찾을 수 없습니다.');
    }
    if (acl.sheet && !user) throw error(401, '로그인이 필요합니다.');
    return acl.publicMedia && !acl.sheet ? 'public' : acl.ownPhoto && !acl.sheet ? 'profile' : 'private';
}
module.exports = { authorizeFile };
