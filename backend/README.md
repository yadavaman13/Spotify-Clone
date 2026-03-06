# Spotify Clone - Backend API

A RESTful API backend for a Spotify-like music streaming application built with Node.js, Express, and MongoDB. This project demonstrates authentication, authorization, file uploads, and database relationships.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Installation & Setup](#installation--setup)
- [Key Concepts for Interviews](#key-concepts-for-interviews)

---

## 🛠 Tech Stack

### Core Dependencies

#### **Express (v5.2.1)**
- **Purpose**: Fast, unopinionated web framework for Node.js
- **Why Used**: 
  - Handles HTTP requests/responses
  - Routing and middleware management
  - Makes API development straightforward
- **In This Project**: Main framework for building REST API endpoints

#### **Mongoose (v9.2.1)**
- **Purpose**: MongoDB Object Data Modeling (ODM) library
- **Why Used**: 
  - Provides schema-based solution to model application data
  - Built-in validation, type casting, and query building
  - Makes MongoDB operations easier with JavaScript
- **In This Project**: 
  - Defines schemas for User, Music, and Album
  - Handles database queries and relationships
  - Implements population for referenced documents

#### **bcryptjs (v3.0.3)**
- **Purpose**: Library for hashing passwords
- **Why Used**: 
  - Securely hashes passwords before storing in database
  - Uses salt rounds for additional security
  - Prevents storing plain-text passwords
- **In This Project**: 
  - Hashes user passwords on registration (10 salt rounds)
  - Compares hashed passwords during login

#### **jsonwebtoken (v9.0.3)**
- **Purpose**: Implementation of JSON Web Tokens (JWT)
- **Why Used**: 
  - Stateless authentication mechanism
  - Securely transmits information between parties
  - No need to store session data on server
- **In This Project**: 
  - Creates JWT tokens on login/register with user ID and role
  - Verifies tokens in authentication middleware
  - Stored in HTTP-only cookies for security

#### **cookie-parser (v1.4.7)**
- **Purpose**: Middleware to parse cookies from request headers
- **Why Used**: 
  - Extracts cookies from HTTP requests
  - Makes cookies accessible via `req.cookies`
- **In This Project**: 
  - Reads JWT tokens from cookies
  - Used in authentication middleware

#### **multer (v2.0.2)**
- **Purpose**: Middleware for handling `multipart/form-data` (file uploads)
- **Why Used**: 
  - Handles file uploads in forms
  - Provides access to uploaded files via `req.file`
  - Can store files in memory or disk
- **In This Project**: 
  - Handles music file uploads
  - Stores files in memory as buffer for processing

#### **@imagekit/nodejs (v7.3.0)**
- **Purpose**: Official ImageKit SDK for Node.js
- **Why Used**: 
  - Cloud storage for media files
  - CDN for fast content delivery
  - Image/video optimization and transformation
- **In This Project**: 
  - Uploads music files to ImageKit cloud storage
  - Stores file URLs in database
  - Provides CDN URLs for music streaming

#### **dotenv (v17.3.1)**
- **Purpose**: Loads environment variables from `.env` file
- **Why Used**: 
  - Keeps sensitive data (API keys, secrets) out of code
  - Different configurations for dev/prod environments
- **In This Project**: 
  - Stores MongoDB URI, JWT secret, ImageKit credentials

---

## 📁 Project Structure

```
backend/
│
├── server.js                    # Entry point - starts server
├── package.json                 # Dependencies and scripts
│
└── src/
    ├── app.js                   # Express app setup and middleware
    │
    ├── db/
    │   └── db.js               # MongoDB connection
    │
    ├── models/                  # Mongoose schemas
    │   ├── user.model.js       # User schema (username, email, password, role)
    │   ├── music.model.js      # Music schema (uri, title, artist ref)
    │   └── album.model.js      # Album schema (title, artist ref, musics array)
    │
    ├── controllers/             # Business logic
    │   ├── auth.controller.js  # Register, login, logout logic
    │   └── music.controller.js # Music/album CRUD operations
    │
    ├── routes/                  # API route definitions
    │   ├── auth.route.js       # /api/auth routes
    │   └── music.routes.js     # /api/music routes
    │
    ├── middlewares/             # Custom middleware
    │   └── auth.middleware.js  # JWT verification & role-based access
    │
    └── services/                # External services
        └── storage.service.js  # ImageKit file upload service
```

### **Architecture Pattern: MVC (Model-View-Controller)**
- **Models**: Define data structure and database schema
- **Controllers**: Handle business logic and request processing
- **Routes**: Define API endpoints and map to controllers
- **Middleware**: Process requests before reaching controllers

---

## ⚡ Core Features

### 1. **Authentication System**
- User registration with password hashing
- Login with credential validation
- JWT-based stateless authentication
- Logout functionality with cookie clearing

### 2. **Role-Based Authorization**
- Two user roles: `user` and `artist`
- Artists can upload music and create albums
- Users can view/stream music content
- Middleware enforces role-based access control

### 3. **Music Management**
- Artists can upload music files
- Files stored on ImageKit cloud storage
- Music associated with artist (MongoDB reference)
- Retrieve all music with artist details (population)

### 4. **Album Management**
- Artists can create albums with multiple songs
- Album-Music relationship using references
- Fetch all albums with artist information
- Get specific album details by ID

### 5. **File Upload System**
- Multer handles multipart form data
- Files stored in memory as buffer
- Converted to base64 for ImageKit upload
- Secure cloud storage with CDN delivery

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)

#### Register User
```
POST /api/auth/register
Body: { username, email, password, role: "user"|"artist" }
Response: { message, user: { id, username, email, role } }
Cookie: Sets JWT token
```

#### Login User
```
POST /api/auth/login
Body: { username|email, password }
Response: { message, user: { username, email, role } }
Cookie: Sets JWT token
```

#### Logout User
```
POST /api/auth/logout
Response: { message }
Cookie: Clears JWT token
```

### **Music Routes** (`/api/music`)

#### Create Music (Artist Only)
```
POST /api/music/create
Headers: Cookie with JWT token
Middleware: authArtist
Body: multipart/form-data { title, file }
Response: { message, user: { id, uri, title, artist } }
```

#### Create Album (Artist Only)
```
POST /api/music/album/create
Headers: Cookie with JWT token
Middleware: authArtist
Body: { title, musics: [musicIds] }
Response: { message, album: { id, title, artist, musics } }
```

#### Get All Music (User Only)
```
GET /api/music/all
Headers: Cookie with JWT token
Middleware: authUser
Response: { message, musics: [...] }
Note: Limited to 2 results, populated with artist details
```

#### Get All Albums (User Only)
```
GET /api/music/albums
Headers: Cookie with JWT token
Middleware: authUser
Response: { message, albums: [...] }
```

#### Get Album By ID (User Only)
```
GET /api/music/album/:albumId
Headers: Cookie with JWT token
Middleware: authUser
Response: { message, album: {...} }
```

---

## 💾 Database Models

### **User Model**
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'artist'], default: 'user')
}
```

### **Music Model**
```javascript
{
  uri: String (required) - CloudCDN URL,
  title: String (required),
  artist: ObjectId (ref: 'user', required)
}
```

### **Album Model**
```javascript
{
  title: String (required),
  artist: ObjectId (ref: 'user', required),
  musics: [ObjectId] (ref: 'music')
}
```

### **Relationships**
- User → Music: One-to-Many (One artist has many music)
- User → Album: One-to-Many (One artist has many albums)
- Album → Music: Many-to-Many (Album contains multiple music, music can be in multiple albums)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- ImageKit account (for file storage)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file in backend root**
```env
MONGODB_URI=mongodb://localhost:27017/spotify-clone
JWT_SECRET=your_super_secret_jwt_key_here
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

