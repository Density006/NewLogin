// pages/api/login.ts
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

// --- 1. Your User Credentials and Config ---
const WA_TIMEZONE_OFFSET = '+08:00'
const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'
const DENSITY_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Dense'
const ETHAN_REDIRECT_URL = 'https://ethans-page.com'
// const ADMIN_REDIRECT_URL = 'https://vercel.com/density006' // No longer needed here
const DISALLOWED_REDIRECT_URL = 'https://sites.google.com/studio.digital/hmmm/home'
const GITHUB_REDIRECT_URL = 'https://github.com/Density006/Density006password'
const TEDDBLUE = 'https://gamebois-inky.vercel.app/'

interface UserCredentials {
  pwd: string
  redirect?: string
  allowedIps?: string[]
  validFrom?: string  // "YYYY-MM-DD HH:MM"
  validUntil?: string // "YYYY-MM-DD HH:MM"
}

const validCredentials = new Map<string, UserCredentials>([
  ['Density006', {
    pwd: 'dense',
    allowedIps: ['138.44.177.162', '103.106.89.184'],
    redirect: DENSITY_REDIRECT_URL }],
  ['Ethan', {
    pwd: 'ethan',
    validFrom: '2025-10-29 9:35',
    validUntil: '2025-10-29 10:00',
  }],
  // --- THIS IS THE CHANGE ---
  ['4dmin', { pwd: 'NATE', redirect: '/admin' }], // Redirect to the new admin page
  // --- END CHANGE ---
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
])

function parseLocalTime(timeString: string): Date {
  const isoString = `${timeString.replace(' ', 'T')}:00${WA_TIMEZONE_OFFSET}`
  return new Date(isoString)
}

function isIpMatch(ip: string, list: string[]): boolean {
  return list.some((item) => {
    if (item.endsWith('.*')) {
      const prefix = item.substring(0, item.length - 1)
      return ip.startsWith(prefix)
    }
    return ip === item
  })
}
// --- End of Your Config ---

// This is the API route handler
export default withIronSessionApiRoute(loginRoute, sessionOptions)

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { username, password } = await req.body
  const ip = (req.headers['x-forwarded-for'] || 'IP not found') as string

  try {
    const credentials = validCredentials.get(username)

    if (!credentials) {
      return res.status(401).json({ message: 'Invalid username' })
    }

    // --- Check Time Validity ---
    const now = new Date()
    if (credentials.validFrom) {
      const validFromDate = parseLocalTime(credentials.validFrom)
      if (now < validFromDate) {
        return res.status(403).json({ message: 'This account is not yet active.' })
      }
    }
    if (credentials.validUntil) {
      const validUntilDate = parseLocalTime(credentials.validUntil)
      if (now > validUntilDate) {
        return res.status(403).json({ message: 'Your access has expired! Please reach out to renew your access.' })
      }
    }

    // --- Check Password ---
    if (credentials.pwd !== password) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    // --- Check User-Specific IP Allowlist ---
    if (credentials.allowedIps && credentials.allowedIps.length > 0) {
      if (!isIpMatch(ip, credentials.allowedIps)) {
        console.log(`BLOCKED login attempt from IP: ${ip}. User ${username} is restricted.`)
        return res.status(403).json({ message: 'Access denied for this user from this IP.' })
      }
    }

    // --- SUCCESS! ---
    const redirectUrl = credentials.redirect || DEFAULT_REDIRECT_URL
    
    // --- THIS IS THE CHANGE ---
    const sessionData: SessionData = {
      username: username,
      isLoggedIn: true,
      redirectUrl: redirectUrl,
      isAdmin: username === '4dmin', // Set isAdmin flag to true if user is 4dmin
    }
    // --- END CHANGE ---
    
    req.session.user = sessionData
    await req.session.save()

    console.log(`Successful login - IP: ${ip}, User: ${username}`)
    res.json({ ok: true, redirectUrl: redirectUrl })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
