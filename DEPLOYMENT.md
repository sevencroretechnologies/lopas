# Deploying PEB 3D Configurator to Netlify and Vercel

This guide explains how to deploy the PEB 3D Building Configurator to Netlify or Vercel. Both platforms require converting the Express backend to serverless functions.

## Important Notes

- This app uses a **fullstack architecture** (React frontend + Express backend)
- Both Netlify and Vercel run Express as **serverless functions**, not traditional servers
- Database connections require external PostgreSQL hosting (e.g., Neon, Supabase, Railway)

---

## Option 1: Deploy to Netlify

### Step 1: Install Required Package

```bash
npm install serverless-http
```

### Step 2: Create Netlify Functions Directory

Create the following file structure:

```
netlify/
└── functions/
    └── api.js
```

### Step 3: Create Serverless API Handler

Create `netlify/functions/api.js`:

```javascript
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import your routes (adjust paths as needed)
// const { registerRoutes } = require('../../server/routes');
// registerRoutes(app);

// Example routes - replace with your actual API routes
app.get('/.netlify/functions/api/templates', (req, res) => {
  res.json([
    { id: 1, type: 'single_slope', name: 'Single Slope' },
    { id: 2, type: 'rigid_frame', name: 'Rigid Frame' },
    { id: 3, type: 'lean_to', name: 'Building with Leans-to' }
  ]);
});

app.post('/.netlify/functions/api/quotes', (req, res) => {
  console.log('Quote received:', req.body);
  res.json({ success: true, message: 'Quote submitted successfully' });
});

// Add more routes as needed...

module.exports.handler = serverless(app);
```

### Step 4: Create netlify.toml

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 5: Update Frontend API Calls

Update API calls to use the `/api` prefix:

```javascript
// Before
fetch('http://localhost:5000/api/templates')

// After
fetch('/api/templates')
```

### Step 6: Deploy

**Via Netlify Dashboard:**
1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" > "Import from Git"
4. Select your repository
5. Verify settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables (DATABASE_URL, etc.)
7. Click "Deploy"

**Via CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 7: Add Environment Variables

In Netlify Dashboard:
1. Go to Site Settings > Environment Variables
2. Add your variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - Your session secret

---

## Option 2: Deploy to Vercel

### Step 1: Create API Directory

Create the following structure:

```
api/
└── index.js
```

### Step 2: Create Serverless API Handler

Create `api/index.js`:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// All routes must start with /api
app.get('/api', (req, res) => {
  res.json({ message: 'PEB Configurator API' });
});

app.get('/api/templates', (req, res) => {
  res.json([
    { id: 1, type: 'single_slope', name: 'Single Slope' },
    { id: 2, type: 'rigid_frame', name: 'Rigid Frame' },
    { id: 3, type: 'lean_to', name: 'Building with Leans-to' }
  ]);
});

app.post('/api/quotes', (req, res) => {
  console.log('Quote received:', req.body);
  res.json({ success: true, message: 'Quote submitted successfully' });
});

// Add more routes as needed...

// Export for Vercel serverless
module.exports = app;
```

### Step 3: Create vercel.json

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Update package.json

Add a build script if not present:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

### Step 5: Update vite.config.ts for Local Development

Add proxy configuration:

```typescript
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 6: Deploy

**Via Vercel Dashboard:**
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Click "Deploy"

**Via CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 7: Add Environment Variables

In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add your variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - Your session secret

---

## Database Hosting Options

Since both Netlify and Vercel use serverless functions, you need an external PostgreSQL database:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Neon](https://neon.tech) | 512 MB storage | Serverless, auto-scaling |
| [Supabase](https://supabase.com) | 500 MB storage | Includes auth, storage |
| [Railway](https://railway.app) | $5 credit/month | Easy setup |
| [PlanetScale](https://planetscale.com) | 5 GB storage | MySQL only |
| [ElephantSQL](https://elephantsql.com) | 20 MB storage | Basic PostgreSQL |

---

## Limitations

### Netlify Functions
- 10 second execution limit
- 128 MB memory default
- No WebSocket support
- Stateless (no persistent connections)

### Vercel Serverless
- 10 second limit (Hobby) / 60 seconds (Pro)
- 1024 MB memory default
- Limited WebSocket support
- Stateless

---

## Troubleshooting

### 404 on API Routes
- Ensure routes start with `/api`
- Check rewrite rules in config files
- Verify function file location

### CORS Errors
- Add `cors()` middleware
- Configure allowed origins for production

### Database Connection Issues
- Use connection pooling
- Set `ssl: { rejectUnauthorized: false }` for hosted databases
- Check environment variables are set

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Review build logs for specific errors

---

## Quick Comparison

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Free tier | Yes | Yes |
| Serverless functions | Yes | Yes |
| Edge functions | Yes | Yes |
| WebSocket support | No | Limited |
| Build minutes (free) | 300/month | 6000/month |
| Bandwidth (free) | 100 GB | 100 GB |

Both platforms work great for this application. Choose based on your preference and existing infrastructure.
