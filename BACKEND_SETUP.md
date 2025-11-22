# Backend Setup Guide

This guide will help you set up and run the backend server for the EV Smart Route & Charging Assistant application.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation Steps

1. **Install Dependencies**

   Open a terminal in the project directory and run:

   ```bash
   npm install
   ```

   This will install the following packages:
   - `express` - Web framework
   - `cors` - Cross-Origin Resource Sharing
   - `bcryptjs` - Password hashing
   - `jsonwebtoken` - JWT authentication

2. **Start the Server**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

3. **Verify Server is Running**

   Open your browser and navigate to:
   ```
   http://localhost:3000/api/health
   ```

   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

## Default Admin Account

When the server starts for the first time, it creates a default admin account:

- **Email**: `admin@evroute.com`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/resend-otp` - Resend verification OTP

### Profile
- `GET /api/profile` - Get user profile (requires authentication)
- `PUT /api/profile` - Update user profile (requires authentication)

### Charging Stations
- `GET /api/stations` - Get all charging stations
- `POST /api/stations` - Add a new station (requires authentication)
- `PUT /api/stations/:id` - Update a station (requires authentication)
- `DELETE /api/stations/:id` - Delete a station (admin only)

### Routes
- `POST /api/routes/plan` - Plan a route (requires authentication)

### Users (Admin Only)
- `GET /api/users` - Get all users (admin only)

## Data Storage

The backend uses file-based storage in the `data/` directory:
- `users.json` - User accounts
- `profiles.json` - User profiles
- `stations.json` - Charging stations
- `otps.json` - OTP verification codes

These files are created automatically on first run.

## Environment Variables

You can configure the server using environment variables:

```bash
PORT=3000                    # Server port (default: 3000)
JWT_SECRET=your-secret-key  # JWT secret for tokens (default: 'ev-route-secret-key-change-in-production')
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, set a different port:

```bash
PORT=3001 npm start
```

Then update `api.js` to point to the new port:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

### CORS Issues

If you encounter CORS errors, the server is already configured to allow all origins. For production, update the CORS settings in `server.js`.

### OTP Not Working

OTPs are logged to the console for demo purposes. In production, integrate with an email service like SendGrid, AWS SES, or similar.

## Production Deployment

Before deploying to production:

1. **Set Environment Variables**
   - Set `JWT_SECRET` to a secure random string
   - Set `PORT` if needed

2. **Enable Email Service**
   - Replace console.log OTP with actual email sending
   - Use a service like SendGrid, AWS SES, or similar

3. **Use a Real Database**
   - Consider migrating from file-based storage to:
     - PostgreSQL
     - MongoDB
     - MySQL
     - Or any other database of your choice

4. **Enable HTTPS**
   - Use a reverse proxy like Nginx
   - Set up SSL certificates (Let's Encrypt)

5. **Security**
   - Implement rate limiting
   - Add request validation
   - Enable logging and monitoring

## Support

For issues or questions, please check the main README.md file or contact the development team.

