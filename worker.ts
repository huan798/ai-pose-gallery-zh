import { onRequestGet, onRequestPost, type ProxyEnv } from './functions/api/proxy'

export interface Env extends ProxyEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // HTTP 跳转 HTTPS（仅限页面/静态资源的 GET/HEAD；/api/* 与非 GET 一律放行，
    // 否则 301 会把浏览器 POST 改写为 GET 并造成跨源失败）
    if (
      url.protocol === 'http:' &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      !url.pathname.startsWith('/api/')
    ) {
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
