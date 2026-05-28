# Hosting Research (May 2026)

Researched for backend deployment. Chose **Railway**.

## Railway ✅ (chosen)

- **Cost**: $5/mo flat (includes $5 usage credit)
- **Always-on**: yes, no cold starts
- **Postgres**: included in same project, injected as `DATABASE_URL`
- **Volumes**: $0.15/GB/month (comes out of $5 credit)
- **Deploy**: GitHub auto-deploy, Docker support
- **Region**: eu-west (Ireland)
- **Verdict**: best balance of cost, simplicity, and DX

## Fly.io

- **Cost**: ~$10/mo (Machine ~$5 + Managed Postgres ~$4.50 + Volume ~$0.15)
- **Always-on**: yes
- **Free tier**: removed for new accounts in late 2024 (free trial only: 2h or 7 days)
- **Volumes**: $0.15/GB/month
- **Region**: cdg (Paris) available
- **Verdict**: good option but no free tier and slightly more expensive than Railway

## Scaleway

- **Cost**: potentially free for low traffic (400k GB-s + 200k vCPU-s free/month)
- **Always-on**: no — Serverless Containers scale to zero
- **Cold starts**: 3–5s for NestJS (bad UX)
- **Postgres**: from €0.10/month for 1GB
- **Region**: Paris (best for French users + GDPR)
- **Verdict**: good for GDPR/data residency, but cold starts are a deal-breaker for NestJS. Revisit if GDPR compliance becomes a requirement.
- **Note**: pricing update announced for June 1st 2026

## Render

- **Cost**: ~$14/mo always-on (Web $7 + Postgres $7 + disk $0.30)
- **Free tier**: spins down after 15min idle, ~1min cold start, Postgres expires after 30 days
- **Always-on**: paid only
- **Volumes**: $0.30/GB/month
- **Verdict**: most expensive, worst cold starts, no geographic advantage — ruled out
