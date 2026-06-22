import { Link, NavLink } from 'react-router-dom'
import ProgressBadge from './ProgressBadge.jsx'

export default function Navbar({ xp }) {
  const linkClass = ({ isActive }) =>
    'font-mono text-sm transition-colors ' +
    (isActive ? 'text-signal-cyan' : 'text-slate-400 hover:text-slate-200')

  return (
    <header className="sticky top-0 z-20 border-b border-signal-cyan/10 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-signal-cyan/30 bg-ink-900 font-mono text-signal-cyan shadow-glow">
            4⊘4
          </span>
          <span className="leading-tight">
            <span className="block font-mono text-base font-semibold tracking-tight text-slate-100 group-hover:text-signal-cyan">
              Case404
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
              NOtFound_404
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/" className={linkClass} end>
            Cases
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <div className="hidden sm:block">
            <ProgressBadge xp={xp} compact />
          </div>
        </nav>
      </div>
    </header>
  )
}
