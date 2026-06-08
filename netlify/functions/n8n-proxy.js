export default async (request, context) => {
  const url = new URL(request.url)

  // Ambil path setelah /.netlify/functions/n8n-proxy
  // contoh: /.netlify/functions/n8n-proxy/webhook/daily-activity?user=...
  const n8nPath = url.pathname.replace('/.netlify/functions/n8n-proxy', '')
  const n8nUrl = `https://n8n.devss.my.id${n8nPath}${url.search}`

  try {
    const response = await fetch(n8nUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  path: '/api/n8n/*',
}
