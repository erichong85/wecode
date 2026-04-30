import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, mapSiteFromDB, mapSiteToDB } from './lib/supabase';
import { User, HostedSite, ViewState } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage as Landing } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Viewer } from './views/Viewer';
import { AdminPanel } from './views/AdminPanel';
import { PromptTemplates } from './views/PromptTemplates';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './views/AuthModal';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
// Hooks
import { useAuth } from './hooks/useAuth';
import { useSites } from './hooks/useSites';

function App() {
  const { user, view, setView, logout } = useAuth();
  const { 
    allSites, setAllSites, 
    allUsers, 
    userLikes, setUserLikes, 
    userFavorites, setUserFavorites, 
    isSyncing, setIsSyncing, 
    loadSites 
  } = useSites(user);

  const [currentSite, setCurrentSite] = useState<HostedSite | null>(null);
  const [editingSite, setEditingSite] = useState<HostedSite | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');

  const hasRealBackend = !!supabase;

  // Optimized Handlers
  const handleViewSite = useCallback(async (site: HostedSite) => {
    setCurrentSite(site);
    setView('VIEWER');
    window.location.hash = `site/${site.id}`;

    if (hasRealBackend && supabase) {
      await supabase.rpc('increment_views', { p_site_id: site.id });
    }
    setAllSites(prev => prev.map(s => s.id === site.id ? { ...s, views: s.views + 1 } : s));
  }, [hasRealBackend, setAllSites, setView]);

  const handleEditSite = useCallback((site: HostedSite) => {
    setEditingSite(site);
    setView('EDITOR');
  }, [setView]);

  const handleLikeSite = useCallback(async (siteId: string) => {
    if (!user || !hasRealBackend || !supabase) return alert('请先登录');

    const isCurrentlyLiked = userLikes.includes(siteId);
    setAllSites(prev => prev.map(s => s.id === siteId ? { ...s, likes: isCurrentlyLiked ? Math.max(0, s.likes - 1) : s.likes + 1 } : s));
    setUserLikes(prev => isCurrentlyLiked ? prev.filter(id => id !== siteId) : [...prev, siteId]);

    try {
      const { error } = await supabase.rpc('toggle_like', { p_user_id: user.id, p_site_id: siteId });
      if (error) throw error;
    } catch (error: any) {
      // Rollback
      setAllSites(prev => prev.map(s => s.id === siteId ? { ...s, likes: isCurrentlyLiked ? s.likes + 1 : Math.max(0, s.likes - 1) } : s));
      setUserLikes(prev => isCurrentlyLiked ? [...prev, siteId] : prev.filter(id => id !== siteId));
      alert(`点赞失败: ${error.message}`);
    }
  }, [user, hasRealBackend, userLikes, setAllSites, setUserLikes]);

  const handleFavoriteSite = useCallback(async (siteId: string) => {
    if (!user || !hasRealBackend || !supabase) return alert('请先登录');

    const isCurrentlyFavorited = userFavorites.includes(siteId);
    setAllSites(prev => prev.map(s => s.id === siteId ? { ...s, favorites: isCurrentlyFavorited ? Math.max(0, s.favorites - 1) : s.favorites + 1 } : s));
    setUserFavorites(prev => isCurrentlyFavorited ? prev.filter(id => id !== siteId) : [...prev, siteId]);

    try {
      const { error } = await supabase.rpc('toggle_favorite', { p_user_id: user.id, p_site_id: siteId });
      if (error) throw error;
    } catch (error: any) {
      setAllSites(prev => prev.map(s => s.id === siteId ? { ...s, favorites: isCurrentlyFavorited ? s.favorites + 1 : Math.max(0, s.favorites - 1) } : s));
      setUserFavorites(prev => isCurrentlyFavorited ? [...prev, siteId] : prev.filter(id => id !== siteId));
      alert(`收藏失败: ${error.message}`);
    }
  }, [user, hasRealBackend, userFavorites, setAllSites, setUserFavorites]);

  const handleSaveSite = async (data: { id?: string, title: string, htmlContent: string, isPublic: boolean, allowSourceDownload: boolean }) => {
    if (!user) return;
    setIsSyncing(true);

    const footerStyles = `<style>html,body{min-height:100%;margin:0;}body{display:flex;flex-direction:column;padding-bottom:40px;}#hg-footer{position:fixed;bottom:0;left:0;padding:8px 16px;text-align:left;font-size:11px;z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);color:#fff;border-radius:0 8px 0 0;}</style>`;
    const footerHtml = `<footer id="hg-footer"><p>技术支持微信：35808387</p></footer>`;
    
    let finalHtml = data.htmlContent;
    if (!finalHtml.includes('#hg-footer')) {
      finalHtml = finalHtml.includes('</head>') ? finalHtml.replace('</head>', `${footerStyles}</head>`) : footerStyles + finalHtml;
      finalHtml = finalHtml.includes('</body>') ? finalHtml.replace('</body>', `${footerHtml}</body>`) : finalHtml + footerHtml;
    }

    const siteObj: HostedSite = {
      id: data.id || '',
      userId: user.id,
      authorName: user.name,
      title: data.title,
      htmlContent: finalHtml,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      views: 0, likes: 0, favorites: 0,
      published: true,
      isPublic: data.isPublic,
      allowSourceDownload: data.allowSourceDownload
    };

    if (hasRealBackend && supabase) {
      if (data.id) {
        await supabase.from('sites').update(mapSiteToDB(siteObj)).eq('id', data.id);
        setAllSites(prev => prev.map(s => s.id === data.id ? { ...s, ...siteObj, createdAt: s.createdAt, views: s.views } : s));
      } else {
        const payload = mapSiteToDB(siteObj);
        delete (payload as any).id;
        const { data: inserted, error } = await supabase.from('sites').insert(payload).select().single();
        if (!error && inserted) setAllSites(prev => [mapSiteFromDB(inserted), ...prev]);
        else if (error) alert('发布失败: ' + error.message);
      }
    }
    
    setIsSyncing(false);
    setEditingSite(null);
    setView('DASHBOARD');
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    if (hasRealBackend && supabase) {
      await supabase.from('sites').delete().eq('id', deleteTargetId);
    }
    setAllSites(prev => prev.filter(s => s.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#site/')) {
        const id = hash.replace('#site/', '');
        const site = allSites.find(s => s.id === id);
        if (site) {
          setCurrentSite(site);
          setView('VIEWER');
        } else if (hasRealBackend && supabase) {
          supabase.from('sites').select('*').eq('id', id).single().then(({ data }) => {
            if (data) {
              const mapped = mapSiteFromDB(data);
              setCurrentSite(mapped);
              setView('VIEWER');
            }
          });
        }
      } else if (hash === '' && view === 'VIEWER') {
        setView(user ? 'DASHBOARD' : 'LANDING');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allSites, hasRealBackend, user, view]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-cyber-black transition-colors duration-300 font-sans selection:bg-pop-blue/30 dark:selection:bg-neon-blue/30">
          <Navbar 
            user={user} 
            currentView={view} 
            onViewChange={setView} 
            onLogout={logout} 
            onLogin={() => setShowAuthModal(true)}
            onNewSite={() => { setEditingSite(null); setView('EDITOR'); }} 
          />
          
          <main className="container mx-auto px-4 pt-20 pb-8 max-w-7xl">
            {view === 'LANDING' && (
              <Landing 
                onGetStarted={() => setView(user ? 'DASHBOARD' : 'EDITOR')} 
                publicSites={allSites.filter(s => s.isPublic)}
                onViewSite={handleViewSite}
                isLoggedIn={!!user}
              />
            )}
            {view === 'DASHBOARD' && (
              <Dashboard 
                user={user} 
                sites={allSites} 
                onEditSite={handleEditSite} 
                onDeleteSite={setDeleteTargetId} 
                onViewSite={handleViewSite} 
                onLikeSite={handleLikeSite} 
                onFavoriteSite={handleFavoriteSite} 
                userLikes={userLikes} 
                userFavorites={userFavorites} 
                isSyncing={isSyncing} 
                onSync={loadSites} 
                onUsePrompt={(p) => { setInitialPrompt(p); setView('EDITOR'); }} 
              />
            )}
            {view === 'EDITOR' && <Editor initialSite={editingSite} initialPrompt={initialPrompt} onSave={handleSaveSite} onCancel={() => setView(user ? 'DASHBOARD' : 'LANDING')} />}
            {view === 'VIEWER' && currentSite && <Viewer site={currentSite} onBack={() => { window.location.hash = ''; setView(user ? 'DASHBOARD' : 'LANDING'); }} onEdit={handleEditSite} canEdit={user?.id === currentSite.userId} onLike={handleLikeSite} onFavorite={handleFavoriteSite} isLiked={userLikes.includes(currentSite.id)} isFavorited={userFavorites.includes(currentSite.id)} />}
            {view === 'ADMIN' && user?.role === 'admin' && <AdminPanel sites={allSites} users={allUsers} onEditSite={handleEditSite} onDeleteSite={setDeleteTargetId} />}
            {view === 'PROMPTS' && <PromptTemplates user={user} onUsePrompt={(p) => { setInitialPrompt(p); setView('EDITOR'); }} onBack={() => setView('DASHBOARD')} />}
          </main>

          <ConfirmModal isOpen={!!deleteTargetId} title="确认删除" message="确定要删除这个网站吗？此操作无法撤销。" onConfirm={confirmDelete} onCancel={() => setDeleteTargetId(null)} />
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={() => {}} />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
