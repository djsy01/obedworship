const { rows, error } = require('./sql');
const categories = ['opening', 'celebration'];

function songList(value) {
    if (typeof value === 'string') {
        try { value = JSON.parse(value); } catch { return []; }
    }
    return Array.isArray(value) ? value : [];
}
async function includeSongs(worships) {
    if (!worships.length) return worships;
    const ids = worships.map(item => item.id);
    const placeholders = ids.map(() => '?').join(', ');
    const songs = await rows('SELECT worship_id, category, song_name FROM worship_songs WHERE worship_id IN (' +
        placeholders + ') ORDER BY song_order, id', ids);
    const grouped = new Map(worships.map(item => [item.id, {
        opening_songs: [], celebration_songs: [],
    }]));
    for (const song of songs) grouped.get(song.worship_id)[song.category + '_songs'].push(song.song_name);
    return worships.map(item => ({
        ...item, ...grouped.get(item.id), excluded_songs: songList(item.excluded_songs),
        application_enabled: Boolean(item.application_enabled),
    }));
}

async function replaceSongs(conn, id, lists) {
    for (const category of categories) {
        const songs = lists[category];
        if (songs === undefined) continue;
        if (!Array.isArray(songs) || songs.some(song => typeof song !== 'string' || !song.trim() || song.length > 200)) {
            throw error(400, '곡 목록을 확인해주세요.');
        }
        await rows('DELETE FROM worship_songs WHERE worship_id = ? AND category = ?', [id, category], conn);
        for (const [index, song] of songs.entries()) {
            await rows('INSERT INTO worship_songs (worship_id, category, song_order, song_name) VALUES (?, ?, ?, ?)',
                [id, category, index + 1, song], conn);
        }
    }
}
module.exports = { includeSongs, replaceSongs };
