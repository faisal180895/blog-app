# Environment Variables Setup

This file documents all required environment variables for the Editorial Studio blog platform.

## Database
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/blog-platform?retryWrites=true&w=majority
```

## NextAuth Configuration
```
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

## Google OAuth (Optional)
For social login with Google:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## How to Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## How to Setup Google OAuth
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret

## Local Development
Create a `.env.local` file with the following variables:

```
DATABASE_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/blog-platform?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Production
For production deployment, ensure all environment variables are set in your hosting platform's configuration.
