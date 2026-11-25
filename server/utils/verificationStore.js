const { randomBytes, randomInt, createHash } = require('node:crypto');
const challenges = new Map();
const grants = new Map();
const digest = value => createHash('sha256').update(value).digest('hex');

function setCode(purpose, email) {
    const key = purpose + ':' + email;
    const code = String(randomInt(100000, 1000000));
    grants.delete(key);
    challenges.set(key, { code, attempts: 0, until: Date.now() + 600000 });
    return code;
}
function verifyCode(purpose, email, code) {
    const key = purpose + ':' + email;
    const entry = challenges.get(key);
    if (!entry || entry.until <= Date.now()) return null;
    entry.attempts++;
    if (entry.attempts >= 5 || entry.code === code) challenges.delete(key);
    if (entry.code !== code) return null;
    const proof = randomBytes(32).toString('hex');
    grants.set(key, { hash: digest(proof), until: Date.now() + 1800000 });
    return proof;
}
function consume(purpose, email, proof) {
    const key = purpose + ':' + email;
    const grant = grants.get(key);
    if (!grant || grant.until <= Date.now() || typeof proof !== 'string' || digest(proof) !== grant.hash) return false;
    grants.delete(key);
    return true;
}
setInterval(() => {
    for (const store of [challenges, grants]) {
        for (const [key, entry] of store) if (entry.until <= Date.now()) store.delete(key);
    }
}, 600000).unref();
module.exports = { setCode, verifyCode, consume };
