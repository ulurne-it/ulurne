'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/store/hooks';
import { setAuth, setLoading } from '@/store/slices/authSlice';

export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({ 
        user: session?.user ?? null, 
        session: session ?? null 
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setAuth({ 
        user: session?.user ?? null, 
        session: session ?? null 
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
