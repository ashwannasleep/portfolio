#!/bin/bash
# Script to set all Apple Music secrets for Cloudflare Worker

echo "Setting up Apple Music API secrets..."
echo ""

echo "1. Setting APPLE_TEAM_ID..."
echo "   Enter: 7Z45F36LFG"
npx wrangler secret put APPLE_TEAM_ID

echo ""
echo "2. Setting APPLE_KEY_ID..."
echo "   Enter: M958PF4JKB"
npx wrangler secret put APPLE_KEY_ID

echo ""
echo "3. Setting APPLE_PRIVATE_KEY..."
echo "   Paste your full .p8 file content (including BEGIN/END markers)"
npx wrangler secret put APPLE_PRIVATE_KEY

echo ""
echo "4. Setting APPLE_MEDIA_IDENTIFIER..."
echo "   Enter: media.ashwannasleep.music"
npx wrangler secret put APPLE_MEDIA_IDENTIFIER

echo ""
echo "✅ All secrets set! Your Worker is ready to use."

