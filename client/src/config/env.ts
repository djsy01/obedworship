export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// 백엔드가 "/files/15" 같은 상대경로를 내려줄 때, 프론트 도메인이 아니라
// 백엔드 도메인(BASE_URL) 기준으로 이미지/오디오를 불러오도록 절대경로로 바꿔준다.
export const toAbsoluteFileUrl = (url?: string | null): string => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
