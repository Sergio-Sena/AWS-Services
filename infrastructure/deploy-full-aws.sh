#!/bin/bash

echo "🚀 INICIANDO MIGRAÇÃO FULL AWS"
echo "================================"

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado. Instale primeiro."
    exit 1
fi

# Verificar credenciais
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Credenciais AWS inválidas."
    exit 1
fi

echo "✅ AWS CLI configurado"

# PASSO 1: Testar build frontend
echo "📦 Testando build do frontend..."
cd ../frontend-next
npm install
npm run build
npm run export
cd ../infrastructure

# PASSO 2: Configurar S3
echo "🗄️ Configurando S3..."
chmod +x s3-setup.sh
./s3-setup.sh

# PASSO 3: Configurar CloudFront
echo "☁️ Configurando CloudFront..."
chmod +x cloudfront-setup.sh
./cloudfront-setup.sh

# PASSO 4: Deploy inicial
echo "🚀 Fazendo deploy inicial..."
aws s3 sync ../frontend-next/out/ s3://aws-services-dashboard-prod

echo "✅ MIGRAÇÃO CONCLUÍDA!"
echo "========================"
echo "📍 Próximos passos:"
echo "1. Configure Route 53 (route53-setup.sh)"
echo "2. Configure domínio customizado no backend"
echo "3. Atualize secrets no GitHub"
echo "4. Teste o pipeline completo"