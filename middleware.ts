import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Middleware to handle authentication and security headers
 */
export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  
  // Handle admin route protection - temporarily disabled for debugging
  // if (url.pathname.startsWith('/admin')) {
  //   try {
  //     const token = await getToken({ 
  //       req: request, 
  //       secret: process.env.NEXTAUTH_SECRET 
  //     })
      
  //     if (!token) {
  //       return NextResponse.redirect(new URL('/auth/login', request.url))
  //     }
      
  //     if (token.role !== 'ADMIN') {
  //       return NextResponse.redirect(new URL('/unauthorized', request.url))
  //     }
  //   } catch (error) {
  //     // If JWT decryption fails, redirect to login to clear cookies
  //     console.error("JWT error in middleware:", error)
  //     return NextResponse.redirect(new URL('/auth/login?error=session_expired', request.url))
  //   }
  // }

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
    })
  }

  // Create a response object with security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
