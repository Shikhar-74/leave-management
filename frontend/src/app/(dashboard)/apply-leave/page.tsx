'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { leaveService } from '@/services/leave.service';
import toast from 'react-hot-toast';
import { Loader2, CalendarPlus, CheckCircle2 } from 'lucide-react';

const applyLeaveSchema = z
  .object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    leave_type: z.enum(['SICK', 'CASUAL', 'EARNED'], {
      message: 'Select a leave type',
    }),
    reason: z.string().max(500, 'Reason must be under 500 characters').optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

type ApplyLeaveForm = z.infer<typeof applyLeaveSchema>;

export default function ApplyLeavePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLeaveForm>({
    resolver: zodResolver(applyLeaveSchema),
  });

  // Tomorrow's date as min value for start_date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const onSubmit = async (data: ApplyLeaveForm) => {
    try {
      await leaveService.apply({
        start_date: data.start_date,
        end_date: data.end_date,
        leave_type: data.leave_type,
        reason: data.reason || undefined,
      });
      setSuccess(true);
      toast.success('Leave applied successfully!');
      setTimeout(() => router.push('/my-leaves'), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Leave Applied!</h2>
        <p className="text-gray-500 text-sm">
          Your leave request has been submitted. Redirecting to My Leaves...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Fill in the details below to submit your leave request
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Leave Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('leave_type')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select leave type
              </option>
              <option value="SICK">🤒 Sick Leave</option>
              <option value="CASUAL">🏖️ Casual Leave</option>
              <option value="EARNED">💼 Earned Leave</option>
            </select>
            {errors.leave_type && (
              <p className="text-red-500 text-xs mt-1">{errors.leave_type.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                {...register('start_date')}
                type="date"
                min={minDate}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date <span className="text-red-400">*</span>
              </label>
              <input
                {...register('end_date')}
                type="date"
                min={minDate}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              placeholder="Provide a reason for your leave request..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
            )}
          </div>

          {/* Info box */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-700">
              <strong>Note:</strong> Sundays are automatically excluded from the leave count.
              Only working days (Mon–Sat) are counted. Leave must start from tomorrow or later.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarPlus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Apply Leave'}
          </button>
        </form>
      </div>
    </div>
  );
}
