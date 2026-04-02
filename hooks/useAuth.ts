import { useState, useEffect } from 'react';
import { supabase, mapUserFromDB } from '../lib/supabase';
import { User, ViewState } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LANDING');

  const resolveUserFromSession = async (sessionUser: any): Promise<User> => {
    const email = sessionUser.email || '';
    let role: 'user' | 'admin' = 'user';

    if (supabase) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionUser.id)
        .maybeSingle();
      if (dbUser?.role === 'admin') {
        role = 'admin';
      }
    }

    return {
      id: sessionUser.id,
      email: email,
      name: sessionUser.user_metadata?.name || email.split('@')[0] || 'User',
      role,
      createdAt: new Date(sessionUser.created_at).getTime(),
      lastLoginAt: sessionUser.last_sign_in_at ? new Date(sessionUser.last_sign_in_at).getTime() : Date.now()
    };
  };

  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const resolvedUser = await resolveUserFromSession(session.user);
        setUser(resolvedUser);
        setView('DASHBOARD');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const resolvedUser = await resolveUserFromSession(session.user);
        setUser(resolvedUser);
        if (typeof window !== 'undefined' && window.location.hash === '') {
             // Only switch to dashboard if we are not deep-linked
             setView('DASHBOARD');
        }
      } else {
        setUser(null);
        setView('LANDING');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return { user, view, setView, logout };
};
