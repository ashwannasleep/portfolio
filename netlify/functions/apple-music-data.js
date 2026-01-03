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
    const token = jwt.sign(
      {
        iss: teamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
      },
      privateKey.replace(/\\n/g, '\n'),
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

