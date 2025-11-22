// Backend Enhancements: Analytics, Logging, Rate Limiting, Caching

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map();

// Rate limiting middleware
function rateLimiter(maxRequests = 100, windowMs = 60000) {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = rateLimitStore.get(key);
        
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        if (record.count >= maxRequests) {
            return res.status(429).json({ 
                error: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }

        record.count++;
        next();
    };
}

// Simple in-memory cache (use Redis in production)
const cache = new Map();

function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.data;
}

function setCache(key, data, ttlMs = 300000) { // 5 minutes default
    cache.set(key, {
        data,
        expiry: Date.now() + ttlMs
    });
}

// Analytics tracking
const analytics = {
    requests: [],
    errors: [],
    routes: [],
    stations: [],
    
    trackRequest(req, res, responseTime) {
        this.requests.push({
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 requests
        if (this.requests.length > 1000) {
            this.requests.shift();
        }
    },
    
    trackError(error, req) {
        this.errors.push({
            message: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 errors
        if (this.errors.length > 100) {
            this.errors.shift();
        }
    },
    
    trackRoute(origin, destination, distance, duration, userId) {
        this.routes.push({
            origin,
            destination,
            distance,
            duration,
            userId,
            timestamp: new Date().toISOString()
        });
    },
    
    getStats() {
        const now = Date.now();
        const last24h = this.requests.filter(r => {
            const reqTime = new Date(r.timestamp).getTime();
            return (now - reqTime) < 24 * 60 * 60 * 1000;
        });

        return {
            totalRequests: this.requests.length,
            requestsLast24h: last24h.length,
            totalErrors: this.errors.length,
            totalRoutes: this.routes.length,
            totalStations: this.stations.length,
            averageResponseTime: this.requests.length > 0 
                ? this.requests.reduce((sum, r) => sum + r.responseTime, 0) / this.requests.length 
                : 0,
            errorRate: this.requests.length > 0 
                ? (this.errors.length / this.requests.length) * 100 
                : 0,
            topEndpoints: this.getTopEndpoints(),
            requestsByMethod: this.getRequestsByMethod()
        };
    },
    
    getTopEndpoints(limit = 10) {
        const counts = {};
        this.requests.forEach(req => {
            counts[req.path] = (counts[req.path] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([path, count]) => ({ path, count }));
    },
    
    getRequestsByMethod() {
        const counts = {};
        this.requests.forEach(req => {
            counts[req.method] = (counts[req.method] || 0) + 1;
        });
        return counts;
    }
};

// Request logging middleware
function requestLogger(req, res, next) {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        analytics.trackRequest(req, res, responseTime);
        
        const log = `${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`;
        console.log(log);
    });
    
    next();
}

// Error logging middleware
function errorLogger(err, req, res, next) {
    analytics.trackError(err, req);
    console.error('Error:', err);
    next(err);
}

// Verify Google OAuth token (simplified - use Google's token verification in production)
async function verifyGoogleToken(idToken) {
    // In production, use Google's token verification API
    // For now, we'll accept the token if provided
    // You should verify it with: https://oauth2.googleapis.com/tokeninfo?id_token={idToken}
    
    try {
        // Mock verification - replace with actual Google API call
        if (idToken && idToken.length > 50) {
            return {
                verified: true,
                email: null, // Extract from token in production
                name: null,
                picture: null
            };
        }
        return { verified: false };
    } catch (error) {
        return { verified: false, error: error.message };
    }
}

// Export functions (CommonJS for Node.js)
module.exports = {
    rateLimiter,
    getCache,
    setCache,
    analytics,
    requestLogger,
    errorLogger,
    verifyGoogleToken
};

