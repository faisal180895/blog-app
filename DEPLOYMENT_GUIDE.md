# 🚀 DEPLOYMENT & TESTING GUIDE

## ✅ PRE-DEPLOYMENT CHECKLIST

### Environment Variables
```bash
# Required - API Keys
GOOGLE_API_KEY=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://yourdomain.com

# Optional - Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Database
DATABASE_URL=mongodb+srv://...

# Cloudinary (for image uploads)
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Production Mode
NODE_ENV=production
```

### Pre-Deployment Tests

#### 1. Type Checking
```bash
# Check for TypeScript errors
npx tsc --noEmit
```

#### 2. Linting
```bash
# Check code quality
npm run lint
```

#### 3. Build Test
```bash
# Test production build
npm run build
```

#### 4. Unit Tests (Recommended)
```bash
# Create test file: __tests__/api-validation.test.ts
npm install --save-dev jest @testing-library/react

# Run tests
npm test
```

#### 5. Security Audit
```bash
# Check for vulnerable dependencies
npm audit
npm audit fix

# Security scan
npm install -g snyk
snyk test
```

---

## 🧪 MANUAL TESTING CHECKLIST

### Authentication Flow
- [ ] User can register with email/password
- [ ] Password is hashed (not visible in DB)
- [ ] User can sign in with correct credentials
- [ ] User cannot sign in with wrong password
- [ ] Sessions persist across page reloads
- [ ] User can sign out

### Post Management
- [ ] Create new post as author
- [ ] Edit own posts
- [ ] Cannot edit other users' posts
- [ ] Publish/unpublish posts
- [ ] Delete own posts
- [ ] Search functionality works
- [ ] Posts appear in public feed only when published

### Comments & Engagement
- [ ] Readers can comment on published posts
- [ ] Comments are visible to other readers
- [ ] Cannot comment without authentication
- [ ] Likes counter increments
- [ ] Cannot like same post twice (should unlike instead)

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Images load correctly
- [ ] Theme toggle works
- [ ] Error messages are helpful
- [ ] Loading states show correctly
- [ ] Form validation shows errors

### Error Handling
- [ ] Dashboard loads even with DB issues
- [ ] 404 page for non-existent posts
- [ ] Error boundary catches runtime errors
- [ ] API errors return proper status codes

### Performance
- [ ] Images load quickly (check DevTools)
- [ ] No console errors in production mode
- [ ] Page load time < 3 seconds
- [ ] Database queries are optimized

---

## 🔒 SECURITY TESTING

### Test Input Validation
```bash
# Test comment length limit
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "test",
    "text": "VERY_LONG_TEXT_HERE_REPEATED_1000_TIMES..."
  }'
# Should fail with 422 validation error

# Test XSS prevention
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "test",
    "text": "<script>alert(\"xss\")</script>"
  }'
# Comment text should be sanitized
```

### Test Error Messages
```bash
# Test that errors don't leak sensitive info
curl http://localhost:3000/api/posts/nonexistent

# In production, should get generic error
# In development, detailed error
```

### Test Rate Limiting
```bash
# Rapid-fire requests to same endpoint
for i in {1..100}; do
  curl http://localhost:3000/api/posts &
done
wait
# Should handle gracefully without crashing
```

---

## 📊 MONITORING SETUP

### Add Error Tracking (Sentry)
```bash
npm install @sentry/nextjs

# In next.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Add Analytics
```bash
# Use Vercel Analytics (if on Vercel)
npm install @vercel/analytics

# In app/layout.tsx
import { Analytics } from "@vercel/analytics/react"

// In JSX:
<Analytics />
```

### Add Performance Monitoring
```bash
# Use Web Vitals
npm install web-vitals

# In app/layout.tsx
import { reportWebVitals } from "next/web-vitals"

export function reportWebVitals(metric) {
  console.log(metric) // Send to analytics
}
```

---

## 🚀 DEPLOYMENT STEPS

### Deploy to Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Connect project
vercel link

# 3. Set environment variables
vercel env add GOOGLE_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
# ... add all required vars

# 4. Deploy
vercel deploy --prod
```

### Deploy to Other Platforms

#### AWS Amplify
```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

#### Railway
```bash
# Push to GitHub first
git push origin main

# Connect via railway.app
# Select repo → Deploy
```

#### Docker Deployment
```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t blog-app .
docker run -p 3000:3000 -e DATABASE_URL=xxx blog-app
```

---

## 📈 POST-DEPLOYMENT VERIFICATION

### Health Checks
```bash
# Check API endpoints
curl https://yourdomain.com/api/posts
curl https://yourdomain.com/api/comments

# Verify metadata
curl https://yourdomain.com/posts/slug \
  -H "Accept: text/html" | grep -i "meta"

# Check redirects
curl -I https://yourdomain.com/auth # Should redirect to /auth/signin
```

### Monitor Performance
```bash
# Use tools:
# 1. Google PageSpeed Insights
# 2. GTmetrix
# 3. Lighthouse (DevTools)
# 4. WebPageTest

# Monitor these metrics:
# - First Contentful Paint < 1.8s
# - Largest Contentful Paint < 2.5s
# - Cumulative Layout Shift < 0.1
# - Time to Interactive < 3.8s
```

### Monitor Errors
```bash
# Check server logs
vercel logs # For Vercel

# Check error tracking
# Visit Sentry dashboard for errors

# Database performance
# Check MongoDB Atlas metrics
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Weekly Tasks
- [ ] Check for failing tests
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Review dependency updates

### Monthly Tasks
- [ ] Security audit (`npm audit`)
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Database optimization

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Feature planning
- [ ] Architecture review
- [ ] Capacity planning

---

## 📋 ROLLBACK PLAN

If issues occur post-deployment:

### Quick Rollback (Vercel)
```bash
vercel rollback
```

### Manual Rollback
```bash
# 1. Connect to previous working version
git checkout <previous-commit-hash>

# 2. Redeploy
npm run build
vercel deploy --prod
```

### Database Recovery
```bash
# If data was corrupted, restore from backup
# MongoDB Atlas → Backups → Restore

# Never push changes without backup!
```

---

## 📞 SUPPORT RESOURCES

### Debugging Common Issues

**Issue: Dashboard shows 0 posts**
- Check database connection
- Verify PRISMA_DATABASE_URL is correct
- Check MongoDB Atlas network access

**Issue: AI generation returns error**
- Verify GOOGLE_API_KEY is set
- Check Google GenAI API quota
- Check request size limits

**Issue: Images don't load**
- Verify Cloudinary credentials
- Check image URLs in database
- Verify CORS settings

**Issue: Authentication fails**
- Verify NEXTAUTH_SECRET is set
- Clear browser cookies
- Check session duration

**Issue: High database load**
- Check for N+1 queries
- Review database indexes
- Check connection pool settings

---

## ✅ FINAL CHECKLIST

Before considering deployment complete:

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Backups automated
- [ ] SSL/HTTPS enabled
- [ ] DNS properly configured
- [ ] CDN enabled (if available)
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Security headers configured
- [ ] Caching strategy defined
- [ ] Documentation updated

---

## 🎉 DEPLOYMENT COMPLETE!

Your blog app is now:
- ✅ Production-ready
- ✅ Secure
- ✅ Fast
- ✅ Monitored
- ✅ Scalable

Monitor the application and iterate based on user feedback!
