import axios from "./axios";

// ticket status
export type TicketStatus = "OPEN" | "CLOSED" | "CANCELED";

// application status
export type ApplicationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

// payment status
export type PaymentStatus = "UNPAID" | "PAID" | "FREE";

// Ticket (for meeting application)
export interface Ticket {
  id: number;
  worship_id?: number; //Connect worship_logs (optional)
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
  // relationship data
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

// create ticket DTO
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

// modify ticket DTO
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

// Apply for ticket
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
  // relationship data
  tickets?: Ticket;
  users?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// Generate ticket request DTO
export interface CreateTicketApplicationDto {
  ticket_id: number;
  user_id: number;
  applicant_name: string;
  applicant_phone: string;
  applicant_email?: string;
  party_size?: number;
  memo?: string;
}

// Modify ticket application DTO
export interface UpdateTicketApplicationDto {
  applicant_name?: string;
  applicant_phone?: string;
  applicant_email?: string;
  party_size?: number;
  memo?: string;
}

// application statistics
export interface ApplicationStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

// ==========================================
// Ticket API
// ==========================================
export const ticketApi = {
  // View all tickets
  getAll: () => axios.get<Ticket[]>("/tickets"),

  // Check only open tickets (those that can be applied for)
  getOpen: () => axios.get<Ticket[]>("/tickets?status=OPEN"),

  // Check tickets by year
  getByYear: (year: number) => axios.get<Ticket[]>(`/tickets?year=${year}`),

  // Look up a specific ticket
  getById: (id: number) => axios.get<Ticket>(`/tickets/${id}`),

  // create ticket
  create: (data: CreateTicketDto) => axios.post<Ticket>("/tickets", data),

  // edit ticket
  update: (id: number, data: UpdateTicketDto) =>
    axios.patch<Ticket>(`/tickets/${id}`, data),

  // delete ticket
  delete: (id: number) => axios.delete(`/tickets/${id}`),

  // Ticket Deadline
  close: (id: number) =>
    axios.patch<Ticket>(`/tickets/${id}`, { status: "CLOSED" }),

  // Cancel ticket
  cancel: (id: number) =>
    axios.patch<Ticket>(`/tickets/${id}`, { status: "CANCELED" }),

  // Create ticket from worship_logs (link to existing rally information)
  createFromWorship: (worshipId: number, data: Partial<CreateTicketDto>) =>
    axios.post<Ticket>("/tickets/from-worship", {
      worship_id: worshipId,
      ...data,
    }),
};

// ==========================================
// Ticket Application API
// ==========================================
export const ticketApplicationApi = {
  // View all applications
  getAll: () => axios.get<TicketApplication[]>("/ticket-applications"),

  // View applications by user
  getByUser: (userId: number) =>
    axios.get<TicketApplication[]>(`/ticket-applications?user_id=${userId}`),

  // View applications by ticket
  getByTicket: (ticketId: number) =>
    axios.get<TicketApplication[]>(
      `/ticket-applications?ticket_id=${ticketId}`,
    ),

  // Check specific application
  getById: (id: number) =>
    axios.get<TicketApplication>(`/ticket-applications/${id}`),

  // application statistics
  getStats: (ticketId: number) =>
    axios.get<ApplicationStats>(`/ticket-applications/stats/${ticketId}`),

  // create application
  create: (data: CreateTicketApplicationDto) =>
    axios.post<TicketApplication>("/ticket-applications", data),

  // edit application
  update: (id: number, data: UpdateTicketApplicationDto) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}`, data),

  // Cancel application
  cancel: (id: number) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/cancel`),

  // change state (admin)
  updateStatus: (id: number, status: ApplicationStatus) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/status`, {
      status,
    }),

  // Change payment status (Administrator)
  updatePaymentStatus: (id: number, paymentStatus: PaymentStatus) =>
    axios.patch<TicketApplication>(`/ticket-applications/${id}/payment`, {
      payment_status: paymentStatus,
    }),

  // Delete application
  delete: (id: number) => axios.delete(`/ticket-applications/${id}`),
};
