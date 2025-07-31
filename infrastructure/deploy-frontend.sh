#!/bin/bash

# 🚀 DEPLOY FRONTEND - Build e Deploy para S3 + CloudFront
# Script completo para build e deploy do frontend

set -e

BUCKET_NAME="aws-services-dashboard-prod"
CLOUDFRONT_DISTRIBUTION_ID=""

echo "🔨 Iniciando build e deploy do frontend..."

# Navegar para diretório do frontend
cd ../frontend-next

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🏗️ Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "out" ]; then
  echo "❌ Erro: Diretório 'out' não encontrado. Build falhou."
  exit 1
fi

# Deploy para S3
echo "☁️ Fazendo upload para S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

# Invalidar cache do CloudFront (se distribution ID estiver configurado)
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidando cache do CloudFront..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
else
  echo "⚠️ CLOUDFRONT_DISTRIBUTION_ID não configurado. Pule a invalidação."
fi

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"