## Run locally

- Enable HyperV on Windows Features

- AWS CLI ->
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

- Run the following command to install WSL using Powershell(You have to run in ADMIN mode):
```
wsl --install
```

- Run the app
```
npm run dev
```

- Run the app (not restarting)
```
npm start
```

## Configure AWS CLI 

AWS CREDENTIALS:
  ACCESS KEY: **AKIAXIUOYXSXQ4QLET6V**
  SECRET ACCESS KEY: **IaJDmctVF8hnsthgD+glbWJ7ZL8tsuYNQ/IhjBpJ**
  region: us-east-1

- Run the following command to start configuring

```
aws configure
```

- Run the following in the following order>

- Authenticate to ECR

```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 499589364911.dkr.ecr.us-east-1.amazonaws.com
```

- Build the image

```
docker build -t phl .
```

- Change the tag of the image to the appropriate tag of ECR

```
docker tag phl:latest 499589364911.dkr.ecr.us-east-1.amazonaws.com/phl:latest
```

- Push the new image to ECR

```
docker push 499589364911.dkr.ecr.us-east-1.amazonaws.com/phl:latest
```

NOTE: Every push you made to ECR, will trigger a new deploy process