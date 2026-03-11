/**
 * worship.ts - Worship Events API Client
 *
 * Backend API Endpoints Required:
 * - GET    /worship         - Get all worship events
 * - GET    /worship?year=N  - Get worship events by year
 * - GET    /worship/:id     - Get single worship event
 * - POST   /worship         - Create new worship event
 * - PATCH  /worship/:id     - Update worship event
 * - DELETE /worship/:id     - Delete worship event
 *
 * Database Tables:
 * - worship_logs (main table)
 * - worship_songs (songs for each worship)
 * - worship_videos (videos)
 * - worship_photos (photos)
 * - worship_scores (sheet music)
 */
import axios from "./axios";

/**
 * Worship event data structure
 * Maps to worship_logs table in MySQL
 */
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
  // Ticket application related fields
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
  // Ticket application related fields
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
  // Fields related to meeting application
  application_enabled?: boolean;
  max_capacity?: number;
  application_deadline?: string;
}

export const worshipApi = {
  // View all meetings
  getAll: () => axios.get<Worship[]>("/worship"),

  // View meetings by year
  getByYear: (year: number) => axios.get<Worship[]>(`/worship?year=${year}`),

  // Check specific meeting
  getOne: (id: number) => axios.get<Worship>(`/worship/${id}`),

  // create assembly
  create: (data: CreateWorshipDto) => axios.post<Worship>("/worship", data),

  // Modify rally
  update: (id: number, data: UpdateWorshipDto) =>
    axios.patch<Worship>(`/worship/${id}`, data),

  // Delete meeting
  delete: (id: number) => axios.delete(`/worship/${id}`),
};
