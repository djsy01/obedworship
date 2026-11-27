import type { TicketApplication } from "./tickets";
import type { UserProfile, UserQna, ScoreDownload } from "./mypage-profile-types";

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
