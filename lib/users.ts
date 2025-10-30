// lib/users.ts

// --- 1. Redirect Constants ---
export const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'
export const DENSITY_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Dense'
export const ETHAN_REDIRECT_URL = 'https://ethans-page.com'
export const DISALLOWED_REDIRECT_URL = 'https://sites.google.com/studio.digital/hmmm/home'
export const GITHUB_REDIRECT_URL = 'https://github.com/Density006/Density006password'
export const TEDDBLUE = 'https://gamebois-inky.vercel.app/'
// Note: We use '/admin' for the 4dmin redirect in the map below

// --- 2. UserCredentials Interface ---
export interface UserCredentials {
  pwd: string
  redirect?: string
  allowedIps?: string[]
  validFrom?: string  // "YYYY-MM-DD HH:MM"
  validUntil?: string // "YYYY-MM-DD HH:MM"
}

// --- 3. User Credentials Map ---
export const validCredentials = new Map<string, UserCredentials>([
  ['Density006', {
    pwd: 'dense',
    allowedIps: ['138.44.177.162', '103.106.89.184'],
    redirect: DENSITY_REDIRECT_URL }],
  ['Ethan', {
    pwd: 'ethan',
    validFrom: '2025-10-29 9:35',
    validUntil: '2025-10-29 10:00',
  }],
  ['4dmin', { pwd: 'NATE', redirect: '/console-auth-7f3b' }], // Redirect to the admin page
  ['Jimmy', { pwd: 'germanleader' }],
  ['Test', {
    pwd: 'Nate',
    validFrom: '2025-10-28 14:15', // Example WA Time
    validUntil: '2025-10-28 14:22', // Example WA Time
  }],
  ['Jamesmann', { pwd: 'wisehelp88' }],
  ['Duke', { pwd: 'danby', redirect: DISALLOWED_REDIRECT_URL }],
  ['add user', { pwd: '', redirect: GITHUB_REDIRECT_URL }],
  ['new1', { pwd: 'coldnewt29', redirect: TEDDBLUE }],
  ['JamesH', { pwd: '  ' }],
  ['Keaton', { pwd: 'keaton' }],
  ['shawto29', {
   pwd: 'darkram60',
   validFrom: '2025-10-28 15:03',
   validUntil: '2025-10-30 8:30',
   }],
  ['du', { pwd: 'Jimmy keen lives in south Perth Perth Australia 31.98237° S, 115.87365° E' }],
])

// --- 4. Helper Functions ---
const WA_TIMEZONE_OFFSET = '+08:00'
export function parseLocalTime(timeString: string): Date {
  const isoString = `${timeString.replace(' ', 'T')}:00${WA_TIMEZONE_OFFSET}`
  return new Date(isoString)
}

export function isIpMatch(ip: string, list: string[]): boolean {
  return list.some((item) => {
    if (item.endsWith('.*')) {
      const prefix = item.substring(0, item.length - 1)
      return ip.startsWith(prefix)
    }
    return ip === item
  })
}
