const db = require('../config/db');
const { transaction } = require('./transaction');
const { linkedIds, lockLinks } = require('./file-links');

function error(status, message) {
    return Object.assign(new Error(message), { status });
}

function fields(body, allowed) {
    if (!body || Array.isArray(body) || typeof body !== 'object') throw error(400, '입력값을 확인해주세요.');
    const names = allowed.split(' ');
    if (Object.keys(body).some(key => !names.includes(key))) throw error(400, '허용되지 않는 필드입니다.');
    const keys = names.filter(key => Object.hasOwn(body, key));
    if (!keys.length) throw error(400, '입력 필드가 필요합니다.');
    return keys;
}

function writeLinked(table, body, conn, write) {
    const ids = linkedIds(table, body);
    if (!ids.length) return write(conn);
    const guarded = async connection => {
        await lockLinks(connection, ids);
        return write(connection);
    };
    return conn === db ? transaction(guarded) : guarded(conn);
}

async function insert(table, body, allowed, conn = db) {
    const keys = fields(body, allowed);
    const markers = keys.map(() => '?').join(', ');
    const sql = 'INSERT INTO ' + table + ' (' + keys.join(', ') + ') VALUES (' + markers + ')';
    const [result] = await writeLinked(table, body, conn, db => db.execute(sql, keys.map(key => body[key])));
    return result.insertId;
}

async function update(table, body, allowed, where, params, conn = db) {
    const keys = fields(body, allowed);
    const assignments = keys.map(key => key + ' = ?').join(', ');
    const sql = 'UPDATE ' + table + ' SET ' + assignments + ' WHERE ' + where;
    const [result] = await writeLinked(table, body, conn, db => db.execute(sql, [...keys.map(key => body[key]), ...params]));
    if (!result.affectedRows) throw error(404, '찾을 수 없습니다.');
}

async function rows(sql, params = [], conn = db) {
    const [records] = await conn.execute(sql, params);
    return records;
}

async function one(sql, params, conn = db) {
    const [record] = await rows(sql, params, conn);
    if (!record) throw error(404, '찾을 수 없습니다.');
    return record;
}

module.exports = { rows, one, insert, update, fields, transaction, error };
