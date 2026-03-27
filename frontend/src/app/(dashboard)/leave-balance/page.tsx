'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { leaveService, LeaveBalance } from '@/services/leave.service';
import {
  CalendarDays,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export default function LeaveBalancePage() {
  const { employee } = useAuthStore();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;

    const fetchBalance = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await leaveService.getBalance(employee.id, year);
        setBalance(res.data);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Failed to load balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [employee]);

  const usagePercent = balance
    ? Math.round((balance.leaves_taken / balance.total_leaves) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Your leave summary for {new Date().getFullYear()}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Unable to load balance</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : balance ? (
        <div className="space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{balance.total_leaves}</p>
              <p className="text-sm text-gray-500 mt-1">Total Entitled</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{balance.leaves_taken}</p>
              <p className="text-sm text-gray-500 mt-1">Applied / Pending</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{balance.remaining_leaves}</p>
              <p className="text-sm text-gray-500 mt-1">Remaining</p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Leave Usage</h3>
              <span className="text-sm text-gray-500">{usagePercent}% reserved</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  usagePercent > 80
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : usagePercent > 50
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>0 days</span>
              <span>{balance.total_leaves} days</span>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Balance Details</h3>
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-6 py-3.5 text-sm text-gray-500">Employee ID</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                    #{balance.employee_id}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-sm text-gray-500">Year</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                    {balance.year}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-sm text-gray-500">Total Entitlements</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                    {balance.total_leaves} days
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-sm text-gray-500">Leaves Taken / Applied</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-amber-600 text-right">
                    {balance.leaves_taken} days
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 text-sm text-gray-500 font-medium">Available Balance</td>
                  <td className="px-6 py-3.5 text-sm font-bold text-emerald-600 text-right">
                    {balance.remaining_leaves} days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
