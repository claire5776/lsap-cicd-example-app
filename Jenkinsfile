pipeline {
    agent any

    tools {
        nodejs "NodeJS 25"
    }

    environment {
        SLACK_WEBHOOK = credentials('slack-webhook')
        IMAGE_NAME    = "myapp" // Will be combined with Docker username from credentials
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                  usernameVariable: 'DOCKER_USER', 
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                    docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}

                    docker build -t ${DOCKER_USER}/${IMAGE_NAME}:dev-${BUILD_NUMBER} .
                    docker push ${DOCKER_USER}/${IMAGE_NAME}:dev-${BUILD_NUMBER}

                    # Remove old container
                    docker rm -f dev-app 2>/dev/null || true

                    # Wait until container is fully removed
                    for i in {1..10}; do
                        if ! docker ps -a --format '{{.Names}}' | grep -q '^dev-app$'; then
                            break
                        fi
                        echo "Waiting for dev-app container removal..."
                        sleep 1
                    done

                    docker run -d --name dev-app -p 8081:3000 ${DOCKER_USER}/${IMAGE_NAME}:dev-${BUILD_NUMBER}

                    for i in {1..10}; do
                        if curl -s http://localhost:8081/health; then
                            echo "dev-app is ready"
                            break
                        fi
                        echo "Waiting for dev-app..."
                        sleep 2
                    done
                    """
                }
            }
        }

        stage('Promote & Deploy to Production') {
            when { branch 'main' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                  usernameVariable: 'DOCKER_USER', 
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                    docker pull ${DOCKER_USER}/${IMAGE_NAME}:${TARGET_TAG}
                    docker tag ${DOCKER_USER}/${IMAGE_NAME}:${TARGET_TAG} ${DOCKER_USER}/${IMAGE_NAME}:prod-${BUILD_NUMBER}
                    docker push ${DOCKER_USER}/${IMAGE_NAME}:prod-${BUILD_NUMBER}

                    docker rm -f prod-app || true
                    docker run -d --name prod-app -p 8082:3000 ${DOCKER_USER}/${IMAGE_NAME}:prod-${BUILD_NUMBER}
                    """
                }
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
