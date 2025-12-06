# Backend - FileLlama

A production-ready backend API built with Fastify, tRPC v11, PostgreSQL with pgvector, and Drizzle ORM.

## Technology Stack

- **Framework**: Fastify with TypeScript
- **API**: tRPC v11 (type-safe API with AppRouter export)
- **Database**: PostgreSQL 16 with pgvector extension
- **ORM**: Drizzle ORM with drizzle-kit
- **Authentication**: JWT-based (access + refresh tokens)
- **Password Hashing**: bcrypt
- **Testing**: Vitest
- **Dev Tools**: tsx for hot-reloading
- **Logging**: Pino with pretty printing in development
- **Security**: CORS, Helmet, Rate Limiting

## Features

- JWT-based authentication with access and refresh tokens
- User registration and login
- Vector embeddings storage with pgvector (1536 dimensions)
- Vector similarity search using cosine distance
- Type-safe tRPC API
- Production-ready security middleware
- Comprehensive error handling
- Docker support with multi-stage builds

## Prerequisites

- Node.js 20+
- pnpm
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 16 with pgvector extension (if running locally without Docker)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Install dependencies:

```bash
pnpm install
```

2. Start the services:

```bash
docker-compose up
```

This will:

- Start PostgreSQL with pgvector extension
- Run database migrations
- Start the backend server with hot-reloading

The backend will be available at `http://localhost:3000`

### Option 2: Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your database credentials.

3. Start PostgreSQL (ensure pgvector extension is installed):

```bash
# If using Docker for just the database:
docker run -d \
  --name filellama-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=filellama \
  -p 5432:5432 \
  ankane/pgvector:latest
```

4. Push the database schema:

```bash
pnpm db:push
```

5. Start the development server:

```bash
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start development server with hot-reloading
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm lint` - Lint code
- `pnpm db:generate` - Generate Drizzle migrations from schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database (dev)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

## Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `name` (String, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Refresh Tokens Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → Users)
- `token` (String, Unique)
- `expires_at` (Timestamp)
- `created_at` (Timestamp)

### Embeddings Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → Users)
- `content` (Text)
- `embedding` (Vector[1536])
- `metadata` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## API Routes

### Health Check

#### GET /health

Returns server health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67
}
```

### tRPC Endpoints

All tRPC endpoints are available at `/trpc/*`

#### health.hello

Hello world endpoint.

**Input:**

```typescript
{ name?: string }
```

**Output:**

```typescript
{
  message: string,
  timestamp: string
}
```

#### health.status

Server status endpoint.

**Output:**

```typescript
{
  status: "ok",
  uptime: number,
  timestamp: string
}
```

#### auth.register

Register a new user.

**Input:**

```typescript
{
  email: string,
  password: string,
  name?: string
}
```

**Output:**

```typescript
{
  user: {
    id: string,
    email: string,
    name?: string
  },
  accessToken: string,
  refreshToken: string
}
```

#### auth.login

Login with email and password.

**Input:**

```typescript
{
  email: string,
  password: string
}
```

**Output:**

```typescript
{
  user: {
    id: string,
    email: string,
    name?: string
  },
  accessToken: string,
  refreshToken: string
}
```

#### auth.refresh

Refresh access token using refresh token.

**Input:**

```typescript
{
  refreshToken: string;
}
```

**Output:**

```typescript
{
  accessToken: string,
  refreshToken: string
}
```

#### auth.me (Protected)

Get current user information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Output:**

```typescript
{
  id: string,
  email: string,
  name?: string
}
```

#### embeddings.create (Protected)

Create a new embedding.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Input:**

```typescript
{
  content: string,
  embedding: number[], // Array of 1536 numbers
  metadata?: string
}
```

**Output:**

```typescript
{
  id: string,
  content: string,
  metadata?: string,
  createdAt: Date
}
```

#### embeddings.search (Protected)

Search embeddings by vector similarity.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Input:**

```typescript
{
  embedding: number[], // Array of 1536 numbers
  limit?: number, // Default: 10, Max: 100
  threshold?: number // Optional similarity threshold (0-1)
}
```

**Output:**

```typescript
Array<{
  id: string;
  content: string;
  metadata?: string;
  createdAt: Date;
  similarity: number;
}>;
```

#### embeddings.getById (Protected)

Get embedding by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Input:**

```typescript
{
  id: string;
}
```

**Output:**

```typescript
{
  id: string,
  content: string,
  metadata?: string,
  createdAt: Date
}
```

#### embeddings.list (Protected)

List user's embeddings with pagination.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Input:**

```typescript
{
  limit?: number, // Default: 20, Max: 100
  offset?: number // Default: 0
}
```

**Output:**

```typescript
Array<{
  id: string;
  content: string;
  metadata?: string;
  createdAt: Date;
}>;
```

## Using the tRPC Client

### TypeScript Client Setup

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@manila/backend";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      headers() {
        const token = localStorage.getItem("accessToken");
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Usage
const result = await client.auth.login.mutate({
  email: "user@example.com",
  password: "password123",
});
```

### React Client Setup

```typescript
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@manila/backend";

export const trpc = createTRPCReact<AppRouter>();

// In your app setup
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      headers() {
        const token = localStorage.getItem("accessToken");
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

## Environment Variables

See `.env.example` for all available environment variables:

- `NODE_ENV` - Environment (development, production)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_ACCESS_EXPIRES_IN` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `RATE_LIMIT_MAX` - Max requests per time window (default: 100)
- `RATE_LIMIT_TIME_WINDOW` - Time window for rate limiting (default: 15m)

## Production Deployment

### Build Docker Image

```bash
docker build -t filellama-backend --target production .
```

### Run in Production

```bash
docker run -d \
  --name filellama-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_production_database_url \
  -e JWT_ACCESS_SECRET=your_access_secret \
  -e JWT_REFRESH_SECRET=your_refresh_secret \
  filellama-backend
```

## Testing

Run the test suite:

```bash
pnpm test
```

Run tests with UI:

```bash
pnpm test:ui
```

The test suite includes:

- Authentication flow tests (register, login, refresh)
- Password hashing and verification tests
- JWT token generation and verification tests
- Vector embedding utility tests
- Cosine similarity calculations

## Security Features

- **CORS**: Configured to only allow specified origins
- **Helmet**: Security headers middleware
- **Rate Limiting**: Prevents abuse with configurable limits
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Comprehensive error handling with proper status codes

## Database Migrations

Generate migrations from schema changes:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

For development, push schema directly:

```bash
pnpm db:push
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change the `PORT` environment variable in your `.env.development` file.

### Database Connection Errors

Ensure PostgreSQL is running and the `DATABASE_URL` is correct. If using Docker Compose, ensure the database service is healthy before starting the backend.

### pgvector Extension Missing

If you get errors about the vector type, ensure you're using the `ankane/pgvector` Docker image or have manually installed the pgvector extension in your PostgreSQL database.

## License

Private - Part of FileLlama monorepo
