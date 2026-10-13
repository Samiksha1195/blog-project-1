pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        DOCKERHUB_USER = 'samiksha1195'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
        APP_HOST = '10.0.2.10'
    }

    stages {
        stage('Checkout') {
            steps {
                    checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                  docker build -t $DOCKERHUB_USER/frontend:latest "$FRONTEND_DIR"
                  docker build -t $DOCKERHUB_USER/backend:latest "$BACKEND_DIR"
                '''
            }
        }
	

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DH_PASS" | docker login \
                        -u "$DH_USER" --password-stdin

                      docker push $DOCKERHUB_USER/frontend:latest
                      docker push $DOCKERHUB_USER/backend:latest

                      docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['77e07fe4-5e2e-49f0-8afb-a90407a9ae2b']) {
                    sh '''
                      ssh -o StrictHostKeyChecking=accept-new \
                        ec2-user@$APP_HOST \
                        'sudo docker pull samiksha1195/frontend:latest &&
                         sudo docker pull samiksha1195/backend:latest &&
                         sudo docker rm -f frontend backend || true'
                    '''
                }

                sshagent(credentials: ['77e07fe4-5e2e-49f0-8afb-a90407a9ae2b']) {
                    sh '''
                      ssh ec2-user@$APP_HOST \
                        'sudo docker run -d --restart unless-stopped \
                         --name frontend -p 80:80 \
                         samiksha1195/frontend:latest'

                      ssh ec2-user@$APP_HOST \
                        'sudo docker run -d --restart unless-stopped \
                         --name backend -p 8081:80 \
                         samiksha1195/backend:latest'
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Blogging platform deployment succeeded.'
        }
        failure {
            echo 'Deployment failed. Review the console output.'
        }
    }
}
