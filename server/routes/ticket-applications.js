const router = require('express').Router();
const { signedIn, isStaff, staff } = require('../security/access');
const { applications, contactFields, owned, validateContact, lockTicket, checkSpace, updateApplication } = require('../utils/applications');
const { rows, insert, transaction, error } = require('../utils/sql');
const table = 'ticket_applications';
router.use(signedIn);

router.get('/', async (req, res) => {
    const owner = isStaff(req.user) ? req.query.user_id : req.user.id;
    res.json(await applications(owner, req.query.ticket_id));
});
router.get('/:id', async (req, res) => res.json(await owned(req.params.id, req.user)));
router.get('/stats/:ticketId', staff, async (req, res) => {
    const stats = { total: 0, confirmed: 0, pending: 0, cancelled: 0 };
    const counts = await rows('SELECT status, COUNT(*) AS n FROM ticket_applications WHERE ticket_id = ? GROUP BY status', [req.params.ticketId]);
    for (const row of counts) {
        stats[row.status.toLowerCase()] = row.n;
        stats.total += row.n;
    }
    res.json(stats);
});
router.post('/', async (req, res) => {
    const data = { party_size: 1, ...req.body, user_id: req.user.id };
    validateContact(data);
    if (!data.applicant_name || !data.applicant_phone || !Number.isSafeInteger(data.ticket_id)) throw error(400, '신청 정보를 확인해주세요.');
    const app = await transaction(async conn => {
        const ticket = await lockTicket(conn, data.ticket_id);
        await checkSpace(conn, ticket, data.party_size);
        const id = await insert(table, data, 'ticket_id user_id ' + contactFields, conn);
        return owned(id, req.user, conn);
    });
    res.status(201).json(app);
});

async function modify(req, res, changes, allowed) {
    res.json(await updateApplication(req.params.id, req.user, changes, allowed));
}
router.patch('/:id', async (req, res) => {
    validateContact(req.body ?? {});
    await modify(req, res, req.body || {}, contactFields);
});
router.patch('/:id/cancel', (req, res) => modify(req, res, { status: 'CANCELLED' }, 'status'));
router.patch('/:id/status', staff, (req, res) => {
    const status = req.body?.status;
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) return res.sendStatus(400);
    return modify(req, res, { status }, 'status');
});
router.patch('/:id/payment', staff, (req, res) => {
    const payment_status = req.body?.payment_status;
    if (!['UNPAID', 'PAID', 'FREE'].includes(payment_status)) return res.sendStatus(400);
    return modify(req, res, { payment_status }, 'payment_status');
});
router.delete('/:id', staff, async (req, res) => {
    const result = await rows('DELETE FROM ticket_applications WHERE id = ?', [req.params.id]);
    res.sendStatus(result.affectedRows ? 204 : 404);
});
module.exports = router;
