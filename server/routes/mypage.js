const router = require('express').Router();
const { signedIn, isStaff } = require('../security/access');
const { update, one, fields, error } = require('../utils/sql');
const { profile, questions, downloads } = require('../utils/profile');
const { applications } = require('../utils/applications');
const { fileId } = require('../utils/file-links');
const { authorizeFile } = require('../security/file-access');
const editable = 'name phone profile_photo_url';

router.use(signedIn);
router.use('/:userId', (req, res, next) => {
    if (req.params.userId !== String(req.user.id)) return res.sendStatus(403);
    next();
});
router.get('/:userId/profile', async (req, res) => res.json(await profile(req.user)));
router.patch('/:userId/profile', async (req, res) => {
    fields(req.body, editable);
    const id = fileId(req.body.profile_photo_url);
    if (id && !isStaff(req.user) && await authorizeFile(id, req.user) === 'private') {
        throw error(404, '파일을 찾을 수 없습니다.');
    }
    await update('users', req.body, editable, 'id = ?', [req.user.id]);
    res.json(await profile(req.user));
});
router.get('/:userId/applications', async (req, res) => res.json(await applications(req.user.id)));
router.get('/:userId/qnas', async (req, res) => res.json(await questions(req.user)));
router.get('/:userId/downloads', async (req, res) => res.json(await downloads(req.user)));
router.get('/:userId/activity', async (req, res) => {
    const days = Number(req.query.days ?? 30);
    if (!Number.isSafeInteger(days) || days < 1) return res.sendStatus(400);
    const since = new Date(Date.now() - days * 86400000);
    const counts = await Promise.all(['ticket_applications', 'qna', 'score_downloads'].map((table, index) => {
        const date = index === 2 ? 'downloaded_at' : 'created_at';
        return one('SELECT COUNT(*) AS n FROM ' + table + ' WHERE user_id = ? AND ' + date + ' >= ?', [table === 'ticket_applications' ? req.user.id : String(req.user.id), since]);
    }));
    res.json({ period: days + '일', recentApplications: counts[0].n, recentQnas: counts[1].n, recentDownloads: counts[2].n });
});
router.get('/:userId/dashboard', async (req, res) => {
    const [info, apps, qnas, history] = await Promise.all([
        profile(req.user), applications(req.user.id), questions(req.user), downloads(req.user),
    ]);
    res.json({ profile: info, applications: apps, qnas, downloads: history, stats: {
        totalApplications: apps.length, confirmedApplications: apps.filter(app => app.status === 'CONFIRMED').length,
        totalQnas: qnas.length, answeredQnas: qnas.filter(q => q.status === 'ANSWERED').length,
        totalDownloads: history.length,
    } });
});
module.exports = router;
