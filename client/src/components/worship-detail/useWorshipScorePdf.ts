import { onScopeDispose, ref } from "vue";
import api from "@/api/axios";
import type { WorshipScore } from "@/api/worship-scores";
import { isLoggedIn, sessionToken } from "@/composables/session";
import { BASE_URL, toAbsoluteFileUrl } from "@/config/env";
import { saveBlob } from "@/utils/download";

async function scorePdf(score: WorshipScore) {
  const url = new URL(toAbsoluteFileUrl(score.file_url), location.origin);
  const base = new URL(BASE_URL.replace(/\/$/, "") + "/files/", location.origin);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid score URL");
  if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) {
    return (await api.get<Blob>(url.href, { responseType: "blob" })).data;
  }
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) throw new Error("Score file unavailable");
  return response.blob();
}

export function useWorshipScorePdf() {
  const previewUrl = ref("");
  let previewRequest = 0;
  function closePreview() {
    previewRequest++;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
  async function previewScore(score: WorshipScore) {
    if (!isLoggedIn.value) return;
    closePreview();
    const request = previewRequest;
    const token = sessionToken();
    try {
      const pdf = await scorePdf(score);
      if (request !== previewRequest || token !== sessionToken()) return;
      if (pdf.type !== "application/pdf") throw new Error("Invalid PDF response");
      previewUrl.value = URL.createObjectURL(pdf);
    } catch {
      if (request === previewRequest) alert("악보를 미리 볼 수 없습니다.");
    }
  }
  async function downloadScore(score?: WorshipScore) {
    if (!isLoggedIn.value || !score) return;
    const token = sessionToken();
    try {
      const pdf = await scorePdf(score);
      if (token === sessionToken()) saveBlob(pdf, score.filename);
    } catch {
      alert("악보를 다운로드하지 못했습니다.");
    }
  }
  onScopeDispose(closePreview);
  return { previewUrl, previewScore, closePreview, downloadScore };
}
