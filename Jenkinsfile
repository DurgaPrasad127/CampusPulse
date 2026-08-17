pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    COMPOSE_PROJECT_NAME = 'campuspulse'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm install --prefix backend'
        bat 'npm install --prefix frontend'
      }
    }

    stage('Lint') {
      steps {
        bat 'npm run lint --prefix backend'
        bat 'npm run lint --prefix frontend'
      }
    }

    stage('Test') {
      steps {
        bat 'npm test --prefix backend -- --ci'
      }
    }

    stage('Build Frontend') {
      steps {
        bat 'npm run build --prefix frontend'
      }
    }

    stage('Docker Build') {
      steps {
        bat 'docker compose build --pull'
      }
    }

    stage('Deploy') {
      steps {
        bat 'docker compose up -d --remove-orphans'
      }
    }

    stage('Smoke Test') {
      steps {
        bat '''
          powershell -Command "$ok=$false; for($i=1;$i -le 30;$i++){ try { Invoke-WebRequest -Uri http://localhost/api/health -UseBasicParsing -ErrorAction Stop; $ok=$true; break } catch { Start-Sleep -Seconds 2 } }; if(-not $ok){ exit 1 }"
        '''
      }
    }
  }

  post {
    success {
      echo 'CampusPulse CI/CD pipeline completed successfully.'
    }

    failure {
      echo 'Pipeline failed. Deployment stages after the failure point were not executed.'
    }

    always {
      bat 'docker compose ps'
    }
  }
}