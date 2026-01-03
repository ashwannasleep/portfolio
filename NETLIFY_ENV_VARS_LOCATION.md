# 📍 Where to Set Netlify Environment Variables

## Step-by-Step Location

### Option 1: From Your Site Dashboard

1. **Go to Netlify**
   - Visit: https://app.netlify.com/
   - Log in to your account

2. **Select Your Site**
   - Click on your portfolio site from the list

3. **Go to Site Settings**
   - Click **"Site settings"** in the top navigation (or in the left sidebar)

4. **Find Environment Variables**
   - In the left sidebar, scroll down to **"Build & deploy"** section
   - Click **"Environment variables"**

5. **Add Variables**
   - Click **"Add a variable"** or **"Add variable"** button
   - Add each variable one by one

### Option 2: Direct Link (After Selecting Your Site)

Once you're on your site dashboard:
- URL will be: `https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/env`
- Or navigate: Site settings → Environment variables

## Visual Path

```
Netlify Dashboard
  └── Your Site (click on it)
      └── Site settings (top nav or sidebar)
          └── Build & deploy (left sidebar)
              └── Environment variables
                  └── Add variable (button)
```

## Quick Steps

1. **https://app.netlify.com/** → Log in
2. Click your **site name**
3. Click **"Site settings"** (top navigation)
4. Click **"Environment variables"** (left sidebar under "Build & deploy")
5. Click **"Add a variable"**
6. Add each variable:
   - Key: `APPLE_TEAM_ID`, Value: `7Z45F36LFG`
   - Key: `APPLE_KEY_ID`, Value: `M958PF4JKB`
   - Key: `APPLE_PRIVATE_KEY`, Value: (paste the entire key)
   - Key: `APPLE_MEDIA_IDENTIFIER`, Value: `media.ashwannasleep.music`

## After Adding Variables

- Click **"Save"** or the changes save automatically
- **Redeploy** your site (or it will auto-deploy on next push)

That's it! 🎵

