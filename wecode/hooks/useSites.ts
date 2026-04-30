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

    // Fetch Sites - 包含 html_content 用于卡片预览
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
        .select('id, email, name, role, avatar, created_at, last_login_at')
        .order('created_at', { ascending: false });
      if (usersData) {
        setAllUsers(usersData.map(mapUserFromDB) as User[]);
      }
    }

    setIsSyncing(false);
  };

  const loadUserInteractions = async () => {
    if (!user || !supabase) return;

    // 合并查询，减少网络往返
    const [likesResult, favoritesResult] = await Promise.all([
      supabase.from('user_likes').select('site_id').eq('user_id', user.id),
      supabase.from('user_favorites').select('site_id').eq('user_id', user.id)
    ]);

    if (likesResult.data) setUserLikes(likesResult.data.map(l => l.site_id));
    if (favoritesResult.data) setUserFavorites(favoritesResult.data.map(f => f.site_id));
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
