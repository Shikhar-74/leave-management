import api from '@/lib/api';

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  joining_date: string | null;
  phone_number: string | null;
  designation: string | null;
  manager_id: number | null;
  profile_photo_url: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  marital_status: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone_number?: string | null;
  designation?: string | null;
  department?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  password?: string;
}

export interface EmployeeListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  joining_date: string | null;
  designation: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  employees: EmployeeListItem[];
}

export const profileService = {
  getProfile: () => api.get<ProfileData>('/profile'),

  updateProfile: (data: UpdateProfilePayload) =>
    api.put<ProfileData & { message: string }>('/profile', data),

  getAllEmployees: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<EmployeeListResponse>('/employees', { params }),

  deleteEmployee: (employeeId: number, reason?: string) =>
    api.delete(`/profile/${employeeId}`, { params: reason ? { reason } : undefined }),
};
