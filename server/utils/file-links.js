const columns = {
    assets: ['file_url'],
    members: ['photo_url', 'instagram_url', 'youtube_url'],
    scores: ['file_url', 'thumbnail_url'],
    tickets: ['poster_url'],
    users: ['profile_photo_url'],
    worship_logs: ['poster_url', 'location_link', 'promo_video', 'prelisten_video'],
    worship_photos: ['photo_url', 'thumbnail_url'],
    worship_scores: ['file_url', 'thumbnail_url'],
    worship_videos: ['video_url'],
};

function fileId(url) {
    if (typeof url !== 'string') return null;
    const match = /^(?:https?:\/\/[^/]+)?\/files\/0*([1-9]\d{0,9})\/?(?:[?#].*)?$/i.exec(url.trim());
    return match ? Number(match[1]) : null;
}
function linkedIds(table, body) {
    return [...new Set((columns[table] || []).map(key => fileId(body[key])).filter(Boolean))].sort((a, b) => a - b);
}
async function lockLinks(conn, ids) {
    for (const id of ids) {
        const [[file]] = await conn.execute('SELECT id FROM files WHERE id = ? FOR SHARE', [id]);
        if (!file) throw Object.assign(new Error('연결할 파일을 찾을 수 없습니다.'), { status: 404 });
    }
}

const references = Object.entries(columns).flatMap(([table, names]) => names.map(name =>
    'SELECT 1 FROM ' + table + ' WHERE RTRIM(' + name + ') REGEXP ?'
));
const stillLinked = 'SELECT EXISTS(' + references.join(' UNION ALL ') + ') AS linked';

async function reclaimAssetFile(conn, url) {
    const id = fileId(url);
    if (!id) return;
    const [[file]] = await conn.execute('SELECT id FROM files WHERE id = ? FOR UPDATE', [id]);
    if (!file) return;
    const pattern = '/files/0*' + id + '/?([?#].*)?$';
    const [[{ linked }]] = await conn.execute(stillLinked, Array(references.length).fill(pattern));
    if (!linked) await conn.execute('DELETE FROM files WHERE id = ?', [id]);
}

module.exports = { fileId, linkedIds, lockLinks, reclaimAssetFile };
