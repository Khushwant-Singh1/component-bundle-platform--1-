# BundleHub Backend Infrastructure

A comprehensive backend system for managing component bundles, built with Next.js 14, TypeScript, and Prisma.

## 🚀 Features

### Core Functionality
- **Bundle Management**: Complete CRUD operations for component bundles
- **User Authentication**: JWT-based authentication with role-based access control
- **Order Processing**: End-to-end order management with payment integration
- **Review System**: Customer reviews and ratings for bundles
- **Analytics Tracking**: Comprehensive analytics for page views, downloads, and sales
- **File Upload**: Secure file upload with validation and storage
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: Configurable rate limiting for API endpoints

### Security Features
- **Input Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Centralized error handling with custom error classes
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: XSS protection, content type validation, and more
- **Authentication Middleware**: Route-level authentication and authorization

### Performance Features
- **Database Optimization**: Efficient queries with proper indexing
- **Caching Strategy**: Response caching for improved performance
- **File Optimization**: Image upload with size and type validation
- **Transaction Management**: Database transactions for data integrity

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Bundles
- `GET /api/bundles` - List bundles with filtering and pagination
- `POST /api/bundles` - Create new bundle (Admin only)
- `GET /api/bundles/[id]` - Get bundle by ID
- `PUT /api/bundles/[id]` - Update bundle (Admin only)
- `DELETE /api/bundles/[id]` - Delete bundle (Admin only)
- `GET /api/bundles/search` - Search bundles

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (Admin only)
- `GET /api/orders/[id]` - Get order by ID

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review

### File Upload
- `POST /api/upload` - Upload files (Admin only)

### Analytics
- `GET /api/analytics` - Get analytics data (Admin only)

### Contact & Newsletter
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter` - Subscribe to newsletter

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Setup Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bundlehub-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Environment Configuration**
   Create a `.env.local` file with the following variables:
   \`\`\`env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/bundlehub"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # AWS S3 Configuration (for file uploads)
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-aws-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
   AWS_S3_BUCKET_NAME="your-s3-bucket-name"
   
   # File Upload (local fallback)
   UPLOAD_DIR="./public/uploads"
   MAX_FILE_SIZE=10485760  # 10MB
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=900000  # 15 minutes
   RATE_LIMIT_MAX=100
   
   # Cloudinary Configuration (for bundle images)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
   
   # Email (optional)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=587
   SMTP_USER="your-email@example.com"
   SMTP_PASS="your-email-password"
   
   # Payment (optional)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed database with sample data
   pnpm db:seed
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   pnpm dev
   \`\`\`

## 📁 Project Structure

\`\`\`
├── app/
│   └── api/                    # API routes
│       ├── bundles/           # Bundle management endpoints
│       ├── orders/            # Order management endpoints
│       ├── reviews/           # Review system endpoints
│       ├── upload/            # File upload endpoints
│       ├── analytics/         # Analytics endpoints
│       ├── contact/           # Contact form endpoints
│       └── newsletter/        # Newsletter endpoints
├── lib/
│   ├── auth.ts               # Authentication utilities
│   ├── validation.ts         # Zod validation schemas
│   ├── db.ts                 # Database connection
│   ├── errors.ts             # Error handling utilities
│   ├── rate-limit.ts         # Rate limiting utilities
│   ├── upload.ts             # File upload utilities
│   └── analytics.ts          # Analytics utilities
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.ts               # Database seeding script
├── middleware.ts             # Next.js middleware
└── types/                    # TypeScript type definitions
\`\`\`

## 🔧 Configuration

### AWS S3 Setup
For payment screenshot uploads, configure AWS S3 by following the detailed guide:
📋 **[AWS S3 Setup Guide](./AWS_S3_SETUP.md)**

Key benefits of using S3:
- Scalable cloud storage
- Better performance and reliability
- Automatic backups and versioning
- Cost-effective for large files

### Cloudinary Setup
For bundle image uploads, configure Cloudinary by following the guide:
📋 **[Cloudinary Setup Guide](./CLOUDINARY_SETUP.md)**

### Rate Limiting
Configure rate limiting in `lib/rate-limit.ts`:
\`\`\`typescript
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})
\`\`\`

### File Upload
Configure file upload settings in `lib/upload.ts`:
\`\`\`typescript
const defaultOptions: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  destination: 'public/uploads',
}
\`\`\`

### Database Schema
The database schema includes:
- **Users**: Authentication and user management
- **Bundles**: Component bundle information
- **Orders**: Purchase orders and items
- **Reviews**: Customer reviews and ratings
- **Analytics**: Page views and download tracking
- **Tags & Technologies**: Categorization system
- **Files**: Upload and media management

## 🚀 Deployment

### Production Build
\`\`\`bash
pnpm build
pnpm start
\`\`\`

### Docker Deployment
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-nextauth-secret"
\`\`\`

## 🧪 Testing

### Unit Tests
\`\`\`bash
pnpm test
\`\`\`

### API Testing
Use tools like Postman or curl to test API endpoints:
\`\`\`bash
# Get all bundles
curl -X GET "http://localhost:3000/api/bundles"

# Create bundle (requires authentication)
curl -X POST "http://localhost:3000/api/bundles" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Bundle", "slug": "test-bundle", ...}'
\`\`\`

## 📊 Monitoring

### Analytics Dashboard
Access analytics at `/api/analytics` (admin only):
- Page views and traffic sources
- Bundle performance metrics
- Order and revenue tracking
- User engagement statistics

### Error Monitoring
Errors are logged with context:
\`\`\`typescript
console.error('Error:', {
  message: error.message,
  stack: error.stack,
  userId: user?.id,
  endpoint: request.url,
  timestamp: new Date().toISOString(),
})
\`\`\`

## 🔐 Security

### Authentication Flow
1. User login generates JWT token
2. Token includes user ID and role
3. Protected routes verify token
4. Admin routes check user role

### Input Validation
All inputs are validated using Zod schemas:
\`\`\`typescript
const createBundleSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().min(0),
  // ... other fields
})
\`\`\`

### Error Handling
Custom error classes for different scenarios:
\`\`\`typescript
throw new ValidationError('Invalid input data')
throw new AuthenticationError('Login required')
throw new AuthorizationError('Admin access required')
\`\`\`

## 📈 Performance

### Database Optimization
- Proper indexing on frequently queried fields
- Efficient joins and query optimization
- Connection pooling for scalability

### Caching Strategy
- Response caching for static data
- Database query result caching
- File upload caching

### Rate Limiting
- Configurable rate limits per endpoint
- IP-based and user-based limiting
- Graceful degradation under load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@bundlehub.com
- Documentation: [docs.bundlehub.com](https://docs.bundlehub.com)
- Issues: [GitHub Issues](https://github.com/bundlehub/backend/issues)
