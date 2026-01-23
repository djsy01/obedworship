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
  // 전체 멤버 조회
  getAll: () => axios.get<Member[]>("/members"),

  // 활동중인 멤버만 조회
  getActive: () => axios.get<Member[]>("/members?active=true"),

  // 소속별 멤버 조회
  getByAffiliation: (affiliation: string) =>
    axios.get<Member[]>(`/members?affiliation=${affiliation}`),

  // 특정 멤버 조회
  getOne: (id: number) => axios.get<Member>(`/members/${id}`),

  // 멤버 생성
  create: (data: CreateMemberDto) => axios.post<Member>("/members", data),

  // 멤버 수정
  update: (id: number, data: UpdateMemberDto) =>
    axios.patch<Member>(`/members/${id}`, data),

  // 멤버 삭제
  delete: (id: number) => axios.delete(`/members/${id}`),

  // 사진 업로드
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axios.post<{ photo_url: string }>("/members/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 역할(Roles) 업데이트
  updateRoles: (memberId: number, roleTypes: string[]) =>
    axios.post(`/members/${memberId}/roles`, { roleTypes }),

  // Worship 포지션 업데이트
  updateWorshipPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/worship-positions`, { positionTypes }),

  // Step 포지션 업데이트
  updateStepPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/step-positions`, { positionTypes }),
};
