// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// --- 1. Your IP Blocklists ---
const ipBlocklist = new Set([
  '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
  '::1',
])
const globalIpAllowlist = new Set([ 
  // Add any IPs here that should *always* be allowed
])

function isIpMatch(ip: string, list: Set<string> | string[]): boolean {
  const listAsArray = Array.from(list)
  return listAsArray.some((item) => {
    if (item.endsWith('.*')) {
      const prefix = item.substring(0, item.length - 1)
      return ip.startsWith(prefix)
    }
    return ip === item
  })
}

// --- 2. NEW: Canonical Domain Config ---
// This is your "primary" domain. All admin/login traffic will be forced
// to use this domain to keep the session cookie consistent.
const CANONICAL_DOMAIN = 'density006password.vercel.app' // <-- Pick your main domain

// List of paths that MUST use the canonical domain
const SECURE_PATHS = [
  '/login',
  '/admin-redirect',
  '/console-auth-7f3b',
  '/api/login',
  '/api/impersonate',
  '/reset-password',
]
// --- End of New Config ---


export function middleware(req: NextRequest) {
  const ip = (req.ip || 'IP not found') as string
  const host = req.nextUrl.hostname
  const path = req.nextUrl.pathname

  // --- 3. NEW: Canonical Domain Redirect Logic ---
  // Check if the current path is one of the protected login/admin paths
  const isSecurePath = SECURE_PATHS.some(securePath => path.startsWith(securePath))

  if (isSecurePath) {
    // Check if the host is NOT the canonical domain
    // We also check for 'localhost' to allow development
    if (host !== CANONICAL_DOMAIN && host !== 'localhost') {
      
      // If it's not, redirect to the same path on the canonical domain
      const newUrl = new URL(path, `https://${CANONICAL_DOMAIN}`)
      newUrl.search = req.nextUrl.search // Preserve any query parameters
      
      console.log(`Redirecting secure path ${path} from ${host} to ${CANONICAL_DOMAIN}`)
      return NextResponse.redirect(newUrl)
    }
  }
  // --- End of New Redirect Logic ---


  // --- A. Global IP Allowlist ---
  let isGloballyAllowed = isIpMatch(ip, globalIpAllowlist)
  if (isGloballyAllowed) {
      console.log(`IP ${ip} is on the global allowlist. Bypassing blocklist.`)
      // Allow the request to continue
      return NextResponse.next()
  }

  // --- B. Global IP Blocklist ---
  if (!isGloballyAllowed && isIpMatch(ip, ipBlocklist)) {
    console.log(`BLOCKED request from IP: ${ip} - On Blocklist`)
    // Show a custom "access denied" message
    return new NextResponse('Access denied from this domain owner.', { status: 453 })
  }

  // All checks passed, allow the request
  return NextResponse.next()
}

// Config: This middleware runs on ALL routes
// (except for Next.js internal files)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
