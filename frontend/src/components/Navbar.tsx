'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LogOut, Menu, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { employee, clearAuth, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore — we're logging out anyway
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-medium text-gray-500">Welcome back</h2>
          <h1 className="text-base font-semibold text-gray-900 -mt-0.5">
            {employee?.name || 'User'}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Profile badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700 leading-tight">
              {employee?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{employee?.role || 'EMPLOYEE'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
