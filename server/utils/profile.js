const { one, rows } = require('./sql');
const { withRelations } = require('./member-relations');
const { isStaff } = require('../security/access');

async function profile(user) {
    const record = await one('SELECT id, email, name, role, phone, profile_photo_url, email_verified, created_at, last_login_at FROM users WHERE id = ?', [user.id]);
    const members = await rows('SELECT * FROM members WHERE user_id = ?', [user.id]);
    return { ...record, members: await Promise.all(members.map(withRelations)) };
}
async function questions(user) {
    const records = await rows('SELECT * FROM qna WHERE user_id = ? ORDER BY created_at DESC', [String(user.id)]);
    return records.map(question => ({ ...question, user_id: user.id }));
}
async function downloads(user) {
    const records = await rows(`SELECT d.id, d.score_id, d.user_id, d.downloaded_at,
        s.title, s.category, s.song_key, s.bpm, s.thumbnail_url, s.file_url
        FROM score_downloads d JOIN scores s ON s.id = d.score_id
        WHERE d.user_id = ? AND (s.is_public = 1 OR ?) ORDER BY d.downloaded_at DESC`, [String(user.id), isStaff(user)]);
    return records.map(({ id, score_id, user_id, downloaded_at, ...score }) => ({
        id, score_id, user_id, downloaded_at, scores: { id: score_id, ...score },
    }));
}
module.exports = { profile, questions, downloads };
