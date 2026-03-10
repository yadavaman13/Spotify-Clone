# Spotify Clone - Backend API

A RESTful API backend for a Spotify-like music streaming application built with Node.js, Express, and MongoDB. This project demonstrates core backend engineering concepts including JWT-based authentication, role-based authorization, cloud file storage integration, and MongoDB document relationships.

**Perfect for interview preparation** - This README provides comprehensive technical documentation with in-depth explanations of architecture patterns, security best practices, and common interview questions.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Installation & Setup](#installation--setup)
- [Key Concepts for Interviews](#key-concepts-for-interviews)
- [Known Limitations](#known-limitations)

---

## 🛠 Tech Stack

### Core Dependencies

| Dependency | Version | Purpose in This Project |
|------------|---------|------------------------|
| **Express** | ^5.2.1 | Fast, unopinionated web framework that handles HTTP routing, middleware management, and serves as the foundation for all REST API endpoints |
| **Mongoose** | ^9.2.1 | MongoDB ODM providing schema-based data modeling, validation, type casting, and query building. Manages User, Music, and Album schemas with document relationships via references |
| **bcryptjs** | ^3.0.3 | Password hashing library using 10 salt rounds to securely hash passwords before database storage and validate credentials during authentication |
| **jsonwebtoken** | ^9.0.3 | Implements JWT tokens for stateless authentication. Encodes user ID and role in tokens, which are verified by middleware for protected routes |
| **cookie-parser** | ^1.4.7 | Express middleware that parses cookies from HTTP request headers, making JWT tokens accessible via `req.cookies.token` |
| **multer** | ^2.0.2 | Handles `multipart/form-data` file uploads. Configured with memory storage to buffer music files before cloud upload |
| **@imagekit/nodejs** | ^7.3.0 | ImageKit SDK for uploading music files to cloud storage with CDN delivery. Files are uploaded to `sheryians-backend/music` folder |
| **dotenv** | ^17.3.1 | Loads environment variables from `.env` file, keeping sensitive credentials (MongoDB URI, JWT secret, ImageKit keys) out of source code |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| **nodemon** | Not in package.json | Auto-restarts server on file changes during development (used via `npm run dev`). Should be installed globally or added to devDependencies. |

---

## 🏗 System Architecture

This application follows the **MVC (Model-View-Controller)** pattern with a service layer:

```
┌─────────────┐
│   Client    │ (Frontend/Postman)
└──────┬──────┘
       │ HTTP Requests
       ▼
┌─────────────────────────────────────────────────────┐
│              Express.js Server                      │
│  ┌───────────────────────────────────────────────┐ │
│  │         Middleware Layer                      │ │
│  │  • express.json() - Parse JSON bodies         │ │
│  │  • cookieParser() - Extract cookies           │ │
│  │  • authUser/authArtist - JWT verification     │ │
│  │  • multer - Handle file uploads               │ │
│  └───────────────┬───────────────────────────────┘ │
│                  ▼                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │            Routes Layer                       │ │
│  │  • /api/auth - Authentication endpoints       │ │
│  │  • /api/music - Music & album endpoints       │ │
│  └───────────────┬───────────────────────────────┘ │
│                  ▼                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │         Controllers Layer                     │ │
│  │  • auth.controller - Login/Register/Logout    │ │
│  │  • music.controller - CRUD operations         │ │
│  └───────────┬───────────────────────────────────┘ │
│              │                                       │
│              ├──────────────┬───────────────────────┤
│              ▼              ▼                       │
│  ┌─────────────────┐  ┌─────────────┐             │
│  │  Models Layer   │  │  Services   │             │
│  │  • User         │  │  • Storage  │             │
│  │  • Music        │  │             │             │
│  │  • Album        │  └──────┬──────┘             │
│  └────────┬────────┘         │                     │
└───────────┼──────────────────┼─────────────────────┘
            ▼                  ▼
    ┌───────────────┐  ┌──────────────┐
    │   MongoDB     │  │  ImageKit    │
    │   Database    │  │  Cloud CDN   │
    └───────────────┘  └──────────────┘
```

**Key Architectural Decisions:**
- **Stateless Authentication**: JWT tokens eliminate need for server-side session storage
- **Cloud Storage**: Music files stored on ImageKit CDN for scalability and global distribution
- **Document References**: MongoDB ObjectId references instead of embedding for flexible relationships
- **Memory Storage**: Files buffered in RAM before cloud upload (suitable for moderate traffic)
- **Role-Based Access**: Separate middleware functions enforce artist vs user permissions

---

## 📁 Project Structure

```
backend/
│
├── server.js                    # Entry point - Loads .env, connects DB, starts server
├── package.json                 # Dependencies, scripts, metadata
├── .env                         # Environment variables (not in repo)
├── .gitignore                   # Excludes node_modules, .env
│
└── src/
    ├── app.js                   # Express app initialization & middleware setup
    │
    ├── db/
    │   └── db.js               # MongoDB connection using Mongoose
    │
    ├── models/                  # Mongoose schemas & models
    │   ├── user.model.js       # User schema (username, email, password, role)
    │   ├── music.model.js      # Music schema (uri, title, artist reference)
    │   └── album.model.js      # Album schema (title, artist ref, musics array)
    │
    ├── controllers/             # Business logic for API operations
    │   ├── auth.controller.js  # registerUser, loginUser, logoutUser
    │   └── music.controller.js # createMusic, createAlbum, getAllMusics, getAllAlbums, getAlbumById
    │
    ├── routes/                  # API endpoint definitions
    │   ├── auth.route.js       # POST /register, /login, /logout
    │   └── music.routes.js     # POST /createmusic, /createalbum | GET /, /albums, /albums/:id
    │
    ├── middlewares/             # Request preprocessing functions
    │   └── auth.middleware.js  # authArtist & authUser - JWT validation & role verification
    │
    └── services/                # External service integrations
        └── storage.service.js  # uploadFile() - ImageKit cloud upload
```

### File Responsibilities

| File | Key Responsibilities |
|------|---------------------|
| **server.js** | Application bootstrap: load environment variables, establish database connection, start HTTP server on port 3000 |
| **app.js** | Express configuration: apply JSON parsing, cookie parsing, mount route handlers for `/api/auth` and `/api/music` |
| **db/db.js** | Database connection manager using `mongoose.connect()` with `process.env.MONGO_URI` |
| **models/** | Define MongoDB schemas with validation rules and data types. Export Mongoose models for CRUD operations |
| **controllers/** | Implement business logic, interact with models and services, format API responses, handle errors |
| **routes/** | Map HTTP methods and URLs to controller functions, apply middleware for authentication/file upload |
| **middlewares/** | Extract and verify JWT tokens, enforce role-based access control, populate `req.user` with decoded token data |
| **services/** | Encapsulate third-party API interactions (ImageKit) to keep controllers clean and testable |

### Architecture Pattern: **MVC with Service Layer**

- **Models** (M): Data structure and database interaction
- **Views** (V): Not applicable (JSON API, no template rendering)
- **Controllers** (C): Request handling and response formatting
- **Services**: External API integration and reusable business logic

---

## ⚡ Core Features

### 1. **JWT-Based Authentication System**
**Implementation Details:**
- **Registration**: Accepts username, email, password, and optional role. Hashes password with bcrypt (10 salt rounds) before database storage. Returns 409 if username/email already exists.
- **Login**: Accepts username OR email with password. Uses `bcrypt.compare()` to validate hashed password. Creates JWT containing `{ id, role }` payload.
- **Token Storage**: JWT stored in HTTP-only cookie named "token", preventing XSS attacks by making it inaccessible to JavaScript.
- **Logout**: Clears the JWT cookie to invalidate session.

**Security Measures:**
- Passwords never stored in plain text
- JWT signed with `process.env.JWT_SECRET`
- Cookie-based token storage prevents XSS exploitation
- Stateless design eliminates server-side session management overhead

### 2. **Role-Based Authorization (RBAC)**
**Two User Roles:**
- **Artist** (`role: 'artist'`): Can upload music files, create albums, and manage their content
- **User** (`role: 'user'`): Can view and stream music content, browse albums

**Middleware Implementation:**
- `authArtist`: Verifies JWT and checks `decoded.role === 'artist'`. Sets `req.user = decoded` for controller access. Returns 403 if role mismatch.
- `authUser`: Verifies JWT and checks `decoded.role === 'user'`. Returns 403 with message "You don't have access to fetch musics" if role mismatch. **Note**: Does not set `req.user`.

**Access Control:**
- Music/album creation: Artist only
- Music browsing: User only
- Album listing: **Public** (no authentication required)
- Authentication endpoints: Public

### 3. **Music Management System**
**Upload Flow:**
1. Artist submits multipart form with `title` and `music` file
2. Multer buffers file in memory (RAM)
3. Controller converts buffer to base64 string
4. Service uploads to ImageKit with filename `music_<timestamp>`
5. Music document created with ImageKit URL, title, and artist reference
6. Returns music details with CDN URL for streaming

**Database Operations:**
- Create music with artist reference (`artist: req.user.id`)
- Fetch all music with artist population (`populate('artist', 'username email')`)
- **Current Limitation**: Only returns 2 music documents due to `.limit(2)` (appears to be debug code)

### 4. **Album Management System**
**Features:**
- Artists create albums with title and array of music IDs
- Albums maintain references to both artist and music documents
- Album queries populate artist information (username, email)
- Individual album retrieval by MongoDB ObjectId
- **Note**: Album detail queries do NOT populate music array (returns only ObjectIds)

**Document Relationships:**
- One artist can create many albums (1:N)
- One album can contain many songs (1:N)
- One song can belong to multiple albums (M:N potential, though not fully implemented)

### 5. **Cloud-Based File Storage**
**ImageKit Integration:**
- Files uploaded to `sheryians-backend/music` folder
- CDN URLs provide global distribution and low-latency streaming
- Base64 encoding used for upload (file buffer → base64 → ImageKit)
- Filenames timestamped to prevent collisions: `music_1234567890`

**Advantages Over Local Storage:**
- Scalability: No server disk space consumed
- Performance: CDN caching reduces server load
- Availability: Geographic distribution ensures low latency
- Management: Centralized media handling

**Configuration Required:**
- `IMAGEKIT_PRIVATE_KEY`: Authentication for uploads
- Additional keys: `publicKey` and `urlEndpoint` (configured in service)

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`) - Public Access

#### **POST /api/auth/register**
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, unique)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "role": "user | artist (optional, defaults to 'user')"
}
```

**Success Response (201):**
```json
{
  "message": "User Created Successfully",
  "user": {
    "id": "ObjectId",
    "username": "string",
    "email": "string",
    "role": "user | artist"
  }
}
```

**Error Responses:**
- `409 Conflict`: Username or email already exists
- `500 Server Error`: Database or hashing failure

**Sets Cookie:** `token` (JWT, HttpOnly)

---

#### **POST /api/auth/login**
Authenticate existing user.

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "password": "string (required)",
  "role": "string (optional)"
}
```
*Note: Provide either username OR email*

**Success Response (200):**
```json
{
  "message": "User Logged In Successfully",
  "user": {
    "username": "string",
    "email": "string",
    "role": "user | artist"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not found or invalid password
- `500 Server Error`: Database or JWT signing failure

**Sets Cookie:** `token` (JWT, HttpOnly)

---

#### **POST /api/auth/logout**
End user session.

**Success Response (200):**
```json
{
  "message": "User Logged Out Successfully"
}
```

**Clears Cookie:** `token`

---

### Music & Album Routes (`/api/music`)

#### **POST /api/music/createmusic** 🔒 Artist Only
Upload a new music file.

**Authentication:** JWT cookie required  
**Middleware:** `authArtist`  
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title`: string (required) - Song title
- `music`: file (required) - Audio file (any format)

**Success Response (201):**
```json
{
  "message": "Music Created Successfully",
  "user": {
    "id": "ObjectId",
    "uri": "https://imagekit.io/.../music_1234567890",
    "title": "string",
    "artist": "ObjectId"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No JWT token
- `403 Forbidden`: User is not an artist
- `500 Server Error`: Upload or database failure

---

#### **POST /api/music/createalbum** 🔒 Artist Only
Create a new album with existing songs.

**Authentication:** JWT cookie required  
**Middleware:** `authArtist`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "string (required)",
  "musics": ["ObjectId", "ObjectId", ...] (array of music IDs)
}
```

**Success Response (201):**
```json
{
  "message": "Album created successfully",
  "album": {
    "id": "ObjectId",
    "title": "string",
    "artist": "ObjectId",
    "musics": ["ObjectId", "ObjectId", ...]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No JWT token
- `403 Forbidden`: User is not an artist
- `500 Server Error`: Database failure

---

#### **GET /api/music/** 🔒 User Only
Fetch all music with artist details.

**Authentication:** JWT cookie required  
**Middleware:** `authUser`

**Success Response (200):**
```json
{
  "message": "all music fetched successfully",
  "musics": [
    {
      "_id": "ObjectId",
      "uri": "https://imagekit.io/...",
      "title": "string",
      "artist": {
        "_id": "ObjectId",
        "username": "string",
        "email": "string"
      }
    }
  ]
}
```

**⚠️ Current Limitation:** Returns only first 2 results due to `.limit(2)` query

**Error Responses:**
- `401 Unauthorized`: No JWT token
- `403 Forbidden`: User role is not 'user' ("You don't have access to fetch musics")
- `500 Server Error`: Database failure

---

#### **GET /api/music/albums** 🌐 Public Access
Fetch all albums with artist information.

**Authentication:** None required  
**Middleware:** None

**Success Response (200):**
```json
{
  "message": "successfully fetched albums",
  "albums": [
    {
      "_id": "ObjectId",
      "title": "string",
      "artist": {
        "_id": "ObjectId",
        "username": "string",
        "email": "string"
      }
    }
  ]
}
```

**Note:** Returns only `title` and `artist` fields (`.select("title artist")`)

**Error Response:**
- `500 Server Error`: Database failure

---

#### **GET /api/music/albums/:albumId** 🔒 User Only
Get detailed information for a specific album.

**Authentication:** JWT cookie required  
**Middleware:** `authUser`

**URL Parameter:**
- `albumId`: MongoDB ObjectId of the album

**Success Response (200):**
```json
{
  "message": "music fetched",
  "album": {
    "_id": "ObjectId",
    "title": "string",
    "artist": "ObjectId",
    "musics": ["ObjectId", "ObjectId", ...]
  }
}
```

**⚠️ Note:** Music IDs are NOT populated (returns ObjectIds, not full documents)

**Error Responses:**
- `401 Unauthorized`: No JWT token
- `403 Forbidden`: User role is not 'user'
- `500 Server Error`: Database failure or invalid ObjectId

---

## 💾 Database Models

### User Model (`user.model.js`)

**Collection Name:** `users`

**Schema Definition:**
```javascript
{
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true    // Stored as bcrypt hash
  },
  role: {
    type: String,
    enum: ['user', 'artist'],
    default: 'user'
  }
}
```

**Indexes:**
- `username`: Unique index (enforced by MongoDB)
- `email`: Unique index (enforced by MongoDB)

**Security Notes:**
- Password is hashed with bcrypt (10 salt rounds) before saving
- No pre-save hooks implemented (hashing done in controller)
- Password never returned in API responses

**Usage in Application:**
- Referenced by Music model (artist field)
- Referenced by Album model (artist field)
- Used for authentication and authorization

---

### Music Model (`music.model.js`)

**Collection Name:** `musics`

**Schema Definition:**
```javascript
{
  uri: {
    type: String,
    required: true    // ImageKit CDN URL
  },
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}
```

**Relationships:**
- **artist**: References User document (Many-to-One: many songs by one artist)
- **albums**: Reverse reference from Album model (Many-to-Many potential)

**Query Patterns:**
- Population: `.populate('artist', 'username email')` retrieves artist details
- Filtering: Can query by artist ID to get all songs by specific artist

---

### Album Model (`album.model.js`)

**Collection Name:** `albums`

**Schema Definition:**
```javascript
{
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  musics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'music'
  }]
}
```

**Relationships:**
- **artist**: References User document (Many-to-One: many albums by one artist)
- **musics**: Array of Music document references (One-to-Many: one album has many songs)

**Query Patterns:**
- Artist population: `.populate('artist', 'username email')`
- Music population: `.populate('musics')` (not currently implemented in endpoints)
- Selective fields: `.select('title artist')` for list views

---

## 📊 Database Relationships

### Entity-Relationship Diagram

```
┌─────────────────┐
│      User       │
│  (Collection)   │
├─────────────────┤
│ _id: ObjectId   │◄─────────┐
│ username        │          │
│ email           │          │ References
│ password (hash) │          │ (artist)
│ role            │          │
└─────────────────┘          │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│     Music      │  │     Album       │  │  Album (cont.) │
│  (Collection)  │  │  (Collection)   │  │                │
├────────────────┤  ├─────────────────┤  ├────────────────┤
│ _id: ObjectId  │◄─┤ musics: []      │  │ artist: ref    │
│ uri: String    │  │   (ObjectId[])  │  │                │
│ title: String  │  │ _id: ObjectId   │  │                │
│ artist: ref    │  │ title: String   │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
                             │
                             └──────────────┐
                                           │ References
                                           │ (musics array)
                                           │
                             ┌─────────────▼
                             │ Can reference multiple
                             │ Music documents
```

### Relationship Types

| Relationship | Type | Implementation | Notes |
|-------------|------|----------------|-------|
| User → Music | 1:N | `music.artist` references `user._id` | One artist creates many songs |
| User → Album | 1:N | `album.artist` references `user._id` | One artist creates many albums |
| Album → Music | M:N | `album.musics[]` references `music._id` | One album contains many songs; one song can be in multiple albums |

### Population Strategy

**Why References Over Embedding?**
1. **Flexibility**: Music can be updated without modifying all albums
2. **Normalization**: Prevents data duplication
3. **Query Efficiency**: Can query music independently of albums
4. **Scalability**: Albums don't grow unbounded with full music documents

**Trade-offs:**
- Requires additional queries (population) to fetch related data
- More complex queries compared to embedded documents
- Better for large collections and frequently updated data

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher recommended)
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)
- **ImageKit Account** (free tier available at [imagekit.io](https://imagekit.io))
- **npm** or **yarn** package manager

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Spotify-Clone/backend
```

#### 2. Install Dependencies
```bash
npm install
```

This installs all packages listed in `package.json`:
- Express, Mongoose, JWT, bcrypt, multer, cookie-parser, dotenv, ImageKit SDK

#### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
touch .env
```

Add the following variables (replace with your actual values):

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/spotify-clone
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spotify-clone

# Note: Replace 'spotify-clone' with your preferred database name

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# ImageKit Configuration
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

**⚠️ Important Notes:**
- The code expects `MONGO_URI` (not `MONGODB_URI` as might be expected)
- Never commit `.env` file to version control
- JWT_SECRET should be at least 32 characters for security
- Get ImageKit credentials from your [ImageKit Dashboard](https://imagekit.io/dashboard)

#### 4. Start MongoDB (if running locally)
```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

For MongoDB Atlas, ensure your IP is whitelisted in Network Access settings.

#### 5. Run the Development Server
```bash
npm run dev
```

Expected output:
```
DB connected
server is running
```

Server will be available at: **http://localhost:3000**

#### 6. Verify Installation

Test the base endpoint:
```bash
curl http://localhost:3000/
```

Expected response:
```json
"welcome to spotify"
```

---

### Testing API Endpoints

You can test the API using:
- **Postman** (import endpoints from documentation)
- **cURL** (command-line testing)
- **Thunder Client** (VS Code extension)
- **Frontend application** (if available)

Example registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testartist",
    "email": "artist@example.com",
    "password": "securepassword123",
    "role": "artist"
  }'
```

---

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon (auto-restart on file changes) |
| `npm test` | Run tests (not currently implemented) |
| `node server.js` | Start production server without auto-restart |

---

### Troubleshooting

**Database Connection Failed:**
- Verify MongoDB is running: `mongosh` or `mongo`
- Check `MONGO_URI` in `.env` matches your MongoDB setup
- For Atlas: Verify IP whitelist and credentials

**"Unauthorized" on Protected Routes:**
- Ensure you're sending JWT cookie from login/register
- Check cookie is named "token"
- Verify JWT_SECRET matches between operations

**File Upload Fails:**
- Confirm ImageKit credentials are correct
- Check `IMAGEKIT_PRIVATE_KEY` in `.env`
- Verify ImageKit account is active

**Module Not Found Errors:**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 🎯 Key Concepts for Interviews

### 1. Authentication vs Authorization
**Clearly Distinguish These Concepts:**

| Aspect | Authentication | Authorization |
|--------|---------------|---------------|
| **Definition** | Verifying WHO the user is | Verifying WHAT the user can access |
| **Question** | "Are you who you claim to be?" | "Are you allowed to do this?" |
| **In This Project** | JWT token verification in middleware | Role checking (artist vs user) |
| **Implementation** | `jwt.verify(token, secret)` | `if (decoded.role !== 'artist')` |
| **Error Code** | 401 Unauthorized | 403 Forbidden |
| **Example** | Login with username/password | Artist creating music, user browsing |

**Interview Explanation:**
> "Authentication happens first - we verify the JWT token to identify the user. Then authorization checks if that authenticated user has permission for the requested action. For example, both artists and users are authenticated, but only artists are authorized to upload music."

---

### 2. JWT (JSON Web Tokens)

**Structure:**
```
Header.Payload.Signature
```

**Example Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NGYxMmFiYzEyMzQ1Njc4OWFiY2RlZiIsInJvbGUiOiJhcnRpc3QifQ.signature_here
```

**Components in This Application:**
- **Header**: Algorithm (HS256) and token type
- **Payload**: `{ id: "userId", role: "artist|user" }` - User identification and role
- **Signature**: HMAC with SHA-256 using `process.env.JWT_SECRET`

**Why JWT Over Sessions?**
1. **Stateless**: Server doesn't store session data, improving scalability
2. **Distributed Systems**: Works across multiple servers without shared session store
3. **Mobile-Friendly**: Easy to store and send with each request
4. **Self-Contained**: All user info in token, no database lookup needed

**Security Considerations:**
- Stored in HTTP-only cookies (not accessible via JavaScript → prevents XSS)
- Signed with secret key (tampering is detectable)
- **Vulnerability**: If JWT is compromised, it's valid until expiration (no expiration set in current implementation - potential issue)
- **Best Practice**: Should implement token expiration and refresh tokens

---

### 3. Password Security with bcrypt

**How bcrypt Works:**
```javascript
// Registration
const salt = await bcrypt.genSalt(10);  // Generate random salt
const hash = await bcrypt.hash(password, salt);  // Hash password with salt
// Stores: $2b$10$randomsalt...hashedpassword

// Login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
// Returns true if passwords match
```

**Security Features:**
1. **Salting**: Random data added to password before hashing (prevents rainbow table attacks)
2. **Cost Factor** (10 rounds): Computationally expensive to slow down brute-force attacks
3. **One-Way Function**: Cannot reverse hash to get original password
4. **Unique Hashes**: Same password produces different hashes due to random salt

**Interview Question Answer:**
> "bcrypt uses 10 salt rounds, meaning the hashing algorithm runs 2^10 (1024) iterations. This makes brute-forcing computationally expensive. Each user gets a unique salt, so identical passwords have different hashes, preventing attackers from detecting password reuse across accounts."

---

### 4. Middleware Pattern in Express

**Function Signature:**
```javascript
function middleware(req, res, next) {
  // Process request
  // Modify req/res objects
  // Call next() to continue, or send response to terminate
}
```

**Middleware Chain in This Project:**
```
Request
   ↓
express.json()        // Parse JSON body
   ↓
cookieParser()        // Extract cookies
   ↓
authArtist/authUser   // Verify JWT & check role
   ↓
Controller            // Business logic
   ↓
Response
```

**Key Concepts:**
- **Order Matters**: Middleware executes in the order it's added
- **next()**: Passes control to the next middleware/route handler
- **Early Termination**: Sending response (res.json, res.status) stops the chain
- **Request Modification**: Middleware can add data to `req` object (e.g., `req.user`)

**Types of Middleware in Project:**
1. **Application-Level**: `app.use(express.json())`
2. **Router-Level**: Applied to specific route groups
3. **Route-Specific**: `router.post('/createmusic', authArtist, controller)`
4. **Third-Party**: multer, cookieParser

---

### 5. MongoDB References & Population

**Reference vs Embedding:**

| Approach | When to Use | Example |
|----------|------------|---------|
| **Embedding** | Small, tightly coupled data that doesn't change often | User address |
| **Referencing** | Large or frequently updated data, many-to-many relationships | Artist in Music |

**How References Work:**
```javascript
// Stored in Database
{
  _id: "music123",
  title: "Song Name",
  artist: "user456"  // Just the ObjectId
}

// After Population
{
  _id: "music123",
  title: "Song Name",
  artist: {           // Full document
    _id: "user456",
    username: "ArtistName",
    email: "artist@example.com"
  }
}
```

**Population Syntax:**
```javascript
// Basic population
await Music.find().populate('artist')

// Select specific fields (more efficient)
await Music.find().populate('artist', 'username email')

// Multiple populations
await Album.find()
  .populate('artist', 'username')
  .populate('musics')
```

**Performance Considerations:**
- Population requires additional database queries (like SQL JOIN)
- Select only needed fields to reduce data transfer
- Consider denormalization for frequently accessed data
- Use lean queries for read-only operations

---

### 6. File Upload Flow

**Complete Upload Pipeline:**

```
1. Client                           2. Multer Middleware
   [HTML Form]                         [Memory Storage]
   enctype="multipart/form-data"       stores buffer in RAM
          │                                    │
          ▼                                    ▼
   ┌─────────────┐                    ┌─────────────┐
   │  File Data  │ ─── HTTP POST ───> │ req.file    │
   │  + metadata │                    │  .buffer    │
   └─────────────┘                    └──────┬──────┘
                                             │
                                             ▼
3. Controller                        4. Storage Service
   [Base64 Conversion]                 [ImageKit Upload]
          │                                    │
          ▼                                    ▼
   file.buffer.toString('base64')     uploadFile(base64)
          │                                    │
          └──────── sends to ─────────────────┘
                                             │
                                             ▼
5. ImageKit CDN                      6. Database
   [Cloud Storage]                     [Store URL]
          │                                    │
          ▼                                    ▼
   Returns URL                         music.uri = cdnUrl
   https://ik.imagekit.io/...         Save to MongoDB
```

**Why Memory Storage?**
- **Pros**: Fast, no disk I/O, easy cleanup
- **Cons**: RAM usage, not suitable for very large files or high traffic
- **Alternative**: Disk storage (`multer.diskStorage()`) for production

**Interview Answer:**
> "We use memory storage because files are immediately uploaded to cloud. The buffer stays in RAM briefly during the upload process, then gets garbage collected. For production at scale, we'd implement streaming uploads or disk storage to prevent memory exhaustion."

---

### 7. RESTful API Design Principles

**REST Constraints Applied in This Project:**

| Principle | Implementation |
|-----------|----------------|
| **Client-Server** | Frontend and backend are separate; communication via HTTP |
| **Stateless** | Each request contains all needed info (JWT in cookie); no server-side session |
| **Uniform Interface** | Resource-based URLs (`/api/music`, `/api/auth`); standard HTTP methods |
| **Cacheable** | Responses can be cached (especially GET requests for albums/music) |

**HTTP Methods & Semantics:**

| Method | Usage | Idempotent? | In This Project |
|--------|-------|-------------|-----------------|
| **GET** | Retrieve resources | Yes | Fetch music, albums |
| **POST** | Create new resources | No | Register, login, upload music |
| **PUT** | Replace entire resource | Yes | Not implemented |
| **PATCH** | Partial update | No | Not implemented |
| **DELETE** | Remove resource | Yes | Not implemented |

**Status Codes Used:**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET requests, login, logout |
| 201 | Created | Successful resource creation (music, album, user) |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions (wrong role) |
| 409 | Conflict | Resource already exists (username/email taken) |
| 500 | Server Error | Database errors, unexpected failures |

**Missing but Should Implement:**
- 400 Bad Request (invalid input)
- 404 Not Found (resource doesn't exist)
- 422 Unprocessable Entity (validation errors)

---

### 8. Environment Variables Best Practices

**What to Store in .env:**
```env
# Database
MONGO_URI=mongodb://localhost:27017/spotify-clone

# Authentication
JWT_SECRET=min_32_char_random_string_xyz123abc456def789

# Third-Party Services
IMAGEKIT_PRIVATE_KEY=private_xyz123abc
IMAGEKIT_PUBLIC_KEY=public_abc789xyz
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourId
```

**Why Environment Variables?**
1. **Security**: Keeps secrets out of source code and version control
2. **Flexibility**: Different configs for dev/staging/prod without code changes
3. **Separation of Concerns**: Config separate from application logic
4. **12-Factor App**: Industry standard for modern cloud applications

**Security Rules:**
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong, random values for secrets
- ✅ Document required variables in README
- ✅ Provide `.env.example` template (without real values)
- ❌ Never commit `.env` to Git
- ❌ Never hardcode secrets in source code
- ❌ Never expose secrets in error messages or logs

**Production Deployment:**
- Use platform environment variable management (Heroku Config Vars, AWS Systems Manager, etc.)
- Consider secret management services (AWS Secrets Manager, HashiCorp Vault)
- Implement secret rotation policies

---

### 9. Error Handling Patterns

**Current Implementation Analysis:**

**Good Practices:**
- Try-catch blocks in async functions
- Appropriate HTTP status codes
- Meaningful error messages

**Areas for Improvement:**
```javascript
// Current (Basic)
try {
  // database operation
} catch (err) {
  console.log(err);
  res.status(500).json({ message: "Error creating music" });
}

// Better (Detailed)
try {
  // database operation
} catch (err) {
  console.error('Music creation failed:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: err.errors 
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ 
      message: "Duplicate entry",
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
}
```

**Error Handling Levels:**
1. **Validation**: Check input before processing
2. **Try-Catch**: Wrap async operations
3. **Specific Error Types**: Handle different errors appropriately
4. **Global Error Handler**: Catch uncaught errors (not implemented)
5. **Logging**: Record errors for debugging

---

### 10. MongoDB Query Methods Used

**Complete Query Reference:**

| Method | Purpose | Example in Project |
|--------|---------|-------------------|
| `create()` | Insert new document | `musicModel.create({ uri, title, artist })` |
| `find()` | Fetch multiple documents | `musicModel.find()` - gets all music |
| `findOne()` | Fetch single document | `userModel.findOne({ username })` - find user by username |
| `findById()` | Fetch by ObjectId | `albumModel.findById(albumId)` - get specific album |
| `limit(n)` | Restrict results | `.limit(2)` - return only 2 music documents |
| `select()` | Choose fields | `.select('title artist')` - only return title and artist |
| `populate()` | Resolve references | `.populate('artist', 'username email')` - replace artist ID with document |
| `$or` | Logical OR operator | `{ $or: [{ username }, { email }] }` - find by username OR email |

**Query Chaining Example:**
```javascript
const albums = await albumModel
  .find()                              // Get all albums
  .select('title artist')              // Only title and artist fields
  .populate('artist', 'username email') // Replace artist ID with user data
  .limit(10)                           // Return first 10 results
  .sort({ createdAt: -1 });            // Newest first (not in project)
```

**Performance Optimization:**
- Use `.select()` to reduce data transfer
- Index frequently queried fields (username, email already indexed via unique constraint)
- Use `.lean()` for read-only operations (returns plain JS objects, not Mongoose documents)
- Implement pagination for large datasets (currently missing)

---

### 11. Middleware Implementation Details

**authArtist vs authUser - Critical Differences:**

```javascript
// authArtist
async function authArtist(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== 'artist') {
    return res.status(403).json({ message: "You don't have access" });
  }
  
  req.user = decoded;  // ✅ Sets req.user for controller access
  next();
}

// authUser
async function authUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== 'user') {
    return res.status(403).json({ 
      message: "You don't have access to fetch musics" 
    });
  }
  
  // ❌ Does NOT set req.user - inconsistency
  next();
}
```

**Interview Question:**
> "Why does `authArtist` set `req.user` but `authUser` doesn't?"

**Answer:**
> "This appears to be an implementation inconsistency. The artist middleware sets `req.user` because controllers need the artist's ID to associate uploaded music with the correct user. The user middleware should ideally also set `req.user` for consistency and potential future features like user-specific playlists. This is a technical debt that should be addressed."

---

### 12. Cloud Storage vs Local Storage

**Why ImageKit Over Local Filesystem?**

| Factor | Local Storage | Cloud Storage (ImageKit) |
|--------|---------------|-------------------------|
| **Scalability** | Limited by server disk | Unlimited (within plan limits) |
| **Performance** | Server bandwidth bottleneck | CDN with geographic distribution |
| **Cost** | Server storage + bandwidth costs | Pay-per-use, often cheaper |
| **Backup** | Manual backup needed | Automatic redundancy |
| **Server Load** | Server serves files directly | CDN offloads traffic |
| **Portability** | Tied to specific server | Works with any backend |

**ImageKit Advantages:**
- Automatic image/video optimization
- On-the-fly transformations
- CDN caching reduces latency
- Built-in analytics and monitoring

**Trade-offs:**
- Vendor lock-in (migration requires code changes)
- Internet dependency (uploads fail if connection lost)
- Ongoing costs (vs one-time storage costs)

---

---

## 📝 Additional Interview Topics

### Potential Interview Questions & Answers

#### **1. Why use JWT over session-based authentication?**
**Answer:** "JWT is stateless - the server doesn't need to store session data, which improves horizontal scalability across multiple servers. Each request is self-contained with all necessary authentication information. This is ideal for microservices and mobile applications. However, the trade-off is that JWTs can't be invalidated before expiration without additional infrastructure like a token blacklist."

#### **2. How does bcrypt ensure password security?**
**Answer:** "bcrypt combines salting and hashing with a configurable cost factor. The salt (random data) prevents rainbow table attacks by ensuring identical passwords produce different hashes. The cost factor (10 rounds in our app) makes each hash computation intentionally slow - taking ~100ms - which makes brute-force attacks computationally infeasible. The algorithm automatically stores the salt with the hash, so no separate storage is needed."

#### **3. Explain the difference between `ref` and embedding in MongoDB**
**Answer:** "References store only the ObjectId of related documents, requiring population to fetch full data - similar to foreign keys in SQL. Embedding stores the complete document within the parent. We use references for artists in music because: (1) artist data can be updated independently, (2) prevents data duplication, (3) one artist can have many songs without repeating artist data. The trade-off is that references require additional queries (joins), making them slightly slower than embedding."

#### **4. What happens if a JWT is compromised?**
**Answer:** "A compromised JWT remains valid until expiration. Without an expiration time (which our implementation lacks), it's valid indefinitely - a critical security issue. Best practices include: (1) setting short expiration times (15-30 minutes), (2) implementing refresh tokens for long-term sessions, (3) storing JWTs in HTTP-only cookies to prevent XSS, and (4) using HTTPS to prevent man-in-the-middle attacks. For high-security applications, implement a token blacklist in Redis."

#### **5. How would you implement refresh tokens?**
**Answer:** "I'd implement a dual-token system: (1) Access Token with short expiration (15 min) for API requests, (2) Refresh Token with long expiration (7 days) stored securely. When access token expires, client sends refresh token to `/auth/refresh` endpoint. Server validates refresh token against database (stored with user), generates new access token, and optionally rotates refresh token. This allows session revocation while maintaining good UX."

#### **6. What's the difference between authentication middleware for artists and users?**
**Answer:** "Both middleware functions verify the JWT token, but they check for different roles. However, there's an inconsistency: `authArtist` sets `req.user = decoded` to make user data available to controllers, while `authUser` doesn't set this property. This is likely an oversight. Artist endpoints need `req.user.id` to associate uploaded music with the correct artist. Ideally, both should set `req.user` for consistency."

#### **7. Why store files on cloud storage instead of server filesystem?**
**Answer:** "Cloud storage offers several advantages: (1) Scalability - server disk space is limited, cloud is unlimited, (2) Performance - CDN provides geographic distribution and caching, reducing latency and server load, (3) Reliability - automatic redundancy and backups, (4) Cost - pay-per-use is often cheaper than maintaining storage infrastructure, (5) Portability - if we migrate servers or scale horizontally, files remain accessible. The trade-off is vendor dependency and ongoing costs."

#### **8. How would you implement pagination for music list?**
**Answer:** "I'd implement cursor-based pagination using MongoDB's `_id` field. The endpoint would accept `limit` (items per page) and `cursor` (last item's ID) query parameters. Query: `Music.find({ _id: { $gt: cursor } }).limit(limit)`. This is more efficient than offset-based pagination (`skip()`) for large datasets because it uses indexes. I'd also return metadata: `{ data: [...], nextCursor: lastId, hasMore: boolean }`."

#### **9. Explain the MVC architecture in this application**
**Answer:** "Our implementation follows MVC with a service layer: **Models** define data structure using Mongoose schemas (User, Music, Album) with validation and relationships. **Controllers** contain business logic - they receive requests, interact with models and services, and format responses. **Routes** map HTTP endpoints to controllers and apply middleware. We don't have Views since this is an API returning JSON. The **Service layer** (storage.service) encapsulates external APIs like ImageKit, keeping controllers focused and testable."

#### **10. How would you handle concurrent music uploads?**
**Answer:** "Several approaches: (1) **Queue System** - Use Bull/BullMQ with Redis to queue uploads, processing them with worker processes. This prevents memory exhaustion and enables retry logic. (2) **Streaming** - Replace memory storage with streaming uploads to ImageKit, reducing RAM usage. (3) **Rate Limiting** - Implement per-user rate limits to prevent abuse. (4) **Transaction Locks** - If tracking upload quotas, use MongoDB transactions to prevent race conditions. For production, I'd use a combination of streaming uploads and a queue system with monitoring."

---

## ⚠️ Known Limitations & Technical Debt

### Current Implementation Issues

#### 1. **Music List Limited to 2 Results**
**Location:** `music.controller.js` - `getAllMusics()`
```javascript
const musics = await musicModel.find().limit(2)  // ⚠️ Hardcoded limit
```
**Impact:** Users can only see first 2 songs regardless of how many exist  
**Fix:** Remove `.limit(2)` or implement proper pagination  
**Likely Cause:** Debug code left in production

#### 2. **No JWT Expiration**
**Location:** `auth.controller.js` - `registerUser()` and `loginUser()`
```javascript
jwt.sign({ id, role }, process.env.JWT_SECRET)  // ⚠️ No expiration
```
**Impact:** Tokens valid indefinitely; compromised tokens can't be invalidated  
**Fix:** Add expiration: `jwt.sign(payload, secret, { expiresIn: '15m' })`  
**Security Risk:** High

#### 3. **Inconsistent Middleware Behavior**
**Location:** `auth.middleware.js`
- `authArtist` sets `req.user = decoded` ✅
- `authUser` does NOT set `req.user` ❌

**Impact:** Controllers can't access user data for user-protected routes  
**Fix:** Add `req.user = decoded;` in `authUser` before `next()`

#### 4. **Public Album Listing**
**Location:** `music.routes.js`
```javascript
router.get('/albums', musicController.getAllAlbums);  // ⚠️ No middleware
```
**Impact:** Anyone can view all albums without authentication  
**Fix:** Add `authUser` middleware if listing should be protected  
**Note:** May be intentional for public discovery

#### 5. **Album Music Not Populated**
**Location:** `music.controller.js` - `getAlbumById()`
```javascript
const album = await albumModel.findById(albumId);  // ⚠️ Musics not populated
```
**Impact:** Album details return music ObjectIds, not actual music data  
**Fix:** Add `.populate('musics')` or `.populate('musics', 'title uri')`

#### 6. **No Input Validation**
**Impact:** Invalid data can cause server errors or security issues  
**Missing Validation:**
- Email format validation
- Password strength requirements
- File type/size restrictions
- ObjectId format validation

**Fix:** Implement validation library (Joi, express-validator, Zod)

#### 7. **Memory-Based File Storage**
**Location:** `music.routes.js` - `multer.memoryStorage()`  
**Impact:** Large files or concurrent uploads can exhaust server RAM  
**Fix:** For production, use streaming uploads or disk storage with cleanup

#### 8. **Missing Error Handling**
- No global error handler middleware
- Doesn't differentiate between error types (validation, database, auth)
- Incomplete status code usage (no 404, 400, 422)
- No logging system for production debugging

#### 9. **Security Vulnerabilities**
- No rate limiting (vulnerable to brute force)
- No CORS configuration (may cause frontend issues)
- No helmet.js for security headers
- Environment variable not validated on startup
- No HTTPS enforcement

#### 10. **Missing Production Features**
- No logging (Winston, Morgan)
- No monitoring/health check endpoints
- No automated tests
- No API documentation (Swagger/OpenAPI)
- No database migration system
- No graceful shutdown handling

---

## 🚀 Recommended Enhancements

### High Priority (Security & Functionality)

1. **Add JWT Expiration & Refresh Tokens**
   ```javascript
   // Access token: 15 minutes
   const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
   
   // Refresh token: 7 days, stored in database
   const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
   ```

2. **Implement Input Validation**
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   router.post('/register', [
     body('email').isEmail(),
     body('password').isLength({ min: 8 }),
   ], controller.registerUser);
   ```

3. **Fix Known Bugs**
   - Remove `.limit(2)` from `getAllMusics()`
   - Set `req.user` in `authUser` middleware
   - Populate musics in `getAlbumById()`

4. **Add Security Middleware**
   ```javascript
   const helmet = require('helmet');
   const rateLimit = require('express-rate-limit');
   
   app.use(helmet());
   app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 5 }));
   ```

### Medium Priority (User Experience)

5. **Implement Pagination**
   ```javascript
   router.get('/music', async (req, res) => {
     const { limit = 20, cursor } = req.query;
     const query = cursor ? { _id: { $gt: cursor } } : {};
     const musics = await Music.find(query).limit(limit);
   });
   ```

6. **Add Search & Filtering**
   - Search music by title/artist
   - Filter albums by genre
   - Sort options (newest, popular, alphabetical)

7. **Implement Playlists**
   - User-created playlists
   - Many-to-many relationship with music
   - Public/private playlist options

8. **Add Music Metadata**
   - Duration, genre, release date
   - Album artwork
   - Play count, likes

### Low Priority (Developer Experience)

9. **Add Testing**
   ```javascript
   // Unit tests with Jest
   // Integration tests with Supertest
   // E2E tests with Cypress
   ```

10. **API Documentation**
    - Swagger/OpenAPI specification
    - Interactive API explorer
    - Request/response examples

11. **Logging & Monitoring**
    ```javascript
    const winston = require('winston');
    const morgan = require('morgan');
    
    app.use(morgan('combined', { stream: winston.stream }));
    ```

12. **Database Optimization**
    - Add indexes for common queries
    - Implement aggregation pipelines
    - Use lean queries for read-only operations

---

## 📚 Learning Resources

### Official Documentation
- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [JWT.io](https://jwt.io/) - JSON Web Tokens
- [ImageKit Docs](https://docs.imagekit.io/) - Cloud storage

### Recommended Reading
- [12-Factor App](https://12factor.net/) - Modern app development principles
- [REST API Design](https://restfulapi.net/) - Best practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security vulnerabilities
- [MongoDB Performance](https://www.mongodb.com/docs/manual/administration/performance-tuning/) - Optimization guide

### Video Tutorials
- [Node.js Authentication](https://www.youtube.com/results?search_query=nodejs+jwt+authentication) - JWT implementation
- [MongoDB Relationships](https://www.youtube.com/results?search_query=mongodb+relationships) - References vs embedding
- [Express.js Middleware](https://www.youtube.com/results?search_query=express+middleware+tutorial) - Middleware patterns

---

## 📞 Development Commands

```bash
# Install all dependencies
npm install

# Start development server with auto-reload (nodemon)
npm run dev

# Start production server
node server.js

# Run tests (not implemented yet)
npm test

# Install development dependencies
npm install --save-dev jest supertest

# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit for security vulnerabilities
npm audit

# Fix security vulnerabilities automatically
npm audit fix
```

---

## 🎓 Interview Preparation Tips

### How to Present This Project

**Introduction (30 seconds):**
> "I built a Spotify-inspired backend API using Node.js, Express, and MongoDB. It implements JWT authentication, role-based authorization with artist and user roles, cloud file storage integration, and RESTful API design. The architecture follows MVC pattern with a service layer for external API integration."

**Technical Deep Dive (2-3 minutes):**
- **Authentication**: "I implemented stateless authentication using JWT tokens stored in HTTP-only cookies for XSS protection. Passwords are hashed with bcrypt using 10 salt rounds."
- **Authorization**: "Role-based access control separates artist capabilities (upload music, create albums) from user capabilities (browse and stream content) using Express middleware."
- **File Upload**: "Music files are uploaded through a pipeline: multer buffers in memory, converted to base64, then uploaded to ImageKit CDN for global distribution and fast streaming."
- **Database Design**: "I used MongoDB with Mongoose for schema validation. Implemented document references rather than embedding to maintain data normalization and handle one-to-many relationships between artists and their content."

**Challenges & Solutions:**
- **Challenge**: "Managing file uploads efficiently without exhausting server memory"
- **Solution**: "Used memory storage for quick uploads to cloud, with plans to implement streaming for production scale"

**Future Improvements:**
- "Add refresh token mechanism for better security"
- "Implement pagination for large music libraries"
- "Add comprehensive input validation and error handling"
- "Implement rate limiting to prevent abuse"

### Architecture Diagram to Draw

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│   Express Middleware Stack       │
│   1. JSON Parser                 │
│   2. Cookie Parser               │
│   3. Auth Middleware (JWT)       │
│   4. Multer (File Upload)        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   Controllers                    │
│   • Business Logic               │
│   • Request/Response Handling    │
└──────┬───────────────────────────┘
       │
       ├───────────┬────────────────┐
       ▼           ▼                ▼
   ┌───────┐  ┌─────────┐    ┌──────────┐
   │Models │  │ Services│    │  MongoDB │
   │(Schema│  │(ImageKit│    │          │
   │ & DB) │  │  Upload)│    │ Database │
   └───────┘  └────┬────┘    └──────────┘
                   │
                   ▼
            ┌─────────────┐
            │  ImageKit   │
            │  Cloud CDN  │
            └─────────────┘
```

---

**Built with ❤️ for learning and interview preparation**

*This documentation is comprehensive and technically accurate. Use it to understand the architecture, explain design decisions, and demonstrate full-stack expertise during technical interviews.*
