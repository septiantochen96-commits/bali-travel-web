import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL as string
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string
  const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const host = req.headers && (req.headers['x-forwarded-host'] || req.headers['host'])
  const scheme = 'https'
  const baseUrl = host ? `${scheme}://${host}` : ''
  const now = new Date().toISOString()

  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = []
  if (baseUrl) {
    urls.push({ loc: `${baseUrl}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' })
    urls.push({ loc: `${baseUrl}/car-rental`, lastmod: now, changefreq: 'monthly', priority: '0.8' })
    urls.push({ loc: `${baseUrl}/airport-transfer`, lastmod: now, changefreq: 'monthly', priority: '0.7' })
  }

  try {
    const { data } = await client
      .from('tours')
      .select('slug, updated_at, created_at, published')
      .eq('published', true)

    const tourRows = Array.isArray(data) ? data : []
    for (const row of tourRows as any[]) {
      const last = row.updated_at || row.created_at || now
      if (baseUrl && row.slug) {
        urls.push({ loc: `${baseUrl}/tour/${row.slug}`, lastmod: new Date(last).toISOString(), changefreq: 'weekly', priority: '0.9' })
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => (
      `<url>` +
      `<loc>${u.loc}</loc>` +
      `<lastmod>${u.lastmod}</lastmod>` +
      `<changefreq>${u.changefreq}</changefreq>` +
      `<priority>${u.priority}</priority>` +
      `</url>`
    )).join('') +
    `</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.status(200).send(xml)
}

