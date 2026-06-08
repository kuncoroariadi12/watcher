export default async (request, context) => {
  const url = new URL(request.url)

  // Strip /api/n8n dari path, sisanya forward ke n8n
  // /api/n8n/webhook/daily-activity → /webhook/daily-activity
  const n8nPath = url.pathname.replace('/api/n8n', '')
  const n8nUrl = `https://n8n.devss.my.id${n8nPath}${url.search}`

  console.log('Proxying to:', n8nUrl)

  try {
    const response = await fetch(n8nUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    })

    const data = await response.text()
    console.log('n8n response status:', response.status)

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
    console.error('Proxy error:', err.message)
    return new Response(JSON.stringify({ error: 'Proxy error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  path: '/api/n8n/*',
}
