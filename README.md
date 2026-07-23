# ashwannasleep.com

My portfolio site. Static HTML, CSS and vanilla JavaScript — no framework,
no build step. The one server-side piece is a Cloudflare Worker for Apple
Music API auth.

**Live:** https://ashwannasleep.com

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. (The music widget needs a real origin for
its CORS request, so open it via the server, not the file directly.)

## Structure

```
index.html · styles.css · script.js   the site
apple-music-integration.js            client for the Worker
cloudflare/workers/                   Apple Music edge API
projects/                             case studies
*_guide.html                          long-form technical guides
```

## Apple Music edge API

Apple Music requests need a developer token — a JWT signed with a private
key issued as a `.p8`. Signing it in the browser would expose that key, so
a Cloudflare Worker signs it server-side:

- ES256 signatures via the Web Crypto API (Workers don't run Node)
- Key imported non-extractable; scoped to two fixed playlist reads
- Responses cached an hour at the edge

Credentials are Wrangler secrets; the `.p8` is not in this repo.
Write-up: [`projects/apple-music-worker.html`](projects/apple-music-worker.html)

## Links

- Site — https://ashwannasleep.com
- MONU Planner — https://www.monu-planner.com
- LinkedIn — https://www.linkedin.com/in/chang-work
