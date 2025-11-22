// Configuration file for API keys and settings
const CONFIG = {
    // Google Maps API Key - Replace with your actual API key
    // Get your API key from: https://console.cloud.google.com/google/maps-apis
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    
    // Google OAuth Client ID - Get from: https://console.cloud.google.com/apis/credentials
    // For OAuth to work, add authorized JavaScript origins and redirect URIs
    GOOGLE_OAUTH_CLIENT_ID: 'YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE',
    
    // Backend API URL
    API_BASE_URL: 'http://localhost:3000/api',
    
    // App Settings
    APP_NAME: 'EV Smart Route & Charging Assistant',
    VERSION: '1.0.0',
    
    // Default settings
    DEFAULT_EV_RANGE: 250,
    DEFAULT_BATTERY_PERCENT: 80,
    
    // Map settings
    MAP_DEFAULT_ZOOM: 10,
    MAP_DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York
    
    // Route settings
    MAX_STATION_DISTANCE: 5, // miles
    SAFETY_BUFFER: 0.8, // Use 80% of range for safety
    
    // Animation settings
    ANIMATION_DURATION: 300,
    TRANSITION_DURATION: 300,
    
    // UI Settings
    ENABLE_SMOOTH_SCROLL: true,
    ENABLE_ANIMATIONS: true,
    REDUCE_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// Check if Google Maps API key is set
if (CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.warn('⚠️ Google Maps API key not set! Please update config.js with your API key.');
}

