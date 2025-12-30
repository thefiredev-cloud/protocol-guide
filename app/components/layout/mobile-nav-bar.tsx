'use client';
// v5.0 - 4-Tab Navigation (Stitch Design) (Dec 29, 2025)
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useHapticFeedback } from '../../hooks/use-haptic-feedback';
import { useSwipeNavigation } from '../../hooks/use-swipe-navigation';
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

function NavTab({ href, icon, label, active }: NavTabProps) {
  const { tap } = useHapticFeedback();

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center flex-1 h-full gap-1
        transition-all duration-200 min-w-[64px]
        ${active
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-400 dark:text-gray-500'
        }
        active:scale-95
      `}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onPointerDown={tap}
    >
      <MaterialIcon
        name={icon}
        filled={active}
        size={24}
        className="transition-transform duration-200"
      />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // 4-tab navigation (Stitch Design): Assistant, Protocols, History, Account
  const navTabs: NavItem[] = [
    { href: '/', label: 'Assistant', icon: 'home' },
    { href: '/protocols', label: 'Protocols', icon: 'menu_book' },
    { href: '/history', label: 'History', icon: 'history' },
    { href: '/account', label: 'Account', icon: 'person' },
  ];

  const allTabs = navTabs;
  const currentIndex = allTabs.findIndex(item => item.href === pathname);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        router.push(allTabs[currentIndex - 1].href);
      } else if (e.key === 'ArrowRight' && currentIndex < allTabs.length - 1) {
        e.preventDefault();
        router.push(allTabs[currentIndex + 1].href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, router, allTabs]);

  const handleSwipeLeft = useCallback(() => {
    const nextIndex = (currentIndex + 1) % allTabs.length;
    router.push(allTabs[nextIndex].href);
  }, [currentIndex, router, allTabs]);

  const handleSwipeRight = useCallback(() => {
    const prevIndex = currentIndex === 0 ? allTabs.length - 1 : currentIndex - 1;
    router.push(allTabs[prevIndex].href);
  }, [currentIndex, router, allTabs]);

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe z-50"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center max-w-lg mx-auto h-16">
        {/* 4 equal tabs */}
        {navTabs.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}
