import api from '@/lib/api';

export interface LeaveBalance {
  employee_id: number;
  year: number;
  total_leaves: number;
  leaves_taken: number;
  remaining_leaves: number;
}

export interface LeaveRecord {
  leave_id: number;
  employee_id?: number;
  employee_name?: string;
  employee_email?: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  days_requested: number;
  status: string;
  reason?: string | null;
  admin_remark?: string | null;
  applied_at?: string;
}

export interface LeavesResponse {
  total: number;
  page: number;
  limit: number;
  leaves: LeaveRecord[];
}

export interface ApplyLeavePayload {
  start_date: string;
  end_date: string;
  leave_type: string;
  reason?: string;
}

export const leaveService = {
  getBalance: (employeeId: number, year: number) =>
    api.get<LeaveBalance>(`/employees/${employeeId}/leave-balance?year=${year}`),

  apply: (data: ApplyLeavePayload) =>
    api.post<LeaveRecord>('/leaves/apply', data),

  getMyLeaves: (params?: { status?: string; year?: number; page?: number; limit?: number }) =>
    api.get<LeavesResponse>('/leaves/my', { params }),

  getAllLeaves: (params?: { status?: string; year?: number; page?: number; limit?: number }) =>
    api.get<LeavesResponse>('/leaves/all', { params }),

  getLeaveById: (leaveId: number) =>
    api.get<LeaveRecord>(`/leaves/${leaveId}`),

  cancelLeave: (leaveId: number) =>
    api.patch<{ leave_id: number; status: string; message: string }>(
      `/leaves/${leaveId}/cancel`,
    ),
    
  processLeave: (leaveId: number, data: { status: 'APPROVED' | 'REJECTED'; admin_remark: string }) =>
    api.patch<{ leave_id: number; status: string; admin_remark: string; message: string }>(
      `/leaves/${leaveId}/process`,
      data
    ),
};
