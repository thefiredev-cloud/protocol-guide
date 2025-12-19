'use client';

import { ClipboardList, type LucideIcon, MessageCircle, Phone, Pill, Timer } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useHapticFeedback } from '../../hooks/use-haptic-feedback';
import { useSwipeNavigation } from '../../hooks/use-swipe-navigation';

interface NavTabProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  isOnline: boolean;
}

function NavTab({ href, icon: Icon, label, active, isOnline }: NavTabProps) {
  const { tap } = useHapticFeedback();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={href}
      className={`nav-tab ${active ? 'active' : ''} ${isPressed ? 'pressed' : ''}`}
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
      <span className="nav-tab-icon">
        <Icon size={28} strokeWidth={2} aria-hidden={true} />
        {/* Online/Offline status indicator - only show on first tab (Chat) */}
        {href === '/' && (
          <span
            className={`nav-status-indicator ${isOnline ? 'online' : 'offline'}`}
            aria-label={isOnline ? 'Online' : 'Offline'}
          />
        )}
      </span>
      <span className="nav-tab-label">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Define navigation order for swipe and keyboard navigation
  const navItems = [
    { href: '/', label: 'Chat', icon: MessageCircle },
    { href: '/dosing', label: 'Dosing', icon: Pill },
    { href: '/protocols', label: 'Protocols', icon: ClipboardList },
    { href: '/base-hospitals', label: 'Base', icon: Phone },
    { href: '/scene', label: 'Scene', icon: Timer },
  ];

  const currentIndex = navItems.findIndex(item => item.href === pathname);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    // Swipe left = next tab
    const nextIndex = (currentIndex + 1) % navItems.length;
    router.push(navItems[nextIndex].href);
  }, [currentIndex, router, navItems]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right = previous tab
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
      className="mobile-nav-bar"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {navItems.map((item) => (
        <NavTab
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname === item.href}
          isOnline={isOnline}
        />
      ))}
    </nav>
  );
}
