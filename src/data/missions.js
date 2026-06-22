// ---------------------------------------------------------------------------
// Case404 — Season 1 mission data (25 cases).
//
// Everything here is FICTIONAL and LOCAL. No real IPs, domains, targets,
// credentials, malware, or systems. Logs, JSON, ciphers, and "metadata" are
// invented teaching props used only inside this offline game. The terminal
// reads ONLY the active mission's `files`. Nothing touches a network.
//
// Every encoded value below was generated so its flag is actually solvable
// with the listed `recommendedCommands` (verified in the build harness).
// ---------------------------------------------------------------------------

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Boss']

export const CATEGORIES = [
  'Log Analysis',
  'Crypto',
  'Encoding',
  'Forensics',
  'Web Logic',
  'Stego Simulation',
  'OSINT-style Puzzle',
  'Incident Response',
  'Threat Hunting',
  'Access Review',
]

// Base XP per difficulty (boss bonus is added by the scoring engine).
export const BASE_XP = { Easy: 100, Medium: 150, Hard: 250, Boss: 500 }

// Small helper so multi-line file bodies stay readable.
const lines = (...arr) => arr.join('\n')

export const missions = [
  // ===================== EASY (1–8) =====================
  {
    id: 1,
    title: 'The Suspicious Login',
    category: 'Log Analysis',
    difficulty: 'Easy',
    xp: 100,
    story:
      'A fictional company saw odd login activity overnight. Inspect the logs and name the account the suspicious actor actually got into.',
    objective: 'Find the username of the successful suspicious login.',
    files: {
      'readme.txt': 'Incident happened around 02:14 AM. Read the timeline carefully.',
      'access.log': lines(
        '[02:14] failed login admin from 10.0.0.44',
        '[02:15] failed login root from 10.0.0.44',
        '[02:16] success login guest_backup from 10.0.0.44',
        '[02:20] normal login mira from 10.0.0.12'
      ),
      'users.txt': lines('admin', 'root', 'mira', 'guest_backup', 'backup_ops'),
    },
    hints: [
      'List the files first, then read the log.',
      'One IP fails several times then succeeds.',
      'The successful account after the failures is the answer.',
    ],
    flag: 'NOtFound404{guest_backup}',
    explanation:
      'IP 10.0.0.44 failed as admin and root, then logged in as guest_backup. A success right after repeated failures from one source is the classic brute-force tell.',
    recommendedCommands: ['ls', 'cat access.log', 'grep success access.log'],
  },
  {
    id: 2,
    title: 'Base64 Note',
    category: 'Encoding',
    difficulty: 'Easy',
    xp: 100,
    story: 'A strange encoded note turned up in a fictional incident report.',
    objective: 'Decode the encoded message.',
    files: {
      'message.txt': 'Tk90Rm91bmQ0MDR7YmFzZTY0X2RldGVjdGl2ZX0=',
      'readme.txt': 'Encoded, not encrypted. Try a common web encoding format.',
    },
    hints: [
      'Trailing "=" is a clue.',
      'This is Base64.',
      'Use: decode base64 <text>',
    ],
    flag: 'NOtFound404{base64_detective}',
    explanation:
      'The Base64 string decodes straight to the flag. "=" padding and the A–Z/a–z/0–9/+/ alphabet are strong Base64 tells.',
    recommendedCommands: [
      'cat message.txt',
      'decode base64 Tk90Rm91bmQ0MDR7YmFzZTY0X2RldGVjdGl2ZX0=',
    ],
  },
  {
    id: 3,
    title: 'Caesar Shift',
    category: 'Crypto',
    difficulty: 'Easy',
    xp: 100,
    story: 'An old-school cipher was scrawled in a fictional attacker note.',
    objective: 'Decode the Caesar-shifted message.',
    files: {
      'cipher.txt': 'QRwIrxqg404{fdhvdu_flskhu}',
      'readme.txt': 'Classic Caesar shifts letters. Try shifting backward.',
    },
    hints: ['Substitution cipher.', 'Small shift value.', 'Use: caesar <text> 3'],
    flag: 'NOtFound404{caesar_cipher}',
    explanation:
      'The text was shifted forward by 3; shifting each letter back by 3 reveals the flag. Digits and braces stay put.',
    recommendedCommands: ['cat cipher.txt', 'caesar QRwIrxqg404{fdhvdu_flskhu} 3'],
  },
  {
    id: 4,
    title: 'Hidden in Plain Sight',
    category: 'Forensics',
    difficulty: 'Easy',
    xp: 100,
    story: 'A fictional memory dump is full of noise. Find the one useful line.',
    objective: 'Find the flag hidden in the dump.',
    files: {
      'dump.txt': lines(
        'system.boot=true',
        'cache.index=4182',
        'debug.mode=false',
        'session.alpha=active',
        'random_token=7fa91ac',
        'NOtFound404{grep_is_powerful}',
        'trace.closed=true',
        'worker.status=idle',
        'noise.value=xyz'
      ),
      'readme.txt': 'Big evidence files are easier with targeted search.',
    },
    hints: [
      'The flag has a predictable prefix.',
      'Search for NOtFound404 in the dump.',
      'Use: grep NOtFound404 dump.txt',
    ],
    flag: 'NOtFound404{grep_is_powerful}',
    explanation:
      'When you know a substring of the target, grep collapses noise into the one line that matters.',
    recommendedCommands: ['grep NOtFound404 dump.txt'],
  },
  {
    id: 5,
    title: 'Broken Access Logic',
    category: 'Web Logic',
    difficulty: 'Easy',
    xp: 100,
    story: 'A fictional API response shows one active account with admin power.',
    objective: 'Find the active admin-like account.',
    files: {
      'api_response.json': `{
  "users": [
    { "name": "admin", "role": "disabled", "active": false },
    { "name": "mira", "role": "user", "active": true },
    { "name": "backup_bot", "role": "admin", "active": true },
    { "name": "guest", "role": "user", "active": false }
  ]
}`,
      'readme.txt': 'Risk lives where role AND active status combine.',
    },
    hints: [
      'Read the user list closely.',
      'The risky one is active AND admin.',
      'Use: jsonget api_response.json users.2.name',
    ],
    flag: 'NOtFound404{backup_bot}',
    explanation:
      'backup_bot is role=admin and active=true. Reviewing role plus state together is how you spot privilege issues.',
    recommendedCommands: ['cat api_response.json', 'jsonget api_response.json users.2.name'],
  },
  {
    id: 6,
    title: 'Percent Signs Everywhere',
    category: 'Encoding',
    difficulty: 'Easy',
    xp: 100,
    story: 'A fictional web request carried a payload full of % escapes.',
    objective: 'Decode the URL-encoded payload.',
    files: {
      'payload.txt': 'NOtFound404%7Burl_decoded%7D',
      'readme.txt': 'Percent-encoding shows up in URLs and request bodies.',
    },
    hints: [
      '%7B and %7D are encoded braces.',
      'This is URL/percent encoding.',
      'Use: urldecode <text>',
    ],
    flag: 'NOtFound404{url_decoded}',
    explanation:
      '%7B and %7D are { and }. urldecode turns the percent-escapes back into the original flag.',
    recommendedCommands: ['cat payload.txt', 'urldecode NOtFound404%7Burl_decoded%7D'],
  },
  {
    id: 7,
    title: 'Hex Dump Whisper',
    category: 'Encoding',
    difficulty: 'Easy',
    xp: 100,
    story: 'A fictional config leaked a value as a long hex string.',
    objective: 'Decode the hex-encoded message.',
    files: {
      'hex.txt': '4e4f74466f756e643430347b6865785f6d61737465727d',
      'readme.txt': 'Pairs of 0-9 a-f usually mean hex bytes.',
    },
    hints: [
      'Each pair of characters is one byte.',
      'This is hexadecimal.',
      'Use: hexdecode <text>',
    ],
    flag: 'NOtFound404{hex_master}',
    explanation:
      'Two hex digits per byte; converting each byte to ASCII spells out the flag.',
    recommendedCommands: ['cat hex.txt', 'hexdecode 4e4f74466f756e643430347b6865785f6d61737465727d'],
  },
  {
    id: 8,
    title: 'ROT13 Note',
    category: 'Crypto',
    difficulty: 'Easy',
    xp: 100,
    story: 'A fictional sticky note used the oldest trick in the forum-troll book.',
    objective: 'Decode the ROT13 note.',
    files: {
      'note.txt': 'ABgSbhaq404{ebg13_ebpxf}',
      'readme.txt': 'ROT13 rotates letters by 13. It is its own inverse.',
    },
    hints: [
      'Only letters change; digits and braces stay.',
      'ROT13 — apply it again to undo it.',
      'Use: rot13 <text>',
    ],
    flag: 'NOtFound404{rot13_rocks}',
    explanation:
      'ROT13 shifts letters by 13, so running rot13 on the note recovers the flag.',
    recommendedCommands: ['cat note.txt', 'rot13 ABgSbhaq404{ebg13_ebpxf}'],
  },

  // ===================== MEDIUM (9–18) =====================
  {
    id: 9,
    title: 'Drowning in Duplicates',
    category: 'Log Analysis',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional auth log repeats the same lines over and over. One account is hammering the system far more than the rest.',
    objective: 'Name the service account spamming failed logins.',
    files: {
      'logins.log': lines(
        'fail svc_scanner',
        'ok mira',
        'fail svc_scanner',
        'fail svc_scanner',
        'ok devon',
        'fail svc_scanner',
        'fail svc_scanner',
        'ok mira',
        'fail svc_scanner',
        'fail svc_scanner',
        'ok devon',
        'fail svc_scanner'
      ),
      'readme.txt': 'sort groups identical lines; uniq collapses the repeats.',
    },
    hints: [
      'Sort first so identical lines sit together.',
      'uniq collapses adjacent duplicates so the noisy one stands out.',
      'The account appears far more than any other — it is svc_scanner.',
    ],
    flag: 'NOtFound404{svc_scanner}',
    explanation:
      'After sort + uniq, svc_scanner clearly dominates the failed entries — a single account brute-forcing.',
    recommendedCommands: ['cat logins.log', 'sort logins.log', 'uniq logins.log', 'grep fail logins.log'],
  },
  {
    id: 10,
    title: 'The Shadow Admin',
    category: 'Web Logic',
    difficulty: 'Medium',
    xp: 150,
    story: 'A fictional accounts API hides one over-privileged active user.',
    objective: 'Find the active admin account that should not exist.',
    files: {
      'api.json': `{
  "accounts": [
    { "user": "admin", "role": "disabled", "active": false },
    { "user": "mira", "role": "user", "active": true },
    { "user": "shadow_admin", "role": "admin", "active": true },
    { "user": "guest", "role": "user", "active": false }
  ]
}`,
      'readme.txt': 'jsonget reads dot paths, e.g. accounts.2.user',
    },
    hints: [
      'Inspect every account object.',
      'Filter for role=admin AND active=true.',
      'Use: jsonget api.json accounts.2.user',
    ],
    flag: 'NOtFound404{shadow_admin}',
    explanation:
      'Only shadow_admin is both admin and active — a privilege the account list should not contain.',
    recommendedCommands: ['cat api.json', 'jsonget api.json accounts.2.user', 'jsonget api.json accounts.2.role'],
  },
  {
    id: 11,
    title: 'Transcript of a Leak',
    category: 'Threat Hunting',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional capture was rendered into a readable HTTP transcript. Most of it is harmless browsing — one request is not.',
    objective: 'Identify the suspicious upload action (host_action form).',
    files: {
      'transcript.txt': lines(
        'GET /index.html host=portal.lab 200',
        'GET /style.css host=portal.lab 200',
        'GET /dashboard host=portal.lab 200',
        'POST /upload host=node7 file=dump.bin 201',
        'GET /logo.png host=portal.lab 200',
        'GET /about host=portal.lab 200'
      ),
      'readme.txt': 'Most traffic is GET. Outbound POSTs carrying files are worth a look.',
    },
    hints: [
      'GET vs POST — which verb moves data out?',
      'grep for POST to isolate the odd request.',
      'A file was POSTed to host node7 — answer is node7_upload.',
    ],
    flag: 'NOtFound404{node7_upload}',
    explanation:
      'Among normal GETs, a POST /upload to host node7 ships a file out — the exfil action. Format: host_action.',
    recommendedCommands: ['cat transcript.txt', 'grep POST transcript.txt'],
  },
  {
    id: 12,
    title: 'Comment in the Pixels',
    category: 'Stego Simulation',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional image file is mostly binary noise, but readable strings are hiding inside its metadata.',
    objective: 'Extract the readable flag from the image strings.',
    files: {
      // Simulated binary blob with nulls; `strings` pulls out the printable runs.
      'photo.img':
        '\x00\x00JFIF\x00\x01\x01\x00Exif\x00\x00MM\x00\x2aMake=FauxCam\x00Model=FX-9\x00\x07\x07Comment=NOtFound404{exif_comment}\x00\x00\xff\xd9trailingnoise\x01\x02\x03',
      'readme.txt': 'Binary files often carry readable text. strings extracts it.',
    },
    hints: [
      'cat shows garbage — you need readable runs only.',
      'strings pulls printable sequences out of binary noise.',
      'Use: strings photo.img  then read the Comment field.',
    ],
    flag: 'NOtFound404{exif_comment}',
    explanation:
      'strings skips the binary bytes and surfaces the Comment metadata field, which holds the flag.',
    recommendedCommands: ['strings photo.img', 'find NOtFound404'],
  },
  {
    id: 13,
    title: 'Rebuild the Timeline',
    category: 'Incident Response',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional incident left scrambled event lines. Put them in order and name the first malicious action.',
    objective: 'Identify the earliest malicious event (action_HHMM).',
    files: {
      'events.log': lines(
        '0312 file_exfil',
        '0245 lateral_move',
        '0231 initial_access',
        '0301 privilege_escalation',
        '0258 persistence'
      ),
      'readme.txt': 'Sort by the leading timestamp to reconstruct order.',
    },
    hints: [
      'The 4-digit prefix is a 24h timestamp.',
      'Sort ascending to find what happened first.',
      'Earliest is 0231 initial_access — format action_HHMM.',
    ],
    flag: 'NOtFound404{initial_access_0231}',
    explanation:
      'Sorting by timestamp shows 02:31 initial_access kicked off the chain before escalation, persistence, lateral movement, and exfil.',
    recommendedCommands: ['cat events.log', 'sort events.log', 'head events.log'],
  },
  {
    id: 14,
    title: 'Reversible Secret',
    category: 'Crypto',
    difficulty: 'Medium',
    xp: 150,
    story: 'A fictional payload was XORed with a short known key found in the notes.',
    objective: 'XOR-decode the secret using the known key.',
    files: {
      'secret.hex': '222e162a0e170205565c5519140e103308113313071a04101f080000041f',
      'readme.txt': 'XOR is symmetric. The recovered key is: lab',
    },
    hints: [
      'XOR with the same key reverses the operation.',
      'The hex is the ciphertext; the key is in readme.txt.',
      'Use: xor 222e162a0e170205565c5519140e103308113313071a04101f080000041f lab',
    ],
    flag: 'NOtFound404{xor_is_reversible}',
    explanation:
      'XOR is its own inverse: applying the key "lab" to the ciphertext bytes restores the flag.',
    recommendedCommands: ['cat secret.hex', 'cat readme.txt', 'xor 222e162a0e170205565c5519140e103308113313071a04101f080000041f lab'],
  },
  {
    id: 15,
    title: 'Hunting the User-Agent',
    category: 'Threat Hunting',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional web log is full of normal browsers, with one obvious scanning tool mixed in.',
    objective: 'Name the malicious tool from its user-agent.',
    files: {
      'web.log': lines(
        '10.0.0.5 "Mozilla/5.0 Chrome/120"',
        '10.0.0.6 "Mozilla/5.0 Firefox/121"',
        '10.0.0.7 "sqlmap/1.7#stable"',
        '10.0.0.8 "Mozilla/5.0 Safari/17"',
        '10.0.0.9 "Mozilla/5.0 Edge/120"'
      ),
      'readme.txt': 'Legit clients claim to be browsers. Scanners often do not.',
    },
    hints: [
      'Scan the user-agent strings.',
      'One of them is a known injection tool, not a browser.',
      'grep for sqlmap — answer is sqlmap_detected.',
    ],
    flag: 'NOtFound404{sqlmap_detected}',
    explanation:
      'The sqlmap user-agent stands out among real browsers — a scanning tool fingerprinting the app.',
    recommendedCommands: ['cat web.log', 'grep sqlmap web.log'],
  },
  {
    id: 16,
    title: 'Brute Then Break-In',
    category: 'Log Analysis',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional auth log shows one IP failing many times before a single success.',
    objective: 'Identify the attacking IP (dots become underscores).',
    files: {
      'auth.log': lines(
        'fail user=ann ip=10.0.0.12',
        'fail user=root ip=10.0.0.99',
        'fail user=root ip=10.0.0.99',
        'fail user=admin ip=10.0.0.99',
        'fail user=admin ip=10.0.0.99',
        'ok   user=admin ip=10.0.0.99',
        'ok   user=ann ip=10.0.0.12'
      ),
      'readme.txt': 'Count failures per IP, then see which one finally succeeds.',
    },
    hints: [
      'Group by IP and count failures.',
      'One IP fails repeatedly then gets an ok.',
      '10.0.0.99 is the attacker — format 10_0_0_99.',
    ],
    flag: 'NOtFound404{10_0_0_99}',
    explanation:
      '10.0.0.99 racks up four failures then a success — a brute-force that broke through. Dots become underscores in the flag.',
    recommendedCommands: ['grep 10.0.0.99 auth.log', 'grep ok auth.log', 'wc auth.log'],
  },
  {
    id: 17,
    title: 'Token in the Debug Log',
    category: 'Incident Response',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional service shipped to prod with debug logging on, leaking a secret into the file.',
    objective: 'Find the leaked credential line.',
    files: {
      'debug.log': lines(
        'INFO server started on :8080',
        'DEBUG cache warmup ok',
        'DEBUG request id=adf12',
        'DEBUG leaked_key=sk_live_FAKE_NOtFound404{leaked_api_key}',
        'INFO healthcheck ok',
        'WARN slow query 1200ms'
      ),
      'readme.txt': 'Debug builds often print secrets. Search for key/token.',
    },
    hints: [
      'Secrets often follow words like key= or token=.',
      'grep for "key" to jump to it.',
      'The leaked line carries the flag — leaked_api_key.',
    ],
    flag: 'NOtFound404{leaked_api_key}',
    explanation:
      'A DEBUG line printed a leaked_key value with the flag embedded — exactly the kind of secret debug logging exposes.',
    recommendedCommands: ['cat debug.log', 'grep key debug.log', 'grep DEBUG debug.log'],
  },
  {
    id: 18,
    title: 'Left-Behind Backup',
    category: 'Forensics',
    difficulty: 'Medium',
    xp: 150,
    story:
      'A fictional deploy left an old backup file next to the app. Backups love to leak secrets.',
    objective: 'Discover the backup file and read its secret.',
    files: {
      'index.html': '<!doctype html><title>Portal</title><h1>Welcome</h1>',
      'app.js': 'console.log("portal loaded")',
      'config.bak': lines(
        '# OLD CONFIG BACKUP - do not ship',
        'db_host=localhost',
        'admin_note=NOtFound404{backup_left_behind}'
      ),
      'readme.txt': 'List everything first — .bak files are easy to miss.',
    },
    hints: [
      'ls reveals more than the obvious app files.',
      'A .bak file is sitting right there.',
      'cat config.bak to read the admin_note.',
    ],
    flag: 'NOtFound404{backup_left_behind}',
    explanation:
      'Listing the directory exposes config.bak, an old backup that still contains a secret note — a common real-world leak.',
    recommendedCommands: ['ls', 'cat config.bak', 'grep NOtFound404 config.bak'],
  },

  // ===================== HARD (19–23) =====================
  {
    id: 19,
    title: 'Trace the Handle',
    category: 'OSINT-style Puzzle',
    difficulty: 'Hard',
    xp: 250,
    story:
      'A fictional handle appears across several artifacts. Correlate them to surface the operator codename.',
    objective: 'Resolve the handle to its codename.',
    files: {
      'posts.txt': lines(
        'post#1 author=lurker_9 "nice weather"',
        'post#2 author=gh0st_42 "the drop is ready"',
        'post#3 author=mira "lunch?"'
      ),
      'profiles.txt': lines(
        'lurker_9 -> joined 2021, low activity',
        'gh0st_42 -> flagged: coordinates drops, high activity',
        'mira -> staff'
      ),
      'registry.json': `{
  "aliases": [
    { "handle": "gh0st_42", "codename": "nightjar" },
    { "handle": "lurker_9", "codename": "sparrow" }
  ]
}`,
      'readme.txt': 'Find the flagged handle, then map it through the registry.',
    },
    hints: [
      'Which handle is described as coordinating the drop?',
      'Cross-reference that handle in profiles, then registry.',
      'Use: jsonget registry.json aliases.0.codename',
    ],
    flag: 'NOtFound404{nightjar}',
    explanation:
      'posts + profiles point to gh0st_42 as the active operator; the registry maps gh0st_42 to codename nightjar.',
    recommendedCommands: [
      'find drop',
      'grep gh0st_42 profiles.txt',
      'jsonget registry.json aliases.0.codename',
    ],
  },
  {
    id: 20,
    title: 'The Spoofed Sender',
    category: 'Incident Response',
    difficulty: 'Hard',
    xp: 250,
    story:
      'A fictional phishing email claims to be from the CEO. The headers tell a different story.',
    objective: 'Name the actual sending relay from the Received chain.',
    files: {
      'email.txt': lines(
        'From: CEO <ceo@trusted.lab>',
        'Reply-To: payments@payday-now.lab',
        'Return-Path: <bounce@relay_node12.lab>',
        'Received: from relay_node12.lab (10.0.0.231) by mx.trusted.lab',
        'Received: from unknown by relay_node12.lab',
        'Subject: URGENT wire transfer',
        'Body: Please wire funds immediately.'
      ),
      'readme.txt': 'From can be faked. Received and Return-Path reveal the real path.',
    },
    hints: [
      'Compare From with Return-Path and Reply-To.',
      'The earliest trustworthy Received hop names the relay.',
      'Use: grep Received email.txt — relay is relay_node12.',
    ],
    flag: 'NOtFound404{relay_node12}',
    explanation:
      'From says CEO, but Return-Path and the Received chain both expose relay_node12 as the true origin — a spoofed sender.',
    recommendedCommands: ['cat email.txt', 'grep Received email.txt', 'grep Return-Path email.txt'],
  },
  {
    id: 21,
    title: 'IOC Match',
    category: 'Threat Hunting',
    difficulty: 'Hard',
    xp: 250,
    story:
      'A fictional threat feed lists bad indicators. Compare them against netflow to find the compromised host.',
    objective: 'Identify the host that contacted a known-bad indicator.',
    files: {
      'iocs.txt': lines(
        'bad_ip=203.0.113.66',
        'bad_domain=update-mirror.lab',
        'bad_hash=deadbeef1234'
      ),
      'netflow.log': lines(
        'host1 -> 10.0.0.1 ok',
        'host2 -> cdn.trusted.lab ok',
        'host4 -> 203.0.113.66 SUSPECT',
        'host5 -> mail.trusted.lab ok',
        'host6 -> 10.0.0.9 ok'
      ),
      'readme.txt': 'Take each IOC and search the netflow for a match.',
    },
    hints: [
      'Read the indicators first.',
      'Search the netflow for the bad IP.',
      'host4 talked to 203.0.113.66 — answer is ioc_match_host4.',
    ],
    flag: 'NOtFound404{ioc_match_host4}',
    explanation:
      'The bad_ip 203.0.113.66 from the feed appears in netflow against host4 — that host matched an IOC.',
    recommendedCommands: ['cat iocs.txt', 'find 203.0.113.66', 'grep 203.0.113.66 netflow.log'],
  },
  {
    id: 22,
    title: 'Conflict of Duties',
    category: 'Access Review',
    difficulty: 'Hard',
    xp: 250,
    story:
      'A fictional access review must catch separation-of-duties violations — one person holding incompatible roles.',
    objective: 'Find the user who is both auditor and admin.',
    files: {
      'roles.json': `{
  "users": [
    { "name": "amref", "roles": ["viewer"] },
    { "name": "kpark", "roles": ["auditor", "admin"] },
    { "name": "lwong", "roles": ["editor"] },
    { "name": "sboard", "roles": ["auditor"] }
  ]
}`,
      'policy.txt': lines(
        'SoD rule: auditor and admin must never be held by the same user.',
        'Auditor reviews; admin changes. Holding both breaks oversight.'
      ),
      'readme.txt': 'Check each user.roles list against the SoD rule.',
    },
    hints: [
      'Read the policy: which two roles conflict?',
      'Inspect each user.roles array for both roles.',
      'Use: jsonget roles.json users.1.roles',
    ],
    flag: 'NOtFound404{kpark}',
    explanation:
      'kpark holds both auditor and admin, violating separation of duties — auditor must stay independent of admin.',
    recommendedCommands: ['cat roles.json', 'cat policy.txt', 'jsonget roles.json users.1.roles'],
  },
  {
    id: 23,
    title: 'Layered Crypto',
    category: 'Crypto',
    difficulty: 'Hard',
    xp: 250,
    story:
      'A fictional payload was wrapped three times: hex on the outside, Base64 underneath, Caesar at the core.',
    objective: 'Peel all three layers: hex -> base64 -> caesar.',
    files: {
      'chain.hex':
        '553152355333523663326b304d44523763575a6b616e64716156396f6432523165585239',
      'readme.txt': 'Order matters: hexdecode, then decode base64, then caesar shift 5.',
    },
    hints: [
      'Step 1: hexdecode the file — you get a Base64 string.',
      'Step 2: decode base64 that — you get Caesar text.',
      'Step 3: caesar <text> 5 reveals the flag.',
    ],
    flag: 'NOtFound404{layered_crypto}',
    explanation:
      'hexdecode -> a Base64 blob; decode base64 -> Caesar-shifted text; caesar shift 5 -> the flag. Layered encodings peel in reverse order.',
    recommendedCommands: [
      'cat chain.hex',
      'hexdecode 553152355333523663326b304d44523763575a6b616e64716156396f6432523165585239',
      'decode base64 U1R5S3R6c2k0MDR7cWZkandqaV9od2R1eXR9',
      'caesar STyKtzsi404{qfdjwji_hwduyt} 5',
    ],
  },

  // ===================== BOSS (24–25) =====================
  {
    id: 24,
    title: 'BOSS: Operation Night Signal',
    category: 'Threat Hunting',
    difficulty: 'Boss',
    xp: 500,
    story:
      'A fictional multi-stage intrusion left clues across three files. Assemble the full flag from all of them.',
    objective:
      'Build the flag: NOtFound404{ip_user_codename}. Get the attacker IP, the active operative handle, and the decoded codename.',
    files: {
      'intercept.log': lines(
        'beacon from 10.0.0.12 ok',
        'beacon from 10.0.0.66 EXFIL 4.2GB',
        'beacon from 10.0.0.5 ok',
        'beacon from 10.0.0.66 EXFIL 1.1GB'
      ),
      'agents.json': `{
  "operatives": [
    { "id": 1, "handle": "echo", "active": false },
    { "id": 2, "handle": "nori", "active": true },
    { "id": 3, "handle": "vex", "active": false }
  ]
}`,
      'signal.b64': 'YmxhY2tzaWduYWw=',
      'readme.txt': lines(
        'Part 1 (ip): the IP doing EXFIL, dots -> underscores.',
        'Part 2 (user): the operative with active=true.',
        'Part 3 (codename): decode signal.b64.',
        'Final flag: NOtFound404{part1_part2_part3}'
      ),
    },
    hints: [
      'Part 1: grep EXFIL intercept.log — find the repeating IP (10.0.0.66 -> 10_0_0_66).',
      'Part 2: the active operative in agents.json is the handle nori.',
      'Part 3: decode base64 the signal.b64 contents -> blacksignal.',
    ],
    flag: 'NOtFound404{10_0_0_66_nori_blacksignal}',
    explanation:
      'IP 10.0.0.66 ran the exfil (10_0_0_66), agents.json marks operative "nori" active, and signal.b64 decodes to "blacksignal". Joined: NOtFound404{10_0_0_66_nori_blacksignal}.',
    recommendedCommands: [
      'grep EXFIL intercept.log',
      'jsonget agents.json operatives.1.handle',
      'decode base64 YmxhY2tzaWduYWw=',
    ],
  },
  {
    id: 25,
    title: 'BOSS: The Final 404',
    category: 'Incident Response',
    difficulty: 'Boss',
    xp: 500,
    story:
      'The season finale. Three different techniques each yield one word. Combine them to close Case404.',
    objective:
      'Build the flag: NOtFound404{p1_p2_p3} using a JSON path, a hex decode, and an XOR decode.',
    files: {
      'manifest.json': `{
  "operation": { "phase": "final", "codename": "eclipse" }
}`,
      'vector.hex': '7068616e746f6d',
      'payload.xor': '5b465146425d5055',
      'readme.txt': lines(
        'Part 1: jsonget manifest.json operation.codename',
        'Part 2: hexdecode vector.hex',
        'Part 3: xor payload.xor with key 404',
        'Final flag: NOtFound404{part1_part2_part3}'
      ),
    },
    hints: [
      'Part 1: jsonget manifest.json operation.codename -> eclipse.',
      'Part 2: hexdecode vector.hex -> phantom.',
      'Part 3: xor 5b465146425d5055 404 -> override.',
    ],
    flag: 'NOtFound404{eclipse_phantom_override}',
    explanation:
      'manifest.json gives codename "eclipse", vector.hex decodes to "phantom", and payload.xor with key 404 decodes to "override". Joined: NOtFound404{eclipse_phantom_override}.',
    recommendedCommands: [
      'jsonget manifest.json operation.codename',
      'hexdecode 7068616e746f6d',
      'xor 5b465146425d5055 404',
    ],
  },
]

export function getMissionById(id) {
  return missions.find((m) => m.id === Number(id)) || null
}

export const totalMissions = missions.length
