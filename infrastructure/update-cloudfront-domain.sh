#!/bin/bash

# 🔗 SCRIPT PARA ATUALIZAR CLOUDFRONT COM DOMÍNIO CUSTOMIZADO
# Atualiza distribuição CloudFront com domínio e certificado SSL

set -e

# Carregar configurações
source dns-config.txt
DISTRIBUTION_ID=$(cat cloudfront-distribution-id.txt)

echo "🔗 Atualizando CloudFront com domínio customizado..."

# Obter configuração atual da distribuição
aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --query 'DistributionConfig' > current-config.json

# Obter ETag
ETAG=$(aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --query 'ETag' \
  --output text)

# Criar nova configuração com domínio customizado
cat current-config.json | jq --arg domain "$DOMAIN_NAME" --arg cert "$CERTIFICATE_ARN" '
  .Aliases = {
    "Quantity": 2,
    "Items": [$domain, ("www." + $domain)]
  } |
  .ViewerCertificate = {
    "ACMCertificateArn": $cert,
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CertificateSource": "acm"
  }
' > updated-config.json

# Atualizar distribuição
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file://updated-config.json \
  --if-match $ETAG

echo "✅ CloudFront atualizado com domínio customizado"

# Criar registros DNS para apontar para CloudFront
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

cat > dns-records.json << EOF
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "$DOMAIN_NAME",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "$CLOUDFRONT_DOMAIN",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z2FDTNDATAQYW2"
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.$DOMAIN_NAME",
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

# Criar registros DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://dns-records.json

echo "✅ Registros DNS criados"
echo "🌐 Site disponível em: https://$DOMAIN_NAME"
echo "⏳ Aguarde propagação DNS (5-10 minutos)"

# Cleanup
rm -f current-config.json updated-config.json dns-records.json