import axios from "./axios";
import type { Score, CreateScoreDto, UpdateScoreDto } from "./scores-types";
import type { UploadResponse } from "./types";
export type * from "./scores-types";

export const scoreApi = {
  getAll: () => axios.get<Score[]>("/scores"),

  getByCategory: (category: string) =>
    axios.get<Score[]>("/scores", { params: { category } }),

  getByKey: (key: string) => axios.get<Score[]>("/scores", { params: { key } }),

  search: (keyword: string) => axios.get<Score[]>("/scores", { params: { search: keyword } }),

  getOne: (id: number) => axios.get<Score>(`/scores/${id}`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post<UploadResponse>("/scores/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000,
    });
  },

  create: (data: CreateScoreDto) => axios.post<Score>("/scores", data),

  update: (id: number, { title, song_key, bpm, category, description, composer, arranger }: UpdateScoreDto) =>
    axios.patch<Score>(`/scores/${id}`, { title, song_key, bpm, category, description, composer, arranger }),

  downloadFile: (id: number) =>
    axios.get(`/scores/download/${id}`, { responseType: "blob" }),

  delete: (id: number) => axios.delete(`/scores/${id}`),
};
