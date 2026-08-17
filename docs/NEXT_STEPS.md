# CampusPulse — What To Do After Extracting the ZIP

This is the execution guide for the generated project. The source was created from the supplied DevOps assignment prompt, whose core requirement is a full-stack CampusPulse application with Jenkins as the CI/CD centerpiece. The supplied prompt explicitly asks for a complete lifecycle from application development through Docker, Jenkins, GitHub webhook, health checks, failure demonstration and optional AWS. 

## 0. What I have already prepared

The ZIP contains:
- React/Vite frontend
- Express/Node backend
- PostgreSQL schema
- JWT authentication
- Student issue reporting and voting
- Admin issue/event management
- Dockerfiles
- Docker Compose
- Nginx reverse proxy
- Jenkinsfile
- automated backend tests
- lint/build scripts
- architecture/report/viva/demo notes

I could create the complete source tree here, but I cannot log into your GitHub/Jenkins/Ubuntu machine or press the buttons on your computer. Those environment-specific steps are the remaining part.

## 1. Recommended environment

### Easiest for your Windows PC: WSL2 + Ubuntu 24.04

Use:
Windows 11/10
→ WSL2
→ Ubuntu 24.04
→ Docker Engine
→ Jenkins

WSL2 is simpler than maintaining a full VirtualBox VM. Current Ubuntu on WSL supports systemd, which lets you manage Jenkins with `systemctl`.

VirtualBox + Ubuntu 24.04 is still a valid alternative if your college specifically wants a traditional VM.

### Important webhook note

A GitHub webhook must reach Jenkins from the internet. `http://localhost:8080` is not reachable by GitHub.

For a laptop/WSL classroom demo, use a temporary HTTPS tunnel such as Cloudflare Tunnel or ngrok, or run Jenkins on a publicly reachable VM. Do not expose Jenkins directly to the public internet without authentication and proper security.

---

# PHASE 1 — Windows / WSL2

## Goal

Get Ubuntu 24.04 running.

### PowerShell as Administrator

```powershell
wsl --install -d Ubuntu-24.04
wsl --update
wsl --status
```

Restart Windows if requested.

Open Ubuntu and create your Linux username/password.

Verify:

```bash
lsb_release -a
uname -a
```

Expected:
- Ubuntu 24.04
- WSL2 kernel

If `systemctl` does not work, enable systemd:

```bash
sudo nano /etc/wsl.conf
```

Put:

```ini
[boot]
systemd=true
```

Save with Ctrl+O, Enter, Ctrl+X.

In PowerShell:

```powershell
wsl --shutdown
```

Start Ubuntu again and verify:

```bash
systemctl status
```

Checkpoint:
Ubuntu works and `systemctl` works.

---

# PHASE 2 — Install Git, Node.js and basic tools

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl ca-certificates unzip
git --version
curl --version
```

For application development, Node.js 22 is used by the Docker images in this project.

If you want Node directly inside Ubuntu, install a current Node 22 distribution through a supported Node version manager. For the base project, Docker is sufficient for runtime.

Checkpoint:
Git and curl work.

---

# PHASE 3 — Install Docker Engine + Compose

Use Docker's official Ubuntu repository rather than an unrelated Ubuntu package.

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify:

```bash
sudo systemctl status docker
sudo docker run hello-world
docker compose version
```

Allow your Linux user to run Docker:

```bash
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

Security note: membership in the `docker` group effectively grants root-level control of the host. Do not add arbitrary users to this group.

Checkpoint:
These all work without errors:

```bash
docker --version
docker compose version
docker run hello-world
```

---

# PHASE 4 — Create GitHub repository

On GitHub create:

`campuspulse`

Prefer a private repository until the project is complete.

Then in Ubuntu:

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/campuspulse.git
cd campuspulse
```

Copy the generated project files into this repository.

If the ZIP was downloaded into Windows Downloads, you can access it from WSL under `/mnt/c/Users/YOUR_WINDOWS_USERNAME/Downloads/`.

Example:

```bash
cd ~
unzip /mnt/c/Users/YOUR_WINDOWS_USERNAME/Downloads/campuspulse-project.zip
```

Then copy the project into the cloned repository.

---

# PHASE 5 — Create environment file

From the project root:

```bash
cp .env.example .env
nano .env
```

Set real local values:

```env
POSTGRES_DB=campuspulse
POSTGRES_USER=campuspulse
POSTGRES_PASSWORD=use-a-strong-local-password
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@campus.local
ADMIN_PASSWORD=UseARealAdminPassword123!
```

Never commit `.env`.

Verify:

```bash
git status
```

`.env` should not appear as a file ready to commit.

---

# PHASE 6 — First application deployment with Docker

Do NOT install Jenkins yet.

First prove the application works manually.

From the project root:

```bash
docker compose build
docker compose up -d
```

Check:

```bash
docker compose ps
```

You should see:
- campuspulse-postgres
- campuspulse-backend
- campuspulse-frontend

Check logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

Health check:

```bash
curl -f http://localhost/api/health
```

Expected:

```json
{"status":"ok","service":"campuspulse-backend"}
```

Open:

`http://localhost`

