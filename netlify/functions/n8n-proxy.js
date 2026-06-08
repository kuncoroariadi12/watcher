export default async (request, context) => {
  const url = new URL(request.url)

  // url.pathname = /.netlify/functions/n8n-proxy/webhook/daily-activity
  // Kita strip /.netlify/functions/n8n-proxy → /webhook/daily-activity
  const n8nPath = url.pathname.replace('/.netlify/functions/n8n-proxy', '')
  const n8nUrl = `https://n8n.devss.my.id${n8nPath}${url.search}`

  console.log('[n8n-proxy] Forwarding to:', n8nUrl)

  try {
    const response = await fetch(n8nUrl, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
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