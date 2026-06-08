# Todo

- Production ready linter (look at README.md)
- Authentification
- Better back-end security (this can help https://mcpmarket.com/tools/skills/backend-development-architecture)
- Store files in S3 or equivalent
- Deploy frontend on Vercel, backend on Fly.io
- Make 404 page
- Traduire l'UI en français
- Stats du coach (sur les pages équipe/match)
- Home page like a newspaper (example : https://mail.google.com/mail/u/0/#inbox/FMfcgzQgLjbvJpfDgGVNdPCPDvBxbQrR) + blog like features
- Faire une page Joueur
- Review "About" page
- Remove /hello api endpoint and its related features

## Scoping

### Deploy frontend on Vercel, backend on Fly.io

- **Frontend** → Vercel (free, purpose-built for React/Vite)
- **Backend** → Fly.io (free tier covers a small NestJS app, supports Docker)
- Fly.io chosen over Render/Railway because it has a free always-on tier
- Docker-based deployment on Fly.io means system binaries (e.g. `poppler-utils` for PDF conversion) are available via `apt-get` in Dockerfile
- Pure-JS PDF libraries avoided: lower rendering quality risks degrading Claude extraction accuracy

## Web design

### Interesting examples

- 