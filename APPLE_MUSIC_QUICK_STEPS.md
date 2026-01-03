# 🍎 Apple Music Setup - Quick Steps

I see you're creating the Key. Here's what to do:

## Step 1: Create Media Identifier First (Required!)

The warning says "There are no identifiers available" - you need to create a Media Identifier first.

1. **Go back to Identifiers**
   - Click "< All Keys" or go to [Identifiers page](https://developer.apple.com/account/resources/identifiers/list)
   - Click the "+" button to create a new Identifier
   - Select **"Media IDs"**
   - Enter name: `Ashley's Portfolio`
   - Click "Continue" then "Register"
   - **Copy the Media Identifier** (format: `team.ABC123.media`)

## Step 2: Then Create the Key

1. **Go back to Keys** (you're already there)
2. **Fill in the form:**
   - Key Name: `Apple Music API Key` (or any name you prefer)
   - Key Usage Description (optional): `For portfolio Apple Music integration`
3. **Check the box for "Media Services (MusicKit, ShazamKit, Apple Music Feed)"**
4. **Click "Configure"** next to Media Services
   - Select the Media Identifier you just created
   - Click "Continue"
5. **Click "Continue"** at the bottom
6. **Click "Register"**
7. **Download the .p8 file** (you can only download once!)
8. **Copy the Key ID** (shown on the confirmation page)

## Step 3: Get Your Team ID

- Go to [Membership page](https://developer.apple.com/account/#/membership/)
- Find your **Team ID** (format: `ABC123DEF4`)

## Step 4: Get Your Playlist ID

- Open Apple Music app or [music.apple.com](https://music.apple.com)
- Find your playlist
- Click share button
- Copy the link and extract the Playlist ID (the `pl.u-xxxxx` part)

## What to Send Me

Once you have everything:
1. **Team ID**: `ABC123DEF4`
2. **Key ID**: `ABC123DEF4` 
3. **Media Identifier**: `team.ABC123.media`
4. **Private Key**: (the entire .p8 file content)
5. **Playlist ID**: `pl.u-xxxxx`

Then I'll update the code and set everything up! 🎵

