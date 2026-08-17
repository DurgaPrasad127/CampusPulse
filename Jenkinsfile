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
      steps { checkout scm }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install --prefix backend'
        sh 'npm install --prefix frontend'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint --prefix backend'
        sh 'npm run lint --prefix frontend'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test --prefix backend -- --ci'
      }
    }

    stage('Build Frontend') {
      steps { sh 'npm run build --prefix frontend' }
    }

    stage('Docker Build') {
      steps {
        sh 'docker compose build --pull'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --remove-orphans'
      }
    }

    stage('Smoke Test') {
      steps {
        sh 'for i in $(seq 1 30); do curl -fsS http://localhost/api/health && exit 0; sleep 2; done; exit 1'
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
      sh 'docker compose ps || true'
    }
  }
}
