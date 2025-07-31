#!/bin/bash

# 🌐 SETUP SUBDOMÍNIO AWS-SERVICES.SSTECHNOLOGIES.COM
# Configura subdomínio, certificado SSL, CloudFront e alias

set -e

# Variáveis
SUBDOMAIN="aws-services.sstechnologies.com"
PARENT_DOMAIN="sstechnologies.com"
S3_BUCKET="aws-services-dashboard-prod"
REGION="us-east-1"

echo "🚀 Configurando subdomínio: $SUBDOMAIN"

# FASE 1: Obter Hosted Zone ID do domínio pai
echo "📍 Obtendo Hosted Zone ID para $PARENT_DOMAIN..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${PARENT_DOMAIN}.'].Id" \
  --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
  echo "❌ Hosted Zone não encontrada para $PARENT_DOMAIN"
  echo "💡 Criando nova hosted zone..."
  HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
    --name $PARENT_DOMAIN \
    --caller-reference $(date +%s) \
    --query 'HostedZone.Id' \
    --output text | cut -d'/' -f3)
fi

echo "✅ Hosted Zone ID: $HOSTED_ZONE_ID"

# FASE 2: Solicitar certificado ACM para o subdomínio
echo "🔒 Solicitando certificado SSL para $SUBDOMAIN..."
CERTIFICATE_ARN=$(aws acm request-certificate \
  --domain-name $SUBDOMAIN \
  --validation-method DNS \
  --region $REGION \
  --query 'CertificateArn' \
  --output text)

echo "✅ Certificado solicitado: $CERTIFICATE_ARN"

# Aguardar dados de validação
echo "⏳ Aguardando dados de validação DNS..."
sleep 15

# FASE 3: Criar registro de validação DNS
echo "🔧 Criando registro de validação DNS..."
VALIDATION_DATA=$(aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region $REGION \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
  --output json)

VALIDATION_NAME=$(echo $VALIDATION_DATA | jq -r '.Name')
VALIDATION_VALUE=$(echo $VALIDATION_DATA | jq -r '.Value')

# Criar arquivo de validação
cat > subdomain-validation.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$VALIDATION_NAME",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$VALIDATION_VALUE"
          }
        ]
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://subdomain-validation.json

echo "✅ Registro de validação criado"

# FASE 4: Aguardar validação do certificado
echo "⏳ Aguardando validação do certificado..."
aws acm wait certificate-validated \
  --certificate-arn $CERTIFICATE_ARN \
  --region $REGION

echo "✅ Certificado validado!"

# FASE 5: Criar configuração CloudFront com subdomínio
echo "☁️ Criando configuração CloudFront..."
cat > cloudfront-subdomain-config.json << EOF
{
  "CallerReference": "aws-services-subdomain-$(date +%s)",
  "Comment": "AWS Services Dashboard - Subdomínio sstechnologies.com",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$S3_BUCKET",
        "DomainName": "$S3_BUCKET.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$S3_BUCKET",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "Aliases": {
    "Quantity": 1,
    "Items": [
      "$SUBDOMAIN"
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERTIFICATE_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html", 
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

# FASE 6: Criar distribuição CloudFront
echo "🚀 Criando distribuição CloudFront..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-subdomain-config.json \
  --query 'Distribution.Id' \
  --output text)

echo "✅ Distribution ID: $DISTRIBUTION_ID"

# Obter domínio CloudFront
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo "📍 CloudFront Domain: $CLOUDFRONT_DOMAIN"

# FASE 7: Criar registro DNS A (alias) para o subdomínio
echo "🔧 Criando registro DNS alias..."
cat > subdomain-alias.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$SUBDOMAIN",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "$CLOUDFRONT_DOMAIN",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z2FDTNDATAQYW2"
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://subdomain-alias.json

echo "✅ Registro DNS alias criado"

# FASE 8: Aguardar deploy do CloudFront
echo "⏳ Aguardando deploy do CloudFront (15-20 minutos)..."
aws cloudfront wait distribution-deployed \
  --id $DISTRIBUTION_ID

# FASE 9: Salvar configurações
cat > subdomain-config.txt << EOF
SUBDOMAIN=$SUBDOMAIN
HOSTED_ZONE_ID=$HOSTED_ZONE_ID
CERTIFICATE_ARN=$CERTIFICATE_ARN
DISTRIBUTION_ID=$DISTRIBUTION_ID
CLOUDFRONT_DOMAIN=$CLOUDFRONT_DOMAIN
URL=https://$SUBDOMAIN
EOF

# Cleanup arquivos temporários
rm -f subdomain-validation.json cloudfront-subdomain-config.json subdomain-alias.json

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "================================"
echo "🌐 URL da aplicação: https://$SUBDOMAIN"
echo "☁️ CloudFront Distribution: $DISTRIBUTION_ID"
echo "🔒 Certificado SSL: Ativo"
echo "📍 DNS Alias: Configurado"
echo ""
echo "📋 Todas as configurações salvas em: subdomain-config.txt"
echo ""
echo "✅ Sua aplicação AWS Services está online em:"
echo "   👉 https://$SUBDOMAIN"