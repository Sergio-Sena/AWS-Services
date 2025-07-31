#!/bin/bash

# Configuração S3 para Frontend
BUCKET_NAME="aws-services-dashboard-prod"
REGION="us-east-1"

echo "🚀 Criando bucket S3..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

echo "🌐 Configurando website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html

echo "🔓 Configurando política pública..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json

echo "✅ S3 configurado com sucesso!"
echo "📍 URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"