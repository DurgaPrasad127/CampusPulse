pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    COMPOSE_PROJECT_NAME = 'campuspulse'

    // Demo/local Jenkins deployment values.
    // Do NOT use real production secrets here.
    JWT_SECRET = 'campuspulse-jenkins-demo-secret'
    POSTGRES_PASSWORD = 'campuspulse-db-password'
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
        bat '"C:\\Users\\pandr\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" build --pull'
      }
    }

    stage('Deploy') {
      steps {
        bat '"C:\\Users\\pandr\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" up -d'
      }
    }

    stage('Smoke Test') {
      steps {
        bat '"C:\\Users\\pandr\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" ps'
      }
    }
  }

  post {
    success {
      echo 'CampusPulse CI/CD pipeline completed successfully.'
      bat '"C:\\Users\\pandr\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" ps'
    }

    failure {
      echo 'Pipeline failed. Check the failed stage in Console Output.'
    }

    always {
      echo 'CampusPulse pipeline execution finished.'
    }
  }
}