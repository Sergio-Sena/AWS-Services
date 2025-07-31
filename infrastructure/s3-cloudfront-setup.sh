#!/bin/bash

# 🚀 SCRIPT DE SETUP S3 + CLOUDFRONT
# Configura bucket S3 e distribuição CloudFront para o frontend

set -e

# Variáveis
BUCKET_NAME="aws-services-dashboard-prod"
REGION="us-east-1"
DOMAIN_NAME="aws-services.com"

echo "🚀 Iniciando setup S3 + CloudFront..."

# FASE 1: Criar e configurar bucket S3
echo "📦 Criando bucket S3..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

echo "🌐 Configurando website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html

echo "🔓 Configurando política do bucket..."
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

# FASE 2: Build e deploy do frontend
echo "🔨 Fazendo build do frontend..."
cd ../frontend-next
npm install
npm run build

echo "📤 Fazendo upload para S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

# FASE 3: Criar distribuição CloudFront
echo "☁️ Criando distribuição CloudFront..."
cd ../infrastructure

cat > cloudfront-distribution.json << EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "AWS Services Dashboard - Frontend Distribution",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-distribution.json \
  --query 'Distribution.Id' \
  --output text)

echo "✅ Distribuição CloudFront criada: $DISTRIBUTION_ID"
echo "🌐 URL CloudFront: https://$DISTRIBUTION_ID.cloudfront.net"

# Salvar ID da distribuição
echo $DISTRIBUTION_ID > cloudfront-distribution-id.txt

echo "🎉 Setup S3 + CloudFront concluído!"
echo "📋 Próximos passos:"
echo "   1. Aguardar deploy da distribuição (~15 min)"
echo "   2. Configurar Route 53 e ACM"
echo "   3. Atualizar GitHub Actions"

# Cleanup
rm -f bucket-policy.json cloudfront-distribution.json