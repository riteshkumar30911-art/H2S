# EduRural STEM - Deployment Guide

## 🚀 Deployment Options

Choose the deployment method that works best for you:

### Option 1: Firebase Hosting (Recommended) ⭐
### Option 2: Netlify
### Option 3: Vercel
### Option 4: Custom Server

---

## 🔥 Option 1: Firebase Hosting (Recommended)

### Prerequisites
- Firebase project created
- Firebase CLI installed
- Node.js installed

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Hosting

In your project root:

```bash
firebase init hosting
```

When prompted:
- **Project:** Select your Firebase project
- **Directory:** Enter `.` (current directory) or `edurural-stem`
- **Single page app:** Select **Yes**
- **Overwrite index.html:** Select **No**

### Step 4: Configure firebase.json

Update `firebase.json`:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
}
```

### Step 5: Deploy

```bash
firebase deploy
```

Your app is now live at: `https://your-project-id.firebaseapp.com`

### Step 6: Custom Domain (Optional)

1. Firebase Console → Hosting → Connect domain
2. Follow domain verification steps
3. Setup DNS records

---

## 🌐 Option 2: Netlify

### Step 1: Prepare Code

Create a `.netlifyrc` file:

```toml
[build]
  command = ""
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/edurural-stem.git
git push -u origin main
```

### Step 3: Connect to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click **"New site from Git"**
3. Connect your GitHub account
4. Select repository
5. Click **"Deploy site"**

Your site is live!

---

## 🚀 Option 3: Vercel

### Step 1: Push to GitHub (if not done)

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy with Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **"New Project"**
3. Select GitHub repository
4. Click **"Import"**
5. Click **"Deploy"**

Your app is live at `your-project.vercel.app`

---

## 🖥️ Option 4: Custom Server (Apache/Nginx)

### Apache Setup

Create `.htaccess` in your root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### Nginx Setup

Create nginx config:

```nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  root /var/www/edurural-stem;
  index index.html;

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # HTML cache
  location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
  }

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Security headers
  add_header X-Frame-Options "DENY";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
  add_header Referrer-Policy "strict-origin-when-cross-origin";
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

### Code & Configuration
- [ ] Update Firebase credentials with production config
- [ ] Review all environment variables
- [ ] Remove console.log() statements
- [ ] Check for hardcoded test data
- [ ] Verify Service Worker paths are correct
- [ ] Update manifest.json URLs

### Security
- [ ] Update Firestore security rules
- [ ] Enable HTTPS
- [ ] Add security headers
- [ ] Configure CORS policies
- [ ] Enable Firebase authentication
- [ ] Review data privacy policies

### Performance
- [ ] Test app offline
- [ ] Verify caching strategy
- [ ] Check bundle sizes
- [ ] Run Lighthouse audit
- [ ] Test on slow network
- [ ] Optimize images

### Testing
- [ ] Test on mobile (iOS & Android)
- [ ] Test on different browsers
- [ ] Verify responsive design
- [ ] Test offline functionality
- [ ] Test all user flows
- [ ] Check API connections

### Analytics & Monitoring
- [ ] Setup Google Analytics
- [ ] Setup error logging
- [ ] Configure performance monitoring
- [ ] Setup backup system
- [ ] Document deployment process

---

## 🔍 Deployment Verification

After deployment, verify:

```bash
# Check if app loads
curl -i https://yourdomain.com

# Check security headers
curl -I https://yourdomain.com | grep -i "X-"

# Check service worker
curl https://yourdomain.com/sw.js

# Check manifest
curl https://yourdomain.com/manifest.json
```

Test the app:
1. Open in browser
2. Offline mode works
3. Quiz functionality works
4. Progress saves
5. Can install as app

---

## 📊 Performance Optimization

### Image Optimization
```bash
# Install ImageMagick
convert image.png -quality 80 -strip image-optimized.png

# Or use online tools
# - TinyPNG
# - ImageOptim
# - Squoosh
```

### Minification
```bash
# CSS
csso styles.css -o styles.min.css

# JavaScript
uglifyjs script.js -o script.min.js

# HTML
html-minifier index.html -o index.min.html
```

---

## 🆘 Troubleshooting Deployment

### Issue: "Cannot find module 'firebase'"
**Solution:** Firebase is not an npm package. Use the web SDK script or update imports.

### Issue: "Service Worker won't register"
**Solution:** 
- Check HTTPS is enabled
- Verify sw.js path is correct
- Clear browser cache

### Issue: "App shows blank page after deploy"
**Solution:**
- Check browser console for errors
- Verify all file paths are absolute (start with /)
- Check Firebase config

### Issue: "Custom domain not working"
**Solution:**
- Verify DNS records are set correctly
- Wait 24-48 hours for propagation
- Check domain verification

### Issue: "High Firebase costs"
**Solution:**
- Review Firestore usage
- Set up budget alerts
- Optimize database queries
- Consider read/write limits

---

## 📈 Post-Deployment Monitoring

### Monitor Performance
```javascript
// Add to js/ui.js
if (window.performance && window.performance.timing) {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page Load Time:', pageLoadTime, 'ms');
}
```

### Monitor Errors
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Error caught:', event.error);
  // Send to logging service
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});
```

### Monitor Offline Events
```javascript
window.addEventListener('offline', () => {
  console.log('Device went offline');
  // Track in analytics
});

window.addEventListener('online', () => {
  console.log('Device back online');
  // Track sync
});
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
```

Add to GitHub Secrets:
- Settings → Secrets → New repository secret
- Name: `FIREBASE_TOKEN`
- Value: Token from above

---

## 📞 Support Resources

- [Firebase Deployment](https://firebase.google.com/docs/hosting/deploying)
- [Netlify Deployment](https://docs.netlify.com)
- [Vercel Deployment](https://vercel.com/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Ready to Deploy!** Choose your platform and follow the steps above.
