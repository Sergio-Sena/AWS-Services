#!/bin/bash

DOMAIN_NAME="aws-services.com"
CLOUDFRONT_DOMAIN="d123456789.cloudfront.net"  # Substituir pelo real

echo "🌐 Configurando Route 53..."

# Criar hosted zone
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name $DOMAIN_NAME \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' \
  --output text | cut -d'/' -f3)

echo "📍 Hosted Zone ID: $HOSTED_ZONE_ID"

# Solicitar certificado ACM
echo "🔒 Solicitando certificado SSL..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name $DOMAIN_NAME \
  --subject-alternative-names "*.$DOMAIN_NAME" \
  --validation-method DNS \
  --query 'CertificateArn' \
  --output text)

echo "📜 Certificate ARN: $CERT_ARN"

# Obter registros de validação DNS
echo "⏳ Aguardando registros de validação..."
sleep 10

aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table

echo "✅ Route 53 configurado!"
echo "📝 Configure os nameservers no seu provedor de domínio:"
aws route53 get-hosted-zone \
  --id $HOSTED_ZONE_ID \
  --query 'DelegationSet.NameServers' \
  --output table