# CampusPulse Architecture

## Application
Browser → React/Nginx → `/api` reverse proxy → Express REST API → PostgreSQL

## CI/CD
Developer → GitHub → webhook → Jenkins → checkout → npm ci → lint → tests → frontend build → Docker build → Docker Compose deployment → `/api/health` smoke test.

## Why this design?
The application stays intentionally simple so the demonstration can focus on Jenkins. Docker gives Jenkins a repeatable deployment target, while Compose keeps the three runtime services easy to understand.

## Rollback
For a simple student demonstration, the safest rollback is source-controlled: identify the last known-good Git commit, check it out in a controlled branch, and run the pipeline again. A more advanced image-tag rollback can be added after the base pipeline is stable.
