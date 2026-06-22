// ---------------------------------------------------------------------------
// flagChecker.js — compares a submitted flag against a mission's flag.
//
// Tolerant of surrounding whitespace and case differences in the wrapper, but
// preserves the exact inner token. All comparison is local; nothing leaves the
// browser.
// ---------------------------------------------------------------------------

export function normalizeFlag(input) {
  return String(input == null ? '' : input).trim()
}

export function checkFlag(submitted, expected) {
  const a = normalizeFlag(submitted)
  const b = normalizeFlag(expected)
  if (!a) return false
  // Exact match first.
  if (a === b) return true
  // Case-insensitive match as a friendly fallback (e.g. NOTFOUND404{...}).
  return a.toLowerCase() === b.toLowerCase()
}
