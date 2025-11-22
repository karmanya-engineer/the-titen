// Node.js/Express Backend Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ev-route-secret-key-change-in-production';
const DATA_DIR = path.join(__dirname, 'data');

// Import enhancements
const { 
    rateLimiter, 
    getCache, 
    setCache, 
    analytics, 
    requestLogger, 
    errorLogger,
    verifyGoogleToken 
} = require('./backend-enhancements');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimiter(100, 60000)); // 100 requests per minute
app.use('/api/auth/', rateLimiter(10, 60000)); // 10 auth requests per minute

// Error logging
app.use(errorLogger);

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// File-based database functions
async function readData(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeData(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Initialize default admin on startup
async function initializeAdmin() {
    const users = await readData('users.json');
    const adminExists = users.find(u => u.email === 'admin@evroute.com');
    
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = {
            id: 'admin-001',
            email: 'admin@evroute.com',
            password: hashedPassword,
            name: 'System Admin',
            role: 'admin',
            verified: true,
            createdAt: new Date().toISOString()
        };
        users.push(admin);
        await writeData('users.json', users);
        console.log('Default admin created: admin@evroute.com / admin123');
    }
}

// Routes

// Health check with detailed system info
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        features: [
            'OAuth Authentication',
            'Google Maps Integration',
            'Route Planning',
            'Analytics',
            'Reviews & Ratings',
            'Rate Limiting',
            'Caching'
        ]
    });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'EV Smart Route & Charging Assistant API',
        version: '1.0.0',
        description: 'Complete API for EV route planning and charging station management',
        endpoints: {
            health: 'GET /api/health',
            auth: {
                register: 'POST /api/auth/register',
                verify: 'POST /api/auth/verify',
                login: 'POST /api/auth/login',
                oauthGoogle: 'POST /api/auth/oauth/google'
            },
            profile: {
                get: 'GET /api/profile',
                update: 'PUT /api/profile'
            },
            stations: {
                list: 'GET /api/stations',
                create: 'POST /api/stations',
                update: 'PUT /api/stations/:id',
                delete: 'DELETE /api/stations/:id',
                reviews: 'GET /api/stations/:id/reviews',
                addReview: 'POST /api/stations/:id/reviews'
            },
            routes: {
                plan: 'POST /api/routes/plan'
            },
            maps: {
                geocode: 'POST /api/maps/geocode',
                nearby: 'POST /api/maps/nearby'
            },
            analytics: {
                stats: 'GET /api/analytics/stats (Admin)'
            }
        },
        documentation: 'See API_DOCUMENTATION.md for detailed documentation'
    });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const users = await readData('users.json');
        
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const user = {
            id: 'user-' + Date.now(),
            email,
            password: hashedPassword,
            name,
            role: 'user',
            verified: false,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        await writeData('users.json', users);

        // Save OTP (in production, send via email)
        const otps = await readData('otps.json');
        otps[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        await writeData('otps.json', otps);

        console.log(`OTP for ${email}: ${otp}`); // For demo purposes

        res.json({ 
            message: 'Registration successful. Please verify your email.',
            otp, // Only for demo - remove in production
            userId: user.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otps = await readData('otps.json');
        const otpData = otps[email];

        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (Date.now() > otpData.expiresAt) {
            delete otps[email];
            await writeData('otps.json', otps);
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Verify user
        const users = await readData('users.json');
        const user = users.find(u => u.email === email);
        if (user) {
            user.verified = true;
            await writeData('users.json', users);
        }

        // Remove OTP
        delete otps[email];
        await writeData('otps.json', otps);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = await readData('users.json');
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.verified && user.role !== 'admin') {
            return res.status(403).json({ error: 'Please verify your email first' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otps = await readData('otps.json');
        otps[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        };
        await writeData('otps.json', otps);

        console.log(`New OTP for ${email}: ${otp}`); // For demo

        res.json({ message: 'OTP resent successfully', otp }); // Only for demo
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// OAuth Routes
app.post('/api/auth/oauth/google', async (req, res) => {
    try {
        const { idToken, email, name, picture, providerId } = req.body;

        // Verify token (in production, verify with Google)
        if (idToken) {
            const verification = await verifyGoogleToken(idToken);
            if (!verification.verified) {
                return res.status(401).json({ error: 'Invalid Google token' });
            }
        }

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        const users = await readData('users.json');
        let user = users.find(u => u.email === email);

        if (user) {
            // User exists, update OAuth info
            if (!user.providers) user.providers = [];
            if (!user.providers.includes('google')) {
                user.providers.push('google');
            }
            user.googleId = providerId || user.googleId;
            user.picture = picture || user.picture;
            user.verified = true; // OAuth users are auto-verified
            user.lastLogin = new Date().toISOString();
            user.loginCount = (user.loginCount || 0) + 1;
        } else {
            // New user, create account
            user = {
                id: 'user-' + Date.now(),
                email: email,
                name: name,
                role: 'user',
                verified: true,
                providers: ['google'],
                oauthUser: true,
                googleId: providerId,
                picture: picture || null,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                loginCount: 1
            };
            users.push(user);
            
            // Track new user signup
            analytics.stations.push({
                type: 'user_signup',
                provider: 'google',
                timestamp: new Date().toISOString()
            });
        }

        await writeData('users.json', users);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'OAuth authentication failed' });
    }
});

app.post('/api/auth/oauth/verify', async (req, res) => {
    try {
        const { provider, idToken, accessToken } = req.body;

        // In production, verify the token with the OAuth provider
        // For now, accept if token is provided
        if (!idToken) {
            return res.status(400).json({ error: 'Token required' });
        }

        // Here you would verify the token with Google/Facebook/etc.
        // For demo, we'll accept it and return success
        res.json({ verified: true, provider });
    } catch (error) {
        console.error('OAuth verification error:', error);
        res.status(500).json({ error: 'Token verification failed' });
    }
});

// User Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profiles = await readData('profiles.json');
        const profile = profiles[req.user.userId] || {};
        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profiles = await readData('profiles.json');
        profiles[req.user.userId] = {
            ...profiles[req.user.userId],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await writeData('profiles.json', profiles);
        res.json({ message: 'Profile updated successfully', profile: profiles[req.user.userId] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Charging Stations Routes
app.get('/api/stations', async (req, res) => {
    try {
        const stations = await readData('stations.json');
        res.json(stations);
    } catch (error) {
        console.error('Get stations error:', error);
        res.status(500).json({ error: 'Failed to get stations' });
    }
});

app.post('/api/stations', authenticateToken, async (req, res) => {
    try {
        const station = {
            id: 'station-' + Date.now(),
            ...req.body,
            createdBy: req.user.userId,
            createdAt: new Date().toISOString(),
            verified: req.user.role === 'owner' || req.user.role === 'admin'
        };

        const stations = await readData('stations.json');
        stations.push(station);
        await writeData('stations.json', stations);

        res.status(201).json({ message: 'Station added successfully', station });
    } catch (error) {
        console.error('Add station error:', error);
        res.status(500).json({ error: 'Failed to add station' });
    }
});

app.put('/api/stations/:id', authenticateToken, async (req, res) => {
    try {
        const stations = await readData('stations.json');
        const index = stations.findIndex(s => s.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Station not found' });
        }

        stations[index] = {
            ...stations[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData('stations.json', stations);
        res.json({ message: 'Station updated successfully', station: stations[index] });
    } catch (error) {
        console.error('Update station error:', error);
        res.status(500).json({ error: 'Failed to update station' });
    }
});

app.delete('/api/stations/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stations = await readData('stations.json');
        const filtered = stations.filter(s => s.id !== req.params.id);
        await writeData('stations.json', filtered);

        res.json({ message: 'Station deleted successfully' });
    } catch (error) {
        console.error('Delete station error:', error);
        res.status(500).json({ error: 'Failed to delete station' });
    }
});

// Route Planning Routes
app.post('/api/routes/plan', authenticateToken, async (req, res) => {
    try {
        const { origin, destination, evRange, batteryPercent } = req.body;

        // Check cache first
        const cacheKey = `route:${origin}:${destination}:${evRange}:${batteryPercent}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // In a real app, this would use Google Maps Directions API
        // For now, return simulated route data with more details
        const baseDistance = Math.floor(Math.random() * 300) + 200;
        const route = {
            distance: baseDistance,
            duration: Math.floor(baseDistance / 60), // hours
            origin,
            destination,
            waypoints: [],
            elevationGain: Math.floor(Math.random() * 2000), // feet
            estimatedEnergy: 0, // kWh
            totalCost: 0, // $
            estimatedTimeMinutes: Math.floor(baseDistance / 60 * 60),
            trafficConditions: ['Normal', 'Light', 'Moderate'][Math.floor(Math.random() * 3)]
        };

        const availableRange = (evRange * (batteryPercent || 80)) / 100;
        route.chargingStops = Math.ceil((route.distance - availableRange) / (evRange * 0.8));
        
        // Calculate estimated energy usage
        const energyPerMile = 0.3; // kWh per mile (average)
        route.estimatedEnergy = route.distance * energyPerMile;

        // Get nearby stations with cost calculation
        const stations = await readData('stations.json');
        const nearbyStations = stations
            .map(s => {
                const distanceFromRoute = Math.random() * 10; // Simulated
                const chargingTime = (evRange * 0.8) / (s.power || 50); // hours
                const chargingCost = (evRange * 0.8 * energyPerMile) * (s.cost || 0.35);
                
                return {
                    ...s,
                    distanceFromRoute: parseFloat(distanceFromRoute.toFixed(2)),
                    estimatedChargingTime: parseFloat(chargingTime.toFixed(2)),
                    estimatedChargingCost: parseFloat(chargingCost.toFixed(2)),
                    rating: s.rating || (3.5 + Math.random() * 1.5).toFixed(1), // Mock rating
                    reviews: s.reviews || Math.floor(Math.random() * 50)
                };
            })
            .filter(s => s.distanceFromRoute <= 5)
            .sort((a, b) => a.distanceFromRoute - b.distanceFromRoute)
            .slice(0, route.chargingStops + 2);

        // Calculate total trip cost
        route.totalCost = nearbyStations.reduce((sum, station) => sum + (station.estimatedChargingCost || 0), 0);
        route.totalChargingTime = nearbyStations.reduce((sum, station) => sum + (parseFloat(station.estimatedChargingTime) || 0), 0);

        const response = { route, stations: nearbyStations };
        
        // Cache for 5 minutes
        setCache(cacheKey, response, 300000);
        
        // Track route
        analytics.trackRoute(origin, destination, route.distance, route.duration, req.user.userId);

        res.json(response);
    } catch (error) {
        console.error('Route planning error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Failed to plan route' });
    }
});

// Analytics and Statistics Routes
app.get('/api/analytics/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stats = analytics.getStats();
        
        // Add more detailed stats
        const users = await readData('users.json');
        const stations = await readData('stations.json');
        const profiles = await readData('profiles.json');
        
        stats.totalUsers = users.length;
        stats.verifiedUsers = users.filter(u => u.verified).length;
        stats.totalStations = stations.length;
        stats.verifiedStations = stations.filter(s => s.verified).length;
        stats.profilesWithVehicles = Object.values(profiles).filter(p => p.vehicleMake).length;
        
        // User growth (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        stats.newUsersLast7Days = users.filter(u => new Date(u.createdAt) > sevenDaysAgo).length;
        
        res.json(stats);
    } catch (error) {
        console.error('Analytics error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// Reviews and Ratings Routes
app.get('/api/stations/:id/reviews', async (req, res) => {
    try {
        const reviews = await readData('reviews.json');
        const stationReviews = reviews.filter(r => r.stationId === req.params.id);
        res.json(stationReviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

app.post('/api/stations/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const reviews = await readData('reviews.json');
        const review = {
            id: 'review-' + Date.now(),
            stationId: req.params.id,
            userId: req.user.userId,
            userName: req.user.name || req.user.email,
            rating: parseInt(rating),
            comment: comment || '',
            createdAt: new Date().toISOString()
        };

        reviews.push(review);
        await writeData('reviews.json', reviews);

        // Update station rating
        const stations = await readData('stations.json');
        const stationIndex = stations.findIndex(s => s.id === req.params.id);
        if (stationIndex !== -1) {
            const stationReviews = reviews.filter(r => r.stationId === req.params.id);
            const avgRating = stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length;
            stations[stationIndex].rating = parseFloat(avgRating.toFixed(1));
            stations[stationIndex].reviews = stationReviews.length;
            await writeData('stations.json', stations);
        }

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        console.error('Add review error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Google Maps Integration Routes
app.post('/api/maps/geocode', authenticateToken, async (req, res) => {
    try {
        const { address } = req.body;
        
        // In production, use Google Geocoding API
        // For now, return mock data
        const cacheKey = `geocode:${address}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const result = {
            address: address,
            location: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            formattedAddress: address,
            placeId: 'place_' + Date.now()
        };

        setCache(cacheKey, result, 86400000); // Cache for 24 hours
        res.json(result);
    } catch (error) {
        console.error('Geocode error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Geocoding failed' });
    }
});

app.post('/api/maps/nearby', authenticateToken, async (req, res) => {
    try {
        const { location, radius, type } = req.body;
        
        const cacheKey = `nearby:${location.lat}:${location.lng}:${radius}:${type}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // In production, use Google Places API
        const stations = await readData('stations.json');
        const nearby = stations
            .filter(s => {
                if (!s.latitude || !s.longitude) return false;
                const distance = Math.sqrt(
                    Math.pow(s.latitude - location.lat, 2) + 
                    Math.pow(s.longitude - location.lng, 2)
                ) * 69; // Approximate miles
                return distance <= (radius || 5);
            })
            .slice(0, 20);

        const result = { places: nearby };
        setCache(cacheKey, result, 300000); // Cache for 5 minutes
        res.json(result);
    } catch (error) {
        console.error('Nearby search error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Nearby search failed' });
    }
});

// User Management Routes (Admin)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await readData('users.json');
        const sanitized = users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            verified: u.verified,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin,
            loginCount: u.loginCount || 0,
            picture: u.picture || null
        }));
        res.json(sanitized);
    } catch (error) {
        console.error('Get users error:', error);
        analytics.trackError(error, req);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Initialize and start server
async function startServer() {
    await ensureDataDir();
    await initializeAdmin();
    
    // Initialize empty files if they don't exist
    const files = ['users.json', 'profiles.json', 'stations.json', 'otps.json', 'reviews.json'];
    for (const file of files) {
        try {
            await readData(file);
        } catch {
            await writeData(file, file === 'otps.json' ? {} : []);
        }
    }
    
    console.log('✅ Backend enhancements loaded:');
    console.log('   - Rate limiting enabled');
    console.log('   - Analytics tracking active');
    console.log('   - Caching enabled');
    console.log('   - Request logging enabled');

    app.listen(PORT, () => {
        console.log(`🚀 EV Route Server running on http://localhost:${PORT}`);
        console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);

