import { useState, useEffect } from 'react';
import { supabase, mapSiteFromDB, mapUserFromDB } from '../lib/supabase';
import { User, HostedSite } from '../types';

export const useSites = (user: User | null) => {
  const [allSites, setAllSites] = useState<HostedSite[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadSites = async () => {
    if (!supabase) return;
    setIsSyncing(true);

    // Fetch Sites
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (sitesData) {
      setAllSites(sitesData.map(mapSiteFromDB));
    }

    // Fetch Users (Admin check)
    if (user?.role === 'admin') {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersData) {
        setAllUsers(usersData.map(mapUserFromDB) as User[]);
      }
    }

    setIsSyncing(false);
  };

  const loadUserInteractions = async () => {
    if (!user || !supabase) return;

    const { data: likes } = await supabase.from('user_likes').select('site_id').eq('user_id', user.id);
    if (likes) setUserLikes(likes.map(l => l.site_id));

    const { data: favorites } = await supabase.from('user_favorites').select('site_id').eq('user_id', user.id);
    if (favorites) setUserFavorites(favorites.map(f => f.site_id));
  };

  useEffect(() => {
    loadSites();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserInteractions();
    } else {
      setUserLikes([]);
      setUserFavorites([]);
    }
  }, [user]);

  return {
    allSites,
    setAllSites,
    allUsers,
    userLikes,
    setUserLikes,
    userFavorites,
    setUserFavorites,
    isSyncing,
    setIsSyncing,
    loadSites
  };
};
