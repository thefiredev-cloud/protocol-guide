'use client';
// v3.0 - New frontend navigation with Material Symbols (Dec 28, 2025)
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center flex-1 h-full gap-1
        transition-colors
        ${active
          ? 'text-primary dark:text-red-400'
          : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'
        }
        ${isPressed ? 'scale-95' : ''}
      `}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onPointerDown={() => {
        tap();
        setIsPressed(true);
      }}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
    >
      <MaterialIcon
        name={icon}
        filled={active}
        size={26}
        className="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // Define navigation order for swipe and keyboard navigation - 4 tabs matching sketch design
  const navItems: NavItem[] = [
    { href: '/', label: 'Chat', icon: 'home' },
    { href: '/protocols', label: 'Protocols', icon: 'list' },
    { href: '/history', label: 'History', icon: 'history' },
    { href: '/account', label: 'Account', icon: 'person' },
  ];

  const currentIndex = navItems.findIndex(item => item.href === pathname);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        router.push(navItems[currentIndex - 1].href);
      } else if (e.key === 'ArrowRight' && currentIndex < navItems.length - 1) {
        e.preventDefault();
        router.push(navItems[currentIndex + 1].href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, router, navItems]);

  const handleSwipeLeft = useCallback(() => {
    const nextIndex = (currentIndex + 1) % navItems.length;
    router.push(navItems[nextIndex].href);
  }, [currentIndex, router, navItems]);

  const handleSwipeRight = useCallback(() => {
    const prevIndex = currentIndex === 0 ? navItems.length - 1 : currentIndex - 1;
    router.push(navItems[prevIndex].href);
  }, [currentIndex, router, navItems]);

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const { tap } = useHapticFeedback();
  const [micPressed, setMicPressed] = useState(false);

  const handleMicPress = () => {
    tap();
    onMicClick?.();
  };

  // Split nav items: first 2 on left, last 2 on right (mic button in center)
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

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
        {/* Left side tabs: Assistant, Protocols */}
        {leftItems.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}

        {/* Central elevated mic button */}
        <div className="relative -top-5 flex-1 flex justify-center group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-75 group-hover:scale-110 transition-transform" />
          <button
            type="button"
            className={`
              relative w-14 h-14 bg-primary rounded-full
              flex items-center justify-center text-white
              shadow-lg shadow-red-600/40
              hover:scale-105 transition-transform active:scale-95
              border-2 border-white dark:border-gray-900
              ${micPressed ? 'scale-95' : ''}
            `}
            aria-label="Voice input"
            onPointerDown={() => {
              setMicPressed(true);
              handleMicPress();
            }}
            onPointerUp={() => setMicPressed(false)}
            onPointerLeave={() => setMicPressed(false)}
            onPointerCancel={() => setMicPressed(false)}
          >
            <MaterialIcon name="mic" size={28} />
          </button>
        </div>

        {/* Right side tabs: History, Account */}
        {rightItems.map((item) => (
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
