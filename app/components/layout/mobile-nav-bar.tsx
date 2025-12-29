'use client';
// v4.0 - 5-Tab Navigation with Floating Mic Button (Dec 29, 2025)
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useHapticFeedback } from '../../hooks/use-haptic-feedback';
import { useSwipeNavigation } from '../../hooks/use-swipe-navigation';
import { FloatingMicButton } from '../ui/floating-mic-button';
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

interface MobileNavBarProps {
  onVoiceInput?: (text: string) => void;
  onVoiceError?: (error: string) => void;
  voiceDisabled?: boolean;
}

function NavTab({ href, icon, label, active }: NavTabProps) {
  const { tap } = useHapticFeedback();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center flex-1 h-full gap-1
        transition-colors min-w-[64px]
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
        size={24}
        className="transition-transform duration-200"
      />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function MobileNavBar({
  onVoiceInput,
  onVoiceError,
  voiceDisabled = false,
}: MobileNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  // 5-tab navigation: Assistant, Protocols, [Mic], History, Account
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

  const handleVoiceTranscription = useCallback((text: string) => {
    // If on chat page and handler provided, use it
    if (onVoiceInput) {
      onVoiceInput(text);
    } else {
      // Navigate to chat with the transcribed text
      router.push(`/?q=${encodeURIComponent(text)}`);
    }
  }, [onVoiceInput, router]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe z-50"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex items-center max-w-lg mx-auto h-16">
        {/* Left tabs */}
        <div className="flex flex-1 justify-around items-center h-full">
          {leftTabs.map((item) => (
            <NavTab
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </div>

        {/* Floating Mic Button - Raised above nav */}
        <div className="relative flex items-center justify-center w-20">
          <div className="absolute -top-5">
            <FloatingMicButton
              onTranscription={handleVoiceTranscription}
              onError={onVoiceError}
              disabled={voiceDisabled}
            />
          </div>
          {/* Spacer for mic label */}
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-6">
            Speak
          </span>
        </div>

        {/* Right tabs */}
        <div className="flex flex-1 justify-around items-center h-full">
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
      </div>
    </nav>
  );
}
