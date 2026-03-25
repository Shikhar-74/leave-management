import api from '@/lib/api';

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  employee: Employee;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  signup: (data: SignupPayload) => api.post<AuthResponse>('/auth/signup', data),

  login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string; expires_in: number }>('/auth/refresh', {
      refresh_token: refreshToken,
    }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refresh_token: refreshToken }),
};
