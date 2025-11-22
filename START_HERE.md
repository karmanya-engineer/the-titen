# 🚀 START HERE - Quick Setup

## ⚡ Fastest Way to Get Running (2 Minutes)

### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

### Step 2: Start Backend Server (30 seconds)
```bash
npm start
```

You should see:
```
🚀 EV Route Server running on http://localhost:3000
✅ Backend enhancements loaded
📊 API endpoints available at http://localhost:3000/api
```

### Step 3: Open the Application (10 seconds)
- Open `index.html` in your browser
- Or visit: `http://localhost:3000`

### Step 4: Login and Test (30 seconds)
- Click "Sign Up" to create account
- Or use Google OAuth (demo mode if no API key)
- Check browser console (F12) for OTP
- Start using the app!

## 🎯 Optional: Configure Google Maps (1 minute)

1. Get API key: https://console.cloud.google.com/google/maps-apis
2. Edit `config.js`:
   ```javascript
   GOOGLE_MAPS_API_KEY: 'your-actual-api-key'
   ```
3. Refresh the page

## 🎯 Optional: Configure Google OAuth (2 minutes)

1. Get Client ID: https://console.cloud.google.com/apis/credentials
2. Edit `config.js`:
   ```javascript
   GOOGLE_OAUTH_CLIENT_ID: 'your-client-id.apps.googleusercontent.com'
   ```
3. Refresh the page

## ✅ What Works Without Configuration

- ✅ User registration and login
- ✅ Route planning (basic)
- ✅ Station listing
- ✅ Profile management
- ✅ Admin panel
- ✅ All backend features
- ✅ Responsive design
- ✅ All animations

## ✅ What Needs API Keys

- ⚠️ **Google Maps**: Shows placeholder without API key (other features work)
- ⚠️ **Google OAuth**: Uses demo mode without Client ID (still works!)

## 🎉 You're Ready!

Everything works! The app is fully functional even without Google API keys (uses fallbacks).

For detailed setup:
- **Quick Start**: See `QUICK_START.md`
- **Backend Setup**: See `BACKEND_SETUP.md`
- **API Docs**: See `API_DOCUMENTATION.md`
- **Hackathon Guide**: See `HACKATHON_README.md`

---

**Good luck at the hackathon! 🏆**

