const { rows, one, transaction, error } = require('./sql');
const relations = [
    ['roles', 'member_roles', 'role_type', 'roleTypes'],
    ['worship-positions', 'member_worship_positions', 'position_type', 'positionTypes'],
    ['step-positions', 'member_step_positions', 'position_type', 'positionTypes'],
];

async function withRelations(member) {
    const entries = await Promise.all(relations.map(async ([, table, column]) => {
        const records = await rows('SELECT ' + column + ' FROM ' + table + ' WHERE member_id = ?', [member.id]);
        return [table, records];
    }));
    return { ...member, ...Object.fromEntries(entries) };
}
function registerRelations(router) {
    for (const [path, table, column, field] of relations) {
        router.post('/:id/' + path, async (req, res) => {
            const values = req.body?.[field];
            if (!Array.isArray(values) || values.some(v => typeof v !== 'string')) throw error(400, '목록을 확인해주세요.');
            await transaction(async conn => {
                await one('SELECT id FROM members WHERE id = ? FOR UPDATE', [req.params.id], conn);
                await rows('DELETE FROM ' + table + ' WHERE member_id = ?', [req.params.id], conn);
                for (const value of new Set(values)) {
                    await rows('INSERT INTO ' + table + ' (member_id, ' + column + ') VALUES (?, ?)', [req.params.id, value], conn);
                }
            });
            res.json({ message: '저장했습니다.' });
        });
    }
}
module.exports = { withRelations, registerRelations };
