-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tours table
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    itinerary_content TEXT,
    location VARCHAR(255),
    duration VARCHAR(100),
    thumbnail_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tour_gallery table
CREATE TABLE tour_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tour_prices table
CREATE TABLE tour_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    price_idr VARCHAR(50),
    price_usd VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tour_inclusions table
CREATE TABLE tour_inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_included BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table for authentication
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tour_gallery_tour_id ON tour_gallery(tour_id);
CREATE INDEX idx_tour_prices_tour_id ON tour_prices(tour_id);
CREATE INDEX idx_tour_inclusions_tour_id ON tour_inclusions(tour_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only)
CREATE POLICY "Public can view tours" ON tours FOR SELECT USING (true);
CREATE POLICY "Public can view tour gallery" ON tour_gallery FOR SELECT USING (true);
CREATE POLICY "Public can view tour prices" ON tour_prices FOR SELECT USING (true);
CREATE POLICY "Public can view tour inclusions" ON tour_inclusions FOR SELECT USING (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON tours TO anon, authenticated;
GRANT SELECT ON tour_gallery TO anon, authenticated;
GRANT SELECT ON tour_prices TO anon, authenticated;
GRANT SELECT ON tour_inclusions TO anon, authenticated;

-- Grant full permissions to authenticated users for admin operations
GRANT ALL ON tours TO authenticated;
GRANT ALL ON tour_gallery TO authenticated;
GRANT ALL ON tour_prices TO authenticated;
GRANT ALL ON tour_inclusions TO authenticated;
GRANT ALL ON admin_users TO authenticated;

-- Insert sample data
INSERT INTO tours (title, slug, description, itinerary_content, location, duration, thumbnail_image) VALUES
('Ubud Rice Terrace & Monkey Forest Tour', 'ubud-rice-terrace-monkey-forest', 'Experience the natural beauty and cultural richness of Ubud with our comprehensive tour. Visit the famous Tegalalang Rice Terrace, interact with playful monkeys in the sacred Monkey Forest, and explore traditional art markets.', '**Morning:** Pickup from your hotel and drive to Ubud (1 hour)

**9:00 AM - Tegalalang Rice Terrace:** Witness the stunning terraced rice fields, learn about traditional subak irrigation system, and capture breathtaking photos.

**11:00 AM - Coffee Plantation:** Visit a local coffee plantation, taste authentic Balinese coffee and learn about the famous Luwak coffee production process.

**12:30 PM - Lunch:** Enjoy traditional Balinese cuisine at a local restaurant with rice field views.

**2:00 PM - Ubud Monkey Forest:** Explore the sacred sanctuary home to over 700 Balinese long-tailed monkeys in their natural habitat.

**3:30 PM - Ubud Art Market:** Browse through traditional handicrafts, textiles, and souvenirs.

**5:00 PM - Return to hotel**', 'Ubud, Bali', '8-10 hours', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Beautiful%20Tegalalang%20rice%20terraces%20in%20Ubud%2C%20Bali%2C%20lush%20green%20terraced%20fields%2C%20traditional%20Balinese%20agriculture%2C%20misty%20morning%20light%2C%20luxury%20travel%20photography&image_size=landscape_16_9'),
('Mount Batur Sunrise Trekking', 'mount-batur-sunrise-trekking', 'Challenge yourself with an unforgettable sunrise trek to the summit of Mount Batur. Witness spectacular sunrise views over Lake Batur and surrounding mountains while enjoying breakfast cooked by volcanic steam.', '**1:30 AM - Hotel Pickup:** Early morning pickup from your hotel

**2:30 AM - Arrival at Starting Point:** Meet your guide and receive safety briefing

**3:00 AM - Begin Trek:** Start the 2-hour trek to the summit under starlight

**5:00 AM - Summit Arrival:** Reach the peak (1,717m) and witness the spectacular sunrise

**5:30 AM - Sunrise & Breakfast:** Enjoy breakfast cooked by volcanic steam while watching the sunrise over Lake Batur and Mount Rinjani

**6:30 AM - Explore Crater:** Walk around the crater and learn about volcanic activity

**7:30 AM - Descend:** Begin the journey back down

**9:30 AM - Hot Springs:** Optional visit to natural hot springs for relaxation

**11:00 AM - Return to hotel**', 'Kintamani, Bali', '10-12 hours', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Spectacular%20sunrise%20from%20Mount%20Batur%20summit%2C%20volcanic%20crater%2C%20Lake%20Batur%20below%2C%20morning%20mist%2C%20golden%20hour%20lighting%2C%20adventure%20tourism%2C%20luxury%20travel%20experience&image_size=landscape_16_9'),
('Nusa Penida Island Explorer', 'nusa-penida-island-explorer', 'Discover the pristine beauty of Nusa Penida island. Visit iconic spots like Kelingking Beach, Angel''s Billabong, and Broken Beach. Snorkel with manta rays and enjoy crystal clear waters.', '**7:00 AM - Hotel Pickup & Transfer to Sanur:** Morning pickup and transfer to Sanur harbor

**8:30 AM - Speedboat to Nusa Penida:** 30-minute fast boat ride to the island

**9:00 AM - Kelingking Beach:** Visit the famous T-Rex shaped cliff, hike down to the hidden beach (optional)

**11:30 AM - Angel''s Billabong:** Natural infinity pool with crystal clear water

**12:00 PM - Broken Beach:** Spectacular natural arch formation over turquoise waters

**1:00 PM - Lunch:** Fresh seafood lunch at local warung with ocean views

**2:30 PM - Crystal Bay:** Relax on pristine beach, optional snorkeling

**3:30 PM - Manta Point:** Snorkel with majestic manta rays (seasonal)

**5:00 PM - Return to Bali:** Speedboat back to Sanur and transfer to hotel**', 'Nusa Penida Island', '10-12 hours', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Kelingking%20Beach%20in%20Nusa%20Penida%2C%20famous%20T-Rex%20shaped%20cliff%2C%20turquoise%20ocean%20water%2C%20white%20sand%20beach%2C%20dramatic%20coastline%2C%20tropical%20paradise%2C%20luxury%20travel%20destination&image_size=landscape_16_9');

-- Insert sample gallery images
INSERT INTO tour_gallery (tour_id, image_url) VALUES
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Balinese%20temple%20in%20Ubud%20Monkey%20Forest%2C%20ancient%20stone%20statues%2C%20lush%20jungle%20setting%2C%20spiritual%20atmosphere%2C%20luxury%20travel%20photography&image_size=square'),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Balinese%20long-tailed%20monkeys%20in%20natural%20habitat%2C%20playful%20monkeys%20in%20sacred%20forest%2C%20wildlife%20photography%2C%20Ubud%20Monkey%20Forest%2C%20luxury%20travel%20experience&image_size=square'),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Volcanic%20steam%20cooking%20eggs%20on%20Mount%20Batur%2C%20geothermal%20activity%2C%20unique%20breakfast%20experience%2C%20adventure%20tourism%2C%20luxury%20travel%20moment&image_size=square'),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Lake%20Batur%20view%20from%20volcano%20summit%2C%20morning%20mist%20over%20caldera%20lake%2C%20panoramic%20volcanic%20landscape%2C%20stunning%20natural%20beauty%2C%20luxury%20travel%20photography&image_size=square'),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Angel%27s%20Billabong%20natural%20infinity%20pool%2C%20crystal%20clear%20turquoise%20water%2C%20rock%20formations%2C%20Nusa%20Penida%2C%20tropical%20paradise%2C%20luxury%20travel%20destination&image_size=square'),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Broken%20Beach%20natural%20arch%20formation%2C%20turquoise%20ocean%20through%20rock%20arch%2C%20dramatic%20coastal%20scenery%2C%20Nusa%20Penida%2C%20luxury%20travel%20photography&image_size=square');

