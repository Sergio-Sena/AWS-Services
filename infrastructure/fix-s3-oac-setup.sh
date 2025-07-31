#!/bin/bash

# 🔧 SCRIPT PARA CORRIGIR S3 + OAC + CLOUDFRONT
# Resolve problemas de acesso negado configurando OAC corretamente

set -e

# Variáveis
BUCKET_NAME="portfolio-sergio-sena"
REGION="us-east-1"
DISTRIBUTION_ID="E24VZWIM609OXN"  # ID do seu CloudFront
OAC_ID="E24VZWIM609OXN"  # ID do seu OAC

echo "🔧 Corrigindo configuração S3 + OAC..."

# PASSO 1: Remover política pública do bucket
echo "🔒 Removendo acesso público do bucket..."
aws s3api delete-bucket-policy --bucket $BUCKET_NAME || echo "Política já removida"

# PASSO 2: Bloquear acesso público
echo "🚫 Bloqueando acesso público..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# PASSO 3: Criar política para OAC
echo "📝 Criando política para OAC..."
cat > oac-bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::969430605054:distribution/$DISTRIBUTION_ID"
        }
      }
    }
  ]
}
EOF

# PASSO 4: Aplicar política OAC
echo "🔐 Aplicando política OAC ao bucket..."
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://oac-bucket-policy.json

# PASSO 5: Verificar configuração do CloudFront
echo "☁️ Verificando configuração do CloudFront..."
aws cloudfront get-distribution --id $DISTRIBUTION_ID \
  --query 'Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId' \
  --output text

# PASSO 6: Invalidar cache do CloudFront
echo "🔄 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Configuração OAC corrigida!"
echo "📋 Verificações realizadas:"
echo "   ✓ Acesso público removido do S3"
echo "   ✓ Política OAC aplicada"
echo "   ✓ Cache invalidado"
echo ""
echo "🌐 Teste o acesso em: https://dev-cloud.sstechnologies-cloud.com"

# Cleanup
rm -f oac-bucket-policy.json

echo "⏰ Aguarde 5-10 minutos para propagação completa"