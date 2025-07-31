#!/bin/bash

# 🌐 SCRIPT DE SETUP ROUTE 53 + ACM
# Configura DNS e certificado SSL

set -e

# Variáveis
DOMAIN_NAME="aws-services.com"
HOSTED_ZONE_NAME="$DOMAIN_NAME."

echo "🌐 Iniciando setup Route 53 + ACM..."

# FASE 1: Criar hosted zone
echo "📍 Criando hosted zone..."
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name $DOMAIN_NAME \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' \
  --output text | cut -d'/' -f3)

echo "✅ Hosted Zone criada: $HOSTED_ZONE_ID"

# Obter name servers
echo "📋 Name servers:"
aws route53 get-hosted-zone \
  --id $HOSTED_ZONE_ID \
  --query 'DelegationSet.NameServers' \
  --output table

# FASE 2: Solicitar certificado ACM
echo "🔒 Solicitando certificado ACM..."
CERTIFICATE_ARN=$(aws acm request-certificate \
  --domain-name $DOMAIN_NAME \
  --subject-alternative-names "*.$DOMAIN_NAME" \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' \
  --output text)

echo "✅ Certificado solicitado: $CERTIFICATE_ARN"

# Aguardar validação DNS aparecer
echo "⏳ Aguardando informações de validação DNS..."
sleep 10

# Obter registros de validação
aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table

# FASE 3: Criar registros DNS automaticamente
echo "🔧 Criando registros de validação DNS..."

# Obter dados de validação
VALIDATION_DATA=$(aws acm describe-certificate \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
  --output json)

VALIDATION_NAME=$(echo $VALIDATION_DATA | jq -r '.Name')
VALIDATION_VALUE=$(echo $VALIDATION_DATA | jq -r '.Value')

# Criar registro CNAME para validação
cat > validation-record.json << EOF
{
  "Changes": [
    {
      "Action": "CREATE",
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
  --change-batch file://validation-record.json

echo "✅ Registro de validação criado"

# FASE 4: Aguardar validação do certificado
echo "⏳ Aguardando validação do certificado (pode levar alguns minutos)..."
aws acm wait certificate-validated \
  --certificate-arn $CERTIFICATE_ARN \
  --region us-east-1

echo "✅ Certificado validado!"

# Salvar informações importantes
cat > dns-config.txt << EOF
HOSTED_ZONE_ID=$HOSTED_ZONE_ID
CERTIFICATE_ARN=$CERTIFICATE_ARN
DOMAIN_NAME=$DOMAIN_NAME
EOF

echo "🎉 Setup Route 53 + ACM concluído!"
echo "📋 Informações salvas em dns-config.txt"
echo "⚠️  IMPORTANTE: Configure os name servers no seu registrador de domínio"

# Cleanup
rm -f validation-record.json