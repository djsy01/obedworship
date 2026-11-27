import axios from "./axios";

export type QnaCategory = "집회" | "악보" | "기타";
export interface CreateQnaDto {
  category: QnaCategory;
  title: string;
  content: string;
}
export interface AnswerQnaDto {
  answer: string;
}
export interface Qna {
  id: number;
  user_id?: number;
  author_label: string;
  can_delete: boolean;
  category: QnaCategory;
  title: string;
  content: string;
  answer: string | null;
  answer_date: string | null;
  status: "WAITING" | "ANSWERED";
  created_at: string;
  updated_at: string;
}
export const qnaApi = {
  getAll: () => axios.get<Qna[]>("/qna"),
  getByCategory: (category: QnaCategory) => axios.get<Qna[]>("/qna", { params: { category } }),
  getOne: (id: number) => axios.get<Qna>(`/qna/${id}`),
  create: (data: CreateQnaDto) => axios.post<Qna>("/qna", data),
  answer: (id: number, data: AnswerQnaDto) => axios.patch<Qna>(`/qna/${id}/answer`, data),
  delete: (id: number) => axios.delete(`/qna/${id}`),
};
