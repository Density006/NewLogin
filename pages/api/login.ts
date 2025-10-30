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
    
    // --- NEW REDIRECT LOGIC ---
    let finalRedirectUrl: string;
    let sitesList: string[] | undefined = undefined;

    if (credentials.redirect === undefined) {
      // 1. No redirect specified, use default
      finalRedirectUrl = DEFAULT_REDIRECT_URL;
    } else if (typeof credentials.redirect === 'string') {
      // 2. Single redirect specified
      finalRedirectUrl = credentials.redirect;
    } else {
      // 3. Multiple redirects specified (it's an array)
      finalRedirectUrl = '/select-site'; // Send them to the new selection page
      sitesList = credentials.redirect;  // Store the list
    }
    // --- END NEW LOGIC ---

    const sessionData: SessionData = {
      username: username,
      isLoggedIn: true,
      redirectUrl: finalRedirectUrl, // This is what the client gets
      redirectSites: sitesList,      // This is stored in the session
      isAdmin: username === '4dmin',
    }
    
    req.session.user = sessionData
    await req.session.save()

    console.log(`Successful login - IP: ${ip}, User: ${username}`)
    // Return the finalRedirectUrl (e.g., '/select-site' or the specific page)
    res.json({ ok: true, redirectUrl: finalRedirectUrl })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
