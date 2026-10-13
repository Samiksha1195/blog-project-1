pipeline {
    agent any 

    environment {
        FRONTEND_IMAGE = "samiksha1195/frontend"
        BACKEND_IMAGE  = "samiksha1195/backend"
        IMAGE_TAG      = "latest"
    }

    stages {

        stage('Clone Repo') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build \
                          -t $FRONTEND_IMAGE:$IMAGE_TAG .
                    '''
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build \
                          -t $BACKEND_IMAGE:$IMAGE_TAG .
                    '''
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                          -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                    docker push $FRONTEND_IMAGE:$IMAGE_TAG
                    docker push $BACKEND_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                sh '''
                    docker rm -f backend-container || true
                    docker rm -f frontend-container || true

                    docker run -d \
                      --name backend-container \
                      --restart unless-stopped \
                      -p 80:80 \
                      $BACKEND_IMAGE:$IMAGE_TAG

                    docker run -d \
                      --name frontend-container \
                      --restart unless-stopped \
                      -p 8081:80 \
                      $FRONTEND_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Verify Containers') {
            steps {
                sh '''
                    docker ps
                    docker logs --tail=50 backend-container
                    docker logs --tail=50 frontend-container
                '''
            }
        }
    }

    post {
        success {
            echo 'Frontend and backend images built, pushed, and deployed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }

        always {
            sh 'docker logout || true'
        }
    }
}
