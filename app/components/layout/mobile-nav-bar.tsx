'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavTabProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}

function NavTab({ href, icon, label, active }: NavTabProps) {
  return (
    <Link
      href={href}
      className={`nav-tab ${active ? 'active' : ''}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="nav-tab-icon" aria-hidden="true">{icon}</span>
      <span className="nav-tab-label">{label}</span>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav-bar" role="navigation" aria-label="Primary navigation">
      <NavTab href="/" icon="💬" label="Chat" active={pathname === '/'} />
      <NavTab href="/dosing" icon="💊" label="Dosing" active={pathname === '/dosing'} />
      <NavTab href="/protocols" icon="📋" label="Protocols" active={pathname === '/protocols'} />
      <NavTab href="/scene" icon="⏱️" label="Scene" active={pathname === '/scene'} />
    </nav>
  );
}
