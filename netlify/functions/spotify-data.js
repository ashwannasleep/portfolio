// Netlify Serverless Function to fetch Spotify data
// This proxies requests to Spotify API with the access token

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { endpoint } = event.queryStringParameters || {};

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing endpoint parameter' })
    };
  }

    // Get access token from the token endpoint
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Missing Spotify credentials' 
        })
      };
    }

    try {
      // Create base64 encoded client credentials
      const credentials = `${clientId}:${clientSecret}`;
      const encodedCredentials = btoa(credentials);

      // First, get a fresh access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return {
          statusCode: tokenResponse.status,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            error: 'Failed to get access token',
            details: errorText
          })
        };
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Now fetch the requested Spotify data (decode endpoint if needed)
      const decodedEndpoint = decodeURIComponent(endpoint);
      const spotifyResponse = await fetch(`https://api.spotify.com/v1/${decodedEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

    if (!spotifyResponse.ok) {
      return {
        statusCode: spotifyResponse.status,
        body: JSON.stringify({ 
          error: 'Failed to fetch Spotify data',
          status: spotifyResponse.status 
        })
      };
    }

    const data = await spotifyResponse.json();

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
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

