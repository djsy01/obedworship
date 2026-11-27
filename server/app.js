require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { identify, staffWrites } = require('./security/access');

const app = express();
app.set('trust proxy', 1);
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.vary('Authorization');
    if (req.get('Authorization')) res.set('Cache-Control', 'private, no-store');
    next();
});
app.use('/auth', require('./routes/auth'));
app.use(identify);
app.use('/admin/users', require('./routes/admin-users'));
for (const name of ['members', 'assets', 'worship', 'scores', 'tickets',
    'worship-videos', 'worship-scores', 'worship-songs', 'worship-photos']) {
    app.use('/' + name, staffWrites, require('./routes/' + name));
}
app.use('/photos', staffWrites, require('./routes/worship-photos'));
for (const name of ['qna', 'mypage', 'files', 'ticket-applications']) {
    app.use('/' + name, require('./routes/' + name));
}
app.get('/', (req, res) => res.send('OBED Worship API'));
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof multer.MulterError) return res.status(413).json({ message: '업로드 한도를 초과했습니다.' });
    if (err.status >= 400 && err.status < 500) return res.status(err.status).json({ message: err.message });
    console.error('API request failed', err.code || err.name);
    res.status(500).json({ message: '요청 처리 중 오류가 발생했습니다.' });
});

if (require.main === module) app.listen(process.env.PORT || 3000);
module.exports = app;
