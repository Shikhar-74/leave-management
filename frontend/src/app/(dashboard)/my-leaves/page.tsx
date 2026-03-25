'use client';

import { useEffect, useState } from 'react';
import { leaveService, LeaveRecord } from '@/services/leave.service';
import { formatDate, getStatusColor, getLeaveTypeColor, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CalendarX, Loader2, XCircle } from 'lucide-react';

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params: { year: number; status?: string } = {
        year: new Date().getFullYear(),
      };
      if (statusFilter) params.status = statusFilter;

      const res = await leaveService.getMyLeaves(params);
      setLeaves(res.data.leaves);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCancel = async (leaveId: number) => {
    try {
      setCancellingId(leaveId);
      await leaveService.cancelLeave(leaveId);
      toast.success('Leave cancelled successfully');
      fetchLeaves();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    } finally {
      setCancellingId(null);
    }
  };

  const statuses = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            View and manage all your leave requests
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaves List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <CalendarX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-1">No leaves found</h3>
          <p className="text-gray-500 text-sm">
            {statusFilter ? `No ${statusFilter.toLowerCase()} leaves` : 'You haven\'t applied for any leaves yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div
              key={leave.leave_id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                      {leave.leave_type}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(leave.start_date)} — {formatDate(leave.end_date)}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-400">
                      {leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}
                    </p>
                    {leave.applied_at && (
                      <p className="text-xs text-gray-400">
                        Applied {timeAgo(leave.applied_at)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cancel Button */}
                {leave.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(leave.leave_id)}
                    disabled={cancellingId === leave.leave_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === leave.leave_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
