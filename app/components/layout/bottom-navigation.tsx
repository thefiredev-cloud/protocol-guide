'use client';
// v6.0 - 5-Tab Navigation with Center Mic Button (Dec 30, 2025)
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useHapticFeedback } from '../../hooks/use-haptic-feedback';
import { MaterialIcon } from '../ui/material-icon';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface NavTabProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}

interface BottomNavigationProps {
  onMicPress?: () => void;
}

const LEFT_TABS: NavItem[] = [
  { href: '/', label: 'Assistant', icon: 'chat_bubble' },
  { href: '/protocols', label: 'Protocols', icon: 'menu_book' },
];

const RIGHT_TABS: NavItem[] = [
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/account', label: 'Account', icon: 'person' },
];

function NavTab({ href, icon, label, active }: NavTabProps) {
  const { tap } = useHapticFeedback();

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center flex-1 h-full gap-1
        transition-colors duration-200
        ${active
          ? 'text-primary dark:text-red-400'
          : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'
        }
        active:scale-95
      `}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onPointerDown={tap}
    >
      <MaterialIcon name={icon} filled={active} size={26} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function CenterMicButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative -top-5 flex-1 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-glow hover:scale-105 transition-transform active:scale-95"
        aria-label="Voice input"
      >
        <MaterialIcon name="mic" size={28} />
      </button>
    </div>
  );
}

export function BottomNavigation({ onMicPress }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tap } = useHapticFeedback();

  const handleMicClick = useCallback(() => {
    tap();
    onMicPress ? onMicPress() : router.push('/');
  }, [tap, onMicPress, router]);

  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 backdrop-blur-xl border-t-4 border-red-500 pb-safe pt-1 px-2 z-[9999]"
      role="navigation"
      aria-label="Primary navigation"
    >
      <div className="flex justify-between items-end max-w-md mx-auto h-[60px] pb-2">
        {LEFT_TABS.map((item) => (
          <NavTab key={item.href} {...item} active={pathname === item.href} />
        ))}
        <CenterMicButton onClick={handleMicClick} />
        {RIGHT_TABS.map((item) => (
          <NavTab key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}
