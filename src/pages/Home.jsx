import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { missions, CATEGORIES } from '../data/missions.js'
import {
  missionStatus,
  isMissionUnlocked,
  unlockRequirement,
  totalMissions,
} from '../utils/progress.js'
import MissionCard from '../components/MissionCard.jsx'

const DIFF_FILTERS = ['All', 'Easy', 'Medium', 'Hard', 'Boss']

export default function Home({ ctx }) {
  const { state } = ctx
  const navigate = useNavigate()

  const [diff, setDiff] = useState('All')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const solvedCount = state.solved.length
  const pct = Math.round((solvedCount / totalMissions) * 100)

  function startInvestigation() {
    const next =
      missions.find(
        (m) => !state.solved.includes(m.id) && isMissionUnlocked(m, state)
      ) || missions[0]
    navigate('/mission/' + next.id)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return missions.filter((m) => {
      if (diff !== 'All' && m.difficulty !== diff) return false
      if (category !== 'All' && m.category !== category) return false
      if (q && !m.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [diff, category, query])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="scanlines relative overflow-hidden rounded-2xl border border-signal-cyan/20 bg-ink-900/50 px-6 py-12 text-center shadow-glow sm:px-10 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-signal-cyan/70">
          NOtFound_404 · Season 1
        </p>
        <h1 className="mt-4 font-mono text-5xl font-bold tracking-tight text-slate-50 sm:text-7xl">
          Case<span className="text-signal-cyan">404</span>
        </h1>
        <p className="mt-2 font-mono text-base uppercase tracking-[0.3em] text-slate-400 sm:text-lg">
          Cyber Detective Lab
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
          Solve fictional cyber cases. Learn CTF thinking. Become the operator.
          25 cases across 10 categories, four difficulty tiers, and two bosses.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={startInvestigation}
            className="rounded-lg border border-signal-cyan bg-signal-cyan/10 px-6 py-3 font-mono text-sm font-semibold text-signal-cyan shadow-glow transition-all hover:-translate-y-0.5 hover:bg-signal-cyan/20"
          >
            ▸ Start Investigation
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-8 max-w-xl">
          <div className="mb-1.5 flex items-center justify-between font-mono text-xs text-slate-400">
            <span>
              {solvedCount}/{totalMissions} cases closed
            </span>
            <span>{ctx.xp} XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal-cyan to-signal-green transition-all duration-700"
              style={{ width: pct + '%' }}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {DIFF_FILTERS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiff(d)}
              className={
                'rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ' +
                (diff === d
                  ? 'border-signal-cyan/60 bg-signal-cyan/10 text-signal-cyan'
                  : 'border-slate-800 text-slate-400 hover:border-signal-cyan/30 hover:text-slate-200')
              }
            >
              {d}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="filter by category"
              className="rounded-lg border border-slate-800 bg-ink-900 px-3 py-1.5 font-mono text-xs text-slate-300 outline-none focus:border-signal-cyan/40"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search title…"
              aria-label="search by title"
              className="rounded-lg border border-slate-800 bg-ink-900 px-3 py-1.5 font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-signal-cyan/40"
            />
          </div>
        </div>

        {/* Mission grid */}
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-ink-900/40 p-8 text-center font-mono text-sm text-slate-500">
            No cases match these filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const status = missionStatus(m, state)
              const sc = state.scores[m.id]
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  status={status}
                  score={sc?.score}
                  hintsUsed={sc?.hintsUsed}
                  lockReason={status === 'Locked' ? unlockRequirement(m, state) : ''}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
