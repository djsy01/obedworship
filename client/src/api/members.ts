/**
 * members.ts - Team Members API Client
 *
 * Backend API Endpoints Required:
 * - GET    /members                    - Get all members (with roles and positions)
 * - GET    /members?active=true        - Get only active members
 * - GET    /members?affiliation=X      - Filter by affiliation
 * - GET    /members/:id                - Get single member
 * - POST   /members                    - Create new member
 * - PATCH  /members/:id                - Update member
 * - DELETE /members/:id                - Delete member
 * - POST   /members/upload-photo       - Upload member photo (multipart/form-data)
 * - POST   /members/:id/roles          - Update member's leadership roles
 * - POST   /members/:id/worship-positions - Update worship positions
 * - POST   /members/:id/step-positions - Update step team positions
 *
 * Database Tables:
 * - members (main table)
 * - member_roles (leadership roles - Pastor, Elder, Team Leader, etc.)
 * - member_worship_positions (Vocal, Piano, Guitar, Drum, etc.)
 * - member_step_positions (Media Team, Stage Team, etc.)
 *
 * Note: When fetching members, include joined data from role/position tables
 */
import axios from "./axios";

/**
 * Member data structure with joined roles and positions
 * Maps to members table with LEFT JOINs on role/position tables
 */
export interface Member {
  id: number;
  name: string;
  affiliation: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
  member_roles?: Array<{ role_type: string }>;
  member_worship_positions?: Array<{ position_type: string }>;
  member_step_positions?: Array<{ position_type: string }>;
}

export interface CreateMemberDto {
  name: string;
  affiliation: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
}

export interface UpdateMemberDto {
  name?: string;
  affiliation?: string;
  user_id?: number;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  description?: string;
}

export const memberApi = {
  // Check all members
  getAll: () => axios.get<Member[]>("/members"),

  // Search only active members
  getActive: () => axios.get<Member[]>("/members?active=true"),

  // Check members by affiliation
  getByAffiliation: (affiliation: string) =>
    axios.get<Member[]>(`/members?affiliation=${affiliation}`),

  // Look up specific members
  getOne: (id: number) => axios.get<Member>(`/members/${id}`),

  // create member
  create: (data: CreateMemberDto) => axios.post<Member>("/members", data),

  // edit member
  update: (id: number, data: UpdateMemberDto) =>
    axios.patch<Member>(`/members/${id}`, data),

  // delete member
  delete: (id: number) => axios.delete(`/members/${id}`),

  // upload photo
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axios.post<{ photo_url: string }>(
      "/members/upload-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  // Update roles
  updateRoles: (memberId: number, roleTypes: string[]) =>
    axios.post(`/members/${memberId}/roles`, { roleTypes }),

  // Worship position update
  updateWorshipPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/worship-positions`, { positionTypes }),

  // Step position update
  updateStepPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/step-positions`, { positionTypes }),
};
