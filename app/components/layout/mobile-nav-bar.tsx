'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, MessageCircle, Pill, Timer } from 'lucide-react';

interface NavTabProps {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  label: string;
  active: boolean;
}

function NavTab({ href, icon: Icon, label, active }: NavTabProps) {
  return (
    <Link
      href={href}
      className={`nav-tab ${active ? 'active' : ''}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="nav-tab-icon">
        <Icon size={24} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="nav-tab-label">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav-bar" role="navigation" aria-label="Primary navigation">
      <NavTab href="/" icon={MessageCircle} label="Chat" active={pathname === '/'} />
      <NavTab href="/dosing" icon={Pill} label="Dosing" active={pathname === '/dosing'} />
      <NavTab href="/protocols" icon={ClipboardList} label="Protocols" active={pathname === '/protocols'} />
      <NavTab href="/scene" icon={Timer} label="Scene" active={pathname === '/scene'} />
    </nav>
  );
}
