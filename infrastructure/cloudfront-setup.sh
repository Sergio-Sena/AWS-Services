#!/bin/bash

echo "☁️ Criando distribuição CloudFront..."

# Criar distribuição
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --query 'Distribution.Id' \
  --output text)

echo "📍 Distribution ID: $DISTRIBUTION_ID"
echo "⏳ Aguardando deploy (pode levar 15-20 minutos)..."

# Aguardar deploy
aws cloudfront wait distribution-deployed \
  --id $DISTRIBUTION_ID

# Obter URL da distribuição
DOMAIN_NAME=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo "✅ CloudFront configurado!"
echo "🌐 URL: https://$DOMAIN_NAME"
echo "📝 Salve o Distribution ID: $DISTRIBUTION_ID"