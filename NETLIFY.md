# 🚀 Quick Netlify Deployment

## Files Added/Modified

- ✅ `netlify.toml` - Netlify configuration
- ✅ `public/_redirects` - SPA routing rules
- ✅ `package.json` - Added `build:netlify` script
- ✅ `DEPLOYMENT.md` - Complete deployment guide
- ✅ `server/index.ts` - Fixed Windows compatibility (removed `reusePort`)

## Deploy in 3 Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

- Go to [app.netlify.com](https://app.netlify.com)
- Click "Add new site" → "Import an existing project"
- Select your GitHub repo
- Netlify will auto-detect settings from `netlify.toml`

### 3. Deploy

- Click "Deploy site"
- Wait 2-3 minutes
- Your site is live! 🎉

## CLI Deployment (Alternative)

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Important Notes

⚠️ **This builds a static frontend only** - No backend/database included

**Backend Options:**

1. Use mock data (update code to remove API calls)
2. Deploy backend separately (Railway/Render/Heroku)
3. Use Netlify Functions for lightweight APIs

## Build Settings (Auto-configured)

- **Build command**: `npm run build:netlify`
- **Publish directory**: `dist/public`
- **Node version**: 20

## Test Build Locally

```bash
npm run build:netlify
npx serve dist/public
```

---

📖 **See `DEPLOYMENT.md` for full documentation**
