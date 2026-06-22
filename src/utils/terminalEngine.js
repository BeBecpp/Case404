// ---------------------------------------------------------------------------
// terminalEngine.js — a SIMULATED command processor (Season 1).
//
// This is NOT a shell. It runs nothing on the host, opens no network
// connection, and reads no real files. Every "file" comes from the active
// mission's `files` object. Commands like decode/hexdecode/urldecode/rot13/
// caesar/xor/hash are pure string transforms in the browser. Teaching prop only.
// ---------------------------------------------------------------------------

import { checkFlag } from './flagChecker.js'

const line = (text, tone = 'normal') => ({ text, tone })

const HELP = [
  line('Case404 operator console — commands:', 'accent'),
  line('  help                       this list'),
  line('  ls                         list evidence files'),
  line('  cat <file>                 print a file'),
  line('  head <file>                first 10 lines'),
  line('  tail <file>                last 10 lines'),
  line('  wc <file>                  count lines / words / chars'),
  line('  grep <keyword> <file>      lines containing keyword'),
  line('  find <keyword>             search keyword across ALL files'),
  line('  strings <file>             printable strings from noisy data'),
  line('  sort <file>                sort lines A→Z'),
  line('  uniq <file>                collapse adjacent duplicate lines'),
  line('  jsonget <file> <path>      read a dot path, e.g. users.2.name'),
  line('  decode base64 <text>       Base64 decode'),
  line('  hexdecode <text>           hex → text'),
  line('  urldecode <text>           percent-decode'),
  line('  rot13 <text>               ROT13'),
  line('  caesar <text> <shift>      shift letters BACKWARD'),
  line('  xor <hexOrText> <key>      XOR with a repeating key'),
  line('  hash <text>                SHA-256 (Web Crypto)'),
  line('  history                    show command history'),
  line('  submit <FLAG>              submit a flag'),
  line('  clear                      clear console'),
  line('Tip: ls → cat readme.txt → follow the recommended commands.', 'muted'),
]

// ---- pure transforms ------------------------------------------------------

function decodeBase64(str) {
  const cleaned = str.trim()
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) throw new Error('not base64')
  const binary = atob(cleaned)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function hexDecode(str) {
  const cleaned = str.trim().replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0)
    throw new Error('not hex')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16)
  return new TextDecoder().decode(bytes)
}

function rot13(text) {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

function caesarBack(text, shift) {
  const s = ((shift % 26) + 26) % 26
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base - s + 26) % 26) + base)
  })
}

// XOR: if `data` looks like hex, treat as bytes; otherwise use raw chars.
// XORs against the repeating ASCII `key` and returns the resulting string.
function xorDecode(data, key) {
  let bytes
  const cleaned = data.trim()
  if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length % 2 === 0) {
    bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16)
  } else {
    bytes = Uint8Array.from(cleaned, (c) => c.charCodeAt(0))
  }
  let out = ''
  for (let i = 0; i < bytes.length; i++)
    out += String.fromCharCode(bytes[i] ^ key.charCodeAt(i % key.length))
  return out
}

// `strings`: extract runs of printable ASCII (>= 4 chars) from noisy content.
function extractStrings(content) {
  const matches = String(content).match(/[\x20-\x7e]{4,}/g) || []
  return matches
}

// `jsonget`: traverse a dot path with numeric array indices.
function jsonGet(content, path) {
  const obj = JSON.parse(content)
  const parts = path.split('.').filter(Boolean)
  let cur = obj
  for (const p of parts) {
    if (cur == null) throw new Error(`path stops at "${p}"`)
    const key = /^\d+$/.test(p) ? Number(p) : p
    cur = cur[key]
  }
  if (cur === undefined) throw new Error('path not found')
  return typeof cur === 'object' ? JSON.stringify(cur) : String(cur)
}

async function sha256(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  return null
}

const requireFile = (files, name) => name in files

