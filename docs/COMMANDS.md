# Command Cheat Sheet

## Windows PowerShell
`git clone <repo-url>`
`cd campuspulse`
`copy .env.example .env`
`docker compose up -d --build`
`docker compose ps`
`docker compose logs -f backend`
`docker compose exec backend node scripts/seed-admin.js`

## Ubuntu
`sudo apt update`
`sudo apt install -y openjdk-21-jre curl git`
`java -version`
`docker --version`
`docker compose version`
`sudo systemctl status jenkins`

## Verify application
`curl -f http://localhost/api/health`

## Git
`git status`
`git add .`
`git commit -m "Update CampusPulse"`
`git push origin main`
