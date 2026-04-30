/**
 * 净化 HTML 内容，防止 XSS 攻击
 * 移除 on* 事件处理器和 javascript: 协议
 */
export function sanitizeHTML(html: string): string {
  // 移除所有 on* 事件处理器（onclick, onload 等）
  let sanitized = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // 移除 javascript: 协议
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

  return sanitized;
}

/**
 * 获取安全的 iframe sandbox 属性
 */
export function getSafeSandbox(): string {
  return 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin';
}
