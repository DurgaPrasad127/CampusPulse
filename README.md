# CampusPulse — Smart Campus Issue & Event Platform

A beginner-friendly full-stack DevOps project whose main goal is to demonstrate an automated Jenkins CI/CD lifecycle.

## Stack
- React + Vite + Axios
- Node.js + Express + JWT
- PostgreSQL
- Docker + Docker Compose + Nginx
- Jenkins Declarative Pipeline
- GitHub Webhook

## CI/CD flow
Git push → GitHub → Webhook → Jenkins → Checkout → Install → Lint → Test → Frontend build → Docker build → Deploy → Health check

## Quick local run
1. Copy `.env.example` to `.env` and change the secrets.
2. Run `docker compose up -d --build`.
3. Create the admin:
   `docker compose exec backend node scripts/seed-admin.js`
4. Open generated URL
5. Register a student account.

## Development without Docker
- Backend: `cd backend && npm ci && npm run dev`
- Frontend: `cd frontend && npm ci && npm run dev`
- PostgreSQL must be available and backend environment variables configured.

## Important
Never commit `.env` or real secrets. The Jenkinsfile intentionally uses the repository's Docker Compose deployment and keeps secrets in the server environment rather than Git.
