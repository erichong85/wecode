
// This file runs on the server in Next.js
// It handles requests to /s/[id] and returns the raw HTML

import { createClient } from '@supabase/supabase-js';

// Note: In Next.js App Router, you would use standard Request/Response objects
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;

  // Re-init supabase for server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch HTML content
  const { data: site, error } = await supabase
    .from('sites')
    .select('html_content, views')
    .eq('id', siteId)
    .single();

  if (error || !site) {
    return new Response(
      '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404</h1><p>网站未找到 / Site Not Found</p></body></html>',
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }

  // 2. Increment Views (Fire and forget)
  await supabase.from('sites').update({ views: site.views + 1 }).eq('id', siteId);

  // 3. Return Raw HTML
  return new Response(site.html_content, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      // Optional: Security headers
      'X-Frame-Options': 'SAMEORIGIN'
    },
  });
}
