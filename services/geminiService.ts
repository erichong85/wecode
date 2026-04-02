// AI Generation Service
// Calls the server-side /api/generate endpoint with streaming support

import { supabase } from '../lib/supabase';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onFullContent?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

export const generateHtmlCodeStream = async (
  prompt: string, 
  callbacks: StreamCallbacks,
  modelOverride?: string
): Promise<void> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: prompt,
        modelOverride: modelOverride
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Unknown error occurred.');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
      callbacks.onChunk(chunk);
    }

    if (callbacks.onFullContent) {
      callbacks.onFullContent(fullContent.trim());
    }

  } catch (error) {
    console.error("AI Generation failed:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (callbacks.onError) {
      callbacks.onError?.(errorMsg);
    }
    throw new Error(`生成失败: ${errorMsg}`);
  }
};

// Legacy for backward compatibility (though we should migrate all)
export const generateHtmlCode = async (prompt: string, modelOverride?: string): Promise<string> => {
  let full = '';
  await generateHtmlCodeStream(prompt, {
    onChunk: (c) => { full += c; }
  }, modelOverride);
  return full.trim();
};
