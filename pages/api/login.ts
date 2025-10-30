// pages/api/login.ts
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions, SessionData } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

// --- 1. Your User Credentials and Config ---
const WA_TIMEZONE_OFFSET = '+08:00'
const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'
const DENSITY_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Dense'
const ETHAN_REDIRECT_URL = 'https://ethans-page.com'
const ADMIN_REDIRECT_URL = 'https://vercel.com/density006'
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
  ['4dmin', { pwd: 'NATE', redirect: ADMIN_REDIRECT_URL }],
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
  ['Keaton', { pwd: 'keaton
