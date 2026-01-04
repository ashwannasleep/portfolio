# Setting Up Custom Domain for Cloudflare Workers

## Option 1: Use Subdomain (Recommended)
Use a subdomain like `api.yourdomain.com` for the Worker.

### Step 1: Deploy Worker First
```bash
cd cloudflare/workers
wrangler deploy
```

### Step 2: Add Custom Domain in Cloudflare Dashboard
1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on your `apple-music-data` worker
3. Go to "Triggers" tab
4. Click "Add Custom Domain"
5. Enter: `api.yourdomain.com` (or any subdomain you prefer)
6. Cloudflare will automatically configure DNS

### Step 3: Update Frontend Code
In `apple-music-integration.js`, change:
```javascript
this.apiBase = 'https://api.yourdomain.com';
```

## Option 2: Use Path on Main Domain
Use a path like `yourdomain.com/api/apple-music` on your main domain.

### Step 1: Deploy Worker
```bash
cd cloudflare/workers
wrangler deploy
```

### Step 2: Add Route in wrangler.toml
Edit `cloudflare/workers/wrangler.toml`:
```toml
routes = ["yourdomain.com/api/apple-music/*"]
```

Then redeploy:
```bash
wrangler deploy
```

### Step 3: Update Frontend Code
In `apple-music-integration.js`, change:
```javascript
this.apiBase = 'https://yourdomain.com/api/apple-music';
```

## Which Option Should You Use?

- **Option 1 (Subdomain)**: Cleaner, easier to manage
- **Option 2 (Path)**: Keeps everything on one domain

Tell me your domain name and which option you prefer, and I'll update the code for you!

