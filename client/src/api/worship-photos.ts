import axios from "./axios";
import type { UploadResponse } from "./types";

export interface WorshipPhoto {
  id: number;
  worship_id: number;
  photo_url: string;
  thumbnail_url?: string;
  file_name: string;
  file_size?: number;
  photo_order: number;
  created_at?: string;
}

export interface CreateWorshipPhotoDto {
  worship_id: number;
  photo_url: string;
  file_name: string;
  photo_order?: number;
}

export interface UpdateWorshipPhotoDto {
  photo_url?: string;
  photo_order?: number;
}

const BASE_URL = "/worship-photos";

export const worshipPhotoApi = {
  getAll: () => axios.get<WorshipPhoto[]>(BASE_URL),

  getByWorshipId: (worshipId: number) =>
    axios.get<WorshipPhoto[]>(`${BASE_URL}/worship/${worshipId}`),

  getOne: (id: number) => axios.get<WorshipPhoto>(`${BASE_URL}/${id}`),

  // Upload file (using photos endpoint)
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post<UploadResponse>("/photos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  create: (data: CreateWorshipPhotoDto) =>
    axios.post<WorshipPhoto>(BASE_URL, data),

  update: (id: number, data: UpdateWorshipPhotoDto) =>
    axios.patch<WorshipPhoto>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => axios.delete(`${BASE_URL}/${id}`),
};
