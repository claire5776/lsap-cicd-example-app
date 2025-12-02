pipeline {
    agent any

    tools {
        nodejs "NodeJS 25"
    }

    stages {

        stage('Static Analysis') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        failure {
            script {
                def payload = """
                {
                    "text": "*CI Build Failed!* :x:
                    *Name:* Claire Lin
                    *Student ID:* <INSERT_YOUR_ID>
                    *Job:* ${env.JOB_NAME}
                    *Build:* ${env.BUILD_NUMBER}
                    *Repo:* ${env.GIT_URL}
                    *Branch:* ${env.BRANCH_NAME}
                    *Status:* ${currentBuild.currentResult}"
                }
                """

                sh """
                curl -X POST -H 'Content-type: application/json' \
                --data '${payload}' \
                <YOUR_SLACK_WEBHOOK_URL>
                """
            }
        }
    }
}
