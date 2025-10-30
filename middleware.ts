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
// --- End of Your Config ---

export function middleware(req: NextRequest) {
  const ip = (req.ip || 'IP not found') as string

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
