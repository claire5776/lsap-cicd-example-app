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
    }

    post {
        always {
            junit '**/test-results.xml'
        }
    }
}

