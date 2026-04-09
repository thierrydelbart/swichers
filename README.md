# Swichers

Plateforme communautaire dédiée aux championnats amateurs de basketball de la FFBB. Les membres peuvent uploader les PDFs de statistiques officiels ; la plateforme en extrait les données et les expose aux visiteurs.

## Stack

- **Backend** — NestJS 11, TypeORM, PostgreSQL (port 3001)
- **Frontend** — React 19, Vite, Tailwind v4, shadcn (port 5173)

## Getting started

```bash
# Start the database
docker-compose up -d

# Install dependencies
npm run install:all

# Run in dev mode
npm run dev:backend
npm run dev:frontend
```

## Build

```bash
npm run build:backend
npm run build:frontend
```
