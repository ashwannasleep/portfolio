# Spotify Integration Setup Guide

This guide will help you set up real Spotify integration to replace the placeholder content on your portfolio homepage.

## 🎯 What This Will Do

- Show your actual recently played tracks from Spotify
- Display your currently playing song (if any)
- Replace the static placeholder songs with real data
- Provide a beautiful login interface for Spotify connection

## 🚀 Quick Setup Steps

### 1. Get Your Spotify Client ID

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: `Ashley's Portfolio`
   - **App description**: `Portfolio website with Spotify integration`
   - **Website**: Your portfolio URL
   - **Redirect URI**: `http://localhost:3000` (for testing) or your live portfolio URL
5. Click "Save"
6. Copy your **Client ID** from the app overview

### 2. Use the Spotify Refresh Token Tool

1. Go to [https://github.com/alecchendev/spotify-refresh-token](https://github.com/alecchendev/spotify-refresh-token)
2. Follow their setup instructions to get your refresh token
3. This tool makes it much easier than doing it manually!

### 3. Update Your Code

1. Open `spotify-integration.js`
2. Replace `YOUR_SPOTIFY_CLIENT_ID` with your actual Client ID
3. Add your refresh token to the code (you'll need to implement the token exchange)

### 4. Test Locally

1. Run your portfolio locally
2. Click "Connect Spotify" 
3. Authorize with your Spotify account
4. You should see your real listening history!

## 🔧 Technical Details

### Required Spotify Scopes
- `user-read-recently-played` - Access to recently played tracks
- `user-read-currently-playing` - Access to currently playing track
- `user-top-read` - Access to top tracks (optional)

### API Endpoints Used
- `GET /me/player/recently-played` - Recently played tracks
- `GET /me/player/currently-playing` - Currently playing track

### Security Notes
- Never commit your Client Secret to version control
- Use environment variables for production
- The refresh token tool handles the OAuth flow securely

## 🎨 Customization Options

### Change the Number of Recent Tracks
In `spotify-integration.js`, modify this line:
```javascript
const recentTracks = await this.fetchRecentlyPlayed(5); // Change 5 to any number
```

### Customize the Styling
The CSS classes are:
- `.spotify-login` - Login section styling
- `.spotify-setup` - Setup instructions styling
- `.now-playing` - Currently playing track styling

### Add More Features
You can easily add:
- Top tracks of the month
- Recently played playlists
- Audio features (danceability, energy, etc.)
- Genre analysis

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check your Client ID is correct
   - Ensure your redirect URI matches exactly

2. **"Invalid redirect URI" error**
   - Update your Spotify app settings with the correct redirect URI
   - Make sure there are no trailing slashes

3. **CORS errors**
   - This is expected when testing locally
   - Will work fine when deployed

4. **"Invalid scope" error**
   - Check the scope string in the code
   - Ensure all required scopes are included

### Getting Help

- Check the [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api)
- Use the [Spotify Refresh Token tool](https://github.com/alecchendev/spotify-refresh-token) for easier setup
- Check the browser console for detailed error messages

## 🚀 Deployment

When you're ready to deploy:

1. Update the redirect URI in your Spotify app to your live URL
2. Update the `redirectUri` in `spotify-integration.js` to your live URL
3. Deploy your updated portfolio
4. Test the Spotify connection on your live site

## ✨ What You'll Get

After setup, your portfolio will show:
- A beautiful Spotify login button
- Your real recently played tracks with album artwork
- Currently playing song information
- Professional, dynamic content that updates automatically

This will make your portfolio much more engaging and show visitors your real music taste!
