import axios from "./axios";
import type { TicketApplication } from "./tickets";

// user profile
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member" | "user";
  phone?: string;
  profile_photo_url?: string;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string;
  members?: {
    id: number;
    name: string;
    affiliation: string;
    photo_url?: string;
    member_roles: Array<{ role_type: string }>;
    member_worship_positions: Array<{ position_type: string }>;
    member_step_positions: Array<{ position_type: string }>;
  }[];
}

// Q&A
export interface UserQna {
  id: number;
  user_id: number;
  category: "집회" | "악보" | "기타";
  title: string;
  content: string;
  answer?: string;
  answer_date?: string;
  status: "WAITING" | "ANSWERED";
  created_at: string;
  updated_at: string;
}

// Sheet music download history
export interface ScoreDownload {
  id: number;
  score_id: number;
  user_id: number;
  downloaded_at: string;
  scores: {
    id: number;
    title: string;
    category: string;
    song_key: string;
    bpm: number;
    thumbnail_url?: string;
    file_url: string;
  };
}

// Dashboard Statistics
export interface DashboardStats {
  totalApplications: number;
  confirmedApplications: number;
  totalQnas: number;
  answeredQnas: number;
  totalDownloads: number;
}

// Dashboard entire data
export interface Dashboard {
  profile: UserProfile;
  applications: TicketApplication[];
  qnas: UserQna[];
  downloads: ScoreDownload[];
  stats: DashboardStats;
}

// activity summary
export interface ActivitySummary {
  period: string;
  recentApplications: number;
  recentQnas: number;
  recentDownloads: number;
}

// Edit profile DTO
export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  profile_photo_url?: string;
}

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
