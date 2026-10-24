// 이메일 인증번호(6자리)를 메모리에 저장하는 임시 저장소.
// PM2가 단일 인스턴스(fork mode)로만 돌아가는 걸 전제로 한다 — 다중 인스턴스/재시작 시 유효하지 않음.
const codes = new Map(); // key: `${purpose}:${email}` -> { code, expiresAt }
const verified = new Map(); // key: `${purpose}:${email}` -> expiresAt (인증 완료 플래그)

const CODE_TTL_MS = 10 * 60 * 1000; // 10분
const VERIFIED_TTL_MS = 30 * 60 * 1000; // 인증 완료 후 register/reset 수행까지 30분 유예

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const setCode = (purpose, email) => {
    const code = generateCode();
    codes.set(`${purpose}:${email}`, { code, expiresAt: Date.now() + CODE_TTL_MS });
    return code;
};

const verifyCode = (purpose, email, code) => {
    const key = `${purpose}:${email}`;
    const entry = codes.get(key);
    if (!entry || entry.expiresAt < Date.now() || entry.code !== code) {
        return false;
    }
    codes.delete(key);
    verified.set(key, Date.now() + VERIFIED_TTL_MS);
    return true;
};

const isVerified = (purpose, email) => {
    const key = `${purpose}:${email}`;
    const expiresAt = verified.get(key);
    if (!expiresAt || expiresAt < Date.now()) return false;
    return true;
};

const consumeVerified = (purpose, email) => {
    verified.delete(`${purpose}:${email}`);
};

module.exports = { setCode, verifyCode, isVerified, consumeVerified };
