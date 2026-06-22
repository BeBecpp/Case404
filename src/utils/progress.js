// ---------------------------------------------------------------------------
// progress.js — scoring, ranks, unlock logic, achievements (Season 1).
//
// All persistence is local (one localStorage key). Reads/writes are wrapped so
// a disabled/full storage never crashes the app. Total XP is DERIVED from the
// sum of per-mission scores, so it can never drift.
// ---------------------------------------------------------------------------

import { missions, BASE_XP } from '../data/missions.js'

const STORAGE_KEY = 'case404:progress:v2'

const defaultState = () => ({
  solved: [], // [missionId]
  scores: {}, // { [id]: { score, hintsUsed, attempts } }
  hints: {}, // live hints revealed per mission { [id]: n }
  attempts: {}, // live wrong attempts per mission { [id]: n }
  notes: {}, // { [id]: text }
  achievements: [], // [achievementId]
})

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable — session still works, just no persistence */
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return defaultState()
}

// ---- derived XP -----------------------------------------------------------
export function totalXp(state) {
  return Object.values(state.scores).reduce((sum, s) => sum + (s?.score || 0), 0)
}

// ---- difficulty helpers ---------------------------------------------------
const byDifficulty = (diff) => missions.filter((m) => m.difficulty === diff)
const solvedCountOf = (state, diff) =>
  byDifficulty(diff).filter((m) => state.solved.includes(m.id)).length

// ---- unlock logic ---------------------------------------------------------
// Easy: sequential. Medium: after 5 Easy solved. Hard: after 6 Medium solved.
// Boss 1: after 3 Hard solved. Boss 2: after Boss 1 solved.
export function isMissionUnlocked(mission, state) {
  const solved = state.solved
  switch (mission.difficulty) {
    case 'Easy': {
      const list = byDifficulty('Easy')
      const idx = list.findIndex((m) => m.id === mission.id)
      return idx === 0 || solved.includes(list[idx - 1].id)
    }
    case 'Medium':
      return solvedCountOf(state, 'Easy') >= 5
    case 'Hard':
      return solvedCountOf(state, 'Medium') >= 6
    case 'Boss': {
      const list = byDifficulty('Boss')
      const idx = list.findIndex((m) => m.id === mission.id)
      if (idx === 0) return solvedCountOf(state, 'Hard') >= 3
      return solved.includes(list[idx - 1].id)
    }
    default:
      return false
  }
}

export function missionStatus(mission, state) {
  if (state.solved.includes(mission.id)) return 'Solved'
  return isMissionUnlocked(mission, state) ? 'Available' : 'Locked'
}

// Human-readable reason a mission is locked (shown on the card / page).
export function unlockRequirement(mission, state) {
  switch (mission.difficulty) {
    case 'Easy': {
      const list = byDifficulty('Easy')
      const idx = list.findIndex((m) => m.id === mission.id)
      return `Solve "${list[idx - 1]?.title}" first`
    }
    case 'Medium':
      return `Solve ${5 - solvedCountOf(state, 'Easy')} more Easy case(s)`
    case 'Hard':
      return `Solve ${6 - solvedCountOf(state, 'Medium')} more Medium case(s)`
    case 'Boss': {
      const list = byDifficulty('Boss')
      const idx = list.findIndex((m) => m.id === mission.id)
      if (idx === 0) return `Solve ${3 - solvedCountOf(state, 'Hard')} more Hard case(s)`
      return `Solve "${list[idx - 1]?.title}" first`
    }
    default:
      return 'Locked'
  }
}

// ---- scoring --------------------------------------------------------------
// base - 10*hints - 5*wrongAttempts (+25 no-hint bonus) (+100 boss bonus),
// clamped to a minimum of 25.
export const MIN_SCORE = 25
export const NO_HINT_BONUS = 25
export const BOSS_BONUS = 100
export const HINT_PENALTY = 10
export const WRONG_PENALTY = 5

export function computeScore(mission, hintsUsed, attempts) {
  const base = mission.xp ?? BASE_XP[mission.difficulty] ?? 100
  let score = base - HINT_PENALTY * hintsUsed - WRONG_PENALTY * attempts
  if (hintsUsed === 0) score += NO_HINT_BONUS
  if (mission.difficulty === 'Boss') score += BOSS_BONUS
  return Math.max(MIN_SCORE, score)
}

// Preview of the score breakdown for the UI.
export function scoreBreakdown(mission, hintsUsed, attempts) {
  const base = mission.xp ?? BASE_XP[mission.difficulty] ?? 100
  const rows = [{ label: 'Base XP', value: base }]
  if (hintsUsed > 0)
    rows.push({ label: `Hints used (${hintsUsed} × -${HINT_PENALTY})`, value: -HINT_PENALTY * hintsUsed })
  if (attempts > 0)
    rows.push({ label: `Wrong attempts (${attempts} × -${WRONG_PENALTY})`, value: -WRONG_PENALTY * attempts })
  if (hintsUsed === 0) rows.push({ label: 'No-hint bonus', value: NO_HINT_BONUS })
  if (mission.difficulty === 'Boss') rows.push({ label: 'Boss bonus', value: BOSS_BONUS })
  const total = computeScore(mission, hintsUsed, attempts)
  return { rows, total }
}

