// Netlify Serverless Function for Apple Music API
// This handles JWT token generation and API requests
// IMPORTANT: This function ONLY uses Ashley's credentials and playlist data
// It does NOT accept or use any visitor/user-specific data

// Note: You may need to install jsonwebtoken in your Netlify function
// Create netlify/functions/package.json with: { "dependencies": { "jsonwebtoken": "^9.0.2" } }
let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  // Fallback if jsonwebtoken is not available
  console.error('jsonwebtoken not found. Please install it in the function directory.');
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { endpoint } = event.queryStringParameters || {};

  if (!endpoint) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing endpoint parameter' })
    };
  }

  // Get credentials from environment variables
  // These are Ashley's credentials only - never use visitor/user credentials
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;
  const mediaIdentifier = process.env.APPLE_MEDIA_IDENTIFIER; // Ashley's Media Identifier only

  if (!teamId || !keyId || !privateKey || !mediaIdentifier) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Missing Apple Music credentials. Please configure environment variables.' 
      })
    };
  }

  try {
    // Generate JWT token for Apple Music API
    // Handle private key format - Netlify may store it with or without newlines
    let formattedPrivateKey = privateKey;
    
    // Remove any leading/trailing whitespace
    formattedPrivateKey = formattedPrivateKey.trim();
    
    // Replace escaped newlines with actual newlines (handle both \\n and \n)
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
    
    // If the key is all on one line (common when pasting into Netlify), reformat it
    if (!formattedPrivateKey.includes('\n') && formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
      // Extract the base64 content between markers
      const beginMarker = '-----BEGIN PRIVATE KEY-----';
      const endMarker = '-----END PRIVATE KEY-----';
      const beginIndex = formattedPrivateKey.indexOf(beginMarker);
      const endIndex = formattedPrivateKey.indexOf(endMarker);
      
      if (beginIndex !== -1 && endIndex !== -1) {
        // Extract the base64 content (remove markers and whitespace)
        let keyContent = formattedPrivateKey.substring(
          beginIndex + beginMarker.length,
          endIndex
        ).replace(/\s+/g, ''); // Remove all whitespace
        
        // Split into 64-character lines (standard PEM format)
        const lines = [];
        for (let i = 0; i < keyContent.length; i += 64) {
          lines.push(keyContent.substring(i, i + 64));
        }
        
        // Reconstruct with proper formatting
        formattedPrivateKey = `${beginMarker}\n${lines.join('\n')}\n${endMarker}`;
      }
    }
    
    // If the key doesn't have BEGIN/END markers, add them
    if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
      // Remove any existing markers and clean up
      const keyContent = formattedPrivateKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '')
        .trim();
      
      // Split into 64-character lines
      const lines = [];
      for (let i = 0; i < keyContent.length; i += 64) {
        lines.push(keyContent.substring(i, i + 64));
      }
      
      formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
    }
    
    // Ensure proper line breaks (should have \n, not spaces)
    formattedPrivateKey = formattedPrivateKey.replace(/\r\n/g, '\n');
    
    // Validate the key format
    if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----') || 
        !formattedPrivateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing BEGIN/END markers');
    }
    
    // Log first/last few chars for debugging (don't log full key)
    console.log('Key format check:', {
      startsWith: formattedPrivateKey.substring(0, 30),
      endsWith: formattedPrivateKey.substring(formattedPrivateKey.length - 30),
      hasNewlines: formattedPrivateKey.includes('\n'),
      lineCount: formattedPrivateKey.split('\n').length,
      length: formattedPrivateKey.length
    });
    
    const token = jwt.sign(
      {
        iss: teamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
      },
      formattedPrivateKey,
      {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: keyId
        }
      }
    );

    // Fetch data from Apple Music API
    const decodedEndpoint = decodeURIComponent(endpoint);
    const apiUrl = `https://api.music.apple.com/v1/${decodedEndpoint}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Music-User-Token': mediaIdentifier
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Failed to fetch Apple Music data',
          details: errorText 
        })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

