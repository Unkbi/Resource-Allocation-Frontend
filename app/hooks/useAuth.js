"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   const authToken = localStorage.getItem('authToken');
  //   const isAuthenticated = !!authToken;

  //   setIsLoggedIn(isAuthenticated);

  //   if (!isAuthenticated && router.pathname !== '/login') {
  //     router.push('/login'); 
  //   } 
  // }, [router]);

  return !isLoggedIn;
}