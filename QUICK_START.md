# ⚡ Quick Start Guide - Get Running in 5 Minutes

## 🚀 Fastest Way to Demo

### Option 1: Frontend Only (No Backend)
1. Open `index.html` in your browser
2. Click "Sign Up" and create an account
3. Check browser console (F12) for OTP
4. Enter OTP to verify
5. Start using the app!

### Option 2: Full Stack (Backend + Frontend)

#### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

#### Step 2: Start Backend (30 seconds)
```bash
npm start
```
You should see:
```
🚀 EV Route Server running on http://localhost:3000
✅ Backend enhancements loaded
```

#### Step 3: Configure Google Maps (1 minute)
1. Get Google Maps API key from: https://console.cloud.google.com/google/maps-apis
2. Edit `config.js`:
```javascript
GOOGLE_MAPS_API_KEY: 'your-actual-api-key-here'
```

#### Step 4: Configure Google OAuth (Optional - 2 minutes)
1. Get Google OAuth Client ID from: https://console.cloud.google.com/apis/credentials
2. Edit `config.js`:
```javascript
GOOGLE_OAUTH_CLIENT_ID: 'your-oauth-client-id.apps.googleusercontent.com'
```

#### Step 5: Open Application (30 seconds)
- Open `index.html` in your browser
- Or: `http://localhost:3000` (backend serves frontend)

## 🎯 Test Accounts

### Admin Account
- **Email**: `admin@evroute.com`
- **Password**: `admin123`
- **Features**: Full admin panel access, analytics dashboard

### Create User Account
1. Click "Sign Up"
2. Fill in details
3. Check console for OTP (demo mode)
4. Enter OTP
5. You're logged in!

## 🔥 Quick Feature Test

### Test Google OAuth
1. Click "Sign in with Google"
2. If configured: Real Google sign-in
3. If not: Demo mode dialog appears
4. Enter details and sign in

### Test Route Planning
1. Go to Dashboard
2. Enter: Origin: "New York, NY", Destination: "Boston, MA"
3. Set EV Range: 250 miles
4. Set Battery: 80%
5. Click "Plan Route"
6. See route on map with charging stations!

### Test Station Details
1. After planning route, stations appear
2. Click a station marker on map
3. See info window with details
4. Click "View Details" button
5. See full station info with reviews

### Test Analytics (Admin)
1. Login as admin
2. Go to admin panel (if available)
3. Or check: `http://localhost:3000/api/analytics/stats`
4. See system statistics

## 📱 Test Responsive Design

1. Open browser dev tools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select different devices:
   - iPhone 12 Pro
   - iPad
   - Desktop
4. Test all features on each device

## 🗺️ Google Maps Features

### If API Key is Set:
- ✅ Full interactive map
- ✅ Route display
- ✅ Station markers
- ✅ Info windows
- ✅ Autocomplete

### If No API Key:
- ⚠️ Map shows placeholder
- ✅ Route planning still works
- ✅ Station list still works
- ✅ All other features work

## 🐛 Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (need v14+)
- Check if port 3000 is free
- Try: `PORT=3001 npm start`

### Google Maps not loading
- Check API key in `config.js`
- Check browser console for errors
- Verify Maps JavaScript API is enabled in Google Cloud

### OAuth not working
- Check OAuth Client ID in `config.js`
- Demo mode will work if not configured
- Check authorized origins in Google Console

### Frontend errors
- Check browser console (F12)
- Ensure all script files are loaded
- Clear browser cache

## ✅ Verification Checklist

- [ ] Backend running (check http://localhost:3000/api/health)
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can login with Google (or see demo mode)
- [ ] Can plan a route
- [ ] Map displays (or shows placeholder)
- [ ] Stations appear on map
- [ ] Station details work
- [ ] Responsive on mobile
- [ ] All animations smooth

## 🎉 You're Ready!

Everything should be working. For detailed setup, see:
- `BACKEND_SETUP.md` - Backend configuration
- `API_DOCUMENTATION.md` - API reference
- `HACKATHON_README.md` - Complete documentation

**Good luck at the hackathon! 🏆**

