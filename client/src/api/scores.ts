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
  // 전체 조회
  getAll: () => axios.get<Score[]>("/scores"),

  // 카테고리별 조회
  getByCategory: (category: string) =>
    axios.get<Score[]>(`/scores?category=${category}`),

  // 음계별 조회
  getByKey: (key: string) => axios.get<Score[]>(`/scores?key=${key}`),

  // 검색
  search: (keyword: string) => axios.get<Score[]>(`/scores?search=${keyword}`),

  // 특정 악보 조회
  getOne: (id: number) => axios.get<Score>(`/scores/${id}`),

  // 파일 업로드
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post("/scores/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 악보 생성
  create: (data: CreateScoreDto) => axios.post<Score>("/scores", data),

  // 악보 수정
  update: (id: number, data: UpdateScoreDto) =>
    axios.patch<Score>(`/scores/${id}`, data),

  // 파일 다운로드 (DB에서 조회)
  downloadFile: (id: number) =>
    axios.get(`/scores/download/${id}`, { responseType: "blob" }),

  // 악보 삭제
  delete: (id: number) => axios.delete(`/scores/${id}`),
};
