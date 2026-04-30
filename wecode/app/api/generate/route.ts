import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiter with cleanup
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 每5分钟清理一次
let lastCleanup = Date.now();

function cleanupRateLimit() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(key: string): boolean {
  cleanupRateLimit();

  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 必须提供认证信息
    if (!authHeader) {
      return NextResponse.json({ error: '未登录，请先登录后再使用 AI 生成功能。' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '服务配置错误。' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: '未登录，请先登录后再使用 AI 生成功能。' }, { status: 401 });
    }
    const userId = user.id;

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试（每分钟最多 10 次）。' }, { status: 429 });
    }

    const { prompt, modelOverride } = await req.json();

    const apiKey = (process.env.API_KEY || '').split(',')[0]?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing.' }, { status: 500 });
    }
    
    let url = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    if (url.endsWith('/')) url = url.slice(0, -1);
    
    const model = modelOverride || process.env.AI_MODEL || "gpt-3.5-turbo";

    const systemInstruction = `
      You are an expert Frontend Engineer. 
      Your task is to generate a complete, single-file HTML document based on the user's description.
      - Use inline CSS or a CDN like Tailwind (via <script src="https://cdn.tailwindcss.com"></script>) for styling.
      - Return ONLY the raw HTML code. Do not wrap it in markdown code blocks.
      - If the prompt is in Chinese, ensure the content of the generated website is in Chinese.
    `;

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        stream: true
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `API Error: ${errorText}` }, { status: response.status });
    }

    // --- P3 #14: 实现真正的流式响应 ---
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore parse errors for partial chunks
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("AI Generation Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