---

# PHASE 7 — Create admin account

Run:

```bash
docker compose exec backend node scripts/seed-admin.js
```

Expected:

`Admin ready: admin@campus.local`

Use the email/password from `.env`.

Then:
1. Register a student.
2. Login.
3. Report an issue.
4. Upvote it.
5. Logout.
6. Login as admin.
7. Change status.
8. Change priority.
9. Assign it.
10. Create an event.
11. Edit the event.
12. Delete an event if needed.

Checkpoint:
The complete application works manually before Jenkins is introduced.

---

# PHASE 8 — Generate package-lock files

The ZIP intentionally does not contain generated lockfiles. This keeps the source artifact smaller and avoids pretending that a lockfile was generated in your exact environment.

Run:

```bash
cd backend
npm install

cd ../frontend
npm install
```

This generates:
- `backend/package-lock.json`
- `frontend/package-lock.json`

Commit them:

```bash
cd ..
git add backend/package-lock.json frontend/package-lock.json
git commit -m "Add dependency lockfiles"
git push
```

After the first successful install, you can make the pipeline stricter by changing:
- `npm install --prefix backend` → `npm ci --prefix backend`
- `npm install --prefix frontend` → `npm ci --prefix frontend`
- Dockerfile `npm install` → `npm ci`

Do this after confirming the lockfiles work.

---

# PHASE 9 — Run tests and lint manually

Backend:

```bash
cd backend
npm test
npm run lint
```

Frontend:

```bash
cd ../frontend
npm run lint
npm run build
```

All should pass.

If frontend build passes, `frontend/dist/` will be created.

Checkpoint:
Manual CI is green.

---

# PHASE 10 — Understand Docker before Jenkins

Know these terms for viva:

Image:
A packaged blueprint for running an application.

Container:
A running instance of an image.

Network:
Allows containers to communicate by service name.

Volume:
Persistent storage managed by Docker.

Compose:
Defines and runs the multiple services together.

In this project:

frontend → nginx → backend → PostgreSQL

The frontend container knows the backend as:

`http://backend:3000`

The browser sees only:

`http://localhost`

Nginx handles `/api` forwarding.

---

# PHASE 11 — Install Jenkins

Jenkins currently requires Java 21 or later for the Linux package path.

Install Java:

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-21-jre
java -version
```

Install Jenkins LTS:

```bash
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins
```

Start:

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins
```

Get initial password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Open:

`http://localhost:8080`

Unlock Jenkins.

Choose suggested plugins for the first setup, then create your admin account.

Checkpoint:
Jenkins dashboard loads.

---

# PHASE 12 — Jenkins plugins

Install only what this project needs.

Core pipeline capability:
- Pipeline
- Git
- GitHub
- Docker Pipeline
- Credentials Binding
- JUnit if you later publish JUnit XML test reports

For a simple single-branch Pipeline job, you do not need every Jenkins plugin available.

Do not install random plugins just because a tutorial lists them.

---

# PHASE 13 — Give Jenkins Docker access

The Jenkins Linux service runs as the `jenkins` user.

Check:

```bash
getent group docker
```

Add Jenkins:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Test:

```bash
sudo -u jenkins docker version
```

If permission is denied, restart Jenkins and verify group membership:

```bash
id jenkins
```

You should see `docker` in the groups.

Security point for viva:
Docker socket access is powerful. Giving Jenkins access to Docker effectively gives Jenkins high control over the host. In a production environment, use hardened agents or a controlled Docker strategy.

Checkpoint:
Jenkins can execute:

```bash
docker version
docker compose version
```

---

# PHASE 14 — Put the project on GitHub

From the repository:

```bash
git status
git add .
git commit -m "Complete CampusPulse application"
git branch -M main
git push -u origin main
```

Check GitHub.

You should see:

campuspulse/
- frontend/
- backend/
- database/
- nginx/
- docker-compose.yml
- Jenkinsfile
- .gitignore
- README.md

---

# PHASE 15 — Create Jenkins Pipeline job

Recommended beginner option:
Jenkins → New Item → Pipeline

Name:

`CampusPulse-CI-CD`

Choose Pipeline.

In Pipeline definition choose:

`Pipeline script from SCM`

SCM:

`Git`

Repository URL:

`https://github.com/YOUR_USERNAME/campuspulse.git`

Branch:

`*/main`

Script Path:

`Jenkinsfile`

If repository is private:
Jenkins → Manage Jenkins → Credentials → add GitHub credential.

