'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { leaveService, LeaveRecord } from '@/services/leave.service';
import { formatDate, getStatusColor, getLeaveTypeColor, timeAgo } from '@/lib/utils';
import { CalendarDays, Clock, Search, Filter, Ban, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminLeavesPage() {
  const { employee } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [adminRemark, setAdminRemark] = useState('');
  const [processType, setProcessType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState('');

  const limit = 10;

  const fetchLeaves = async (currentPage: number, currentStatus: string) => {
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const params: any = { page: currentPage, limit, year };
      if (currentStatus) params.status = currentStatus;

      const res = await leaveService.getAllLeaves(params);
      setLeaves([...res.data.leaves]);
      setTotal(res.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee?.role === 'ADMIN') {
      fetchLeaves(page, statusFilter);
    }
  }, [employee, page, statusFilter]);

  const openProcessModal = (leave: LeaveRecord, type: 'APPROVED' | 'REJECTED') => {
    setSelectedLeave(leave);
    setProcessType(type);
    setAdminRemark('');
    setProcessError('');
    setProcessModalOpen(true);
  };

  const handleProcess = async () => {
    if (!adminRemark.trim()) {
      setProcessError('Admin remark is strictly mandatory.');
      return;
    }

    if (!selectedLeave || !processType) return;

    setProcessing(true);
    setProcessError('');
    try {
      await leaveService.processLeave(selectedLeave.leave_id, {
        status: processType,
        admin_remark: adminRemark,
      });
      setProcessModalOpen(false);
      // Refresh list
      fetchLeaves(page, statusFilter);
    } catch (error: any) {
      setProcessError(error.response?.data?.message || 'Failed to process leave');
    } finally {
      setProcessing(false);
    }
  };

  if (employee?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">You do not have access to this page.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage employee leaves</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <Clock className="w-5 h-5 animate-spin" /> Fetching leaves...
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No leave requests found</p>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.leave_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{leave.employee_name}</p>
                      <p className="text-xs text-gray-500">{leave.employee_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{formatDate(leave.start_date)} — {formatDate(leave.end_date)}</p>
                      <p className="text-xs text-gray-500">{leave.days_requested} day(s) requested</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="max-w-[150px] truncate" title={leave.reason || 'No reason provided'}>
                         {leave.reason || '-'}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProcessModal(leave, 'APPROVED')}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openProcessModal(leave, 'REJECTED')}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={leave.admin_remark || ''}>
                          {leave.admin_remark || 'No remark'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {processModalOpen && selectedLeave && processType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {processType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You are about to {processType.toLowerCase()} the request for <strong>{selectedLeave.employee_name}</strong> from <strong>{formatDate(selectedLeave.start_date)}</strong> to <strong>{formatDate(selectedLeave.end_date)}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  placeholder="Reason for approval or rejection..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none h-24"
                />
                {processError && <p className="text-red-500 text-xs mt-1">{processError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProcessModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 font-medium rounded-xl text-white transition-colors ${
                    processType === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : `Confirm ${processType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
