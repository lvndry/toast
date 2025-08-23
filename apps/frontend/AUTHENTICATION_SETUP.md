# Authentication Setup Guide

This project uses Clerk for authentication. Follow these steps to set up authentication:

## 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Choose "Next.js" as your framework

## 2. Configure Environment Variables

The `.env.local` file has been created with placeholder values. Update it with your actual Clerk keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (optional - these are the defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/companies
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/companies
```

Replace the placeholder values with your actual Clerk keys from the dashboard.

## 3. Configure Clerk Settings

In your Clerk dashboard:

1. **Authentication Methods**: Enable the authentication methods you want (email, social logins, etc.)
2. **Redirect URLs**: Add your domain to the allowed redirect URLs
3. **Appearance**: Customize the appearance to match your app's design

## 4. Test the Implementation

1. Start the development server: `bun dev`
2. Visit the sign-in page: `http://localhost:3000/sign-in`
3. Test the sign-up flow: `http://localhost:3000/sign-up`
4. Verify that protected routes redirect to sign-in when not authenticated

## Features Implemented

- ✅ Sign-in and sign-up pages with Clerk components
- ✅ Protected routes (companies page)
- ✅ Dashboard layout with authentication checks
- ✅ User profile display
- ✅ Sign-out functionality
- ✅ Automatic redirects for unauthenticated users
- ✅ Loading states during authentication checks

## Protected Routes

The following routes require authentication:
- `/(dashboard)/*` - All dashboard routes (including companies)

Public routes:
- `/` - Home page (marketing)
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## Route Protection Implementation

The authentication is implemented using:

1. **Layout-level protection**: The dashboard layout checks authentication status
2. **Automatic redirects**: Unauthenticated users are automatically redirected to `/sign-in`
3. **Loading states**: Shows loading indicators while checking authentication status
4. **Clerk integration**: Uses Clerk's built-in authentication components and hooks

## File Structure

```
app/
├── (auth)/
│   ├── layout.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   └── companies/page.tsx
├── (marketing)/
│   └── page.tsx
├── layout.tsx
└── provider.tsx
```

## Next Steps

1. Replace the placeholder Clerk keys in `.env.local` with your actual keys
2. Customize the Clerk appearance to match your design
3. Add more protected routes as needed
4. Implement user profile management features