Use a GitHub token rather than a GitHub account password.

Then select that credential in the SCM configuration.

Save.

---

# PHASE 16 — Understand the Jenkinsfile

The pipeline is intentionally:

Checkout
↓
Install Dependencies
↓
Lint
↓
Test
↓
Build Frontend
↓
Docker Build
↓
Deploy
↓
Smoke Test

The critical rule is:

Test failure → later stages do not run.

That is the CI/CD proof.

The Jenkinsfile uses `checkout scm`, which is the correct Pipeline-as-Code pattern because Jenkins checks out the exact source associated with the Pipeline.

---

# PHASE 17 — First Jenkins build

Before webhook configuration, run one manual build.

Click:

`Build Now`

This first build is for troubleshooting.

Watch Console Output.

Expected:

```text
Checkout
Install Dependencies
Lint
Test
Build Frontend
Docker Build
Deploy
Smoke Test
```

At the end:

`Finished: SUCCESS`

Check:

```bash
docker compose ps
```

Check:

```bash
curl -f http://localhost/api/health
```

Open:

`http://localhost`

Checkpoint:
Jenkins can build and deploy the application.

---

# PHASE 18 — GitHub Webhook

GitHub webhooks send event notifications to an external server. Jenkins's GitHub plugin supports the GitHub webhook endpoint.

For a Jenkins server reachable as:

`https://YOUR-JENKINS-DOMAIN/`

the typical webhook endpoint is:

`https://YOUR-JENKINS-DOMAIN/github-webhook/`

In GitHub:

Repository
→ Settings
→ Webhooks
→ Add webhook

Payload URL:

`https://YOUR_PUBLIC_JENKINS_URL/github-webhook/`

Content type:

`application/json`

Events:

`Just the push event`

Active:

checked

Save.

Then use the webhook's Recent Deliveries section.

A successful delivery should return a successful HTTP status.

---

# PHASE 19 — Localhost webhook problem

If Jenkins is only:

`http://localhost:8080`

GitHub cannot call it.

For a classroom demonstration, create a temporary HTTPS tunnel.

Example concept:

Internet
→ HTTPS tunnel
→ localhost:8080
→ Jenkins

Use a reputable tunnel provider and its current official documentation.

Do not publish Jenkins permanently using an insecure anonymous tunnel.

Alternative:
Deploy Jenkins to an Ubuntu VM/server with a reachable IP/domain.

---

# PHASE 20 — Automatic trigger test

Change one small UI string.

Example:

`CampusPulse`

to:

`CampusPulse 🚀`

Then:

```bash
git add .
git commit -m "Update CampusPulse branding"
git push origin main
```

Do NOT click Build Now.

Show:
1. GitHub commit.
2. GitHub webhook delivery.
3. Jenkins build starts.
4. Jenkins stage visualization.
5. Successful deployment.
6. Browser refresh.
7. Updated UI.

This is the most important demonstration.

---

# PHASE 21 — Failure demonstration

This is your strongest viva demonstration.

Open:

`backend/tests/app.test.js`

Temporarily change a valid expectation to an invalid one.

For example:

```js
expect(res.statusCode).toBe(500);
```

when the endpoint actually returns 201.

Commit and push:

```bash
git add .
git commit -m "Demonstrate CI failure"
git push
```

Jenkins should:

Checkout ✓
Install ✓
Lint ✓
Test ❌
Build Frontend — skipped
Docker Build — skipped
Deploy — skipped
Smoke Test — skipped

Explain:

“The pipeline protects deployment by making testing a gate. Since the test stage failed, Jenkins never reaches deployment.”

Then restore the correct assertion:

```bash
git add .
git commit -m "Fix failing test"
git push
```

Now the pipeline should pass again.

---

# PHASE 22 — Health/smoke test

The project contains:

`GET /api/health`

Jenkins calls:

```bash
curl -fsS http://localhost/api/health
```

If the HTTP request fails, Jenkins marks the pipeline failed.

This proves:
- containers started
- nginx is reachable
- nginx can reach backend
- backend is responding

It is stronger than merely checking that a Docker container exists.

---

# PHASE 23 — Credentials

Never put these in Git:

- database password
- JWT secret
- GitHub token
- Docker Hub password
- SSH private key

For the base project, `.env` is created only on the deployment machine.

For an improved Jenkins deployment, store secrets in:

Manage Jenkins
→ Credentials
→ System
→ Global credentials

Then reference credentials by ID from the Jenkinsfile.

Example concept:

```groovy
withCredentials([string(credentialsId: 'campuspulse-jwt-secret', variable: 'JWT_SECRET')]) {
    sh '...'
}
```

Do not write the actual secret into the Jenkinsfile.

---

# PHASE 24 — Optional Docker Hub

Only after the local Jenkins pipeline works.

Advanced flow:

