# ShadCN UI Backend

A robust Node.js backend built with Express.js and MongoDB, featuring JWT authentication, role-based access control, and comprehensive API endpoints for a community management system.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (User, Moderator, Admin)
  - Password hashing with bcrypt
  - Token refresh mechanism

- **User Management**

  - User registration and login
  - Profile management
  - Role management
  - User statistics and analytics

- **Content Management**

  - Announcements with categories and priorities
  - Events with scheduling and attendee management
  - Marketplace for community trading
  - Contact management system

- **Security Features**
  - Input validation with express-validator
  - Rate limiting
  - CORS configuration
  - Helmet security headers
  - Environment variable management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or pnpm

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Configure MongoDB**

   - For local MongoDB: Ensure MongoDB service is running
   - For MongoDB Atlas: Update the connection string in `.env`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/shadcn-ui-db
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/shadcn-ui-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
BCRYPT_ROUNDS=12
```

## 🗄️ Database Setup

The backend will automatically create the necessary collections when you first run the application. The main collections are:

- `users` - User accounts and profiles
- `announcements` - Community announcements
- `events` - Community events
- `marketplace` - Marketplace items
- `contacts` - Contact management

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `POST /api/users/:id/activate` - Activate user
- `GET /api/users/stats/overview` - User statistics

### Announcements

- `GET /api/announcements` - Get all published announcements
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create announcement (Admin/Moderator)
- `PUT /api/announcements/:id` - Update announcement (Admin/Moderator)
- `DELETE /api/announcements/:id` - Delete announcement (Admin/Moderator)
- `GET /api/announcements/categories/list` - Get categories
- `GET /api/announcements/priorities/list` - Get priorities

### Events

- `GET /api/events` - Get all published events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin/Moderator)
- `PUT /api/events/:id` - Update event (Admin/Moderator)
- `DELETE /api/events/:id` - Delete event (Admin/Moderator)
- `GET /api/events/types/list` - Get event types
- `GET /api/events/statuses/list` - Get event statuses

### Marketplace

- `GET /api/marketplace` - Get all approved marketplace items
- `GET /api/marketplace/:id` - Get marketplace item by ID
- `POST /api/marketplace` - Create marketplace item (Authenticated)
- `PUT /api/marketplace/:id` - Update marketplace item (Owner/Admin/Moderator)
- `DELETE /api/marketplace/:id` - Delete marketplace item (Owner/Admin/Moderator)
- `POST /api/marketplace/:id/approve` - Approve item (Admin/Moderator)
- `GET /api/marketplace/categories/list` - Get categories
- `GET /api/marketplace/conditions/list` - Get conditions

### Contacts

- `GET /api/contacts` - Get all contacts (Authenticated)
- `GET /api/contacts/:id` - Get contact by ID (Authenticated)
- `POST /api/contacts` - Create contact (Authenticated)
- `PUT /api/contacts/:id` - Update contact (Authenticated)
- `DELETE /api/contacts/:id` - Delete contact (Authenticated)
- `GET /api/contacts/departments/list` - Get departments
- `GET /api/contacts/tags/list` - Get tags
- `GET /api/contacts/stats/overview` - Get contact statistics

### Health Check

- `GET /api/health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 Role-Based Access Control

- **User**: Basic access to view content and manage own profile
- **Moderator**: Can create/edit announcements, events, and approve marketplace items
- **Admin**: Full access to all features including user management

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Build for Production

```bash
npm run build
```

## 📝 API Testing

You can test the API endpoints using tools like:

- **Postman** - API development and testing
- **Insomnia** - REST API client
- **Thunder Client** - VS Code extension
- **curl** - Command line tool

### Example API Test

```bash
# Test health endpoint
curl https://community-notice-board-website.vercel.app/api/health

# Test user registration
curl -X POST https://community-notice-board-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring & Logging

The application includes:

- Request logging
- Error handling with detailed error messages
- Health check endpoint
- MongoDB connection monitoring

## 🔧 Configuration

### CORS

Configure CORS settings in `server.js` to match your frontend URL.

### Rate Limiting

Rate limiting is configured to allow 100 requests per 15 minutes per IP address.

### Security Headers

Helmet.js provides security headers including:

- XSS Protection
- Content Security Policy
- Frame Options
- And more...

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": ["Additional error details if available"]
}
```

## 📈 Performance

- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient MongoDB queries
- Response compression

## 🔄 Database Migrations

When you're ready to move from mock data to real MongoDB models:

1. Create proper Mongoose schemas
2. Update route handlers to use database operations
3. Add database indexes for performance
4. Implement data validation at the database level

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed

## 🔮 Future Enhancements

- Real-time notifications with WebSocket
- File upload support for images
- Email verification system
- Password reset functionality
- Advanced search and filtering
- API documentation with Swagger
- Unit and integration tests
- Docker containerization
- CI/CD pipeline setup
