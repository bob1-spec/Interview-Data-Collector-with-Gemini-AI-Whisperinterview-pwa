# Interview Data Collector - Deployment & Setup Guide

## Quick Start for Developers

### 1. Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Open browser to http://localhost:5173
```

### 2. Get Anthropic API Key

1. Sign up at https://console.anthropic.com
2. Create a new project
3. Generate an API key
4. Keep this key safe and secure

### 3. Enable AI Features in App

1. Start the dev server
2. Click "Create New Questionnaire"
3. Scroll to "Setup AI (Optional)"
4. Paste your Anthropic API Key
5. Click "Enable AI"

## Building for Production

### Development Build
```bash
npm run build
```

### Production Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Option 2: Netlify
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
```bash
# Update vite.config.ts with base: '/repo-name/'
npm run build
# Push dist folder to gh-pages branch
```

#### Option 4: Self-Hosted (Docker)
```bash
# Create Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]

# Build and run
docker build -t interview-collector .
docker run -p 3000:3000 interview-collector
```

## Environment Configuration

### Environment Variables
Create a `.env` file:

```env
# Optional - for Firebase sync feature
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
```

Note: API keys are stored locally in user's browser, not in environment variables.

## PWA Installation Instructions

### Prerequisites for PWA
- HTTPS enabled (required for production)
- manifest.json configured
- Service worker registered
- Icons provided (optional but recommended)

### Testing PWA Locally
```bash
# Build the app
npm run build

# Preview production build locally
npm run preview

# Test with http://localhost:4173
# Note: PWA features require HTTPS
```

### Enabling HTTPS Locally for Testing
```bash
# Using mkcert (recommended)
npm install -g mkcert

# Create certificate
mkcert localhost

# Configure in vite.config.ts
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
  },
})
```

## Performance Optimization

### Current Performance Features
- ✅ Code splitting with Vite
- ✅ Service worker caching
- ✅ Local storage (no server calls for data)
- ✅ Lazy loading
- ✅ Tree shaking

### Additional Optimization (Optional)
```bash
# Analyze bundle size
npm install --save-dev vite-plugin-visualizer

# Add to vite.config.ts and run build
# Then open dist/stats.html
```

## Testing

### Manual Testing Checklist
- [ ] Create questionnaire with 5+ fields
- [ ] Edit fields (title, description, field labels)
- [ ] Remove and add fields
- [ ] Fill form with text input
- [ ] Fill form with voice input (if supported)
- [ ] Use AI auto-fill
- [ ] Export to PDF
- [ ] Check conversation history
- [ ] Test offline mode
- [ ] Test PWA installation
- [ ] Test on mobile browser

### Unit Testing (Optional Setup)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add to vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
```

## Troubleshooting Deployment

### Issue: Service Worker Not Working
**Solution:**
- Ensure HTTPS is enabled
- Clear browser cache
- Check service worker registration in Console
- Verify manifest.json is accessible

### Issue: AI Features Timing Out
**Solution:**
- Check Anthropic API key is valid
- Verify API rate limits not exceeded
- Check network connectivity
- Look at browser Network tab for 401/403 errors

### Issue: PDF Export Not Working
**Solution:**
- Check browser console for errors
- Ensure html2canvas can access DOM
- Try with simpler form first
- Update jsPDF version if needed

### Issue: Voice Input Not Recognized
**Solution:**
- Check browser permission for microphone
- Use HTTPS (required for microphone access)
- Test with different browser
- Check browser console for errors

## Security Considerations

### For Production Deployment

1. **API Key Security**
   - Keys are stored in user's browser local storage
   - Never expose keys in code or environment
   - Consider implementing backend proxy for API calls
   - In the future: implement API gateway with auth

2. **Data Privacy**
   - All data is stored locally by default
   - Optional Firebase sync requires user consent
   - Never send user data to analytics without consent
   - GDPR compliant data handling

3. **CORS Configuration**
   - Service worker handles offline support
   - API calls need proper CORS headers
   - Test cross-origin requests before deployment

### Recommended Security Enhancements
```typescript
// Example: Backend API Proxy (optional)
// Create a backend endpoint that:
// 1. Validates user API key
// 2. Makes API call on user's behalf
// 3. Returns response to client
// This prevents exposing API keys in browser
```

## Monitoring & Analytics (Optional)

### Error Tracking
```bash
npm install --save @sentry/react
```

### Usage Analytics
```bash
npm install --save
 mixpanel-browser
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review error logs monthly
- [ ] Clear old cached data for users
- [ ] Test new features thoroughly before deployment

### Version Management
- Keep changelog updated
- Use semantic versioning (v1.0.0)
- Test major versions before releasing
- Provide migration guide for breaking changes

## Support & Documentation

### User Support
- Create FAQ section on website
- Provide video tutorials
- Setup email support
- Create community forum/Discord

### Developer Documentation
- Maintain this guide
- Add code comments
- Create architecture diagram
- Document API integrations

## Next Steps

1. ✅ Complete local development
2. ✅ Test all features
3. ✅ Optimize performance
4. ✅ Setup CI/CD pipeline
5. ✅ Deploy to staging
6. ✅ User acceptance testing
7. ✅ Deploy to production
8. ✅ Monitor and iterate

---

For questions or issues, please file an issue on GitHub or contact support.