// ---- ranks ----------------------------------------------------------------
export const RANKS = [
  { min: 0, name: 'Rookie Analyst' },
  { min: 100, name: 'Junior Detective' },
  { min: 300, name: 'Cyber Investigator' },
  { min: 700, name: 'NOtFound_404 Operator' },
  { min: 1200, name: 'Threat Hunter' },
  { min: 2000, name: 'Elite Case Breaker' },
  { min: 3000, name: 'Case404 Master' },
]

export function rankForXp(xp) {
  let current = RANKS[0]
  for (const r of RANKS) if (xp >= r.min) current = r
  return current
}

export function nextRank(xp) {
  return RANKS.find((r) => r.min > xp) || null
}

// ---- achievements ---------------------------------------------------------
export const ACHIEVEMENTS = [
  { id: 'first_case', name: 'First Case Solved', desc: 'Close your first case.' },
  { id: 'no_hint', name: 'No Hint Solver', desc: 'Solve a case using zero hints.' },
  { id: 'crypto_beginner', name: 'Crypto Beginner', desc: 'Solve a Crypto or Encoding case.' },
  { id: 'log_hunter', name: 'Log Hunter', desc: 'Solve a Log Analysis case.' },
  { id: 'pattern_finder', name: 'Pattern Finder', desc: 'Solve a Forensics or Stego case.' },
  { id: 'web_logic_analyst', name: 'Web Logic Analyst', desc: 'Solve a Web Logic or Access Review case.' },
  { id: 'boss_breaker', name: 'Boss Breaker', desc: 'Defeat a Boss case.' },
  { id: 'ten_cases', name: '10 Cases Solved', desc: 'Close 10 cases total.' },
  { id: 'twentyfive_cases', name: '25 Cases Solved', desc: 'Close all 25 cases.' },
  { id: 'perfect_operator', name: 'Perfect Operator', desc: 'Solve with no hints and no wrong attempts.' },
]

function achievementsForSolve(mission, state, hintsUsed, attempts) {
  const earned = []
  const cat = mission.category.toLowerCase()
  const solvedAfter = state.solved.length // count AFTER this solve was applied

  if (solvedAfter >= 1) earned.push('first_case')
  if (hintsUsed === 0) earned.push('no_hint')
  if (cat.includes('crypto') || cat.includes('encoding')) earned.push('crypto_beginner')
  if (cat.includes('log analysis')) earned.push('log_hunter')
  if (cat.includes('forensics') || cat.includes('stego')) earned.push('pattern_finder')
  if (cat.includes('web logic') || cat.includes('access review')) earned.push('web_logic_analyst')
  if (mission.difficulty === 'Boss') earned.push('boss_breaker')
  if (solvedAfter >= 10) earned.push('ten_cases')
  if (solvedAfter >= 25) earned.push('twentyfive_cases')
  if (hintsUsed === 0 && attempts === 0) earned.push('perfect_operator')

  return earned
}

// ---- live event recorders -------------------------------------------------
export function recordHint(state, missionId) {
  if (state.solved.includes(missionId)) return state // no penalty after solve
  const n = (state.hints[missionId] || 0) + 1
  return { ...state, hints: { ...state.hints, [missionId]: n } }
}

export function recordWrongAttempt(state, missionId) {
  if (state.solved.includes(missionId)) return state
  const n = (state.attempts[missionId] || 0) + 1
  return { ...state, attempts: { ...state.attempts, [missionId]: n } }
}

// ---- solve handling --------------------------------------------------------
// Idempotent: re-solving an already-solved mission is a no-op.
export function applySolve(state, mission) {
  if (state.solved.includes(mission.id)) {
    return { state, gainedXp: 0, breakdown: null, newAchievements: [] }
  }
  const hintsUsed = state.hints[mission.id] || 0
  const attempts = state.attempts[mission.id] || 0
  const score = computeScore(mission, hintsUsed, attempts)
  const breakdown = scoreBreakdown(mission, hintsUsed, attempts)

  const solved = [...state.solved, mission.id]
  const scores = { ...state.scores, [mission.id]: { score, hintsUsed, attempts } }
  const afterSolve = { ...state, solved, scores }

  const candidate = achievementsForSolve(mission, afterSolve, hintsUsed, attempts)
  const newAchievements = candidate.filter((a) => !state.achievements.includes(a))
  const achievements = [...state.achievements, ...newAchievements]

  return {
    state: { ...afterSolve, achievements },
    gainedXp: score,
    breakdown,
    newAchievements,
  }
}

export const totalMissions = missions.length
