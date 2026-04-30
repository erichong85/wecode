import { createClient } from '@supabase/supabase-js';

// Initialize Client
const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ========================================
// DB 类型定义（P2 #12：替代 any 类型）
// ========================================

export interface DBSite {
  id: string;
  user_id: string;
  author_name: string | null;
  title: string | null;
  description: string | null;
  html_content: string | null;
  views: number;
  likes: number;
  favorites: number;
  published: boolean;
  is_public: boolean;
  allow_source_download: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface DBUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  avatar: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface DBPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  is_system: boolean;
  created_at: string;
}

// Helper to map DB snake_case to App camelCase
export const mapSiteFromDB = (dbSite: Partial<DBSite> & { id: string; user_id: string }) => ({
  id: dbSite.id,
  userId: dbSite.user_id,
  authorName: dbSite.author_name || 'Unknown',
  title: dbSite.title || 'Untitled',
  description: dbSite.description || '',
  htmlContent: dbSite.html_content || '',
  createdAt: typeof dbSite.created_at === 'string' ? new Date(dbSite.created_at).getTime() : Number(dbSite.created_at),
  updatedAt: dbSite.updated_at ? (typeof dbSite.updated_at === 'string' ? new Date(dbSite.updated_at).getTime() : Number(dbSite.updated_at)) : undefined,
  views: dbSite.views || 0,
  likes: dbSite.likes || 0,
  favorites: dbSite.favorites || 0,
  published: dbSite.published ?? false,
  isPublic: dbSite.is_public ?? false,
  allowSourceDownload: dbSite.allow_source_download ?? false
});

export const mapSiteToDB = (site: {
  id?: string;
  userId: string;
  authorName: string;
  title: string;
  htmlContent: string;
  views?: number;
  likes?: number;
  favorites?: number;
  published: boolean;
  isPublic: boolean;
  allowSourceDownload: boolean;
  createdAt?: number;
  updatedAt?: number;
}) => ({
  ...(site.id && { id: site.id }),
  user_id: site.userId,
  author_name: site.authorName,
  title: site.title,
  html_content: site.htmlContent,
  views: site.views || 0,
  likes: site.likes || 0,
  favorites: site.favorites || 0,
  published: site.published,
  is_public: site.isPublic,
  allow_source_download: site.allowSourceDownload,
  created_at: site.createdAt ? new Date(site.createdAt).toISOString() : new Date().toISOString(),
  updated_at: site.updatedAt ? new Date(site.updatedAt).toISOString() : new Date().toISOString()
});

export const mapUserFromDB = (dbUser: DBUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name || dbUser.email.split('@')[0],
  role: dbUser.role,
  avatar: dbUser.avatar,
  createdAt: new Date(dbUser.created_at).getTime(),
  lastLoginAt: dbUser.last_login_at ? new Date(dbUser.last_login_at).getTime() : Date.now()
});
