import axios from "./axios";

export interface WorshipVideo {
  id: number;
  worship_id: number;
  video_url: string;
  video_order: number;
  created_at?: string;
}

export interface CreateWorshipVideoDto {
  worship_id: number;
  video_url: string;
  video_order?: number;
}

export interface UpdateWorshipVideoDto {
  video_url?: string;
  video_order?: number;
}

const BASE_URL = "/worship-videos";

export const worshipVideoApi = {
  getAll: () => axios.get<WorshipVideo[]>(BASE_URL),

  getByWorshipId: (worshipId: number) =>
    axios.get<WorshipVideo[]>(`${BASE_URL}/worship/${worshipId}`),

  getOne: (id: number) => axios.get<WorshipVideo>(`${BASE_URL}/${id}`),

  create: (data: CreateWorshipVideoDto) =>
    axios.post<WorshipVideo>(BASE_URL, data),

  update: (id: number, data: UpdateWorshipVideoDto) =>
    axios.patch<WorshipVideo>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => axios.delete(`${BASE_URL}/${id}`),
};
