import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * crypto.randomUUID 的安全兜底版本。
 * 该 API 仅在 HTTPS 等安全上下文可用，通过 http:// 访问站点时不存在，
 * 这里降级为 crypto.getRandomValues / Math.random 组合实现。
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      /* 部分环境的 randomUUID 存在但调用受限，继续走兜底 */
    }
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // RFC 4122 v4 格式
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