-- Insert sample pricing
INSERT INTO tour_prices (tour_id, label, price_idr, price_usd) VALUES
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), '2-3 Pax', '750,000', '50'),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), '4-6 Pax', '650,000', '43'),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), '7-10 Pax', '550,000', '37'),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), '2-3 Pax', '850,000', '57'),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), '4-6 Pax', '750,000', '50'),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), '7-10 Pax', '650,000', '43'),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), '2-3 Pax', '1,200,000', '80'),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), '4-6 Pax', '1,100,000', '73'),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), '7-10 Pax', '1,000,000', '67');

-- Insert sample inclusions
INSERT INTO tour_inclusions (tour_id, item_text, is_included) VALUES
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Private air-conditioned vehicle', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Professional English-speaking guide', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Hotel pickup and drop-off', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Entrance fees to all attractions', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Coffee tasting at plantation', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Bottled water', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Lunch at local restaurant', true),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Personal expenses', false),
((SELECT id FROM tours WHERE slug = 'ubud-rice-terrace-monkey-forest'), 'Gratuities (recommended)', false),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Hotel pickup and drop-off', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Experienced trekking guide', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Flashlight and trekking equipment', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Breakfast at summit (eggs, banana, bread)', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Bottled water and hot drinks', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Entrance fee to Mount Batur', true),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Personal expenses', false),
((SELECT id FROM tours WHERE slug = 'mount-batur-sunrise-trekking'), 'Hot springs entrance fee', false),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Round-trip fast boat tickets', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Private car with driver on Nusa Penida', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'English-speaking guide', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Hotel pickup and drop-off in Bali', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Lunch at local restaurant', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Snorkeling equipment (if selected)', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Bottled water', true),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Personal expenses', false),
((SELECT id FROM tours WHERE slug = 'nusa-penida-island-explorer'), 'Gratuities (recommended)', false);