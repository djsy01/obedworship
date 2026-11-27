export interface Score {
  id: number;
  title: string;
  song_key: string;
  bpm: number;
  category: string;
  file_url: string;
  filename: string;
  file_size: number | null;
  thumbnail_url: string | null;
  description: string | null;
  composer: string | null;
  arranger: string | null;
  original_song: string | null;
  is_original: boolean;
  copyright_info: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
  download_count: number;
  is_public: boolean;
}

export interface CreateScoreDto {
  title: string;
  song_key: string;
  bpm: number;
  category: string;
  file_url: string;
  filename: string;
  file_size?: number;
  thumbnail_url?: string;
  description?: string;
  composer?: string;
  arranger?: string;
  original_song?: string;
  is_original?: boolean;
  copyright_info?: string;
  uploaded_by?: string;
  is_public?: boolean;
}

export type UpdateScoreDto = Partial<Pick<Score, "title" | "song_key" | "bpm" | "category" | "description" | "composer" | "arranger">>;
