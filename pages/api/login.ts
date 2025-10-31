// pages/api/login.ts
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { 
  validCredentials, 
  parseLocalTime, 
  isIpMatch, 
  DEFAULT_REDIRECT_URL 
} from 'lib/users' // <-- Import from shared file

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
    
    // --- NEW: Define all admin usernames ---
    // Add any usernames from lib/users.ts to this list to make them admin
    const adminUsers = ['4dmin', 'Density006']; // <-- EDIT THIS LIST
    
    const sessionData: SessionData = {
      username: username,
      isLoggedIn: true,
      redirectUrl: redirectUrl,
      // --- MODIFIED: Check if username is in the admin list ---
      isAdmin: adminUsers.includes(username),
    }
    
    req.session.user = sessionData
    await req.session.save()

    console.log(`Successful login - IP: ${ip}, User: ${username}`)
    res.json({ ok: true, redirectUrl: redirectUrl })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
