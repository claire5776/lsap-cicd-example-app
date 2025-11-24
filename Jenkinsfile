pipeline {
    agent any

    tools {
        nodejs "NodeJS 25"
    }

    stages {

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t cicd-app-dev .'
            }
        }

        stage('Run container') {
            steps {
                sh '''
                    docker rm -f cicd-dev || true
                    docker run -d --name cicd-dev -p 8082:3000 cicd-app-dev
                '''
            }
        }

        stage('Health check') {
            steps {
                sh 'sleep 3'
                sh 'curl -f http://localhost:8082/health'
            }
        }
    }
}