// ---- main entry -----------------------------------------------------------
// runCommand(input, mission, ctx) -> { output: Line[], action? }
// ctx.history: string[] of previously entered commands (for `history`).
export async function runCommand(rawInput, mission, ctx = {}) {
  const input = rawInput.trim()
  if (!input) return { output: [] }

  const parts = input.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)
  const files = mission?.files || {}

  const fileLines = (name) => String(files[name]).split('\n')

  switch (cmd) {
    case 'help':
      return { output: HELP }

    case 'clear':
      return { output: [], action: { kind: 'clear' } }

    case 'history': {
      const h = ctx.history || []
      if (h.length === 0) return { output: [line('(no history yet)', 'muted')] }
      return { output: h.map((c, i) => line(`  ${i + 1}  ${c}`)) }
    }

    case 'ls': {
      const names = Object.keys(files)
      if (!names.length) return { output: [line('no evidence files', 'muted')] }
      return {
        output: [
          line(`evidence/ (${names.length} files)`, 'accent'),
          ...names.map((n) => line('  ' + n)),
        ],
      }
    }

    case 'cat': {
      if (!args[0]) return { output: [line('usage: cat <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`cat: ${args[0]}: no such evidence file`, 'error')] }
      return { output: fileLines(args[0]).map((l) => line(l)) }
    }

    case 'head': {
      if (!args[0]) return { output: [line('usage: head <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`head: ${args[0]}: no such evidence file`, 'error')] }
      return { output: fileLines(args[0]).slice(0, 10).map((l) => line(l)) }
    }

    case 'tail': {
      if (!args[0]) return { output: [line('usage: tail <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`tail: ${args[0]}: no such evidence file`, 'error')] }
      return { output: fileLines(args[0]).slice(-10).map((l) => line(l)) }
    }

    case 'wc': {
      if (!args[0]) return { output: [line('usage: wc <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`wc: ${args[0]}: no such evidence file`, 'error')] }
      const body = String(files[args[0]])
      const l = body.split('\n').length
      const w = body.split(/\s+/).filter(Boolean).length
      const c = body.length
      return { output: [line(`${l} lines  ${w} words  ${c} chars  ${args[0]}`, 'accent')] }
    }

    case 'grep': {
      if (args.length < 2)
        return { output: [line('usage: grep <keyword> <file>', 'error')] }
      const [keyword, name] = args
      if (!requireFile(files, name))
        return { output: [line(`grep: ${name}: no such evidence file`, 'error')] }
      const matches = fileLines(name).filter((l) => l.includes(keyword))
      if (!matches.length)
        return { output: [line(`grep: no lines matching "${keyword}"`, 'muted')] }
      return { output: matches.map((l) => line(l, 'accent')) }
    }

    case 'find': {
      if (!args[0]) return { output: [line('usage: find <keyword>', 'error')] }
      const keyword = args.join(' ')
      const out = []
      for (const name of Object.keys(files)) {
        fileLines(name).forEach((l) => {
          if (l.includes(keyword)) out.push(line(`${name}: ${l}`, 'accent'))
        })
      }
      return out.length
        ? { output: out }
        : { output: [line(`find: no matches for "${keyword}"`, 'muted')] }
    }

    case 'strings': {
      if (!args[0]) return { output: [line('usage: strings <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`strings: ${args[0]}: no such evidence file`, 'error')] }
      const found = extractStrings(files[args[0]])
      return found.length
        ? { output: found.map((s) => line(s)) }
        : { output: [line('strings: no printable runs found', 'muted')] }
    }

    case 'sort': {
      if (!args[0]) return { output: [line('usage: sort <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`sort: ${args[0]}: no such evidence file`, 'error')] }
      return { output: [...fileLines(args[0])].sort().map((l) => line(l)) }
    }

    case 'uniq': {
      if (!args[0]) return { output: [line('usage: uniq <file>', 'error')] }
      if (!requireFile(files, args[0]))
        return { output: [line(`uniq: ${args[0]}: no such evidence file`, 'error')] }
      const src = fileLines(args[0])
      const out = src.filter((l, i) => i === 0 || l !== src[i - 1])
      return { output: out.map((l) => line(l)) }
    }

    case 'jsonget': {
      if (args.length < 2)
        return { output: [line('usage: jsonget <file> <dot.path>', 'error')] }
      const [name, path] = args
      if (!requireFile(files, name))
        return { output: [line(`jsonget: ${name}: no such evidence file`, 'error')] }
      try {
        return { output: [line(jsonGet(files[name], path), 'success')] }
      } catch (e) {
        return { output: [line(`jsonget: ${e.message}`, 'error')] }
      }
    }

    case 'decode': {
      if (args[0]?.toLowerCase() !== 'base64' || args.length < 2)
        return { output: [line('usage: decode base64 <text>', 'error')] }
      try {
        return { output: [line(decodeBase64(args.slice(1).join('')), 'success')] }
      } catch {
        return { output: [line('decode: input is not valid Base64', 'error')] }
      }
    }

    case 'hexdecode': {
      if (!args[0]) return { output: [line('usage: hexdecode <text>', 'error')] }
      try {
        return { output: [line(hexDecode(args.join('')), 'success')] }
      } catch {
        return { output: [line('hexdecode: input is not valid hex', 'error')] }
      }
    }

    case 'urldecode': {
      if (!args[0]) return { output: [line('usage: urldecode <text>', 'error')] }
      try {
        return { output: [line(decodeURIComponent(args.join(' ')), 'success')] }
      } catch {
        return { output: [line('urldecode: malformed percent-encoding', 'error')] }
      }
    }

    case 'rot13': {
      if (!args[0]) return { output: [line('usage: rot13 <text>', 'error')] }
      return { output: [line(rot13(args.join(' ')), 'success')] }
    }

    case 'caesar': {
      if (args.length < 2)
        return { output: [line('usage: caesar <text> <shift>', 'error')] }
      const shift = Number(args[args.length - 1])
      if (!Number.isFinite(shift))
        return { output: [line(`caesar: "${args[args.length - 1]}" is not a number`, 'error')] }
      return { output: [line(caesarBack(args.slice(0, -1).join(' '), shift), 'success')] }
    }

    case 'xor': {
      if (args.length < 2)
        return { output: [line('usage: xor <hexOrText> <key>', 'error')] }
      const key = args[args.length - 1]
      const data = args.slice(0, -1).join(' ')
      try {
        return { output: [line(xorDecode(data, key), 'success')] }
      } catch {
        return { output: [line('xor: could not process input', 'error')] }
      }
    }

    case 'hash': {
      if (!args[0]) return { output: [line('usage: hash <text>', 'error')] }
      const digest = await sha256(args.join(' '))
      return digest === null
        ? { output: [line('hash: Web Crypto unavailable in this context.', 'error')] }
        : { output: [line('sha256: ' + digest, 'success')] }
    }

    case 'submit': {
      if (!args[0]) return { output: [line('usage: submit <FLAG>', 'error')] }
      const flag = args.join(' ')
      const correct = checkFlag(flag, mission?.flag)
      if (correct) {
        return {
          output: [
            line('FLAG ACCEPTED — case closed.', 'success'),
            line('Logging solve to your operator profile...', 'muted'),
          ],
          action: { kind: 'submit', correct: true, flag },
        }
      }
      return {
        output: [line('FLAG REJECTED — that is not the answer. (-5 XP)', 'error')],
        action: { kind: 'submit', correct: false, flag },
      }
    }

    default:
      return {
        output: [
          line(`command not found: ${cmd}`, 'error'),
          line('type  help  for the list of commands', 'muted'),
        ],
      }
  }
}

export const TONES = {
  normal: 'text-slate-200',
  accent: 'text-signal-cyan',
  success: 'text-signal-green',
  error: 'text-alert',
  muted: 'text-slate-500',
}
