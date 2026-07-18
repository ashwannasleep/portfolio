# ashwannasleep.com

Source for my portfolio site.

Static HTML, CSS and vanilla JavaScript — no framework, no build step, no bundler.
The one server-side piece is a Cloudflare Worker that handles Apple Music API
authentication.

**Live:** https://ashwannasleep.com

---

## Running locally

No install step. Serve the directory:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly works too, but the
Apple Music widget needs a real origin for its CORS request.

---

## Layout

```
index.html                      the site
styles.css
script.js                       nav, theme, gallery, project modals
apple-music-integration.js      client for the Worker below

cloudflare/workers/             Apple Music edge API
projects/                       project case studies

complete_algorithm_guide.html   long-form technical guides
llm_learning_guide.html
```

---

## Apple Music edge API

The most interesting code here. Every Apple Music API request needs a developer
token — a JWT you sign yourself with a private key Apple issues as a `.p8` file.
Signing it in the browser would mean handing that key to every visitor, so a
Cloudflare Worker signs it server-side instead.

- ES256 (ECDSA P-256) signatures built against the Web Crypto API, since Workers
  don't run Node and `jsonwebtoken` isn't available
- The key is imported non-extractable, so its raw bytes can't be read back out
- PKCS#8 normalisation to handle the several ways a `.p8` arrives mangled after a
  round trip through an environment variable
- Responses cached an hour at the edge to stay well inside Apple's rate limit

Credentials are Wrangler secrets. The `.p8` is not in this repository.

Write-up: [`projects/apple-music-worker.html`](projects/apple-music-worker.html)

---

## Projects featured on the site

**MONU Planner** — a minimalist iOS planner, live on the App Store. SwiftUI client
with AWS Amplify handling authentication and cloud sync. Designed and built end to
end. Separate repository.
https://www.monu-planner.com

**AI Chat Demo** — a chat interface built around async request lifecycles: loading,
error, retry and recovery states. Prototype.
https://ashwannasleep.github.io/AI-chat-demo/

**Merchant Dashboard** — an operations console concept for e-commerce merchants.
KPI cards, order pipeline, low-stock alerts. Design concept, not a running system.
https://ashwannasleep.github.io/Merchant-Dashboard/

**Memoria** — reading tracker and knowledge manager. Highlights, streaks, progress
visualisation. Prototype.
https://ashwannasleep.github.io/memoria/

---

## Writing

Two long-form guides, each a single self-contained page with interactive charts:

- **Complete Algorithm Guide** — data structures, algorithms, complexity analysis
- **Complete LLM Guide** — fundamentals through RAG, evaluation and deployment

And a piece on why I built MONU:
[How I Re-Engineered My Life with MONU Planner](https://medium.com/@wunjingchang.work/how-i-re-engineered-my-life-with-monu-planner-9228a8940427)

---

## Stack

This repo: vanilla HTML/CSS/JS, Cloudflare Workers, Web Crypto, Wrangler.
Tailwind via CDN in the two guide pages.

Elsewhere: Swift and SwiftUI, AWS Amplify.

---

## Links

- Site — https://ashwannasleep.com
- GitHub — https://github.com/ashwannasleep
- LinkedIn — https://www.linkedin.com/in/chang-work
- MONU Planner — https://www.monu-planner.com

---

Built by Ashley Chang. Open to software engineering and AI engineering internships.
