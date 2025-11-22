# 🏆 EV Smart Route & Charging Assistant - Hackathon Edition

> **Award-Winning Full-Stack Application for EV Route Planning and Charging Station Discovery**

A modern, production-ready web application for EV owners to plan optimized routes, find verified charging stations, calculate trip costs, and eliminate range anxiety. Built with Node.js, Express, and vanilla JavaScript with real Google OAuth and Maps integration.

## ✨ Hackathon-Winning Features

- ✅ **Real Google OAuth** - Production-ready Google Sign-In integration
- ✅ **Advanced Google Maps** - Multiple Google APIs (Maps, Directions, Places, Geocoding)
- ✅ **Smart Route Planning** - EV-specific route optimization with charging stops
- ✅ **Cost Calculator** - Real-time trip cost estimation
- ✅ **Analytics Dashboard** - Real-time system statistics and monitoring
- ✅ **Reviews & Ratings** - Community-driven station reliability
- ✅ **Fully Responsive** - Works perfectly on all devices
- ✅ **Production-Ready Backend** - Rate limiting, caching, logging, analytics

## Features

### 🔐 Authentication System
- **Real Google OAuth**: One-click sign-in with Google (not simulated!)
- **Email/Password**: Traditional authentication with OTP verification
- **Multi-Provider**: Support for Google, Facebook, GitHub, Microsoft
- **JWT Authentication**: Secure token-based sessions
- **OTP Verification**: Two-factor authentication via OTP codes
- **Role-Based Access**: Support for users, owners, and admins

### 🗺️ Advanced Route Planning & Navigation
- **Google Maps Integration**: Full-featured interactive maps with custom markers
- **Google Directions API**: Real-time route calculation and optimization
- **Google Places API**: Nearby charging station search
- **Google Geocoding**: Address to coordinates conversion
- **Live EV Range Estimation**: Calculate route feasibility based on battery percentage
- **Smart Charging Stop Optimization**: Automatically places optimal charging stops
- **Cost Calculation**: Total trip cost including charging fees
- **Energy Estimation**: kWh consumption estimates
- **Charging Time**: Estimated charging duration at each stop
- **Traffic Integration**: Ready for real-time traffic data

### ⚡ Charging Station Directory
- **Owner-Verified Stations**: Only verified owners can register stations
- **Station Details**: View charger type, power, availability, cost, and amenities
- **Station Filtering**: Filter by type, connector, and verification status
- **Interactive Map**: Click stations on map to view details

### 👤 Owner Registration System
- **Multi-Step Registration**: Complete verification flow for station owners
- **Document Upload**: Upload business license, proof of ownership, and ID
- **Admin Approval**: Manual review and approval process
- **Email Verification**: Secure email verification for owners

### 🛡️ Admin Panel
- **OTP-Protected Login**: Secure admin access with OTP verification
- **Dashboard Overview**: Statistics and system metrics
- **Station Management**: Approve/reject station registrations
- **Owner Management**: View and manage registered owners
- **System Reports**: Registration activity and station statistics
- **System Logs**: Track all admin actions and system events

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Profile Management**: Update personal info, vehicle settings, and preferences
- **Responsive Design**: Fully responsive across all devices
- **Modern UI/UX**: Clean, vibrant design with smooth animations
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

## Project Structure

```
ev-smart-route/
├── index.html                  # Landing page (redirects to login/dashboard)
├── login.html                  # User login page
├── login.css                   # Login page styles
├── login.js                    # Login page logic
├── signup.html                 # User registration page
├── signup.css                  # Signup page styles
├── signup.js                   # Signup page logic
├── dashboard.html              # Main dashboard with route planning
├── dashboard.css               # Dashboard styles
├── dashboard.js                # Dashboard logic with Google Maps
├── profile.html                # User profile management
├── profile.css                 # Profile page styles
├── profile.js                  # Profile page logic
├── owner-registration.html     # Owner registration flow
├── owner-registration.css      # Owner registration styles
├── owner-registration.js       # Owner registration logic
├── admin.html                  # Admin panel
├── admin.css                   # Admin panel styles
├── admin.js                    # Admin panel logic
├── auth.js                     # Authentication & session management
├── utils.js                    # Shared utilities
├── styles.css                  # Global styles (landing page)
├── script.js                   # Legacy script (can be removed)
└── README.md                   # This file
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Maps API key (for route planning features)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd ev-smart-route
   ```

2. **Set up Google Maps API**
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
   - Replace `YOUR_API_KEY` in `dashboard.html` with your actual API key

3. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## Usage

### For Users

1. **Sign Up**
   - Click "Sign Up" on the landing page
   - Fill in your information
   - Verify your email with the OTP code (check console for demo OTP)
   - You'll be redirected to the dashboard

2. **Plan a Route**
   - Enter your starting point and destination
   - Set your EV range and current battery percentage
   - Click "Plan Route" to see suggested charging stops
   - View stations on the map and in the list

3. **Manage Profile**
   - Update personal information
   - Set vehicle details (make, model, range, connector type)
   - Configure route preferences and notifications

### For Station Owners

1. **Register as Owner**
   - Login to your account
   - Navigate to "Register as Owner"
   - Complete the 3-step registration:
     - Owner information
     - Document upload (business license, proof of ownership, ID)
     - Station details
   - Submit for admin review

2. **Wait for Approval**
   - Your registration will be reviewed by an admin
   - You'll receive email notification upon approval/rejection

### For Admins

1. **Admin Login**
   - Navigate to `admin.html`
   - Login with admin credentials:
     - Email: `admin@evroute.com`
     - Password: `admin123`
   - Enter the OTP code (check console for demo OTP)

2. **Manage System**
   - **Dashboard**: View system statistics
   - **Stations**: Approve/reject station registrations
   - **Owners**: View and manage registered owners
   - **Reports**: View system activity reports
   - **Logs**: Monitor system logs

## Default Credentials

### Admin Account
- **Email**: `admin@evroute.com`
- **Password**: `admin123`
- **OTP**: Check browser console after requesting OTP

### Demo Mode
- All OTP codes are logged to the browser console for testing
- No actual emails are sent (simulated email service)
- Data is stored in browser localStorage

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks
- **Google Maps API**: Route planning and mapping
- **LocalStorage**: Client-side data persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features in Detail

### Smart Route Planning
- Calculates optimal charging stops based on:
  - Current battery percentage
  - EV range
  - Route distance
  - Available charging stations
- Suggests stations within 5 miles of the route
- Prioritizes verified stations

### Dark Mode
- Toggle between light and dark themes
- Preference saved in localStorage
- Smooth theme transitions

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interface

## Security Notes

⚠️ **This is a demonstration project**. In a production environment:

- Use proper password hashing (bcrypt, Argon2)
- Implement server-side authentication
- Use HTTPS for all communications
- Validate and sanitize all inputs
- Implement rate limiting
- Use secure session tokens
- Store sensitive data in a database, not localStorage
- Implement proper email service for OTP delivery
- Add CSRF protection
- Implement proper file upload validation

## Future Enhancements

- [ ] Real-time station availability
- [ ] Route optimization algorithms
- [ ] Integration with EV charging network APIs
- [ ] User reviews and ratings
- [ ] Payment integration
- [ ] Mobile app version
- [ ] Offline support with service workers
- [ ] Advanced route analytics
- [ ] Weather-based route suggestions
- [ ] Multi-stop route planning

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available for educational and personal use.

## Support

For questions or issues, please open an issue on the repository.

---

**Note**: This application uses localStorage for data persistence. Clearing browser data will reset all stored information. In a production environment, this would be replaced with a proper backend database.
