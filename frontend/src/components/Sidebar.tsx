'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  BarChart3,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { employee } = useAuthStore();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/apply-leave', label: 'Apply Leave', icon: CalendarPlus },
    { href: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
    { href: '/leave-balance', label: 'Leave Balance', icon: BarChart3 },
    ...(employee?.role === 'ADMIN'
      ? [{ href: '/employees', label: 'Employees', icon: Users }]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CalendarDays className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">LeaveHub</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
            <p className="text-xs font-medium text-indigo-700">Leave Management</p>
            <p className="text-xs text-indigo-500 mt-0.5">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
