import axios from "./axios";

// 티켓 상태
export type TicketStatus = "OPEN" | "CLOSED" | "CANCELED";

// 신청 상태
export type ApplicationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

// 결제 상태
export type PaymentStatus = "UNPAID" | "PAID" | "FREE";

// 티켓 (집회 신청용)
export interface Ticket {
  id: number;
  worship_id?: number; // worship_logs 연결 (선택적)
  title: string;
  date: string;
  year: number;
  poster_url?: string;
  place?: string;
  preacher?: string;
  description?: string;
  status: TicketStatus;
  max_capacity?: number;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
  // 관계 데이터
  worship_logs?: {
    id: number;
    title: string;
    date: string;
    poster_url?: string;
  };
  _count?: {
    ticket_applications: number;
  };
}

// 티켓 생성 DTO
export interface CreateTicketDto {
  worship_id?: number;
  title: string;
  date: string;
  year: number;
  poster_url?: string;
  place?: string;
  preacher?: string;
  description?: string;
  status?: TicketStatus;
  max_capacity?: number;
  application_deadline?: string;
}

// 티켓 수정 DTO
export interface UpdateTicketDto {
  title?: string;
  date?: string;
  year?: number;
  poster_url?: string;
  place?: string;
  preacher?: string;
  description?: string;
  status?: TicketStatus;
  max_capacity?: number;
  application_deadline?: string;
}

// 티켓 신청
export interface TicketApplication {
  id: number;
  ticket_id: number;
  user_id: number;
  applicant_name: string;
  applicant_phone: string;
  applicant_email?: string;
  party_size: number;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  memo?: string;
  created_at: string;
  updated_at: string;
  // 관계 데이터
  tickets?: Ticket;
  users?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// 티켓 신청 생성 DTO
export interface CreateTicketApplicationDto {
  ticket_id: number;
  user_id: number;
  applicant_name: string;
  applicant_phone: string;
  applicant_email?: string;
  party_size?: number;
  memo?: string;
}

// 티켓 신청 수정 DTO
export interface UpdateTicketApplicationDto {
  applicant_name?: string;
  applicant_phone?: string;
  applicant_email?: string;
  party_size?: number;
  memo?: string;
}

// 신청 통계
export interface ApplicationStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

// ==========================================
// 티켓 API
// ==========================================
export const ticketApi = {
  // 전체 티켓 조회
  getAll: () => axios.get<Ticket[]>("/tickets"),

  // 열린 티켓만 조회 (신청 가능한 것)
  getOpen: () => axios.get<Ticket[]>("/tickets?status=OPEN"),

  // 연도별 티켓 조회
  getByYear: (year: number) => axios.get<Ticket[]>(`/tickets?year=${year}`),

  // 특정 티켓 조회
  getById: (id: number) => axios.get<Ticket>(`/tickets/${id}`),

  // 티켓 생성
  create: (data: CreateTicketDto) => axios.post<Ticket>("/tickets", data),

  // 티켓 수정
  update: (id: number, data: UpdateTicketDto) =>
    axios.patch<Ticket>(`/tickets/${id}`, data),

  // 티켓 삭제
  delete: (id: number) => axios.delete(`/tickets/${id}`),

  // 티켓 마감
  close: (id: number) =>
    axios.patch<Ticket>(`/tickets/${id}`, { status: "CLOSED" }),

  // 티켓 취소
  cancel: (id: number) =>
    axios.patch<Ticket>(`/tickets/${id}`, { status: "CANCELED" }),

  // worship_logs에서 티켓 생성 (기존 집회 정보 연결)
  createFromWorship: (worshipId: number, data: Partial<CreateTicketDto>) =>
    axios.post<Ticket>("/tickets/from-worship", { worship_id: worshipId, ...data }),
};

// ==========================================
// 티켓 신청 API
// ==========================================
export const ticketApplicationApi = {
  // 전체 신청 조회
  getAll: () => axios.get<TicketApplication[]>("/ticket-applications"),

  // 사용자별 신청 조회
  getByUser: (userId: number) =>
    axios.get<TicketApplication[]>(`/ticket-applications?user_id=${userId}`),

  // 티켓별 신청 조회
  getByTicket: (ticketId: number) =>
    axios.get<TicketApplication[]>(
      `/ticket-applications?ticket_id=${ticketId}`
    ),

  // 특정 신청 조회
  getById: (id: number) =>
    axios.get<TicketApplication>(`/ticket-applications/${id}`),

  // 티켓별 통계
  getStats: (ticketId: number) =>
    axios.get<ApplicationStats>(`/ticket-applications/stats/${ticketId}`),

  // 신청 생성
  create: (data: CreateTicketApplicationDto) =>
    axios.post<TicketApplication>("/ticket-applications", data),

  // 신청 수정
  update: (id: number, data: UpdateTicketApplicationDto) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}`, data),

  // 신청 취소
  cancel: (id: number) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/cancel`),

  // 상태 변경 (관리자)
  updateStatus: (id: number, status: ApplicationStatus) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/status`, {
      status,
    }),

  // 결제 상태 변경 (관리자)
  updatePaymentStatus: (id: number, paymentStatus: PaymentStatus) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/payment`, {
      payment_status: paymentStatus,
    }),

  // 신청 삭제
  delete: (id: number) => axios.delete(`/ticket-applications/${id}`),
};
