# 🍎 Apple Music Integration Setup Guide

This guide will help you set up Apple Music integration to display your own playlist.

## 🎯 Features

- ✅ Display tracks from your own playlist
- ✅ Auto-refresh every 5 minutes
- ✅ Show album artwork, track names, and artists
- ✅ Links to Apple Music for playback

## 🚀 Setup Steps

### Step 1: Get Apple Music API Credentials

1. **Log in to Apple Developer**
   - Go to [Apple Developer Portal](https://developer.apple.com/account/)
   - Log in with your Apple Developer account

2. **Create Media Identifier**
   - Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
   - Click "+" to create a new Identifier
   - Select "Media IDs"
   - Enter a name (e.g., `Ashley's Portfolio`)
   - Click "Continue" then "Register"
   - **Copy your Media Identifier** (format: `team.ABC123.media`)

3. **Create Private Key**
   - Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
   - Click "+" to create a new Key
   - Enter a name (e.g., `Apple Music API Key`)
   - Check "MusicKit" permission
   - Click "Continue" then "Register"
   - **Download the .p8 file** (only downloadable once!)
   - **Copy the Key ID** (format: `ABC123DEF4`)

4. **Get Team ID**
   - Go to [Membership](https://developer.apple.com/account/#/membership/) page
   - Find your **Team ID** (format: `ABC123DEF4`)

### Step 2: Get Your Playlist ID

1. **Find your playlist in Apple Music**
   - Open Apple Music app
   - Find the playlist you want to display
   - Click the share button
   - Copy the link (format: `https://music.apple.com/us/playlist/pl.u-xxxxx`)
   - Extract the **Playlist ID** from the link (the `pl.u-xxxxx` part)

2. **Or use Apple Music Web**
   - Go to [music.apple.com](https://music.apple.com)
   - Log in and find your playlist
   - Get the Playlist ID from the URL

### Step 3: Set Up Netlify Environment Variables

1. Go to your Netlify site settings
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
APPLE_TEAM_ID = Your Team ID
APPLE_KEY_ID = Your Key ID
APPLE_PRIVATE_KEY = Your Private Key content (entire .p8 file content, including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
APPLE_MEDIA_IDENTIFIER = Your Media Identifier
```

**Important:**
- `APPLE_PRIVATE_KEY` needs to include the complete .p8 file content
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- If there are multiple lines, make sure to enter them correctly in Netlify (you may need to use line breaks)

### Step 4: Update Code

1. **Update `apple-music-integration.js`**
   ```javascript
   this.mediaIdentifier = 'Your Media Identifier';
   this.playlistId = 'Your Playlist ID'; // e.g., 'pl.u-xxxxx'
   ```

2. **Update `index.html`**
   - Change `spotify-integration.js` to `apple-music-integration.js`
   - Or load both if you want to support both platforms

### Step 5: Install Dependencies

The Netlify function needs the `jsonwebtoken` package. Create `package.json`:

```json
{
  "name": "portfolio",
  "version": "1.0.0",
  "dependencies": {
    "jsonwebtoken": "^9.0.0"
  }
}
```

Then enable "Build settings" → "Install dependencies" in Netlify settings

### Step 6: Deploy

1. Push code to GitHub
2. Netlify will automatically deploy
3. Test if the functionality works

## 🔧 Technical Details

### API Endpoints

Apple Music API uses the following format:
```
GET https://api.music.apple.com/v1/catalog/{storefront}/playlists/{playlistId}/tracks
```

- `storefront`: Usually `us` (United States)
- `playlistId`: Your playlist ID

### JWT Token

- Uses ES256 algorithm
- Valid for 1 hour
- Signed with your Private Key

### Limitations

- API has rate limits
- Requires a valid Apple Developer account
- Playlist must be public or belong to your account

## 🐛 Troubleshooting

### "Missing Apple Music credentials" Error

- Check that all environment variables are set
- Verify variable names are exactly correct (case-sensitive)
- Confirm Private Key includes complete content

### "Failed to fetch Apple Music data" Error

- Check if Playlist ID is correct
- Confirm playlist is public
- Check if JWT token is generated correctly
- View Netlify function logs

### JWT Signature Error

- Confirm Private Key format is correct
- Check if Key ID matches
- Verify Team ID is correct

## 📚 Resources

- [Apple MusicKit Documentation](https://developer.apple.com/musickit/)
- [Apple Music API Reference](https://developer.apple.com/documentation/applemusicapi)
- [JWT Documentation](https://jwt.io/)

## ✨ Result

After setup, your portfolio will:
- Display the first 3 tracks from your playlist
- Auto-refresh every 5 minutes
- Show album artwork and track information
- Provide links to Apple Music

🎵 Enjoy your personal music showcase!
