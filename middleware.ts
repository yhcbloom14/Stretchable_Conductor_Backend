import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Simple middleware that allows all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and specific files
    '/((?!api|_next/static|_next/image|favicon.ico|property-template.json).*)',
  ],
}