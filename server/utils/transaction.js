const db = require('../config/db');

async function transaction(work, { readCommitted = false } = {}) {
    const conn = await db.getConnection();
    try {
        if (readCommitted) await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        await conn.beginTransaction();
        const result = await work(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}
module.exports = { transaction };
