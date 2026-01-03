#!/bin/bash
# Quick deployment script for Cloudflare Workers

echo "🚀 Deploying Apple Music Worker to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login if not already
echo "📝 Checking Cloudflare login..."
wrangler whoami || wrangler login

# Deploy
echo "📦 Deploying worker..."
wrangler deploy

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set your secrets:"
echo "   wrangler secret put APPLE_TEAM_ID"
echo "   wrangler secret put APPLE_KEY_ID"
echo "   wrangler secret put APPLE_PRIVATE_KEY"
echo "   wrangler secret put APPLE_MEDIA_IDENTIFIER"
echo ""
echo "2. Update apple-music-integration.js with your Worker URL"

