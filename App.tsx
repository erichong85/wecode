
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './views/AuthModal';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Viewer } from './views/Viewer';
import { LandingPage } from './views/LandingPage';
import { AdminPanel } from './views/AdminPanel';
import { User, HostedSite, ViewState } from './types';
import { ConfirmModal } from './components/ConfirmModal';
import { supabase, mapSiteFromDB, mapSiteToDB } from './lib/supabase';

// Mock Data for Admin Simulation
const MOCK_USERS: User[] = [
  {
    id: 'u_101',
    name: '李明',
    email: 'liming@example.com',
    role: 'user',
    avatar: 'L',
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    lastLoginAt: Date.now() - 86400000 * 1 // 1 day ago
  },
  {
    id: 'u_102',
    name: '王芳',
    email: 'wangfang@design.com',
    role: 'user',
    avatar: 'W',
    createdAt: Date.now() - 86400000 * 15, // 15 days ago
    lastLoginAt: Date.now() - 3600000 * 4 // 4 hours ago
  },
];

const MOCK_SITES: HostedSite[] = [
  {
    id: 's_demo_1',
    userId: 'u_101',
    authorName: '李明',
    title: '我的摄影作品集',
    htmlContent: '<!DOCTYPE html><html><body style="text-align:center; padding: 50px; background: #1a1a1a; color: white;"><h1>摄影作品展示</h1><p>欢迎来到我的光影世界</p><!-- HostGenie Footer --><footer style="display: block; width: 100%; padding: 24px 0; margin-top: 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-family: sans-serif; color: #64748b; font-size: 14px;"><p style="margin: 0 0 8px 0;">托管于 <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: bold;">HostGenie</a></p><p style="margin: 0;">技术支持微信：<span style="color: #334155; font-weight: 500;">35808387</span></p></footer></body></html>',
    createdAt: Date.now() - 86400000 * 5,
    views: 1240,
    published: true,
    isPublic: true,
    allowSourceDownload: true
  },
  {
    id: 's_demo_2',
    userId: 'u_102',
    authorName: '王芳',
    title: 'Modern UI Kit 介绍',
    htmlContent: '<!DOCTYPE html><html><body style="text-align:center; padding: 50px; color: #333;"><h1>Modern UI Kit</h1><p>最优雅的 React 组件库</p><!-- HostGenie Footer --><footer style="display: block; width: 100%; padding: 24px 0; margin-top: 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-family: sans-serif; color: #64748b; font-size: 14px;"><p style="margin: 0 0 8px 0;">托管于 <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: bold;">HostGenie</a></p><p style="margin: 0;">技术支持微信：<span style="color: #334155; font-weight: 500;">35808387</span></p></footer></body></html>',
    createdAt: Date.now() - 86400000 * 2,
    views: 856,
    published: true,
    isPublic: true,
    allowSourceDownload: false
  },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LANDING');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data State
  const [allSites, setAllSites] = useState<HostedSite[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [currentSite, setCurrentSite] = useState<HostedSite | null>(null);
  const [editingSite, setEditingSite] = useState<HostedSite | null>(null);

  // Delete Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Check if we have real backend connected
  const hasRealBackend = !!supabase;

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    // Load Sites
    if (hasRealBackend) {
      loadSitesFromSupabase();
    } else {
      // Load from LocalStorage (Fallback)
      const savedSites = localStorage.getItem('hg_sites');
      if (savedSites) {
        try {
          const parsed = JSON.parse(savedSites);
          if (Array.isArray(parsed)) setAllSites(parsed);
          else setAllSites(MOCK_SITES);
        } catch (e) { setAllSites(MOCK_SITES); }
      } else {
        setAllSites(MOCK_SITES);
      }
    }

    // Auth Listener
    if (supabase) {
      // Check active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const email = u.email || '';
          setUser({
            id: u.id,
            email: email,
            name: u.user_metadata?.name || email.split('@')[0] || 'User',
            role: email.startsWith('admin') ? 'admin' : 'user', // Simple admin check
            createdAt: new Date(u.created_at).getTime(),
            lastLoginAt: u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : Date.now()
          });
          setView('DASHBOARD');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const email = u.email || '';
          setUser({
            id: u.id,
            email: email,
            name: u.user_metadata?.name || email.split('@')[0] || 'User',
            role: email.startsWith('admin') ? 'admin' : 'user',
            createdAt: new Date(u.created_at).getTime(),
            lastLoginAt: u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : Date.now()
          });
          // Only switch to dashboard if we are on landing or auth just happened
          if (view === 'LANDING') setView('DASHBOARD');
        } else {
          setUser(null);
          setView('LANDING');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback for no backend (Mock Mode)
      const savedUser = localStorage.getItem('hg_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser) setUser(parsedUser);
        } catch (e) { }
      }
    }

    // Handle Hash routing for preview
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#site/')) {
        const siteId = window.location.hash.replace('#site/', '');
        // We need to wait for sites to load, or fetch specifically
        // For simplicity in React State, we just rely on allSites
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Fetch Sites & Users from Supabase
  const loadSitesFromSupabase = async () => {
    if (!supabase) return;
    setIsSyncing(true);

    // Fetch Sites
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (sitesData) {
      const mapped = sitesData.map(mapSiteFromDB);
      setAllSites(mapped);
    }

    // Fetch Users (Only if Admin)
    // Note: We check current user role, or just fetch if we have permission
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) {
      const mappedUsers: User[] = usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name || u.email.split('@')[0],
        role: u.role,
        avatar: u.avatar,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at
      }));
      setAllUsers(mappedUsers);
    }

    setIsSyncing(false);
  };

  // 3. Sync to LocalStorage (Only if no backend)
  useEffect(() => {
    if (!hasRealBackend && allSites.length > 0) {
      localStorage.setItem('hg_sites', JSON.stringify(allSites));
    }
  }, [allSites, hasRealBackend]);

  // Auth Handling
  const handleLogin = (incomingUser: User) => {
    // Legacy handler for mock mode, or if AuthModal passes user manually
    // With Supabase listener, this might be redundant but keeps compatibility
    setUser(incomingUser);
    if (!hasRealBackend) {
      localStorage.setItem('hg_user', JSON.stringify(incomingUser));
    }
    setView(incomingUser.role === 'admin' ? 'ADMIN' : 'DASHBOARD');
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      // Listener will handle state update
    } else {
      setUser(null);
      localStorage.removeItem('hg_user');
      setView('LANDING');
    }
  };

  // CRUD Operations
  const handleSaveSite = async (data: { id?: string, title: string, htmlContent: string, isPublic: boolean, allowSourceDownload: boolean }) => {
    if (!user) return;
    setIsSyncing(true);

    // Inject Footer Logic
    const appUrl = window.location.origin;
    const footerStyles = `
      <style>
        html, body { min-height: 100%; margin: 0; }
        body { display: flex; flex-direction: column; }
        #hg-footer { 
          margin-top: auto;
          padding: 10px 0;
          width: 100%;
          text-align: center;
          font-size: 12px;
          opacity: 0.6;
          z-index: 9999;
          background: transparent;
          color: inherit; 
          font-family: inherit;
        }
        #hg-footer a {
          color: inherit;
          text-decoration: none;
          font-weight: bold;
        }
        #hg-footer a:hover {
          text-decoration: underline;
        }
        #hg-footer p {
          margin: 2px 0;
        }
      </style>
    `;

    const footerHtml = `
      <!-- HostGenie Footer -->
      <footer id="hg-footer">
        <p>托管于 <a href="${appUrl}" target="_blank">HostGenie</a></p>
        <p>技术支持微信：35808387</p>
      </footer>
    `;

    let finalHtml = data.htmlContent;

    // Inject Styles
    if (!finalHtml.includes('#hg-footer')) {
      const headCloseIndex = finalHtml.indexOf('</head>');
      if (headCloseIndex !== -1) {
        finalHtml = finalHtml.slice(0, headCloseIndex) + footerStyles + finalHtml.slice(headCloseIndex);
      } else {
        // If no head, try to prepend to body or just start
        finalHtml = footerStyles + finalHtml;
      }

      // Inject Footer
      const bodyCloseIndex = finalHtml.lastIndexOf('</body>');
      if (bodyCloseIndex !== -1) {
        finalHtml = finalHtml.slice(0, bodyCloseIndex) + footerHtml + finalHtml.slice(bodyCloseIndex);
      } else {
        finalHtml += footerHtml;
      }
    }

    const siteObj: HostedSite = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      userId: user.id,
      authorName: user.name,
      title: data.title,
      htmlContent: finalHtml,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      views: 0,
      published: true,
      isPublic: data.isPublic,
      allowSourceDownload: data.allowSourceDownload
    };

    if (hasRealBackend && supabase) {
      // SAVE TO SUPABASE
      if (data.id) {
        // Update
        await supabase.from('sites').update(mapSiteToDB(siteObj)).eq('id', data.id);
      } else {
        // Insert (remove ID to let DB generate UUID)
        const payload = mapSiteToDB(siteObj);
        delete payload.id;
        console.log('Supabase Insert Payload:', payload);
        const { error: insertError } = await supabase.from('sites').insert(payload);
        if (insertError) {
          console.error('Supabase Insert Error Object:', insertError);
          console.error('Error Message:', insertError.message);
          console.error('Error Code:', insertError.code);
          console.error('Error Details:', insertError.details);
          alert('发布失败: ' + (insertError.message || 'Unknown error'));
          setIsSyncing(false);
          return;
        }
      }
      await loadSitesFromSupabase(); // Refresh
    } else {
      // SAVE TO LOCALSTORAGE
      if (data.id) {
        setAllSites(allSites.map(s => s.id === data.id ? { ...s, ...siteObj, createdAt: s.createdAt, views: s.views } : s));
      } else {
        setAllSites([siteObj, ...allSites]);
      }
    }

    setIsSyncing(false);
    setEditingSite(null);
    setView('DASHBOARD');
  };

  const handleDeleteSite = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;

    if (hasRealBackend && supabase) {
      await supabase.from('sites').delete().eq('id', id);
      await loadSitesFromSupabase();
    } else {
      setAllSites(allSites.filter(s => s.id !== id));
    }
    setDeleteTargetId(null);
  };

  // View Routing
  const handleViewSite = (site: HostedSite) => {
    setCurrentSite(site);
    setView('VIEWER');
    window.location.hash = `site/${site.id}`;
  };

  const handleEditSite = (site: HostedSite) => {
    setEditingSite(site);
    setView('EDITOR');
  };

  // Check URL Hash for Deep Linking (Preview Mode)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#site/')) {
        const siteId = hash.replace('#site/', '');
        const targetSite = allSites.find(s => s.id === siteId);
        if (targetSite) {
          setCurrentSite(targetSite);
          setView('VIEWER');
        }
      }
    };
    handleHashChange(); // Run on sites update
  }, [allSites]);


  const navigateTo = (target: string) => {
    if (target === 'landing') setView('LANDING');
    if (target === 'dashboard') {
      setEditingSite(null);
      setView(user?.role === 'admin' ? 'ADMIN' : 'DASHBOARD');
    }
    if (target === 'admin') setView('ADMIN');
    if (target === 'create') {
      setEditingSite(null);
      setView('EDITOR');
    }
    if (target !== 'viewer') {
      window.history.pushState(null, document.title, window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    }
  };

  if (view === 'VIEWER' && currentSite) {
    return <Viewer site={currentSite} onBack={() => {
      if (user) {
        setView(user.role === 'admin' ? 'ADMIN' : 'DASHBOARD');
      } else {
        setView('LANDING');
      }
      window.history.pushState(null, document.title, window.location.pathname + window.location.search);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        onLoginClick={() => setIsAuthOpen(true)}
      />

      {isSyncing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-indigo-100 z-[100]">
          <div className="h-full bg-indigo-600 animate-pulse w-1/3 mx-auto"></div>
        </div>
      )}

      <main className="flex-grow">
        {view === 'LANDING' && (
          <LandingPage
            onGetStarted={() => user ? setView('DASHBOARD') : setIsAuthOpen(true)}
            publicSites={allSites.filter(s => s.published && s.isPublic)}
            onViewSite={handleViewSite}
            isLoggedIn={!!user}
          />
        )}

        {view === 'DASHBOARD' && user && (
          <Dashboard
            sites={allSites.filter(s => s.userId === user.id)}
            onCreateNew={() => { setEditingSite(null); setView('EDITOR'); }}
            onViewSite={handleViewSite}
            onEditSite={handleEditSite}
            onDeleteSite={handleDeleteSite}
          />
        )}

        {view === 'ADMIN' && user && user.role === 'admin' && (
          <AdminPanel
            users={allUsers}
            sites={allSites}
            onDeleteUser={() => { }} // simplified
            onDeleteSite={handleDeleteSite}
            onViewSite={handleViewSite}
          />
        )}

        {view === 'EDITOR' && user && (
          <Editor
            initialSite={editingSite}
            onSave={handleSaveSite}
            onCancel={() => {
              setEditingSite(null);
              setView(user.role === 'admin' ? 'ADMIN' : 'DASHBOARD');
            }}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="删除确认"
        message="您确定要删除这个网站吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default App;
