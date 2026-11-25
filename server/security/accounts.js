const { error } = require('../utils/sql');
const profileFields = 'id, email, name, role, phone, is_active, email_verified, created_at, last_login_at';
function emailAddress(input) {
    if (typeof input !== 'string') throw error(400, '이메일을 확인해주세요.');
    const email = input.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw error(400, '이메일을 확인해주세요.');
    return email;
}
function password(value) {
    if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value) > 72 ||
        !/[a-z]/i.test(value) || !/\d/.test(value) || !/[^a-z\d\s]/i.test(value)) {
        throw error(400, '영문, 숫자, 특수문자를 포함한 8자 이상, 72바이트 이하의 비밀번호가 필요합니다.');
    }
    return value;
}
module.exports = { emailAddress, password, profileFields };
