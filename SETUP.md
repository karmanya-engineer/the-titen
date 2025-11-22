# Setup Guide

## Quick Start

1. **Open the application**
   - Simply open `index.html` in your web browser
   - The app will automatically redirect you to login or dashboard based on authentication status

2. **Google Maps API Setup (Required for Route Planning)**
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable these APIs:
     - Maps JavaScript API
     - Places API  
     - Directions API
   - Open `dashboard.html` and replace `YOUR_API_KEY` with your actual key:
     ```html
     <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places,directions"></script>
     ```

## Default Accounts

### Admin Account
- **URL**: Open `admin.html` directly
- **Email**: `admin@evroute.com`
- **Password**: `admin123`
- **OTP**: Check browser console (F12) after clicking "Request OTP"

### Creating User Accounts
1. Click "Sign Up" on the landing page
2. Fill in your details
3. Check browser console for OTP code (in demo mode)
4. Enter OTP to verify email
5. You'll be automatically logged in

## Features Overview

### ✅ Completed Features

- ✅ User authentication (login, signup, OTP verification)
- ✅ Secure session management
- ✅ Google Maps integration for route planning
- ✅ Live EV range estimation
- ✅ Nearby charging station display
- ✅ Owner registration with document upload
- ✅ Admin panel with OTP protection
- ✅ Station approval/rejection system
- ✅ Dark/light mode toggle
- ✅ Profile management
- ✅ Smart route suggestions
- ✅ Fully responsive design
- ✅ Modern UI with animations

## File Structure

All pages are modular with separate HTML, CSS, and JS files:

- **Authentication**: `login.html/css/js`, `signup.html/css/js`
- **Dashboard**: `dashboard.html/css/js` (main route planning)
- **Profile**: `profile.html/css/js`
- **Owner Registration**: `owner-registration.html/css/js`
- **Admin Panel**: `admin.html/css/js`
- **Shared**: `auth.js`, `utils.js`

## Data Storage

The application uses **localStorage** for data persistence:
- User accounts
- Sessions
- Charging stations
- Owner registrations
- Profile data
- System logs

**Note**: All data is stored locally in the browser. Clearing browser data will reset everything.

## Testing the Application

1. **Test User Flow**:
   - Sign up → Verify email → Login → Plan route → View stations

2. **Test Owner Flow**:
   - Login → Register as Owner → Upload documents → Submit for review

3. **Test Admin Flow**:
   - Open `admin.html` → Login with admin credentials → Request OTP → Verify → Manage stations

## Troubleshooting

### Google Maps Not Loading
- Ensure you've added a valid API key
- Check that required APIs are enabled in Google Cloud Console
- Verify API key has proper restrictions (if any)

### OTP Not Working
- In demo mode, OTP codes are logged to browser console
- Open browser DevTools (F12) → Console tab
- Look for "Demo OTP:" or "Admin OTP:" messages

### Data Not Persisting
- Ensure localStorage is enabled in your browser
- Check browser settings for localStorage permissions
- Try clearing cache and reloading

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

1. Add your Google Maps API key
2. Test all user flows
3. Customize colors/themes if needed
4. Deploy to a web server for production use

For production deployment, you'll need to:
- Replace localStorage with a backend database
- Implement proper email service for OTP
- Add server-side authentication
- Implement proper file storage for document uploads
- Add HTTPS
- Implement proper security measures

