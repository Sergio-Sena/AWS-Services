#!/bin/bash

# 🚀 FASE 1: S3 Setup para Frontend
# Script para criar e configurar bucket S3 para hosting estático

set -e

BUCKET_NAME="aws-services-dashboard-prod"
REGION="us-east-1"

echo "🔧 Configurando S3 bucket para frontend..."

# Criar bucket S3
echo "📦 Criando bucket S3: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configurar website hosting
echo "🌐 Configurando website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html

# Configurar política do bucket para acesso público
echo "🔓 Configurando política de acesso público..."
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

# Desabilitar bloqueio de acesso público
echo "🔧 Configurando acesso público..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Limpar arquivo temporário
rm bucket-policy.json

echo "✅ S3 bucket configurado com sucesso!"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"