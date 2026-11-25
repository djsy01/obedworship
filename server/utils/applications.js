const { rows, one, error, transaction, update } = require('./sql');
const { isStaff } = require('../security/access');

async function applications(userId, ticketId) {
    const conditions = [];
    const values = [];
    for (const [column, value] of [['a.user_id', userId], ['a.ticket_id', ticketId]]) {
        if (value != null) {
            conditions.push(column + ' = ?');
            values.push(value);
        }
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const records = await rows(`SELECT a.*, t.title, t.date, t.place FROM ticket_applications a
        JOIN tickets t ON t.id = a.ticket_id` + where + ' ORDER BY a.created_at DESC', values);
    return records.map(({ title, date, place, ...app }) => ({
        ...app, tickets: { id: app.ticket_id, title, date, place },
    }));
}
const contactFields = 'applicant_name applicant_phone applicant_email party_size memo';
function owned(id, user, conn) {
    return one('SELECT * FROM ticket_applications WHERE id = ? AND (user_id = ? OR ?)', [id, user.id, isStaff(user)], conn);
}
function validateContact(data) {
    for (const key of ['applicant_name', 'applicant_phone']) {
        if (key in data && (typeof data[key] !== 'string' || !data[key].trim())) throw error(400, '신청자 정보를 확인해주세요.');
    }
    if ('party_size' in data && (!Number.isSafeInteger(data.party_size) || data.party_size < 1 || data.party_size > 80)) throw error(400, '인원을 확인해주세요.');
}
async function lockTicket(conn, id) {
    return one('SELECT *, (application_deadline < NOW()) AS expired FROM tickets WHERE id = ? FOR UPDATE', [id], conn);
}
async function checkSpace(conn, ticket, size, omitId = 0) {
    if (ticket.status !== 'OPEN' || ticket.expired) throw error(409, '신청 기간이 종료되었습니다.');
    if (ticket.max_capacity == null) return;
    const { used } = await one(`SELECT COALESCE(SUM(party_size), 0) AS used FROM ticket_applications
        WHERE ticket_id = ? AND status <> 'CANCELLED' AND id <> ?`, [ticket.id, omitId], conn);
    if (Number(used) + size > ticket.max_capacity) throw error(409, '잔여 인원이 부족합니다.');
}
async function updateApplication(id, user, changes, allowed) {
    const initial = await owned(id, user);
    return transaction(async conn => {
        const ticket = await lockTicket(conn, initial.ticket_id);
        const app = await owned(id, user, conn);
        if (changes.party_size !== undefined || (app.status === 'CANCELLED' && changes.status && changes.status !== 'CANCELLED')) {
            await checkSpace(conn, ticket, changes.party_size ?? app.party_size, app.id);
        }
        await update('ticket_applications', changes, allowed, 'id = ? AND (user_id = ? OR ?)', [id, user.id, isStaff(user)], conn);
        return owned(id, user, conn);
    });
}
module.exports = { applications, contactFields, owned, validateContact, lockTicket, checkSpace, updateApplication };
