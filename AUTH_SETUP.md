# Auth.js Admin Panel Setup Guide

## 🎉 Setup Complete!

Your Auth.js admin panel is now fully configured and ready to use.

## 🚀 Quick Start

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Create Your First Admin User
Visit: `http://localhost:3000/setup`

**Default credentials (you can change these):**
- Email: `admin@bundlehub.com`
- Password: `admin123`
- Name: `Admin User`

### 3. Login to Admin Panel
After creating the admin user:
1. Visit: `http://localhost:3000/admin/login`
2. Use the credentials you just created
3. You'll be redirected to the admin dashboard

## 📁 What Was Created

### Authentication Files
- `lib/auth.ts` - Main NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `middleware.ts` - Route protection middleware
- `types/next-auth.d.ts` - TypeScript definitions

### Admin Pages
- `app/admin/login/page.tsx` - Admin login page
- `app/admin/layout.tsx` - Admin panel layout with sidebar
- `app/admin/page.tsx` - Admin dashboard
- `app/unauthorized/page.tsx` - Access denied page
- `app/setup/page.tsx` - Initial admin user creation

### Components
- `components/auth/signout-button.tsx` - Sign out functionality
- `components/providers/session-provider.tsx` - Session provider wrapper

### API Routes
- `app/api/admin/create/route.ts` - Admin user creation endpoint

## 🔧 Environment Variables

Make sure these are in your `.env` file:
```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Admin user creation defaults
ADMIN_EMAIL="admin@bundlehub.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin User"
```

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT session tokens
- ✅ Role-based access control (ADMIN/CUSTOMER)
- ✅ Protected routes via middleware
- ✅ Automatic redirects for unauthorized access
- ✅ CSRF protection (built into NextAuth)
- ✅ Security headers

## 🔐 Route Protection

The middleware automatically protects:
- `/admin/*` routes (requires ADMIN role)
- Redirects unauthenticated users to `/admin/login`
- Redirects non-admin users to `/unauthorized`

## 📊 Admin Dashboard Features

The admin dashboard includes:
- Revenue and sales statistics
- Recent orders overview
- Top performing bundles
- Recent customer reviews
- Quick action cards for common tasks

## 🎯 Next Steps

1. **Customize the admin dashboard** with your actual data
2. **Add more admin pages** (users, settings, etc.)
3. **Implement proper analytics** integration
4. **Add email notifications** for new orders
5. **Set up proper logging** and monitoring

## 🐛 Troubleshooting

### Common Issues

**"Authentication required" error:**
- Make sure you've created an admin user via `/setup`
- Check that your database is connected properly

**"Access denied" error:**
- Ensure the user has `ADMIN` role in the database
- Check that the session is properly configured

**Database connection issues:**
- Verify your `DATABASE_URL` is correct
- Run `npx prisma db push` to sync the schema

### Testing the Setup

1. Visit `http://localhost:3000/setup` - Should show admin creation form
2. Visit `http://localhost:3000/admin` - Should redirect to login
3. Visit `http://localhost:3000/admin/login` - Should show login form
4. After login - Should show admin dashboard

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set
4. Ensure the database schema is up to date

Happy coding! 🚀