// API Client for Backend Communication
const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('ev_route_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('ev_route_token', token);
        } else {
            localStorage.removeItem('ev_route_token');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async register(email, password, name) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { email, password, name }
        });
    }

    async verifyEmail(email, otp) {
        const result = await this.request('/auth/verify', {
            method: 'POST',
            body: { email, otp }
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async login(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async resendOTP(email) {
        return this.request('/auth/resend-otp', {
            method: 'POST',
            body: { email }
        });
    }

    // Profile
    async getProfile() {
        return this.request('/profile');
    }

    async updateProfile(data) {
        return this.request('/profile', {
            method: 'PUT',
            body: data
        });
    }

    // Stations
    async getStations() {
        return this.request('/stations');
    }

    async addStation(station) {
        return this.request('/stations', {
            method: 'POST',
            body: station
        });
    }

    async updateStation(id, data) {
        return this.request(`/stations/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteStation(id) {
        return this.request(`/stations/${id}`, {
            method: 'DELETE'
        });
    }

    // Routes
    async planRoute(origin, destination, evRange, batteryPercent) {
        return this.request('/routes/plan', {
            method: 'POST',
            body: { origin, destination, evRange, batteryPercent }
        });
    }

    // Users (Admin)
    async getUsers() {
        return this.request('/users');
    }

    // OAuth
    async oauthGoogle(idToken, email, name, picture, providerId) {
        const result = await this.request('/auth/oauth/google', {
            method: 'POST',
            body: { idToken, email, name, picture, providerId }
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async verifyOAuthToken(provider, idToken, accessToken) {
        return this.request('/auth/oauth/verify', {
            method: 'POST',
            body: { provider, idToken, accessToken }
        });
    }

    // Analytics
    async getAnalytics() {
        return this.request('/analytics/stats');
    }

    // Reviews
    async getStationReviews(stationId) {
        return this.request(`/stations/${stationId}/reviews`);
    }

    async addStationReview(stationId, rating, comment) {
        return this.request(`/stations/${stationId}/reviews`, {
            method: 'POST',
            body: { rating, comment }
        });
    }

    // Google Maps
    async geocodeAddress(address) {
        return this.request('/maps/geocode', {
            method: 'POST',
            body: { address }
        });
    }

    async searchNearby(location, radius, type) {
        return this.request('/maps/nearby', {
            method: 'POST',
            body: { location, radius, type }
        });
    }
}

// Global API client instance
const apiClient = new APIClient();

