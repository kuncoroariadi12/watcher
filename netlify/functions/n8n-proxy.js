export default async (request, context) => {
  const url = new URL(request.url)
  const n8nPath = url.pathname.replace('/.netlify/functions/n8n-proxy', '')
  const n8nUrl = `https://n8n.devss.my.id${n8nPath}${url.search}`

  console.log('[n8n-proxy] Forwarding to:', n8nUrl)

  try {
    const response = await fetch(n8nUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://mdmwatcher.netlify.app',
        'Referer': 'https://mdmwatcher.netlify.app/',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    })

    const data = await response.text()
    console.log('[n8n-proxy] Response status:', response.status)

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}