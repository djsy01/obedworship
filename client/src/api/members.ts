import axios from "./axios";
import type { Member, CreateMemberDto, UpdateMemberDto } from "./members-types";
export type * from "./members-types";

export const memberApi = {
  getAll: () => axios.get<Member[]>("/members"),

  getActive: () => axios.get<Member[]>("/members?active=true"),

  getByAffiliation: (affiliation: string) =>
    axios.get<Member[]>(`/members?affiliation=${affiliation}`),

  getOne: (id: number) => axios.get<Member>(`/members/${id}`),

  create: (data: CreateMemberDto) => axios.post<Member>("/members", data),

  update: (id: number, data: UpdateMemberDto) =>
    axios.patch<Member>(`/members/${id}`, data),

  delete: (id: number) => axios.delete(`/members/${id}`),

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
        timeout: 300000,
      },
    );
  },

  updateRoles: (memberId: number, roleTypes: string[]) =>
    axios.post(`/members/${memberId}/roles`, { roleTypes }),

  updateWorshipPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/worship-positions`, { positionTypes }),

  updateStepPositions: (memberId: number, positionTypes: string[]) =>
    axios.post(`/members/${memberId}/step-positions`, { positionTypes }),
};
