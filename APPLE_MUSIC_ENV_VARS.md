# 🍎 Apple Music - Netlify Environment Variables

Copy these into your Netlify dashboard under **Site settings** → **Environment variables**:

## Environment Variables to Set

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

## ⚠️ Important Notes

1. **APPLE_TEAM_ID**: Replace `YOUR_TEAM_ID_HERE` with your actual Team ID
   - Get it from: https://developer.apple.com/account/#/membership/
   - Format: `ABC123DEF4`

2. **APPLE_PRIVATE_KEY**: 
   - Make sure to include the BEGIN and END lines
   - In Netlify, you may need to paste it as multiple lines or use `\n` for line breaks
   - The entire key should be on one line or properly formatted

3. **After setting variables**: 
   - Redeploy your site
   - The functions will use these environment variables

## Still Need

- **Team ID**: Get from Membership page
- **Playlist ID**: Get from your Apple Music playlist share link

