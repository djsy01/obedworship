/**
 * qna.ts - Q&A API Client
 *
 * Backend API Endpoints Required:
 * - GET    /qna                    - Get all Q&A entries
 * - GET    /qna?category=X         - Filter by category (집회/악보/기타)
 * - GET    /qna/:id                - Get single Q&A
 * - POST   /qna                    - Create new question
 * - PATCH  /qna/:id/answer         - Admin: Add/update answer
 * - DELETE /qna/:id                - Delete Q&A
 *
 * Database Table: qna
 *
 * Status Flow:
 * - User creates question -> status: "WAITING"
 * - Admin answers -> status: "ANSWERED", answer_date: now()
 *
 * Note: Questions are created with user_id for tracking
 * but user info is NOT displayed publicly (privacy protection)
 */
import axios from "./axios";

/**
 * DTO for creating a new Q&A question
 */
export interface CreateQnaDto {
  user_id: string;
  category: "집회" | "악보" | "기타";
  title: string;
  content: string;
}

export interface AnswerQnaDto {
  answer: string;
}

export interface Qna {
  id: number;
  user_id: string;
  category: string;
  title: string;
  content: string;
  answer: string | null;
  answer_date: string | null;
  status: "WAITING" | "ANSWERED";
  created_at: string;
  updated_at: string;
}

// API function
export const qnaApi = {
  // View all
  getAll: () => {
    return axios.get<Qna[]>("/qna");
  },

  // Search by category
  getByCategory: (category: "집회" | "악보" | "기타") => {
    return axios.get<Qna[]>(`/qna?category=${category}`);
  },

  // Specific QnA query
  getOne: (id: number) => {
    return axios.get<Qna>(`/qna/${id}`);
  },

  // Create QnA
  create: (data: CreateQnaDto) => {
    return axios.post<Qna>("/qna", data);
  },

  // Register response
  answer: (id: number, data: AnswerQnaDto) => {
    return axios.patch<Qna>(`/qna/${id}/answer`, data);
  },

  // Delete QnA
  delete: (id: number) => {
    return axios.delete(`/qna/${id}`);
  },
};
