import axios from "./axios";

export function verificationFlow(verifyUrl: string) {
  let confirmedEmail = "";
  let proof = "";

  async function verify(email: string, code: string) {
    const response = await axios.post<{ success: boolean; verificationToken: string }>(verifyUrl, { email, code });
    confirmedEmail = email.trim().toLowerCase();
    proof = response.data.verificationToken;
    return response;
  }

  function token(email: string) {
    return email.trim().toLowerCase() === confirmedEmail ? proof : "";
  }

  return { verify, token };
}
