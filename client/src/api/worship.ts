import axios from "./axios";

export interface Worship {
  id: number;
  title: string;
  date: string;
  year: number;
  preacher: string;
  worship_team: string;
  guest?: string;
  description: string;
  poster_url?: string;
  comments?: string;
  entry_time?: string;
  start_time?: string;
  location?: string;
  location_link?: string;
  parking?: string;
  seating?: string;
  promo_video?: string;
  prelisten_video?: string;
  opening_songs?: string[];
  celebration_songs?: string[];
  excluded_songs?: string[];
  // 집회 신청 관련 필드
  application_enabled?: boolean;
  max_capacity?: number;
  application_deadline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorshipDto {
  title: string;
  date: string;
  year: number;
  preacher: string;
  worship_team: string;
  guest?: string;
  description: string;
  poster_url?: string;
  comments?: string;
  entry_time?: string;
  start_time?: string;
  location?: string;
  location_link?: string;
  parking?: string;
  seating?: string;
  promo_video?: string;
  prelisten_video?: string;
  opening_songs?: string[];
  celebration_songs?: string[];
  excluded_songs?: string[];
  // 집회 신청 관련 필드
  application_enabled?: boolean;
  max_capacity?: number;
  application_deadline?: string;
}

export interface UpdateWorshipDto {
  title?: string;
  date?: string;
  year?: number;
  preacher?: string;
  worship_team?: string;
  guest?: string;
  description?: string;
  poster_url?: string;
  comments?: string;
  entry_time?: string;
  start_time?: string;
  location?: string;
  location_link?: string;
  parking?: string;
  seating?: string;
  promo_video?: string;
  prelisten_video?: string;
  opening_songs?: string[];
  celebration_songs?: string[];
  excluded_songs?: string[];
  // 집회 신청 관련 필드
  application_enabled?: boolean;
  max_capacity?: number;
  application_deadline?: string;
}

export const worshipApi = {
  // 전체 집회 조회
  getAll: () => axios.get<Worship[]>("/worship"),

  // 연도별 집회 조회
  getByYear: (year: number) => axios.get<Worship[]>(`/worship?year=${year}`),

  // 특정 집회 조회
  getOne: (id: number) => axios.get<Worship>(`/worship/${id}`),

  // 집회 생성
  create: (data: CreateWorshipDto) => axios.post<Worship>("/worship", data),

  // 집회 수정
  update: (id: number, data: UpdateWorshipDto) =>
    axios.patch<Worship>(`/worship/${id}`, data),

  // 집회 삭제
  delete: (id: number) => axios.delete(`/worship/${id}`),
};
