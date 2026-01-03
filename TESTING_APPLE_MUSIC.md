# 🧪 Testing Apple Music Integration

## ✅ Deployment Complete!

Your site is deployed with all environment variables set. Now let's test it!

## 🧪 How to Test

### 1. Visit Your Site
- Go to your Netlify site URL
- Scroll to the "What I'm Listening To" section

### 2. What You Should See

**If working correctly:**
- First 3 tracks from your "Yuh" playlist
- Album artwork for each track
- Track names and artists
- "Listen on Apple Music" links
- Text showing "Track 1 from your playlist", etc.

**If not working:**
- Placeholder tracks (Fujii Kaze, Leon Thomas, BABYMONSTER)
- This means the API call failed

### 3. Check Browser Console

1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Go to "Console" tab
3. Look for any errors

**Common errors:**
- `Failed to fetch` - Function not deployed or CORS issue
- `Missing Apple Music credentials` - Environment variables not set
- `Failed to get access token` - JWT token generation issue
- `Failed to fetch Apple Music data` - API endpoint issue

### 4. Check Netlify Function Logs

1. Go to Netlify dashboard
2. Click "Functions" in left sidebar
3. Click on `apple-music-data` function
4. View logs to see any errors

## 🔧 Troubleshooting

### If you see placeholder data:

1. **Check environment variables are set:**
   - Go to Site settings → Environment variables
   - Verify all 4 variables are there

2. **Check function is deployed:**
   - Go to Functions tab
   - Should see `apple-music-data` function

3. **Check function logs:**
   - Look for JWT token errors
   - Look for API call errors

4. **Verify playlist is accessible:**
   - Make sure your "Yuh" playlist is public
   - Or that it's accessible with your Apple Music account

### Common Issues

**"jsonwebtoken not found"**
- The function needs `jsonwebtoken` package
- Check that `netlify/functions/package.json` exists
- Netlify should auto-install, but may need manual setup

**"Failed to get access token"**
- Check Private Key format in environment variables
- Make sure it includes BEGIN and END lines
- May need to be formatted as single line with `\n`

**"Failed to fetch Apple Music data"**
- Check Playlist ID is correct: `pl.u-8aAVZ6qho0lEWVJ`
- Verify Media Identifier: `media.ashwannasleep.music`
- Check Team ID: `7Z45F36LFG`

## 📊 Expected Behavior

- **On page load**: Fetches tracks immediately
- **Every 5 minutes**: Auto-refreshes
- **When tab becomes visible**: Refreshes immediately
- **Fallback**: Shows placeholder if API fails

Let me know what you see! 🎵

