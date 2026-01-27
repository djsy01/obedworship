import axios from "./axios";

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

export interface UpdateScoreDto {
  title?: string;
  song_key?: string;
  bpm?: number;
  category?: string;
  description?: string;
  composer?: string;
  arranger?: string;
}

export const scoreApi = {
  // View all
  getAll: () => axios.get<Score[]>("/scores"),

  // Search by category
  getByCategory: (category: string) =>
    axios.get<Score[]>(`/scores?category=${category}`),

  // Search by scale
  getByKey: (key: string) => axios.get<Score[]>(`/scores?key=${key}`),

  // search
  search: (keyword: string) => axios.get<Score[]>(`/scores?search=${keyword}`),

  // Look up specific sheet music
  getOne: (id: number) => axios.get<Score>(`/scores/${id}`),

  // file upload
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post("/scores/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Generate sheet music
  create: (data: CreateScoreDto) => axios.post<Score>("/scores", data),

  // Edit sheet music
  update: (id: number, data: UpdateScoreDto) =>
    axios.patch<Score>(`/scores/${id}`, data),

  // Download file (search in DB)
  downloadFile: (id: number) =>
    axios.get(`/scores/download/${id}`, { responseType: "blob" }),

  // Delete sheet music
  delete: (id: number) => axios.delete(`/scores/${id}`),
};
