// Cloudflare Worker for Apple Music API
// This handles JWT token generation and API requests
// IMPORTANT: This function ONLY uses Ashley's credentials and playlist data
// It does NOT accept or use any visitor/user-specific data

// Using Web Crypto API for JWT signing (Cloudflare Workers compatible)
async function generateJWT(teamId, keyId, privateKey) {
  // Format private key
  let formattedPrivateKey = privateKey.trim();
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
  
  // Handle single-line key format
  if (!formattedPrivateKey.includes('\n') && formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
    const beginMarker = '-----BEGIN PRIVATE KEY-----';
    const endMarker = '-----END PRIVATE KEY-----';
    const beginIndex = formattedPrivateKey.indexOf(beginMarker);
    const endIndex = formattedPrivateKey.indexOf(endMarker);
    
    if (beginIndex !== -1 && endIndex !== -1) {
      let keyContent = formattedPrivateKey.substring(
        beginIndex + beginMarker.length,
        endIndex
      ).replace(/\s+/g, '');
      
      const lines = [];
      for (let i = 0; i < keyContent.length; i += 64) {
        lines.push(keyContent.substring(i, i + 64));
      }
      
      formattedPrivateKey = `${beginMarker}\n${lines.join('\n')}\n${endMarker}`;
    }
  }
  
  if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
    const keyContent = formattedPrivateKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    const lines = [];
    for (let i = 0; i < keyContent.length; i += 64) {
      lines.push(keyContent.substring(i, i + 64));
    }
    
    formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
  }
  
  formattedPrivateKey = formattedPrivateKey.replace(/\r\n/g, '\n');
  
  // Import the private key
  const keyData = formattedPrivateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  
  const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );
  
  // Create JWT header and payload
  const header = {
    alg: 'ES256',
    kid: keyId
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 3600
  };
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Sign with Web Crypto API
  const signatureBuffer = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );
  
  // Convert signature to base64url
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${signatureInput}.${signature}`;
}

export default {
  async fetch(request, env) {
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // Get credentials from environment variables (Cloudflare Workers secrets)
    const teamId = env.APPLE_TEAM_ID;
    const keyId = env.APPLE_KEY_ID;
    const privateKey = env.APPLE_PRIVATE_KEY;
    const mediaIdentifier = env.APPLE_MEDIA_IDENTIFIER;
    
    if (!teamId || !keyId || !privateKey || !mediaIdentifier) {
      return new Response(
        JSON.stringify({
          error: 'Missing Apple Music credentials. Please configure environment variables.'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    try {
      // Generate JWT token
      const token = await generateJWT(teamId, keyId, privateKey);
      
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
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch Apple Music data',
            details: errorText
          }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
      
      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          details: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }
};

