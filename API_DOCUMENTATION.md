# API Documentation

Complete API reference for EV Smart Route & Charging Assistant backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check
- **GET** `/health`
- **Description**: Check server status
- **Auth**: None
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### Register User
- **POST** `/auth/register`
- **Description**: Register a new user
- **Auth**: None
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
- **Response**:
```json
{
  "message": "Registration successful. Please verify your email.",
  "otp": "123456",
  "userId": "user-1234567890"
}
```

#### Verify Email
- **POST** `/auth/verify`
- **Description**: Verify email with OTP
- **Auth**: None
- **Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- **Response**:
```json
{
  "message": "Email verified successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
- **POST** `/auth/login`
- **Description**: User login
- **Auth**: None
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Google OAuth
- **POST** `/auth/oauth/google`
- **Description**: Google OAuth authentication
- **Auth**: None
- **Body**:
```json
{
  "idToken": "google-id-token",
  "email": "user@gmail.com",
  "name": "Google User",
  "picture": "https://...",
  "providerId": "google-user-id"
}
```
- **Response**:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-1234567890",
    "email": "user@gmail.com",
    "name": "Google User",
    "role": "user",
    "picture": "https://..."
  }
}
```

#### Resend OTP
- **POST** `/auth/resend-otp`
- **Description**: Resend verification OTP
- **Auth**: None
- **Body**:
```json
{
  "email": "user@example.com"
}
```

### Profile

#### Get Profile
- **GET** `/profile`
- **Description**: Get user profile
- **Auth**: Required
- **Response**:
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "phone": "123-456-7890",
  "location": "New York, NY",
  "vehicleMake": "Tesla",
  "vehicleModel": "Model 3",
  "evRange": 250
}
```

#### Update Profile
- **PUT** `/profile`
- **Description**: Update user profile
- **Auth**: Required
- **Body**: (any profile fields)
```json
{
  "fullName": "John Doe",
  "phone": "123-456-7890",
  "location": "New York, NY"
}
```

### Charging Stations

#### Get All Stations
- **GET** `/stations`
- **Description**: Get all charging stations
- **Auth**: None
- **Response**:
```json
[
  {
    "id": "station-1",
    "name": "Electrify America - Downtown",
    "address": "123 Main St",
    "type": "DC Fast",
    "connector": "CCS",
    "power": 150,
    "cost": 0.43,
    "verified": true,
    "latitude": 40.7128,
    "longitude": -74.0060
  }
]
```

#### Add Station
- **POST** `/stations`
- **Description**: Add new charging station
- **Auth**: Required
- **Body**:
```json
{
  "name": "New Station",
  "address": "456 Street",
  "type": "DC Fast",
  "connector": "CCS",
  "power": 150,
  "cost": 0.43,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### Update Station
- **PUT** `/stations/:id`
- **Description**: Update station
- **Auth**: Required

#### Delete Station
- **DELETE** `/stations/:id`
- **Description**: Delete station
- **Auth**: Required (Admin only)

#### Get Station Reviews
- **GET** `/stations/:id/reviews`
- **Description**: Get reviews for a station
- **Auth**: None
- **Response**:
```json
[
  {
    "id": "review-1",
    "stationId": "station-1",
    "userId": "user-1",
    "userName": "John Doe",
    "rating": 5,
    "comment": "Great station!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Add Review
- **POST** `/stations/:id/reviews`
- **Description**: Add review for station
- **Auth**: Required
- **Body**:
```json
{
  "rating": 5,
  "comment": "Great station!"
}
```

### Routes

#### Plan Route
- **POST** `/routes/plan`
- **Description**: Plan EV route with charging stops
- **Auth**: Required
- **Body**:
```json
{
  "origin": "New York, NY",
  "destination": "Boston, MA",
  "evRange": 250,
  "batteryPercent": 80
}
```
- **Response**:
```json
{
  "route": {
    "distance": 215.5,
    "duration": 3.6,
    "chargingStops": 2,
    "estimatedEnergy": 64.65,
    "totalCost": 27.80,
    "totalChargingTime": 1.2,
    "trafficConditions": "Normal"
  },
  "stations": [
    {
      "id": "station-1",
      "name": "...",
      "distanceFromRoute": 2.5,
      "estimatedChargingTime": 0.6,
      "estimatedChargingCost": 13.90,
      "rating": 4.5,
      "reviews": 25
    }
  ]
}
```

### Google Maps

#### Geocode Address
- **POST** `/maps/geocode`
- **Description**: Convert address to coordinates
- **Auth**: Required
- **Body**:
```json
{
  "address": "New York, NY"
}
```
- **Response**:
```json
{
  "address": "New York, NY",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "formattedAddress": "New York, NY, USA",
  "placeId": "place_123456"
}
```

#### Search Nearby
- **POST** `/maps/nearby`
- **Description**: Find nearby places
- **Auth**: Required
- **Body**:
```json
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "radius": 5,
  "type": "charging_station"
}
```

### Analytics (Admin Only)

#### Get Statistics
- **GET** `/analytics/stats`
- **Description**: Get system statistics
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "totalRequests": 1250,
  "requestsLast24h": 85,
  "totalErrors": 5,
  "totalRoutes": 320,
  "totalStations": 45,
  "verifiedStations": 30,
  "totalUsers": 125,
  "verifiedUsers": 100,
  "averageResponseTime": 125.5,
  "errorRate": 0.4,
  "topEndpoints": [...],
  "requestsByMethod": {...}
}
```

### Users (Admin Only)

#### Get All Users
- **GET** `/users`
- **Description**: Get all users
- **Auth**: Required (Admin)
- **Response**:
```json
[
  {
    "id": "user-1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T10:00:00.000Z",
    "loginCount": 25
  }
]
```

## Rate Limiting

- **General API**: 100 requests per minute
- **Auth Endpoints**: 10 requests per minute
- **Response**: 429 status code with retry-after header

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

## Caching

Some endpoints are cached:
- **Routes**: 5 minutes
- **Geocoding**: 24 hours
- **Nearby Search**: 5 minutes

## Authentication Flow

1. Register/Login to get JWT token
2. Include token in Authorization header
3. Token expires in 7 days
4. Refresh by logging in again

## OAuth Flow

1. Client receives Google ID token
2. Send to `/auth/oauth/google` with user info
3. Backend verifies token (or accepts for demo)
4. Backend creates/updates user
5. Returns JWT token for subsequent requests

