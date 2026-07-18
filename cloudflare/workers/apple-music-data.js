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

// Origins allowed to call this Worker. Anything else gets no CORS grant.
const ALLOWED_ORIGINS = [
  'https://ashwannasleep.com',
  'https://www.ashwannasleep.com',
  'http://localhost:8000',
  'http://localhost:8765'
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(body, status, request, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
      ...extra
    }
  });
}

// The only two Apple Music paths this Worker will ever request. The caller
// picks by name; it never supplies a path. Previously the path came straight
// from a query parameter, which let any caller use these credentials to reach
// arbitrary Apple Music endpoints.
function resolveResource(resource, storefront, playlistId) {
  switch (resource) {
    case 'playlist':
      return `catalog/${storefront}/playlists/${playlistId}`;
    case 'tracks':
      return `catalog/${storefront}/playlists/${playlistId}/tracks?limit=100`;
    default:
      return null;
  }
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { ...corsHeaders(request), 'Access-Control-Max-Age': '86400' }
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, request);
    }

    const url = new URL(request.url);
    const storefront = env.APPLE_STOREFRONT || 'us';
    const playlistId = env.APPLE_PLAYLIST_ID || 'pl.u-8aAVZ6qho0lEWVJ';
    const decodedEndpoint = resolveResource(
      url.searchParams.get('resource'),
      storefront,
      playlistId
    );

    if (!decodedEndpoint) {
      return json(
        { error: 'Unknown resource. Expected one of: playlist, tracks' },
        400,
        request
      );
    }

    // Get credentials from environment variables (Cloudflare Workers secrets)
    const teamId = env.APPLE_TEAM_ID;
    const keyId = env.APPLE_KEY_ID;
    const privateKey = env.APPLE_PRIVATE_KEY;
    const mediaIdentifier = env.APPLE_MEDIA_IDENTIFIER;
    
    if (!teamId || !keyId || !privateKey || !mediaIdentifier) {
      return json(
        { error: 'Missing Apple Music credentials. Please configure environment variables.' },
        500,
        request
      );
    }

    try {
      // Generate JWT token
      const token = await generateJWT(teamId, keyId, privateKey);

      const apiUrl = `https://api.music.apple.com/v1/${decodedEndpoint}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Music-User-Token': mediaIdentifier
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return json(
          { error: 'Failed to fetch Apple Music data', details: errorText },
          response.status,
          request
        );
      }

      const data = await response.json();

      return json(data, 200, request, {
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      });
    } catch (error) {
      return json(
        { error: 'Internal server error', details: error.message },
        500,
        request
      );
    }
  }
};

