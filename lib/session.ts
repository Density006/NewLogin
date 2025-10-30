// lib/session.ts
import type { IronSessionOptions } from 'iron-session'

// This is the data you will save in the user's session cookie
export type SessionData = {
  username: string
  isLoggedIn: boolean
  redirectUrl: string
}

export const sessionOptions: IronSessionOptions = {
  // IMPORTANT: You MUST set this password in your Vercel project's Environment Variables
  // Go to your project on Vercel -> Settings -> Environment Variables
  // Create a new variable named 'SECRET_COOKIE_PASSWORD'
  // Use a strong, random password (e.g., from https://1password.com/password-generator/)
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'my-app-session-cookie',
  cookieOptions: {
    // secure: true means the cookie is only sent over HTTPS
    // This is set to true automatically in production (on Vercel)
    secure: process.env.NODE_ENV === 'production',
  },
}
