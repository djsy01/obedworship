import axios from "./axios";
import type { UploadResponse } from "./types";

export interface WorshipScore {
  id: number;
  worship_id: number;
  filename: string;
  file_url: string;
  file_size?: number;
  thumbnail_url?: string;
  description?: string;
  created_at?: string;
}

export interface CreateWorshipScoreDto {
  worship_id: number;
  filename: string;
  file_url: string;
  description?: string;
}

export interface UpdateWorshipScoreDto {
  filename?: string;
  file_url?: string;
  thumbnail_url?: string;
  description?: string;
}

const BASE_URL = "/worship-scores";

export const worshipScoreApi = {
  getAll: () => axios.get<WorshipScore[]>(BASE_URL),

  getByWorshipId: (worshipId: number) =>
    axios.get<WorshipScore[]>(`${BASE_URL}/worship/${worshipId}`),

  getOne: (id: number) => axios.get<WorshipScore>(`${BASE_URL}/${id}`),

  // Upload file (using scores endpoint)
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post<UploadResponse>("/scores/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  create: (data: CreateWorshipScoreDto) =>
    axios.post<WorshipScore>(BASE_URL, data),

  update: (id: number, data: UpdateWorshipScoreDto) =>
    axios.patch<WorshipScore>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => axios.delete(`${BASE_URL}/${id}`),
};