GitHub
→ Jenkins
→ Test
→ Docker Build
→ Docker Hub Push
→ Deployment host pulls image
→ Docker Compose starts image

This is useful if your instructor asks:

“Why build images inside Jenkins?”

You can answer:
“The CI server creates the deployable artifact, which can then be stored in a registry and deployed consistently.”

---

# PHASE 25 — Optional staging/production

Do this only if the base pipeline is stable.

Simple model:

`develop` → CI → staging

`main` → CI → approval → production

This demonstrates Continuous Delivery.

For a college project, it is optional and should not replace the simpler successful pipeline.

---

# PHASE 26 — Optional AWS EC2

Only after local/VM deployment works.

Architecture:

Developer
→ GitHub
→ Jenkins
→ Docker
→ AWS EC2
→ CampusPulse

On EC2:
- Ubuntu
- Java 21
- Jenkins
- Docker
- Git
- open HTTP/HTTPS and Jenkins administration carefully
- clone/use the repository

Do not expose Jenkins to the whole internet without authentication, updates and proper access control.

---

# PHASE 27 — Simple rollback

Do not over-engineer rollback.

Demonstration:

1. Version A works.
2. Version B is deployed.
3. Version B has a problem.
4. Identify the last known-good Git commit.
5. Revert/fix the change.
6. Push.
7. Jenkins redeploys the known-good source.

Advanced version:
Tag Docker images with Git commit IDs and deploy a previous image tag.

---

# PHASE 28 — Report

Use `docs/REPORT_OUTLINE.md`.

Target:
14–16 pages.

Make Jenkins the largest technical section.

Suggested distribution:
- Introduction/problem: 1–2 pages
- Application: 3 pages
- Architecture/database: 2 pages
- Docker: 2 pages
- Jenkins: 4–5 pages
- Testing/failure/health checks: 2 pages
- Results/conclusion: 1–2 pages

Do not fill pages with generic definitions. Use screenshots from YOUR Jenkins run.

---

# PHASE 29 — Handwritten 2-page note

Write in your own handwriting.

Suggested structure:

Page 1:
- Project title
- Objective
- Technologies
- Application workflow
- Docker architecture
- Jenkins pipeline

Page 2:
- GitHub webhook
- CI stages
- CD stages
- Health check
- Failure demonstration
- Result/conclusion

Use the actual commands and screenshots from your run as reference.

---

# PHASE 30 — Final college demo order

## Demo 1 — Application

Show:
- Student login
- Dashboard
- Report issue
- Issue list
- Upvote
- Events

## Demo 2 — Admin

Show:
- Admin login
- Issue management
- Status change
- Priority change
- Assignment
- Event creation/editing

## Demo 3 — Repository

Show:
- GitHub
- Jenkinsfile
- Dockerfile
- docker-compose.yml
- database/init.sql

## Demo 4 — Jenkins

Show:
- Build history
- Stage visualization
- Console output
- successful deployment

## Demo 5 — Automatic CI/CD

Make a tiny change.

```bash
git add .
git commit -m "Update dashboard"
git push
```

Do not click Build Now.

Show the webhook and automatic Jenkins build.

## Demo 6 — Failure

Break a test.

Push.

Show:
Test ❌
Deployment blocked.

Fix.

Push.

Show:
Test ✓
Docker ✓
Deploy ✓
Smoke Test ✓

This is the key proof that the project is genuinely CI/CD.

---

# FINAL CHECKLIST

Before your submission, verify:

- [ ] GitHub repository exists
- [ ] `.env` is not committed
- [ ] Student registration works
- [ ] Student login works
- [ ] Admin login works
- [ ] Issue creation works
- [ ] Issue list works
- [ ] Issue details work
- [ ] Voting works once per user
- [ ] Admin status update works
- [ ] Admin priority update works
- [ ] Admin assignment works
- [ ] Event create works
- [ ] Event edit works
- [ ] Event delete works
- [ ] PostgreSQL persists data
- [ ] Docker Compose works
- [ ] `curl http://localhost/api/health` works
- [ ] Backend tests pass
- [ ] Backend lint passes
- [ ] Frontend lint passes
- [ ] Frontend build passes
- [ ] Jenkins can access Docker
- [ ] Jenkins pipeline runs
- [ ] Test failure blocks deployment
- [ ] GitHub webhook triggers Jenkins
- [ ] No manual Build Now is needed for normal pushes
- [ ] Successful push changes the running application
- [ ] Report screenshots are captured
- [ ] Viva answers are prepared

# The one thing NOT to do

Do not jump straight to Jenkins if Docker Compose application deployment is still broken.

The correct learning sequence is:

Application
→ Docker
→ Jenkins
→ CI
→ CD
→ Webhook
→ Failure recovery
→ Optional improvements

That order keeps the project understandable and makes troubleshooting much easier.
