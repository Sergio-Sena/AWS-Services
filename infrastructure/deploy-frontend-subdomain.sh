#!/bin/bash

# 🚀 DEPLOY FRONTEND PARA SUBDOMÍNIO
# Deploy do Next.js para S3 com configurações do subdomínio

set -e

# Variáveis
S3_BUCKET="aws-services-dashboard-prod"
FRONTEND_DIR="../frontend-next"
SUBDOMAIN="aws-services.sstechnologies.com"

echo "🚀 Iniciando deploy do frontend para subdomínio..."

# FASE 1: Verificar se bucket existe
echo "📦 Verificando bucket S3..."
if ! aws s3 ls "s3://$S3_BUCKET" > /dev/null 2>&1; then
  echo "🔧 Criando bucket S3..."
  aws s3 mb "s3://$S3_BUCKET" --region us-east-1
  
  # Configurar bucket para website
  aws s3 website "s3://$S3_BUCKET" \
    --index-document index.html \
    --error-document index.html
fi

# FASE 2: Build do Next.js
echo "🔨 Fazendo build do Next.js..."
cd $FRONTEND_DIR

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Build para produção
echo "⚙️ Executando build..."
npm run build

# FASE 3: Sync com S3
echo "☁️ Fazendo upload para S3..."
aws s3 sync out/ "s3://$S3_BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML com cache menor
aws s3 sync out/ "s3://$S3_BUCKET" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "*.json"

# FASE 4: Configurar política do bucket
echo "🔒 Configurando política do bucket..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $S3_BUCKET \
  --policy file://bucket-policy.json

# Cleanup
rm bucket-policy.json

cd ../infrastructure

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo "==================="
echo "📦 Bucket S3: $S3_BUCKET"
echo "🌐 Conteúdo sincronizado"
echo "🔒 Política pública configurada"
echo ""
echo "🎯 Próximo passo: Execute o script de configuração do subdomínio"
echo "   👉 ./setup-subdomain-sstechnologies.sh"