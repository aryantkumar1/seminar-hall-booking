# Seminar Hall Booking System - Backend API

A robust Express.js backend API for the Seminar Hall Booking System with MongoDB integration.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin and Faculty user roles
- **Hall Management**: CRUD operations for seminar halls
- **Booking System**: Complete booking management with conflict detection
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM
- **TypeScript**: Full TypeScript support for type safety

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Language**: TypeScript
- **Development**: Nodemon, ts-node

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── hallController.ts    # Hall management logic
│   │   └── bookingController.ts # Booking management logic
│   ├── middleware/
│   │   ├── auth.ts             # Authentication middleware
│   │   └── validation.ts       # Input validation middleware
│   ├── models/
│   │   ├── User.ts             # User model
│   │   ├── Hall.ts             # Hall model
│   │   └── Booking.ts          # Booking model
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   ├── halls.ts            # Hall routes
│   │   └── bookings.ts         # Booking routes
│   └── server.ts               # Main server file
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Installation & Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   The `.env` file is already configured with your MongoDB connection string.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:id` - Update user (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)

### Halls
- `GET /api/halls` - Get all halls
- `GET /api/halls/:id` - Get hall by ID
- `GET /api/halls/search?q=query` - Search halls
- `GET /api/halls/capacity?min=50&max=200` - Filter by capacity
- `GET /api/halls/equipment?equipment=projector,whiteboard` - Filter by equipment
- `POST /api/halls` - Create hall (admin only)
- `PUT /api/halls/:id` - Update hall (admin only)
- `DELETE /api/halls/:id` - Delete hall (admin only)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by user role)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking (faculty/admin)
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Delete booking

## Database Collections

### Users
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: 'admin' | 'faculty' (required)
- `createdAt`, `updatedAt`: Timestamps

### Halls
- `name`: String (required, unique)
- `capacity`: Number (required)
- `equipment`: Array of strings (required)
- `imageUrl`: String (required)
- `imageHint`: String (required)
- `createdAt`, `updatedAt`: Timestamps

### Bookings
- `hallId`: ObjectId (ref: Hall)
- `hallName`: String
- `facultyId`: ObjectId (ref: User)
- `facultyName`: String
- `date`: Date
- `startTime`: String (HH:MM format)
- `endTime`: String (HH:MM format)
- `purpose`: String
- `status`: 'Pending' | 'Approved' | 'Rejected'
- `createdAt`, `updatedAt`: Timestamps

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation with express-validator
- **Role-based Access**: Admin and Faculty permissions

## Development

- **Hot Reload**: Nodemon for development
- **TypeScript**: Full type safety
- **Path Aliases**: `@/` for src directory
- **Error Handling**: Global error handler with proper status codes
- **Logging**: Console logging for development

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=seminar-hall-booking
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:9002
```

## Health Check

Visit `http://localhost:5000/health` to check if the API is running.

## Testing

The API can be tested using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend application

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up MongoDB Atlas or production database
5. Use PM2 or similar for process management
6. Set up reverse proxy (nginx)
7. Enable HTTPS



##Commit