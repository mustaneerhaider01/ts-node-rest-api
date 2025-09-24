# Redis Implementation Guide

This project now includes Redis caching for posts data and JWT session management.

## Features Implemented

### 1. Redis Caching for Posts

- **All Posts**: Cached with key `posts:all` (1 hour TTL)
- **Single Post**: Cached with key `posts:{id}` (1 hour TTL)
- **Cache Invalidation**: Automatically invalidated on create/edit/delete operations

### 2. JWT Session Management

- **Session Storage**: Sessions stored in Redis with key `session:{userId}` (24 hours TTL)
- **Token Validation**: JWT tokens validated against Redis session data
- **Session Refresh**: Ability to refresh session expiration

### 3. Rate Limiting

- **Request Tracking**: Each user’s requests tracked in Redis with key `rate:{ip}`
- **Limit Enforcement**: Request count is incremented per API call and validated against a defined threshold (e.g., 100 requests per 15 minutes)
- **Automatic Reset**: Keys expire after the specified time window (TTL), automatically resetting the request count

### 4. Distributed Locking

- **Resource Locking**: Prevents concurrent post modifications using Redis keys `lock:post:{postId}`
- **Atomic Operations**: Uses Redis `SET` with `NX` and `PX` options for atomic lock acquisition
- **Automatic Expiry**: Locks automatically expire after timeout (e.g., 3 seconds) to prevent deadlocks
- **Conflict Handling**: Returns `409 Conflict` status when resources are already locked

### 5. Quick Search Index

- **Fast Post Search**: Maintain a Redis set of post titles for quick search functionality.
- **Simple Pattern Matching**: Use Redis commands for basic search operations.
- **Real-time Updates**: Keep the search index synchronized with post CRUD operations.
- **Performance Boost**: Avoid expensive `SQL LIKE` queries on SQLite by leveraging Redis.

## Environment Variables Required

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (requires authentication)
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `POST /api/auth/refresh` - Refresh session (requires authentication)

### Endpoints (with caching)

- `GET /api/posts/list` - Get all posts (cached)
- `GET /api/posts/:postId` - Get single post (cached)
- `POST /api/posts/create` - Create post (invalidates cache)
- `PUT /api/posts/:postId/edit` - Edit post (invalidates cache)
- `DELETE /api/posts/:postId/remove` - Delete post (invalidates cache)

### Endpoints (without caching)

- `Search /api/posts/search` - Search all posts (uncached)

## Usage Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

## Cache Strategy

1. **Read Operations**: Check cache first, fallback to database if cache miss
2. **Write Operations**: Update database first, then invalidate relevant cache entries
3. **Cache Keys**:
   - `posts:all` - All posts list
   - `posts:{id}` - Individual post
   - `session:{userId}` - User session data

## Redis Setup

### Using Docker

```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

### Using Homebrew (macOS)

```bash
brew install redis
brew services start redis
```

## Seeded Users

The database is initialized with the following test users:

- **Email**: `admin@example.com` | **Password**: `admin123`
- **Email**: `user@example.com` | **Password**: `user123`

## Testing the Implementation

1. Start Redis server
2. Set environment variables
3. Run the application: `npm run server`
4. Test endpoints with the provided examples

The caching will be transparent to the API consumers - responses will be faster on subsequent requests for the same data.
