# Deployment Guide

## Quick Fix for Current Error

The deployment failed because of missing environment variables or build issues. Here's how to fix it:

### 1. Set Environment Variables

In your deployment platform, set these environment variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
```

### 2. Build the Project Locally First

```bash
npm run build
```

This creates the `dist/` folder that's needed for deployment.

### 3. Platform-Specific Instructions

#### Vercel
- Uses `vercel.json` configuration
- Set environment variables in Vercel dashboard
- Redeploy after setting env vars

#### Railway
- Uses `railway.json` configuration  
- Set environment variables in Railway dashboard
- Automatic builds from Git

#### Render
- Uses `render.yaml` configuration
- Set environment variables in Render dashboard
- Build command: `npm install && npm run build`
- Start command: `npm start`

#### Netlify
- Uses `netlify.toml` configuration
- For serverless functions, move API to `netlify/functions/`

### 4. Common Issues & Solutions

**Error: "Cannot find module"**
- Run `npm run build` locally first
- Ensure all dependencies are in `dependencies`, not `devDependencies`

**Error: "Environment variable not found"**
- Set all required environment variables in your deployment platform
- Check `.env.example` for required variables

**Error: "Port already in use"**
- Use `process.env.PORT` in your code (already done)
- Don't hardcode port numbers

**Error: "Database connection failed"**
- Ensure MONGODB_URI is set correctly
- Use MongoDB Atlas for cloud deployment
- Whitelist deployment platform IPs in MongoDB Atlas

### 5. Test Deployment

After fixing, test these endpoints:
- `GET /api-docs` - Swagger documentation
- `POST /api/auth/register` - User registration
- `GET /api/categories` - Public endpoint

### 6. MongoDB Atlas Setup (if needed)

1. Create account at mongodb.com
2. Create new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Set as MONGODB_URI environment variable