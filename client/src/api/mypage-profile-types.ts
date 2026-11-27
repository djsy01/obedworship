import type { UserRole } from "./auth-types";

// user profile
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: UserRole;
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
