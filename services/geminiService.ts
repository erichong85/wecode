// Universal AI Service (OpenAI Compatible)
// Supports: OpenAI, DeepSeek, Kimi, Qwen, and any other OpenAI-compatible API

const getApiKeys = () => {
  const keysString = process.env.NEXT_PUBLIC_API_KEY;
  if (!keysString) {
    throw new Error("API Key is missing. Please add NEXT_PUBLIC_API_KEY to .env.local");
  }
  return keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

const getBaseUrl = () => {
  // Default to OpenAI if not specified
  let url = process.env.NEXT_PUBLIC_AI_BASE_URL || "https://api.openai.com/v1";
  // Remove trailing slash if present
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
};

const getModel = () => {
  return process.env.NEXT_PUBLIC_AI_MODEL || "gpt-3.5-turbo";
};

export const generateHtmlCode = async (prompt: string): Promise<string> => {
  const apiKeys = getApiKeys();
  const baseUrl = getBaseUrl();
  const model = getModel();

  let lastError = null;

  const systemInstruction = `
    You are an expert Frontend Engineer. 
    Your task is to generate a complete, single-file HTML document based on the user's description.
    - Use inline CSS or a CDN like Tailwind (via <script src="https://cdn.tailwindcss.com"></script>) for styling.
    - Make it look modern, responsive, and professional.
    - Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (e.g., no \`\`\`html). 
    - Do not include explanations.
    - Ensure the HTML is valid and runnable in an iframe.
    - If the prompt is in Chinese, ensure the content of the generated website (headings, paragraphs, buttons) is in Chinese.
  `;

  for (const apiKey of apiKeys) {
    try {
      console.log(`[AI Service] Connecting to: ${baseUrl}`);
      console.log(`[AI Service] Model: ${model}`);
      console.log(`[AI Service] Using Key: ...${apiKey.slice(-4)}`);

      const response = await fetch(`${baseUrl}/chat/completions`, {
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
          stream: false
        })
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(`[AI Service] Failed to parse JSON. Response preview: ${responseText.slice(0, 200)}...`);
        throw new Error(`API returned invalid JSON (likely HTML error page). Status: ${response.status}. Preview: ${responseText.slice(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${data.error?.message || response.statusText}`);
      }

      let text = data.choices?.[0]?.message?.content || "";

      // Cleanup markdown
      text = text.replace(/```html/g, '').replace(/```/g, '');

      return text.trim();

    } catch (error) {
      console.error(`Key ...${apiKey.slice(-4)} failed:`, error);
      lastError = error;
      // Continue to next key
    }
  }

  console.error("All API keys failed.");
  throw new Error(`生成失败: 所有API Key均尝试无效。请检查配置。\n最后一次错误: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
};
