'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { leaveService, LeaveBalance, LeaveRecord } from '@/services/leave.service';
import { formatDate, getStatusColor, getLeaveTypeColor, timeAgo } from '@/lib/utils';
import {
  CalendarDays,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { employee } = useAuthStore();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee) return;

    const year = new Date().getFullYear();

    // Fetch balance — may 404 if no leave policy
    leaveService
      .getBalance(employee.id, year)
      .then((res) => setBalance(res.data))
      .catch(() => {});

    // Fetch recent leaves — independent of balance
    leaveService
      .getMyLeaves({ limit: 5, year })
      .then((res) => setRecentLeaves(res.data.leaves))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [employee]);

  const stats = [
    {
      label: 'Total Leaves',
      value: balance?.total_leaves ?? '—',
      icon: CalendarDays,
      color: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50',
    },
    {
      label: 'Leaves Taken',
      value: balance?.leaves_taken ?? '—',
      icon: CalendarCheck,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
    },
    {
      label: 'Remaining',
      value: balance?.remaining_leaves ?? '—',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      bgLight: 'bg-emerald-50',
    },
    {
      label: 'Pending',
      value: recentLeaves.filter((l) => l.status === 'PENDING').length,
      icon: Clock,
      color: 'from-purple-500 to-violet-500',
      bgLight: 'bg-purple-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {employee?.role === 'ADMIN' ? 'Overview of your company pending requests and employees' : `Overview of your leave status for ${new Date().getFullYear()}`}
        </p>
      </div>

      {employee?.role === 'ADMIN' ? (
        <AdminDashboardView />
      ) : (
        <EmployeeDashboardView loading={loading} balance={balance} recentLeaves={recentLeaves} />
      )}
    </div>
  );
}

function EmployeeDashboardView({ loading, balance, recentLeaves }: any) {
  const stats = [
    { label: 'Total Leaves', value: balance?.total_leaves ?? '—', icon: CalendarDays, color: 'from-indigo-500 to-indigo-600', bgLight: 'bg-indigo-50' },
    { label: 'Leaves Taken', value: balance?.leaves_taken ?? '—', icon: CalendarCheck, color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50' },
    { label: 'Remaining', value: balance?.remaining_leaves ?? '—', icon: TrendingUp, color: 'from-emerald-500 to-green-500', bgLight: 'bg-emerald-50' },
    { label: 'Pending', value: recentLeaves.filter((l: any) => l.status === 'PENDING').length, icon: Clock, color: 'from-purple-500 to-violet-500', bgLight: 'bg-purple-50' },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 bg-linear-to-r ${stat.color} bg-clip-text`} style={{ color: 'inherit' }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? <span className="skeleton inline-block w-12 h-7" /> : stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/apply-leave" className="group bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Apply for Leave</h3>
              <p className="text-indigo-200 text-sm mt-1">Submit a new leave request</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/leave-balance" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">View Balance</h3>
              <p className="text-gray-500 text-sm mt-1">Check your detailed leave balance</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Leaves */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Leaves</h2>
          <Link href="/my-leaves" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
          </div>
        ) : recentLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No leaves applied yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeaves.map((leave: any) => (
              <div key={leave.leave_id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>{leave.leave_type}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatDate(leave.start_date)} — {formatDate(leave.end_date)}</p>
                    <p className="text-xs text-gray-400">
                      {leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}
                      {leave.applied_at && ` · Applied ${timeAgo(leave.applied_at)}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(leave.status)}`}>{leave.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AdminDashboardView() {
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRecord[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number | string>('—');
  const [totalLeaves, setTotalLeaves] = useState<number | string>('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const leavesRes = await leaveService.getAllLeaves({ status: 'PENDING', limit: 5 });
        const allRes = await leaveService.getAllLeaves({ limit: 1 });
        setPendingLeaves(leavesRes.data.leaves);
        setTotalLeaves(allRes.data.total);
        
        // Use a dynamic import to avoid module issues if profile is missing
        const { profileService } = await import('@/services/profile.service');
        const empRes = await profileService.getAllEmployees({ limit: 1 });
        setTotalEmployees(empRes.data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center`}>
              <Clock className="w-5 h-5 bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text" style={{ color: 'inherit' }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? <span className="skeleton inline-block w-8 h-7" /> : pendingLeaves.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Pending Action Needed</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center`}>
              <CalendarDays className="w-5 h-5 bg-linear-to-r from-indigo-500 to-indigo-600 bg-clip-text" style={{ color: 'inherit' }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? <span className="skeleton inline-block w-8 h-7" /> : totalLeaves}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Leave Requests</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center`}>
              <TrendingUp className="w-5 h-5 bg-linear-to-r from-emerald-500 to-green-500 bg-clip-text" style={{ color: 'inherit' }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? <span className="skeleton inline-block w-8 h-7" /> : totalEmployees}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Company Employees</p>
        </div>
      </div>

       {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/leaves" className="group bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Process Leaves</h3>
              <p className="text-indigo-200 text-sm mt-1">Review and approve employee requests</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/employees" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
           <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Manage Team</h3>
              <p className="text-gray-500 text-sm mt-1">View the full employee directory</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Pending Leaves Priority List */}
      <div className="bg-white rounded-2xl border border-gray-100 mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Priority Review (Pending)</h2>
          <Link href="/admin/leaves" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
            Review all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
          </div>
        ) : pendingLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">All caught up! No pending leave requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingLeaves.map((leave: any) => (
              <div key={leave.leave_id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>{leave.leave_type}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{leave.employee_name} ({formatDate(leave.start_date)} — {formatDate(leave.end_date)})</p>
                    <p className="text-xs text-gray-400">
                      Requested {leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}
                      {leave.applied_at && ` · Applied ${timeAgo(leave.applied_at)}`}
                    </p>
                  </div>
                </div>
                <Link href="/admin/leaves" className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
