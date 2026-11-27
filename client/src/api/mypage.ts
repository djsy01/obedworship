import axios from "./axios";
import type { TicketApplication } from "./tickets";

import type { UserProfile, UserQna, ScoreDownload } from "./mypage-profile-types";
import type { Dashboard, ActivitySummary, UpdateProfileDto } from "./mypage-dashboard-types";

export type * from "./mypage-profile-types";
export type * from "./mypage-dashboard-types";

export const mypageApi = {
  // Dashboard (full information)
  getDashboard: (userId: number) =>
    axios.get<Dashboard>(`/mypage/${userId}/dashboard`),

  //Check profile
  getProfile: (userId: number) =>
    axios.get<UserProfile>(`/mypage/${userId}/profile`),

  // Meeting application details
  getApplications: (userId: number) =>
    axios.get<TicketApplication[]>(`/mypage/${userId}/applications`),

  // Q&A inventory
  getQnas: (userId: number) => axios.get<UserQna[]>(`/mypage/${userId}/qnas`),

  // Sheet music download history
  getDownloads: (userId: number) =>
    axios.get<ScoreDownload[]>(`/mypage/${userId}/downloads`),

  // activity summary
  getActivity: (userId: number, days: number = 30) =>
    axios.get<ActivitySummary>(`/mypage/${userId}/activity?days=${days}`),

  // edit profile
  updateProfile: (userId: number, data: UpdateProfileDto) =>
    axios.patch<UserProfile>(`/mypage/${userId}/profile`, data),
};
