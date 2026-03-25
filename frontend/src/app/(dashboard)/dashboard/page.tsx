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
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { employee } = useAuthStore();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee) return;

    const fetchData = async () => {
      try {
        const year = new Date().getFullYear();
        const [balanceRes, leavesRes] = await Promise.all([
          leaveService.getBalance(employee.id, year),
          leaveService.getMyLeaves({ limit: 5, year }),
        ]);
        setBalance(balanceRes.data);
        setRecentLeaves(leavesRes.data.leaves);
      } catch {
        // Balance may 404 if no policy — handle gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          Overview of your leave status for {new Date().getFullYear()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'inherit' }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <span className="skeleton inline-block w-12 h-7" /> : stat.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/apply-leave"
          className="group bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Apply for Leave</h3>
              <p className="text-indigo-200 text-sm mt-1">Submit a new leave request</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/leave-balance"
          className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
        >
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
          <Link
            href="/my-leaves"
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : recentLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No leaves applied yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeaves.map((leave) => (
              <div key={leave.leave_id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                    {leave.leave_type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(leave.start_date)} — {formatDate(leave.end_date)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {leave.days_requested} day{leave.days_requested > 1 ? 's' : ''}
                      {leave.applied_at && ` · Applied ${timeAgo(leave.applied_at)}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
