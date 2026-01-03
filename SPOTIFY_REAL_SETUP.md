# 🎵 Real Spotify Integration Setup Guide

This guide will help you set up **real** Spotify integration that fetches your actual listening history.

## 🎯 What This Does

- ✅ Fetches your **real** recently played tracks from Spotify
- ✅ Shows actual album artwork, track names, and artists
- ✅ Displays when each track was played
- ✅ **Automatically refreshes every 5 minutes** to show your latest listening activity
- ✅ Updates when you switch back to the page (visibility change)
- ✅ Falls back to placeholder data if API fails

## 🚀 Quick Setup (Using Netlify)

### Step 1: Get Your Spotify Credentials

1. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App"
   - Fill in:
     - **App name**: `Ashley's Portfolio`
     - **Description**: `Portfolio website with Spotify integration`
     - **Redirect URI**: `http://localhost:8888/.netlify/functions/callback` (for testing)
   - Click "Save"
   - Copy your **Client ID** and **Client Secret**

2. **Get Your Refresh Token**
   - Go to [spotify-refresh-token tool](https://alecchendev.github.io/spotify-refresh-token/)
   - Enter your **Client ID** and **Client Secret**
   - Click "Get Refresh Token"
   - Authorize with your Spotify account
   - Copy your **Refresh Token**

### Step 2: Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these three variables:
   - `SPOTIFY_CLIENT_ID` = Your Client ID
   - `SPOTIFY_CLIENT_SECRET` = Your Client Secret
   - `SPOTIFY_REFRESH_TOKEN` = Your Refresh Token

### Step 3: Update Your Code

1. **Update `spotify-integration.js`**
   - Replace `YOUR_SPOTIFY_CLIENT_ID` with your actual Client ID (optional, used for fallback)
   - The code is already set up to use the Netlify function

2. **Deploy to Netlify**
   - Push your code to GitHub
   - Netlify will automatically deploy
   - The functions will be available at `/.netlify/functions/spotify-data`

### Step 4: Test Locally (Optional)

For local testing with Netlify Dev:

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Create a .env file in your project root
echo "SPOTIFY_CLIENT_ID=your_client_id" > .env
echo "SPOTIFY_CLIENT_SECRET=your_client_secret" >> .env
echo "SPOTIFY_REFRESH_TOKEN=your_refresh_token" >> .env

# Run Netlify Dev
netlify dev
```

Then visit `http://localhost:8888` to test locally.

## 🔧 How It Works

1. **Frontend (`spotify-integration.js`)**
   - Loads on page load
   - Makes requests to `/.netlify/functions/spotify-data`
   - Displays the fetched data

2. **Backend (`netlify/functions/spotify-data.js`)**
   - Receives requests from frontend
   - Exchanges refresh token for access token (using client secret)
   - Fetches data from Spotify API
   - Returns data to frontend

3. **Security**
   - Client secret is stored in Netlify environment variables (never in code)
   - Refresh token is stored securely
   - Access tokens are refreshed automatically

## 🌐 Alternative: Using Vercel

If you're using Vercel instead of Netlify:

1. Create `api/spotify-data.js`:

```javascript
export default async function handler(req, res) {
  const { endpoint } = req.query;
  
  // Get credentials from environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  // Exchange refresh token for access token
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const tokenData = await tokenResponse.json();
  
  // Fetch Spotify data
  const dataResponse = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });

  const data = await dataResponse.json();
  res.json(data);
}
```

2. Update `spotify-integration.js` to use `/api/spotify-data` instead of `/.netlify/functions/spotify-data`

3. Add environment variables in Vercel dashboard

## 🎨 Customization

### Change Number of Tracks

In `spotify-integration.js`, modify the endpoint:
```javascript
const response = await fetch(`${this.apiBase}?endpoint=me/player/recently-played?limit=5`, ...);
```

### Customize Styling

The tracks use these CSS classes:
- `.track-card` - Individual track card
- `.track-image` - Album artwork
- `.track-name` - Track title
- `.track-artist` - Artist name
- `.played-time` - When the track was played
- `.spotify-link` - Link to Spotify

## 🐛 Troubleshooting

### "Failed to fetch" Error

- Check that your Netlify functions are deployed
- Verify environment variables are set correctly
- Check Netlify function logs in the dashboard

### "Missing Spotify credentials" Error

- Verify all three environment variables are set in Netlify
- Make sure variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

### No Data Showing

- Check browser console for errors
- Verify your refresh token is still valid
- Try getting a new refresh token if needed
- Check that the fallback placeholder data appears (means API call failed)

### CORS Errors

- The Netlify function includes CORS headers
- If you see CORS errors, check the function logs
- Make sure you're using the function endpoint, not calling Spotify API directly

## 📚 Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Refresh Token Tool](https://alecchendev.github.io/spotify-refresh-token/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## ✨ Result

After setup, your portfolio will automatically display:
- Your real recently played tracks (last 3)
- Actual album artwork from Spotify
- Real track names and artists
- Accurate timestamps
- Links to play tracks on Spotify

### Auto-Refresh Behavior

The data updates automatically:
- **Every 5 minutes** - Data refreshes automatically while the page is open
- **When you return** - If you switch tabs and come back, data refreshes immediately
- **On page load** - Fresh data is fetched when someone visits your portfolio

This means your portfolio always shows your latest listening activity! 🎵

