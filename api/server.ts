import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Buffer } from 'buffer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Ensure Storage bucket exists (idempotent)
app.post('/api/storage/ensure-tours-bucket', async (_req, res) => {
  try {
    const { data: bucket } = await supabase.storage.getBucket('tours')
    if (!bucket) {
      const { error: createError } = await supabase.storage.createBucket('tours', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      })
      if (createError) throw createError
    }
    res.json({ ok: true })
  } catch (error) {
    console.error('Error ensuring bucket:', error)
    res.status(500).json({ error: 'Failed to ensure bucket' })
  }
})

// Ensure Branding bucket exists (idempotent)
app.post('/api/storage/ensure-branding-bucket', async (_req, res) => {
  try {
    const { data: bucket } = await supabase.storage.getBucket('branding')
    if (!bucket) {
      const { error: createError } = await supabase.storage.createBucket('branding', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      })
      if (createError) throw createError
    }
    res.json({ ok: true })
  } catch (error) {
    console.error('Error ensuring branding bucket:', error)
    res.status(500).json({ error: 'Failed to ensure branding bucket' })
  }
})

// Site config stored in Storage as JSON
app.get('/api/settings/site-config', async (_req, res) => {
  try {
    const { data, error } = await supabase.storage.from('branding').download('site/site-config.json')
    if (error) {
      return res.json({ email: null, facebook: null, instagram: null, tiktok: null, address: null, copyright_year: null })
    }
    const buf = Buffer.from(await data.arrayBuffer())
    const json = JSON.parse(buf.toString('utf-8'))
    res.json(json)
  } catch (e) {
    res.json({ email: null, facebook: null, instagram: null, tiktok: null, address: null, copyright_year: null })
  }
})

app.post('/api/settings/site-config', async (req, res) => {
  try {
    const payload = {
      email: req.body.email || null,
      facebook: req.body.facebook || null,
      instagram: req.body.instagram || null,
      tiktok: req.body.tiktok || null,
      address: req.body.address || null,
      copyright_year: req.body.copyright_year || null,
    }
    const bytes = Buffer.from(JSON.stringify(payload), 'utf-8')
    // ensure folder path exists, Storage will create it on upload
    const { error } = await supabase.storage.from('branding').upload('site/site-config.json', bytes, { contentType: 'application/json', upsert: true })
    if (error) throw error
    res.json({ ok: true })
  } catch (e) {
    console.error('save site-config failed', e)
    res.status(500).json({ error: 'Failed to save site config' })
  }
})

app.get('/api/branding/about-image', async (_req, res) => {
  try {
    const { data, error } = await supabase.storage.from('branding').list('about', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (error) throw error
    if (!data || data.length === 0) {
      return res.json({ url: null })
    }
    const name = data[0].name
    const { data: pub } = supabase.storage.from('branding').getPublicUrl(`about/${name}`)
    return res.json({ url: pub.publicUrl })
  } catch (e) {
    console.error('about image error', e)
    res.status(500).json({ error: 'Failed to load about image' })
  }
})

// Get all tours
app.get('/api/tours', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error fetching tours:', error)
    res.status(500).json({ error: 'Failed to fetch tours' })
  }
})

// Get single tour by slug
app.get('/api/tours/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('slug', slug)
      .single()

    if (tourError) throw tourError

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' })
    }

    // Fetch related data
    const [{ data: gallery }, { data: prices }, { data: inclusions }] = await Promise.all([
      supabase.from('tour_gallery').select('*').eq('tour_id', tour.id),
      supabase.from('tour_prices').select('*').eq('tour_id', tour.id),
      supabase.from('tour_inclusions').select('*').eq('tour_id', tour.id)
    ])

    res.json({
      ...tour,
      gallery: gallery || [],
      prices: prices || [],
      inclusions: inclusions || []
    })
  } catch (error) {
    console.error('Error fetching tour:', error)
    res.status(500).json({ error: 'Failed to fetch tour' })
  }
})

// Create tour (admin only)
app.post('/api/tours', async (req, res) => {
  try {
    const { title, slug, description, itinerary_content, location, duration, thumbnail_image } = req.body

    const { data, error } = await supabase
      .from('tours')
      .insert([{
        title,
        slug,
        description,
        itinerary_content,
        location,
        duration,
        thumbnail_image
      }])
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error creating tour:', error)
    res.status(500).json({ error: 'Failed to create tour' })
  }
})

// Update tour (admin only)
app.put('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, slug, description, itinerary_content, location, duration, thumbnail_image } = req.body

    const { data, error } = await supabase
      .from('tours')
      .update({
        title,
        slug,
        description,
        itinerary_content,
        location,
        duration,
        thumbnail_image,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error updating tour:', error)
    res.status(500).json({ error: 'Failed to update tour' })
  }
})

// Delete tour (admin only)
app.delete('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Tour deleted successfully' })
  } catch (error) {
    console.error('Error deleting tour:', error)
    res.status(500).json({ error: 'Failed to delete tour' })
  }
})

// Get tour gallery
app.get('/api/tours/:tourId/gallery', async (req, res) => {
  try {
    const { tourId } = req.params
    
    const { data, error } = await supabase
      .from('tour_gallery')
      .select('*')
      .eq('tour_id', tourId)

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// Add gallery image
app.post('/api/tours/:tourId/gallery', async (req, res) => {
  try {
    const { tourId } = req.params
    const { image_url } = req.body

    const { data, error } = await supabase
      .from('tour_gallery')
      .insert([{
        tour_id: tourId,
        image_url
      }])
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error adding gallery image:', error)
    res.status(500).json({ error: 'Failed to add gallery image' })
  }
})

// Get tour prices
app.get('/api/tours/:tourId/prices', async (req, res) => {
  try {
    const { tourId } = req.params
    
    const { data, error } = await supabase
      .from('tour_prices')
      .select('*')
      .eq('tour_id', tourId)

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error fetching prices:', error)
    res.status(500).json({ error: 'Failed to fetch prices' })
  }
})

// Get tour inclusions
app.get('/api/tours/:tourId/inclusions', async (req, res) => {
  try {
    const { tourId } = req.params
    
    const { data, error } = await supabase
      .from('tour_inclusions')
      .select('*')
      .eq('tour_id', tourId)

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error fetching inclusions:', error)
    res.status(500).json({ error: 'Failed to fetch inclusions' })
  }
})

// Admin authentication (demo endpoint)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Demo authentication - in production, use proper auth
    if (email === 'admin@balitravel.com' && password === 'password123') {
      res.json({ 
        user: { email, id: 'demo-admin-id' },
        token: 'demo-jwt-token'
      })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Start server locally only; on Vercel, the function will be served without listening
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Supabase URL: ${supabaseUrl}`)
  })
}

export default app
