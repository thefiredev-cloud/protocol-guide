'use client';
// v6.0 - 5-Tab Navigation with Center Mic Button (Dec 30, 2025)
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

interface BottomNavigationProps {
  onMicPress?: () => void;
}

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
      <MaterialIcon
        name={icon}
        filled={active}
        size={26}
        className="transition-transform duration-200"
      />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function BottomNavigation({ onMicPress }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const { tap } = useHapticFeedback();

  // Navigation tabs (4 items, mic is center floating button)
  const leftTabs: NavItem[] = [
    { href: '/', label: 'Assistant', icon: 'chat_bubble' },
    { href: '/protocols', label: 'Protocols', icon: 'menu_book' },
  ];

  const rightTabs: NavItem[] = [
    { href: '/history', label: 'History', icon: 'history' },
    { href: '/account', label: 'Account', icon: 'person' },
  ];

  const allTabs = [...leftTabs, ...rightTabs];
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

  const handleMicClick = useCallback(() => {
    tap();
    if (onMicPress) {
      onMicPress();
    } else {
      // Default: navigate to home/assistant
      router.push('/');
    }
  }, [tap, onMicPress, router]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe pt-1 px-2 z-50"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-end max-w-md mx-auto h-[60px] pb-2">
        {/* Left tabs */}
        {leftTabs.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}

        {/* Center floating mic button */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <button
            type="button"
            onClick={handleMicClick}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-glow hover:scale-105 transition-transform active:scale-95"
            aria-label="Voice input"
          >
            <MaterialIcon name="mic" size={28} />
          </button>
        </div>

        {/* Right tabs */}
        {rightTabs.map((item) => (
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
