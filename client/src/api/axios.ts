import axios from "axios";
import { BASE_URL } from "@/config/env";
import { clearSession, mockToken, sessionToken } from "@/composables/session";

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = sessionToken();
    if (token && config.url !== "/auth/login") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = sessionToken();
    const authorization = error.config?.headers?.get("Authorization");
    if (error.response?.status === 401 && token && authorization === `Bearer ${token}` &&
        !(import.meta.env.DEV && token === mockToken)) {
      clearSession(token, true);
    }
    return Promise.reject(error);
  },
);

export default instance;

export { qnaApi } from "./qna";
export { scoreApi } from "./scores";
export { memberApi } from "./members";
export { worshipApi } from "./worship";
export { worshipSongApi } from "./worship-songs";
export { worshipVideoApi } from "./worship-videos";
export { worshipPhotoApi } from "./worship-photos";
export { worshipScoreApi } from "./worship-scores";
export { ticketApi, ticketApplicationApi } from "./tickets";
export { mypageApi } from "./mypage";
export type * from "./qna";
export type * from "./scores";
export type * from "./members";
export type * from "./worship";
export type * from "./worship-songs";
export type * from "./worship-videos";
export type * from "./worship-photos";
export type * from "./worship-scores";
export type * from "./tickets";
export type * from "./mypage";
export type * from "./types";
