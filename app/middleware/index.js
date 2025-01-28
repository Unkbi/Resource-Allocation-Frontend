// app/middleware/index.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  const isLoggedIn = false;  // Replace with your actual login check, e.g., from cookies or session

  console.log(req, 'Request Info');  // For debugging

  const url = req.nextUrl.clone();
  if (url.pathname === '/' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login if not logged in
  }

  if (url.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url)); // Redirect to dashboard if logged in
  }

  return NextResponse.next();
}

// Configure the middleware paths to match
export const config = {
  matcher: ['/', '/login', '/dashboard'], // Only run on these paths
};
