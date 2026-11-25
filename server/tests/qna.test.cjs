const assert = require('node:assert/strict');
const test = require('node:test');
const { presentQuestion } = require('../utils/qna');

const author = { id: 42, role: 'user' };
const operator = { id: 77, role: 'operator' };

test('recognizes current and legacy numeric Q&A owner IDs', () => {
    for (const user_id of [42, '42']) {
        const view = presentQuestion({ id: 1, user_id }, author);
        assert.equal(view.user_id, 42);
        assert.equal(view.author_label, '42');
        assert.equal(view.can_delete, true);
    }
});

test('hides the author ID from public and other regular readers', () => {
    for (const viewer of [undefined, { id: 77, role: 'member' }]) {
        const view = presentQuestion({ id: 1, user_id: '42' }, viewer);
        assert.equal(Object.hasOwn(view, 'user_id'), false);
        assert.equal(view.author_label, '익명');
        assert.equal(view.can_delete, false);
    }
});

test('preserves legacy labels for operators without granting ownership', () => {
    const question = { id: 1, user_id: '42-legacy' };
    const view = presentQuestion(question, operator);
    assert.equal(view.author_label, '42-legacy');
    assert.equal(view.can_delete, false);
    assert.equal(Object.hasOwn(view, 'user_id'), false);
    assert.equal(presentQuestion(question, author).can_delete, false);
});