4. **Run the development server**
```bash
npm run dev
```

Server will start on `http://localhost:3000`

---

## 🎯 Key Concepts for Interviews

### 1. **Authentication vs Authorization**
- **Authentication**: Verifying user identity (login with JWT)
- **Authorization**: Checking user permissions (role-based access with middleware)

### 2. **JWT (JSON Web Tokens)**
- **Structure**: Header.Payload.Signature
- **Stateless**: Server doesn't store session data
- **Payload in this app**: `{ id, role }`
- **Storage**: HTTP-only cookies (prevents XSS attacks)

### 3. **Password Security**
- Never store plain-text passwords
- bcrypt uses salt + hashing (10 rounds in this app)
- `bcrypt.hash()` for registration
- `bcrypt.compare()` for login verification

### 4. **Middleware Pattern**
- Functions that execute before reaching controller
- Signature: `(req, res, next)`
- Used for: Authentication, logging, error handling
- `next()` passes control to next middleware/controller

### 5. **MongoDB References & Population**
- References store ObjectIds, not actual documents
- `populate()` replaces ObjectIds with actual documents
- Example: `populate('artist', 'username email')`
- More efficient than embedding for one-to-many relationships

### 6. **File Upload Flow**
1. Client sends multipart/form-data
2. Multer parses and stores in memory
3. Controller accesses via `req.file`
4. Convert buffer to base64
5. Upload to ImageKit cloud storage
6. Store returned URL in database

### 7. **RESTful API Design**
- **Resource-based URLs**: `/api/music`, `/api/auth`
- **HTTP Methods**: GET (read), POST (create), PUT/PATCH (update), DELETE
- **Status Codes**: 
  - 200 (OK), 201 (Created)
  - 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
  - 409 (Conflict - user exists), 500 (Server Error)

### 8. **Environment Variables**
- Keep secrets out of codebase
- Different configs for dev/staging/prod
- Never commit `.env` to version control
- Access via `process.env.VARIABLE_NAME`

### 9. **Error Handling Patterns**
- Always validate input
- Use try-catch for async operations
- Return appropriate status codes
- Provide meaningful error messages

### 10. **Database Queries Used**
- `findOne()`: Find single document
- `find()`: Find multiple documents
- `create()`: Insert new document
- `findById()`: Find by MongoDB ObjectId
- `limit()`: Limit results
- `select()`: Choose specific fields
- `populate()`: Resolve references
- `$or`: MongoDB OR operator for multiple conditions

---

## 📝 Additional Notes

### **Security Best Practices Implemented**
- Passwords hashed with bcrypt
- JWT tokens in HTTP-only cookies
- Environment variables for secrets
- Role-based access control
- Input validation (checking for existing users)

### **Potential Interview Questions**
1. Why use JWT over session-based authentication?
2. How does bcrypt ensure password security?
3. Explain the difference between `ref` and embedding in MongoDB
4. What happens if a JWT is compromised?
5. How would you implement refresh tokens?
6. What's the difference between authentication middleware for artists and users?
7. Why store files on cloud storage instead of server filesystem?
8. How would you implement pagination for music list?
9. Explain the MVC architecture in this application
10. How would you handle concurrent music uploads?

### **Future Enhancements**
- Add refresh token mechanism
- Implement password reset functionality
- Add music search and filtering
- Implement playlists feature
- Add rate limiting for API endpoints
- Implement comprehensive error handling middleware
- Add input validation with libraries like Joi or express-validator
- Add unit and integration tests
- Implement logging system (Winston/Morgan)
- Add API documentation (Swagger/OpenAPI)

---

## 📞 Development Commands

```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Run tests (when implemented)
npm test
```

---

**Built with ❤️ for learning and interview preparation**
