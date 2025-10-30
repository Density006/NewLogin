// pages/api/impersonate.ts
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

// --- We need the user list here too ---
const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'
const DENSITY_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Dense'
const ETHAN_REDIRECT_URL = 'https://ethans-page.com'
const DISALLOWED_REDIRECT_URL = 'https://sites.google.com/studio.digital/hmmm/home'
const GITHUB_REDIRECT_URL = 'https://github.com/Density006/Density006password'
const TEDDBLUE = 'https://gamebois-inky.vercel.app/'

interface UserCredentials {
  pwd: string
  redirect?: string
}

// We only need the users and their redirects here
const validCredentials = new Map<string, UserCredentials>([
  ['Density006', { pwd: 'dense', redirect: DENSITY_REDIRECT_URL }],
  ['Ethan', { pwd: 'ethan' }],
  ['4dmin', { pwd: 'NATE', redirect: '/admin' }],
  ['Jimmy', { pwd: 'germanleader' }],
  ['Test', { pwd: 'Nate' }],
  ['Jamesmann', { pwd: 'wisehelp88' }],
  ['Duke', { pwd: 'danby', redirect: DISALLOWED_REDIRECT_URL }],
  ['add user', { pwd: '', redirect: GITHUB_REDIRECT_URL }],
  ['new1', { pwd: 'coldnewt29', redirect: TEDDBLUE }],
  ['JamesH', { pwd: '  ' }],
  ['Keaton', { pwd: 'keaton' }],
  ['shawto29', { pwd: 'darkram60' }],
])
// --- End of user list ---

export default withIronSessionApiRoute(impersonateRoute, sessionOptions)

async function impersonateRoute(req: NextApiRequest, res: NextApiResponse) {
  // 1. Check if the person making this request is an admin
  if (req.session.user?.isAdmin !== true) {
    return res.status(403).json({ message: 'Forbidden: Not an admin' })
  }
  
  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { username } = req.body

    // 3. Find the user the admin wants to impersonate
    const credentials = validCredentials.get(username)

    if (!credentials) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 4. Create a new session for that user
    const redirectUrl = credentials.redirect || DEFAULT_REDIRECT_URL
    
    const newSessionData: SessionData = {
      username: username,
      isLoggedIn: true,
      redirectUrl: redirectUrl,
      isAdmin: false, // The new session is a normal user session
    }
    
    // 5. Overwrite the admin's session with the new user's session
    req.session.user = newSessionData
    await req.session.save()

    res.json({ ok: true, redirectUrl: redirectUrl })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
