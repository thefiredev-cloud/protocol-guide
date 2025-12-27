'use client';

import { BookOpen, History, type LucideIcon, MessageCircle, Mic, User } from 'lucide-react';
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

interface MobileNavBarProps {
  onMicClick?: () => void;
}

export function MobileNavBar({ onMicClick }: MobileNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Define navigation order for swipe and keyboard navigation
  // Updated to match new frontend mockup design
  const navItems = [
    { href: '/', label: 'Assistant', icon: MessageCircle },
    { href: '/protocols', label: 'Protocols', icon: BookOpen },
    { href: '/history', label: 'History', icon: History },
    { href: '/account', label: 'Account', icon: User },
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
      className="mobile-nav-bar mobile-nav-bar-with-mic"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left side tabs: Assistant, Protocols */}
      {leftItems.map((item) => (
        <NavTab
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname === item.href}
          isOnline={isOnline}
        />
      ))}

      {/* Central elevated mic button */}
      <div className="nav-mic-container">
        <button
          type="button"
          className={`nav-mic-button ${micPressed ? 'pressed' : ''}`}
          aria-label="Voice input"
          onPointerDown={() => {
            setMicPressed(true);
            handleMicPress();
          }}
          onPointerUp={() => setMicPressed(false)}
          onPointerLeave={() => setMicPressed(false)}
          onPointerCancel={() => setMicPressed(false)}
        >
          <Mic size={28} strokeWidth={2} aria-hidden={true} />
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
          isOnline={isOnline}
        />
      ))}
    </nav>
  );
}
