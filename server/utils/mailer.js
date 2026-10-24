const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'OBED Worship <onboarding@resend.dev>';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const sendVerificationEmail = async (to, code) => {
    if (!resend) {
        throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: `[OBED Worship] 인증번호 ${code}`,
        html: `<p>요청하신 인증번호입니다. 10분 이내에 입력해주세요.</p><h2>${code}</h2>`,
    });
};

module.exports = { sendVerificationEmail };
