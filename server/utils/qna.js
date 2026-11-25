function presentQuestion({ user_id, ...question }, viewer) {
    const label = String(user_id);
    const owner = viewer != null && String(viewer.id) === label;
    const showId = owner || viewer?.role === 'admin' || viewer?.role === 'operator';
    const numericId = Number(label);
    const hasNumericId = Number.isSafeInteger(numericId) && String(numericId) === label;
    return {
        ...question,
        ...(showId && hasNumericId ? { user_id: numericId } : {}),
        author_label: showId ? label : '익명',
        can_delete: owner,
    };
}

module.exports = { presentQuestion };
