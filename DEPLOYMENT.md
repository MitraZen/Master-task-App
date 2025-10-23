# Production Deployment Guide

## 🚀 Simple Task Tracker - Production Ready

This guide will help you deploy the Simple Task Tracker application to production.

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Supabase project created and configured
- [ ] Database schema deployed (`supabase-schema.sql`)
- [ ] Environment variables configured
- [ ] Domain name registered (optional)

### ✅ Code Quality
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] Bundle size optimized

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.production` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Database Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Deploy Database Schema**:
   ```sql
   -- Run the contents of supabase-schema.sql in your Supabase SQL editor
   ```

3. **Configure Row Level Security**:
   - Enable RLS on all tables
   - Set up appropriate policies for your use case

## 🏗️ Build Process

### Local Build Test
```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Test production build locally
npm run start
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**:
   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Configure Environment Variables**:
   - Add all required environment variables in Vercel dashboard

3. **Deploy**:
   - Vercel will automatically deploy on every push to main branch

### Option 2: Netlify

1. **Build Settings**:
   ```yaml
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**:
   - Add environment variables in Netlify dashboard

### Option 3: Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

## 🔒 Security Considerations

### Headers Configuration
The app includes security headers in `next.config.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Database Security
- Enable Row Level Security (RLS) on all tables
- Use service role key only on server-side
- Implement proper authentication if needed

## 📊 Monitoring & Analytics

### Error Tracking
The app includes error boundaries that can be integrated with:
- Sentry
- LogRocket
- Bugsnag

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- API response time monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚀 Performance Optimizations

### Implemented Optimizations
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ Bundle size optimization
- ✅ Compression enabled
- ✅ Offline functionality
- ✅ Local storage caching

### Additional Optimizations
- CDN for static assets
- Database query optimization
- Caching strategies
- Service worker for offline support

## 📱 PWA Features (Optional)

To make the app installable as a PWA:

1. Add `manifest.json`:
```json
{
  "name": "Simple Task Tracker",
  "short_name": "TaskTracker",
  "description": "A clean, minimal task tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. Add service worker for offline functionality

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports are correct
   - Ensure environment variables are set

2. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check database schema is deployed
   - Ensure RLS policies are configured

3. **Performance Issues**:
   - Run bundle analysis: `npm run analyze`
   - Check for large dependencies
   - Optimize images and assets

## 📞 Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify environment variables
3. Test locally with production build
4. Check database connectivity

## 🎉 Post-Deployment

After successful deployment:
- [ ] Test all functionality
- [ ] Verify database operations
- [ ] Check performance metrics
- [ ] Set up monitoring alerts
- [ ] Configure backup strategies

---

**Congratulations! Your Simple Task Tracker is now production-ready! 🚀**
