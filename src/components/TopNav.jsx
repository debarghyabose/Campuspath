import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { UNIVERSITY } from '../data/campus.js';

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/explore', label: 'Explore Campus' },
  { to: '/navigate', label: 'Navigate' },
  { to: '/lab', label: 'Algorithm Lab' },
  { to: '/about', label: 'About' },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-ink-700/80 bg-ink-900/80 shadow-[0_8px_24px_rgba(2,8,23,0.2)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">
            CampusPath <span className="text-fg-muted">3D</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `relative rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-glow shadow-[0_0_12px_rgba(56,189,248,0.65)]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-md border border-ink-700 px-2.5 py-1 text-xs text-fg-muted lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            {UNIVERSITY}
          </span>
          {pathname !== '/navigate' && (
            <Link to="/navigate" className="btn-primary hidden h-8 sm:inline-flex">
              Start navigation
            </Link>
          )}
          <button className="icon-btn md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-b border-ink-700 bg-ink-900/95 px-4 pb-3 backdrop-blur-xl md:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm ${isActive ? 'bg-ink-800 text-fg' : 'text-fg-muted'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
