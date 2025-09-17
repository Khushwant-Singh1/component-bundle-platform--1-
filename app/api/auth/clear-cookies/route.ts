import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  // Get all cookies and clear auth-related ones
  const allCookies = cookieStore.getAll()
  
  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  
  // Clear all NextAuth cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('next-auth') || cookie.name.includes('__Secure-next-auth')) {
      response.cookies.delete(cookie.name)
    }
  })
  
  return response
}