import { Link } from 'react-router-dom'
import { missions } from '../data/missions.js'
import {
  rankForXp,
  nextRank,
  RANKS,
  ACHIEVEMENTS,
  totalMissions,
  totalXp,
} from '../utils/progress.js'
import ProgressBadge from '../components/ProgressBadge.jsx'

export default function Profile({ ctx }) {
  const { state, reset } = ctx
  const xp = totalXp(state)
  const rank = rankForXp(xp)
  const next = nextRank(xp)
  const solvedMissions = missions.filter((m) => state.solved.includes(m.id))
  const completion = Math.round((state.solved.length / totalMissions) * 100)

  // Best (highest) scoring solved cases.
  const bestScores = [...solvedMissions]
    .map((m) => ({ mission: m, score: state.scores[m.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  function confirmReset() {
    if (
      window.confirm(
        'Reset all progress? This clears XP, solved cases, scores, achievements, and notes.'
      )
    ) {
      reset()
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
            Operator Profile
          </p>
          <h1 className="mt-1 font-mono text-3xl font-bold text-slate-100">{rank.name}</h1>
          {next && (
            <p className="mt-1 font-mono text-xs text-slate-500">
              {next.min - xp} XP to {next.name}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={confirmReset}
          className="rounded-lg border border-alert/40 px-3 py-2 font-mono text-xs text-alert hover:bg-alert/10"
        >
          Reset progress
        </button>
      </header>

      {/* Statistics cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Total XP" value={xp} accent="cyan" />
        <Stat label="Rank" value={rank.name} small accent="cyan" />
        <Stat
          label="Solved"
          value={`${state.solved.length}/${totalMissions}`}
          accent="green"
        />
        <Stat label="Completion" value={completion + '%'} accent="green" />
        <Stat
          label="Achievements"
          value={`${state.achievements.length}/${ACHIEVEMENTS.length}`}
          accent="cyan"
        />
      </div>

      <ProgressBadge xp={xp} />

      {/* Rank ladder */}
      <section>
        <h2 className="mb-3 font-mono text-lg font-semibold text-slate-100">Rank Ladder</h2>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {RANKS.map((r) => {
            const reached = xp >= r.min
            const current = r.name === rank.name
            return (
              <li
                key={r.name}
                className={
                  'rounded-lg border p-3 ' +
                  (current
                    ? 'border-signal-cyan/50 bg-signal-cyan/5 shadow-glow'
                    : reached
                    ? 'border-signal-green/25 bg-ink-900/60'
                    : 'border-slate-800 bg-ink-900/30 opacity-60')
                }
              >
                <p className="font-mono text-[11px] text-slate-500">{r.min} XP</p>
                <p
                  className={
                    'mt-1 font-mono text-[13px] ' +
                    (current
                      ? 'text-signal-cyan'
                      : reached
                      ? 'text-slate-200'
                      : 'text-slate-500')
                  }
                >
                  {r.name}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 font-mono text-lg font-semibold text-slate-100">Achievements</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const earned = state.achievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={
                  'rounded-lg border p-4 ' +
                  (earned
                    ? 'border-signal-green/30 bg-signal-green/5'
                    : 'border-slate-800 bg-ink-900/40 opacity-60')
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={'font-mono ' + (earned ? 'text-signal-green' : 'text-slate-600')}
                    aria-hidden
                  >
                    {earned ? '✦' : '✧'}
                  </span>
                  <p
                    className={
                      'font-mono text-sm font-semibold ' +
                      (earned ? 'text-slate-100' : 'text-slate-500')
                    }
                  >
                    {a.name}
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-400">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Best scores */}
      {bestScores.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-lg font-semibold text-slate-100">Best Scores</h2>
          <ul className="space-y-2">
            {bestScores.map(({ mission, score }) => (
              <li
                key={mission.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-ink-900/50 px-4 py-3"
              >
                <span className="font-mono text-sm text-slate-200">
                  <span className="text-slate-500">
                    #{String(mission.id).padStart(3, '0')}
                  </span>{' '}
                  {mission.title}
                </span>
                <span className="font-mono text-xs text-signal-green">{score} XP</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Solved cases */}
      <section>
        <h2 className="mb-3 font-mono text-lg font-semibold text-slate-100">Solved Cases</h2>
        {solvedMissions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-ink-900/40 p-6 text-center">
            <p className="text-sm text-slate-400">
              No cases closed yet. Your record is clean — for now.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-lg border border-signal-cyan/40 px-4 py-2 font-mono text-xs text-signal-cyan hover:bg-signal-cyan/10"
            >
              Open the first case →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {solvedMissions.map((m) => {
              const sc = state.scores[m.id]
              return (
                <li key={m.id}>
                  <Link
                    to={'/mission/' + m.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-ink-900/50 px-4 py-3 transition-colors hover:border-signal-cyan/30"
                  >
                    <span className="font-mono text-sm text-slate-200">
                      <span className="text-slate-500">
                        #{String(m.id).padStart(3, '0')}
                      </span>{' '}
                      {m.title}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {sc?.hintsUsed ? `${sc.hintsUsed} hint(s)` : 'no hints'} ·{' '}
                      <span className="text-signal-green">{sc?.score ?? m.xp} XP</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, accent, small = false }) {
  const color = accent === 'green' ? 'text-signal-green' : 'text-signal-cyan'
  return (
    <div className="rounded-xl border border-signal-cyan/15 bg-ink-900/60 p-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={'mt-2 font-mono font-bold ' + color + (small ? ' text-sm leading-snug' : ' text-3xl')}>
        {value}
      </p>
    </div>
  )
}
