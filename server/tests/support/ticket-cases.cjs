const assert = require('node:assert/strict');

module.exports = async function ticketCases(t, request, { user, member, operator }) {
    await t.test('ticket applications are scoped to the account and staff controls', async () => {
        const created = await request('/tickets', { method: 'POST', token: operator.token,
            body: { title: 'Test event', date: '2026-11-26', year: 2026, max_capacity: 2 } });
        assert.equal(created.status, 201);
        const ticket = await created.json();
        const application = { ticket_id: ticket.id, applicant_name: 'Test applicant', applicant_phone: '010-0000-0000', party_size: 2 };
        const response = await request('/ticket-applications', { method: 'POST', token: user.token, body: application });
        assert.equal(response.status, 201);
        const record = await response.json();
        assert.equal(record.user_id, user.id);
        const path = '/ticket-applications/' + record.id;
        assert.equal((await request(path, { token: member.token })).status, 404);
        assert.equal((await request(path, { token: user.token })).status, 200);
        assert.equal((await request(path, { token: operator.token })).status, 200);
        const confirm = token => request(path + '/status', { method: 'PATCH', token, body: { status: 'CONFIRMED' } });
        assert.equal((await confirm(user.token)).status, 403);
        assert.equal((await confirm(operator.token)).status, 200);
        const full = await request('/ticket-applications', { method: 'POST', token: member.token, body: application });
        assert.equal(full.status, 409);
    });
};
