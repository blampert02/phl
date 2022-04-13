## Requirements
Docker and docker compose installed (any version)
AWS CLI (pre-configured)

## Deploy 

1. Build the a new image with the changes made
2. Authentication using AWS CLI
3. Change the image tag to the given by AWS
4. Push the new tagged image to AWS 

Every push to ECR will trigger a deploy to AWS Runner based on the lastest tag of the image 🚀