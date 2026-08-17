# CI/CD Notes

## Why the starter uses `npm install`
The source package is distributed without generated `package-lock.json` files. The first setup run should execute `npm install` in both `backend/` and `frontend/`, then commit the generated lockfiles. After that, you can replace the two Jenkins install commands and Dockerfile install commands with `npm ci` for strict reproducibility.

## Deployment safety
The Jenkinsfile runs Docker build only after lint, tests and the frontend build pass. Docker Compose deployment is a later stage, so a failed test prevents deployment.

## Jenkins workspace
The Jenkins job checks the repository out into its workspace. Docker Compose commands therefore operate against the checked-out repository. Keep the Jenkins workspace on the same Docker host that is intended to run CampusPulse.

## Secret handling
`.env` is not committed. On the deployment host, create the `.env` file once. Jenkins uses it indirectly because Docker Compose reads it from the repository workspace/current working directory. For a production setup, move these secrets to Jenkins Credentials or a dedicated secret manager and inject them at deploy time.

## Webhook
GitHub must be able to reach Jenkins. A localhost-only Jenkins URL is not reachable from GitHub. For a classroom laptop/VM demo, use a temporary HTTPS tunnel or deploy Jenkins to a reachable VM/server. Never expose an unsecured Jenkins controller directly to the public internet.
