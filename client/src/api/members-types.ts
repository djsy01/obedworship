export interface Member {
  id: number;
  name: string;
  affiliation: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
  member_roles?: Array<{ role_type: string }>;
  member_worship_positions?: Array<{ position_type: string }>;
  member_step_positions?: Array<{ position_type: string }>;
}

export interface CreateMemberDto {
  name: string;
  affiliation: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
}

export interface UpdateMemberDto {
  name?: string;
  affiliation?: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
}
