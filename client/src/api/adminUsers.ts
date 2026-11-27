import axios from "./axios";

export type EditableRole = "user" | "operator";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: EditableRole | "admin";
  created_at: string;
}

type SuccessResponse<T> = { success: true; data: T };

const usersPath = "/admin/users";

export const adminUsersApi = {
  searchByEmail: (email: string) =>
    axios.get<SuccessResponse<AdminUser[]>>(usersPath, { params: { email } }),

  updateRole: (id: number, role: EditableRole) =>
    axios.patch<SuccessResponse<Omit<AdminUser, "created_at">>>(
      `${usersPath}/${id}/role`,
      { role },
    ),
};
