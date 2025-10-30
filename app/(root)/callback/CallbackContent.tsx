'use client';
import { callbackExchangeCode } from '@/app/redux/actions/authActions';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function CallbackContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const route = useRouter();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      dispatch(callbackExchangeCode(code) as any).then(() => {
        route.push('/dashboard');
      });
    }
  }, [code]);

  return <p></p>;
}
