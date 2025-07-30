#!/bin/bash

# Script para deploy da infraestrutura DNS
# Execute: bash infrastructure/deploy-dns.sh

STACK_NAME="aws-services-dns"
TEMPLATE_FILE="infrastructure/route53.yml"
REGION="us-east-1"

echo "🚀 Deploying DNS infrastructure..."

# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file $TEMPLATE_FILE \
  --stack-name $STACK_NAME \
  --region $REGION \
  --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo "✅ DNS infrastructure deployed successfully!"
    
    # Get outputs
    echo ""
    echo "📋 Stack Outputs:"
    aws cloudformation describe-stacks \
      --stack-name $STACK_NAME \
      --region $REGION \
      --query 'Stacks[0].Outputs' \
      --output table
    
    # Get Hosted Zone ID for GitHub Secrets
    HOSTED_ZONE_ID=$(aws cloudformation describe-stacks \
      --stack-name $STACK_NAME \
      --region $REGION \
      --query 'Stacks[0].Outputs[?OutputKey==`HostedZoneId`].OutputValue' \
      --output text)
    
    echo ""
    echo "🔑 Add this to GitHub Secrets:"
    echo "HOSTED_ZONE_ID=$HOSTED_ZONE_ID"
    
else
    echo "❌ DNS infrastructure deployment failed!"
    exit 1
fi