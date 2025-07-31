#!/bin/bash

cd ../backend

echo "📦 Instalando dependências..."
npm install
npm install -g serverless
npm install serverless-domain-manager

echo "🌐 Criando domínio customizado..."
export HOSTED_ZONE_ID="Z123456789"  # Substituir pelo real
sls create_domain --stage prod

echo "🚀 Fazendo deploy do backend..."
sls deploy --stage prod

echo "✅ Backend deployado!"
echo "📍 API URL: https://api-prod.aws-services.com"