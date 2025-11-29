import { createClient } from '@supabase/supabase-js';

// SQL SCHEMA FOR SUPABASE
// Run this in your Supabase SQL Editor:
/*
create table sites (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- simplified for demo, ideally references auth.users
  author_name text,
  title text,
  html_content text,
  views integer default 0,
  published boolean default true,
  is_public boolean default true,
  allow_source_download boolean default true,
  created_at bigint,
  updated_at bigint
);

alter table sites enable row level security;
create policy "Public read" on sites for select using (true);
create policy "Public insert" on sites for insert with check (true);
create policy "Public update" on sites for update using (true);
*/

// Initialize Client
const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper to map DB snake_case to App camelCase
// Helper to map DB snake_case to App camelCase
export const mapSiteFromDB = (dbSite: any) => ({
  id: dbSite.id,
  userId: dbSite.user_id,
  authorName: dbSite.author_name || 'Unknown',
  title: dbSite.title || 'Untitled',
  htmlContent: dbSite.html_content || '',
  createdAt: typeof dbSite.created_at === 'string' ? new Date(dbSite.created_at).getTime() : Number(dbSite.created_at),
  updatedAt: dbSite.updated_at ? (typeof dbSite.updated_at === 'string' ? new Date(dbSite.updated_at).getTime() : Number(dbSite.updated_at)) : undefined,
  views: dbSite.views,
  published: dbSite.published,
  isPublic: dbSite.is_public,
  allowSourceDownload: dbSite.allow_source_download
});

export const mapSiteToDB = (site: any) => ({
  // id is auto-generated on insert if missing
  ...(site.id && { id: site.id }),
  user_id: site.userId,
  author_name: site.authorName,
  title: site.title,
  html_content: site.htmlContent,
  views: site.views,
  published: site.published,
  is_public: site.isPublic,
  allow_source_download: site.allowSourceDownload,
  created_at: site.createdAt ? new Date(site.createdAt).toISOString() : new Date().toISOString(),
  updated_at: site.updatedAt ? new Date(site.updatedAt).toISOString() : new Date().toISOString()
});
