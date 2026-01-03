# 🎉 Apple Music Integration - Complete Setup

## ✅ All Credentials Collected

- ✅ Team ID: `7Z45F36LFG`
- ✅ Key ID: `M958PF4JKB`
- ✅ Media Identifier: `media.ashwannasleep.music`
- ✅ Private Key: (saved)
- ✅ Playlist ID: `pl.u-8aAVZ6qho0lEWVJ` (Your "Yuh" playlist)

## 🚀 Final Steps to Deploy

### Step 1: Set Netlify Environment Variables

Go to your Netlify dashboard → **Site settings** → **Environment variables** and add these:

```
APPLE_TEAM_ID = 7Z45F36LFG
APPLE_KEY_ID = M958PF4JKB
APPLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQggyZDB8exem+JyUPE
rpPl7zmjTFn58p3oTCl69lwCTHOgCgYIKoZIzj0DAQehRANCAATT6N3OGhNn9ZYd
MqzUzr0oXOeeWAE3/Wnhh3/z6lEMgxI8nXGsD7b+R0xJMxohukQU66P4lK/tUyPS
hYuTjybQ
-----END PRIVATE KEY-----
APPLE_MEDIA_IDENTIFIER = media.ashwannasleep.music
```

**Important Notes:**
- For `APPLE_PRIVATE_KEY`, you may need to paste it as a single line with `\n` for line breaks
- Or if Netlify supports multi-line, paste it exactly as shown above
- Make sure to include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

### Step 2: Deploy to Netlify

1. **Push your code to GitHub** (if not already done)
2. **Netlify will automatically deploy**
3. **Or trigger a manual redeploy** after setting environment variables

### Step 3: Verify Installation

Make sure `netlify/functions/package.json` exists with:
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2"
  }
}
```

If Netlify doesn't auto-install dependencies, you may need to:
- Add a build command in Netlify settings
- Or ensure the package.json is in the functions directory

### Step 4: Test

1. Visit your deployed site
2. Check the "What I'm Listening To" section
3. You should see the first 3 tracks from your "Yuh" playlist
4. Tracks will auto-refresh every 5 minutes

## 🎵 What You'll See

- **Playlist**: "Yuh" by Ashley
- **Tracks**: First 3 tracks from your playlist
- **Auto-update**: Every 5 minutes
- **Links**: Direct links to Apple Music for each track

## 🐛 Troubleshooting

If tracks don't show:
1. Check Netlify function logs (Site settings → Functions → View logs)
2. Verify all environment variables are set correctly
3. Check browser console for errors
4. Verify the playlist is public or accessible

## ✨ All Done!

Your Apple Music integration is ready! Once deployed, your portfolio will show your real playlist tracks. 🎵

