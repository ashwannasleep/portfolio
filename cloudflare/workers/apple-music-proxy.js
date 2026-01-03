// Cloudflare Worker - Simple Proxy to Netlify Functions
// This allows you to use your custom domain while keeping Netlify Functions free
// IMPORTANT: This is just a proxy - actual API calls still go through Netlify

export default {
  async fetch(request) {
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
    
    // Get the endpoint parameter
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
    
    // Proxy to your Netlify function
    // Replace YOUR_NETLIFY_SITE with your actual Netlify site URL
    const netlifyUrl = `https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/apple-music-data?endpoint=${encodeURIComponent(endpoint)}`;
    
    try {
      const response = await fetch(netlifyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        {
          status: response.status,
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
          error: 'Proxy error',
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

