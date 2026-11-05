import { onRequestGet, onRequestPost, type ProxyEnv } from './functions/api/proxy'

export interface Env extends ProxyEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // HTTP 一律 301 跳转 HTTPS：保证安全上下文（crypto.randomUUID 等Web API 需要）
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return new Response(null, { status: 301, headers: { Location: url.toString() } })
    }

    // Handle /api/proxy CORS forwarding for DashScope (Qwen) & Volcengine Ark (Doubao) & Grsai
    if (url.pathname === '/api/proxy') {
      if (request.method === 'POST') {
        return onRequestPost({ request, env })
      }
      if (request.method === 'GET') {
        return onRequestGet({ request, env })
      }
      return new Response(JSON.stringify({ error: { message: 'Method Not Allowed' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }

    // Fallback to static assets binding
    return env.ASSETS.fetch(request)
  },
}
