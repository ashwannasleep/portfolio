# Quick Cloudflare Workers Deployment Guide

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Navigate to Workers Directory

```bash
cd cloudflare/workers
```

## Step 4: Set Your Secrets (Environment Variables)

Set your Apple Music credentials as Cloudflare secrets:

```bash
# Team ID
wrangler secret put APPLE_TEAM_ID
# When prompted, enter: 7Z45F36LFG

# Key ID
wrangler secret put APPLE_KEY_ID
# When prompted, enter: M958PF4JKB

# Private Key (paste the full .p8 file content)
wrangler secret put APPLE_PRIVATE_KEY
# When prompted, paste your full private key including:
# -----BEGIN PRIVATE KEY-----
# [content]
# -----END PRIVATE KEY-----

# Media Identifier
wrangler secret put APPLE_MEDIA_IDENTIFIER
# When prompted, enter: media.ashwannasleep.music
```

## Step 5: Deploy the Worker

```bash
wrangler deploy
```

After deployment, you'll see a URL like:
```
https://apple-music-data.YOUR_SUBDOMAIN.workers.dev
```

## Step 6: Update Frontend Code

Edit `apple-music-integration.js` and replace line 8:

```javascript
// Change from:
this.apiBase = 'https://apple-music-data.YOUR_SUBDOMAIN.workers.dev';

// To your actual Worker URL (from step 5):
this.apiBase = 'https://apple-music-data.abc123.workers.dev';
```

## Step 7: (Optional) Set Up Custom Domain

If you want to use your custom domain:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on your `apple-music-data` worker
3. Go to "Triggers" → "Custom Domains"
4. Add a route like: `api.yourdomain.com`
5. Update `apple-music-integration.js`:
   ```javascript
   this.apiBase = 'https://api.yourdomain.com';
   ```

## Troubleshooting

### JWT Signing Errors
The current implementation uses Web Crypto API. If you encounter JWT errors, we may need to use a different approach or library.

### Test the Worker
After deployment, test it:
```bash
curl "https://apple-music-data.YOUR_SUBDOMAIN.workers.dev?endpoint=catalog%2Fus%2Fplaylists%2Fpl.u-8aAVZ6qho0lEWVJ"
```

## Cloudflare Free Tier
- **100,000 requests/day** (very generous!)
- No bandwidth limits
- Perfect for a portfolio site

