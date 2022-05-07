echo 'Authenticating with AWS...'
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 499589364911.dkr.ecr.us-east-1.amazonaws.com

echo 'Building the image...'
docker build -t phl .

echo 'Tagging with the appropriate tag'
docker tag phl:latest 499589364911.dkr.ecr.us-east-1.amazonaws.com/phl:latest

echo 'Pushing the image to AWS ECR'
docker push 499589364911.dkr.ecr.us-east-1.amazonaws.com/phl:latest