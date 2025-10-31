'use client';

import { ClipboardList, type LucideIcon, MessageCircle, Pill, Timer, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useSwipeNavigation } from '../../hooks/use-swipe-navigation';
import { useHapticFeedback } from '../../hooks/use-haptic-feedback';

interface NavTabProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}

function NavTab({ href, icon: Icon, label, active }: NavTabProps) {
  const { tap } = useHapticFeedback();

  return (
    <Link
      href={href}
      className={`nav-tab ${active ? 'active' : ''}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onPointerDown={tap}
    >
      <span className="nav-tab-icon">
        <Icon size={24} strokeWidth={2} aria-hidden={true} />
      </span>
      <span className="nav-tab-label">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Define navigation order for swipe
  const navItems = [
    { href: '/', label: 'Chat' },
    { href: '/dosing', label: 'Dosing' },
    { href: '/protocols', label: 'Protocols' },
    { href: '/base-hospitals', label: 'Base Hospitals' },
    { href: '/scene', label: 'Scene' },
  ];

  const currentIndex = navItems.findIndex(item => item.href === pathname);

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
      className="mobile-nav-bar"
      role="navigation"
      aria-label="Primary navigation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <NavTab href="/" icon={MessageCircle} label="Chat" active={pathname === '/'} />
      <NavTab href="/dosing" icon={Pill} label="Dosing" active={pathname === '/dosing'} />
      <NavTab href="/protocols" icon={ClipboardList} label="Protocols" active={pathname === '/protocols'} />
      <NavTab href="/base-hospitals" icon={Phone} label="Base" active={pathname === '/base-hospitals'} />
      <NavTab href="/scene" icon={Timer} label="Scene" active={pathname === '/scene'} />
    </nav>
  );
}
