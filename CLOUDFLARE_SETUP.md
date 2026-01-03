# Cloudflare Workers Setup for Apple Music Integration

## Overview
This guide will help you deploy the Apple Music integration to Cloudflare Workers so it works with your custom domain.

## Option 1: Simple Proxy (Recommended - Easiest)
Use Cloudflare Workers as a proxy to your existing Netlify Functions. This way:
- ✅ You keep using free Netlify Functions
- ✅ Your custom domain works
- ✅ No JWT complexity
- ✅ Very simple setup

## Option 2: Full Cloudflare Implementation
Deploy the full Apple Music API handler to Cloudflare Workers (more complex, requires JWT signing).

---

## Option 1: Simple Proxy Setup (Recommended)

## Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Your Apple Music credentials

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Update Proxy Code

Edit `cloudflare/workers/apple-music-proxy.js` and replace `YOUR_NETLIFY_SITE` with your actual Netlify site name (e.g., `aquamarine-snickerdoodle-d695b9`).

### Step 3: Login to Cloudflare

```bash
wrangler login
```

### Step 4: Create wrangler.toml

Create a file `wrangler.toml` in the `cloudflare/workers/` directory:

```toml
name = "apple-music-data"
main = "apple-music-data.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { }
```

### Step 5: Deploy the Worker

```bash
cd cloudflare/workers
wrangler deploy
```

### Step 6: Update Frontend Code

Update `apple-music-integration.js`:

```javascript
// Change from:
this.apiBase = '/.netlify/functions/apple-music-data';

// To your Cloudflare Worker URL:
this.apiBase = 'https://apple-music-data.YOUR_SUBDOMAIN.workers.dev';
```

**No secrets needed for the proxy option!** It just forwards requests to Netlify.

---

## Option 2: Full Cloudflare Implementation

### Step 1: Install Wrangler CLI

Set your Apple Music credentials as secrets:

```bash
wrangler secret put APPLE_TEAM_ID
# Enter: 7Z45F36LFG

wrangler secret put APPLE_KEY_ID
# Enter: M958PF4JKB

wrangler secret put APPLE_PRIVATE_KEY
# Paste your full .p8 key content (including BEGIN/END markers)

wrangler secret put APPLE_MEDIA_IDENTIFIER
# Enter: media.ashwannasleep.music
```

### Step 6: Update Your Frontend Code

Update `apple-music-integration.js` to use your Cloudflare Worker:

```javascript
// Change this line:
this.apiBase = '/.netlify/functions/apple-music-data';

// To your Cloudflare Worker URL:
this.apiBase = 'https://apple-music-data.YOUR_SUBDOMAIN.workers.dev';
// OR if you have a custom route:
this.apiBase = 'https://yourdomain.com/api/apple-music';
```

### Step 7: Set Up Custom Route (Optional)

If you want to use your custom domain:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to "Triggers" → "Custom Domains"
4. Add your domain route (e.g., `api.yourdomain.com`)

### Step 8: Update Frontend for Custom Domain

If using custom domain, update the API base:

```javascript
this.apiBase = 'https://api.yourdomain.com';
```

## Cloudflare Free Tier Limits

- **100,000 requests/day** (free tier)
- **CPU time: 10ms per request** (usually enough)
- **No bandwidth limits** for Workers

This is MORE generous than Netlify's free tier!

## Troubleshooting

### JWT Signing Issues
If you get JWT errors, the Web Crypto API implementation might need adjustment. The current code uses Web Crypto which should work, but if you encounter issues, we may need to use a different approach.

### CORS Issues
The worker already includes CORS headers. If you still see CORS errors, make sure your frontend domain is allowed.

## Cost
Cloudflare Workers free tier includes:
- 100,000 requests/day
- Unlimited bandwidth
- No charges unless you exceed limits

You're very unlikely to exceed these limits for a portfolio site!

