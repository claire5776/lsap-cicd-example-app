pipeline {
    agent any

    tools {
        nodejs "NodeJS 25"
    }

    environment {
        SLACK_WEBHOOK = credentials('slack-webhook')

        DOCKER_USER = credentials('dockerhub-user')
        DOCKER_PASS = credentials('dockerhub-pass')
        IMAGE_NAME  = "${DOCKER_USER}/myapp"
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

        stage('Build & Deploy to Staging') {
            when { branch 'dev' }
            steps {
                sh """
                docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}

                docker build -t ${IMAGE_NAME}:dev-${BUILD_NUMBER} .
                docker push ${IMAGE_NAME}:dev-${BUILD_NUMBER}

                docker rm -f dev-app || true
                docker run -d --name dev-app -p 8081:3000 ${IMAGE_NAME}:dev-${BUILD_NUMBER}

                sleep 5
                curl -f http://localhost:8081/health
                """
            }
        }

        stage('Promote & Deploy to Production') {
            when { branch 'main' }
            steps {
                sh """
                docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}

                TARGET_TAG=\$(cat deploy.config)

                docker pull ${IMAGE_NAME}:\$TARGET_TAG
                docker tag ${IMAGE_NAME}:\$TARGET_TAG ${IMAGE_NAME}:prod-${BUILD_NUMBER}
                docker push ${IMAGE_NAME}:prod-${BUILD_NUMBER}

                docker rm -f prod-app || true
                docker run -d --name prod-app -p 8082:3000 ${IMAGE_NAME}:prod-${BUILD_NUMBER}
                """
            }
        }
    }

    post {
        failure {
            script {
                def payload = """
                {
                  "text": "*Pipeline Failed!* :x:
                  *Name:* Claire Lin
                  *Student ID:* B10705004
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
                $SLACK_WEBHOOK
                """
            }
        }
    }
}
