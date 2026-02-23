import axios from "./axios";

export interface WorshipSong {
  id: number;
  worship_id: number;
  category: "opening" | "celebration";
  song_order: number;
  song_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorshipSongDto {
  worship_id: number;
  category: "opening" | "celebration";
  song_order: number;
  song_name: string;
}

export interface UpdateWorshipSongDto {
  category?: "opening" | "celebration";
  song_order?: number;
  song_name?: string;
}

const BASE_URL = "/worship-songs";

export const worshipSongApi = {
  getAll: () => axios.get<WorshipSong[]>(BASE_URL),

  getByWorshipId: (worshipId: number) =>
    axios.get<WorshipSong[]>(`${BASE_URL}/worship/${worshipId}`),

  getOne: (id: number) => axios.get<WorshipSong>(`${BASE_URL}/${id}`),

  create: (data: CreateWorshipSongDto) =>
    axios.post<WorshipSong>(BASE_URL, data),

  update: (id: number, data: UpdateWorshipSongDto) =>
    axios.patch<WorshipSong>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => axios.delete(`${BASE_URL}/${id}`),
};
