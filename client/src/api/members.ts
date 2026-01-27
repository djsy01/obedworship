import axios from "./axios";

export interface Member {
  id: number;
  name: string;
  affiliation: string;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  display_order?: number;
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
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  display_order?: number;
  description?: string;
}

export interface UpdateMemberDto {
  name?: string;
  affiliation?: string;
  photo_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  is_active?: boolean;
  display_order?: number;
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
