#!/bin/bash

# 🚀 Script para configurar recursos AWS para o pipeline CI/CD
# Executa: bash setup-pipeline-resources.sh

set -e

echo "🚀 Configurando recursos AWS para pipeline CI/CD..."

# Variáveis
REGION="us-east-1"
DOMAIN="aws-services.com"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Criar buckets S3
log "Criando buckets S3..."

BUCKETS=("aws-services-dashboard-dev" "aws-services-dashboard-test" "aws-services-dashboard-prod")

for bucket in "${BUCKETS[@]}"; do
    if aws s3 ls "s3://$bucket" 2>/dev/null; then
        warn "Bucket $bucket já existe"
    else
        log "Criando bucket: $bucket"
        aws s3 mb "s3://$bucket" --region $REGION
        
        # Configurar website hosting
        aws s3 website "s3://$bucket" \
            --index-document index.html \
            --error-document 404.html
        
        # Configurar política pública
        cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$bucket/*"
        }
    ]
}
EOF
        
        aws s3api put-bucket-policy \
            --bucket $bucket \
            --policy file:///tmp/bucket-policy.json
        
        log "✅ Bucket $bucket configurado"
    fi
done

# 2. Criar distribuições CloudFront
log "Criando distribuições CloudFront..."

ENVIRONMENTS=("dev" "test" "prod")

for env in "${ENVIRONMENTS[@]}"; do
    bucket="aws-services-dashboard-$env"
    
    # Verificar se distribuição já existe
    existing_dist=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='$env-distribution'].Id" \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$existing_dist" ]; then
        warn "Distribuição CloudFront para $env já existe: $existing_dist"
        continue
    fi
    
    log "Criando distribuição CloudFront para $env..."
    
    # Criar configuração da distribuição
    cat > /tmp/cloudfront-$env.json << EOF
{
    "CallerReference": "$env-$(date +%s)",
    "Comment": "$env-distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "$bucket",
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
        "MaxTTL": 31536000
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "$bucket",
                "DomainName": "$bucket.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF
    
    # Criar distribuição
    dist_id=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cloudfront-$env.json \
        --query 'Distribution.Id' \
        --output text)
    
    log "✅ Distribuição CloudFront criada para $env: $dist_id"
    
    # Salvar ID para uso posterior
    echo "CLOUDFRONT_DISTRIBUTION_ID_$(echo $env | tr '[:lower:]' '[:upper:]')=$dist_id" >> /tmp/cloudfront-ids.txt
done

# 3. Configurar Route 53 (opcional)
read -p "Deseja configurar Route 53? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Configurando Route 53..."
    
    # Verificar se hosted zone já existe
    hosted_zone_id=$(aws route53 list-hosted-zones \
        --query "HostedZones[?Name=='$DOMAIN.'].Id" \
        --output text 2>/dev/null | cut -d'/' -f3 || echo "")
    
    if [ -n "$hosted_zone_id" ]; then
        warn "Hosted Zone para $DOMAIN já existe: $hosted_zone_id"
    else
        log "Criando Hosted Zone para $DOMAIN..."
        hosted_zone_id=$(aws route53 create-hosted-zone \
            --name $DOMAIN \
            --caller-reference "$(date +%s)" \
            --query 'HostedZone.Id' \
            --output text | cut -d'/' -f3)
        
        log "✅ Hosted Zone criada: $hosted_zone_id"
    fi
    
    echo "HOSTED_ZONE_ID=$hosted_zone_id" >> /tmp/cloudfront-ids.txt
fi

# 4. Criar usuário IAM para GitHub Actions
log "Configurando usuário IAM para GitHub Actions..."

IAM_USER="github-actions-aws-services"

# Verificar se usuário já existe
if aws iam get-user --user-name $IAM_USER 2>/dev/null; then
    warn "Usuário IAM $IAM_USER já existe"
else
    log "Criando usuário IAM: $IAM_USER"
    aws iam create-user --user-name $IAM_USER
    
    # Criar política personalizada
    cat > /tmp/github-actions-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:PutBucketWebsite"
            ],
            "Resource": [
                "arn:aws:s3:::aws-services-dashboard-*",
                "arn:aws:s3:::aws-services-dashboard-*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetDistribution",
                "cloudfront:ListDistributions"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*",
                "apigateway:*",
                "iam:PassRole",
                "cloudformation:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    # Criar política
    aws iam create-policy \
        --policy-name GitHubActionsAWSServicesPolicy \
        --policy-document file:///tmp/github-actions-policy.json
    
    # Anexar política ao usuário
    aws iam attach-user-policy \
        --user-name $IAM_USER \
        --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/GitHubActionsAWSServicesPolicy"
    
    # Criar access keys
    log "Criando access keys..."
    aws iam create-access-key --user-name $IAM_USER > /tmp/access-keys.json
    
    access_key=$(cat /tmp/access-keys.json | jq -r '.AccessKey.AccessKeyId')
    secret_key=$(cat /tmp/access-keys.json | jq -r '.AccessKey.SecretAccessKey')
    
    echo "AWS_ACCESS_KEY_ID=$access_key" >> /tmp/cloudfront-ids.txt
    echo "AWS_SECRET_ACCESS_KEY=$secret_key" >> /tmp/cloudfront-ids.txt
    
    log "✅ Usuário IAM configurado"
fi

# 5. Resumo final
echo
log "🎉 Configuração concluída!"
echo
log "📋 Secrets para configurar no GitHub Actions:"
echo "=============================================="
if [ -f /tmp/cloudfront-ids.txt ]; then
    cat /tmp/cloudfront-ids.txt
fi
echo
warn "⚠️  Salve estes valores em um local seguro!"
warn "⚠️  Configure os secrets no GitHub: Settings > Secrets and variables > Actions"
echo
log "📚 Próximos passos:"
echo "1. Configure os secrets no GitHub Actions"
echo "2. Crie as branches: dev, test, main"
echo "3. Faça push para testar o pipeline"
echo
log "✅ Pipeline pronto para uso!"

# Limpeza
rm -f /tmp/bucket-policy.json /tmp/cloudfront-*.json /tmp/github-actions-policy.json /tmp/access-keys.json