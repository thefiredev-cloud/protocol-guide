'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { MaterialIcon } from '../components/ui/material-icon';
import { useAuth } from '../contexts/authentication-context';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  href?: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
}

function MenuItem({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  href,
  onClick,
  rightContent,
}: MenuItemProps) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {title}
          </p>
          {badge && (
            <span
              className={`text-[10px] font-bold ${badgeColor} px-2 py-0.5 rounded-full`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {rightContent || (
        <MaterialIcon name="chevron_right" size={20} className="text-gray-400 dark:text-gray-500" />
      )}
    </>
  );

  const className =
    'w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4 group';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  // User data from auth context with fallbacks
  const user = {
    name: authUser?.fullName || authUser?.email?.split('@')[0] || 'Paramedic',
    department: 'LA County Fire Dept.',
    status: 'Active Duty',
    employeeId: 'LAC-FD-8942',
    station: authUser?.stationId || 'Station 12',
    email: authUser?.email || 'user@fire.lacounty.gov',
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-28">
      {/* Header */}
      <div className="pt-16 pb-4 px-5 max-w-md mx-auto w-full">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Account
          </h1>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </header>
      </div>

      <main className="px-5 max-w-md mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-sm overflow-hidden flex items-center justify-center">
                <MaterialIcon name="person" size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                <MaterialIcon name="check" size={12} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {user.department}
            </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {user.status}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                Employee ID
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {user.employeeId}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                Station
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {user.station}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Department Email
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white break-all">
              {user.email}
            </p>
          </div>
        </div>

        {/* Workplace Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
            Workplace
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MaterialIcon name="chat_bubble" size={20} />
                </div>
              }
              title="Chat History"
              subtitle="Review past protocol queries"
              href="/history"
            />
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MaterialIcon name="sync" size={20} />
                </div>
              }
              title="ImageTrend Elite"
              subtitle="Last sync: 10 mins ago"
              badge="CONNECTED"
              rightContent={
                <MaterialIcon name="sync" size={20} className="text-gray-400 dark:text-gray-500" />
              }
            />
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <MaterialIcon name="bookmark" size={20} />
                </div>
              }
              title="Saved Protocols"
              subtitle="12 items saved offline"
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
            Preferences
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <MaterialIcon name="dark_mode" size={20} />
                </div>
              }
              title="Appearance"
              rightContent={
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    System
                  </span>
                  <MaterialIcon
                    name="chevron_right"
                    size={20}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              }
            />
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <MaterialIcon name="notifications" size={20} />
                </div>
              }
              title="Notifications"
            />
            <MenuItem
              icon={
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <MaterialIcon name="help" size={20} />
                </div>
              }
              title="Support & Feedback"
            />
          </div>
        </div>

        {/* Logout */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400 font-semibold text-sm py-3 px-6 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-center gap-2"
          >
            <MaterialIcon name="logout" size={18} />
            Log Out
          </button>
          <p className="mt-6 text-[11px] text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            ProtocolGuide v2.4.1
            <br />
            Authorized Personnel Only
          </p>
        </div>
      </main>
    </div>
  );
}
