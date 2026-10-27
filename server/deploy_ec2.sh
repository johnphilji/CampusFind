#!/bin/bash
set -e

# Update and install Node.js 20 & Git & PostgreSQL client
dnf update -y
dnf install -y git postgresql16
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Create application directory
mkdir -p /opt/campusfind
cd /opt/campusfind

# Clone repository
git clone https://github.com/johnphilji/CampusFind.git .

# Fetch configuration from SSM Parameter Store
AWS_REGION="ap-south-1"
DATABASE_URL=$(aws ssm get-parameter --name "/campusfind/database_url" --with-decryption --region $AWS_REGION --query "Parameter.Value" --output text)
JWT_SECRET=$(aws ssm get-parameter --name "/campusfind/jwt_secret" --with-decryption --region $AWS_REGION --query "Parameter.Value" --output text)

# Setup server environment file
cat <<EOF > /opt/campusfind/server/.env
PORT=5000
NODE_ENV=production
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=campusfind-uploads-880690594539
AWS_SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/880690594539/campusfind-claims-queue
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:880690594539:campusfind-claims-topic
CLIENT_ORIGIN=*
EOF

# Install dependencies and build client + server
npm install
npm run build

cd /opt/campusfind/server
npm install
npm run build

# Run DB migrations/schema setup against RDS
npm run db:setup
npm run db:seed

# Install PM2 and run app continuously
npm install -g pm2
pm2 start dist/index.js --name "campusfind-api"
pm2 startup systemd -u root --hp /root
pm2 save

echo "CampusFind deployed successfully!"
