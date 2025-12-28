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

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe z-50"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map((item) => (
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
