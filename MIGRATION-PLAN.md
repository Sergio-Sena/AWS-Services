# 🚀 PLANO DE MIGRAÇÃO - ARQUITETURA FULL AWS

## 📋 **OBJETIVO**
Migrar de arquitetura híbrida (Vercel + AWS) para arquitetura totalmente AWS (S3 + CloudFront + Lambda + Route 53).

## 🏗️ **ARQUITETURA ATUAL vs NOVA**

### **ATUAL**
```
Frontend: Vercel (Next.js) → CDN Vercel
Backend: AWS Lambda + API Gateway
DNS: Não configurado
```

### **NOVA (Full AWS)**
```
Frontend: S3 + CloudFront → CDN AWS
Backend: Lambda + API Gateway (mantém)
DNS: Route 53 + ACM
Monitoramento: CloudWatch
```

## 📅 **CRONOGRAMA DE EXECUÇÃO**

### **FASE 1: Preparação (1 dia)**
- [ ] Criar bucket S3 para frontend
- [ ] Configurar website hosting no S3
- [ ] Testar build estático do Next.js

### **FASE 2: CloudFront (1 dia)**
- [ ] Criar distribuição CloudFront
- [ ] Configurar cache policies
- [ ] Testar CDN funcionando

### **FASE 3: DNS e SSL (1 dia)**
- [ ] Configurar Route 53 hosted zone
- [ ] Criar certificado ACM
- [ ] Configurar domínios customizados

### **FASE 4: Deploy Automatizado (1 dia)**
- [ ] Atualizar GitHub Actions
- [ ] Configurar deploy S3 + CloudFront
- [ ] Testar pipeline completo

### **FASE 5: Validação (1 dia)**
- [ ] Testes de performance
- [ ] Validação de funcionalidades
- [ ] Monitoramento CloudWatch

## 💰 **COMPARAÇÃO DE CUSTOS**

### **Atual (Vercel + AWS)**
- Vercel: $0-20/mês
- Lambda: $0-10/mês
- API Gateway: $0-5/mês
- **Total**: $0-35/mês

### **Nova (Full AWS)**
- S3: $1-5/mês
- CloudFront: $5-15/mês
- Lambda: $0-10/mês (mantém)
- API Gateway: $0-5/mês (mantém)
- Route 53: $0.50/mês
- ACM: Gratuito
- **Total**: $6.50-35.50/mês

## 🛠️ **COMANDOS DE EXECUÇÃO**

### **Fase 1: S3 Setup**
```bash
# Criar bucket
aws s3 mb s3://aws-services-dashboard-prod

# Configurar website hosting
aws s3 website s3://aws-services-dashboard-prod \
  --index-document index.html \
  --error-document 404.html

# Build e upload
cd frontend-next
npm run build
npm run export
aws s3 sync out/ s3://aws-services-dashboard-prod
```

### **Fase 2: CloudFront**
```bash
# Criar distribuição (via AWS CLI ou Console)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### **Fase 3: Route 53**
```bash
# Criar hosted zone
aws route53 create-hosted-zone \
  --name aws-services.com \
  --caller-reference $(date +%s)

# Criar certificado ACM
aws acm request-certificate \
  --domain-name aws-services.com \
  --subject-alternative-names *.aws-services.com \
  --validation-method DNS
```

## 📊 **VANTAGENS DA MIGRAÇÃO**

### **Performance**
- CloudFront: +400 pontos de presença
- Cache otimizado para conteúdo estático
- Latência reduzida globalmente

### **Integração**
- Todos serviços na mesma conta AWS
- Monitoramento unificado (CloudWatch)
- IAM centralizado

### **Escalabilidade**
- S3: 99.999999999% durabilidade
- CloudFront: Auto-scaling
- Lambda: Já configurado

### **Segurança**
- WAF integrado (opcional)
- Shield DDoS protection
- SSL/TLS gerenciado

## 🔧 **ARQUIVOS DE CONFIGURAÇÃO**

### **next.config.js (Atualizado)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.aws-services.com'
      : 'http://localhost:8000'
  }
}

module.exports = nextConfig
```

### **GitHub Actions (Atualizado)**
```yaml
name: Deploy Full AWS
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd frontend-next
          npm install
          npm run build
          npm run export
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend-next/out/ s3://aws-services-dashboard-prod --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Pré-Deploy**
- [ ] Backup da configuração atual
- [ ] Testes locais funcionando
- [ ] Credenciais AWS configuradas
- [ ] Domínio disponível para compra/configuração

### **Pós-Deploy**
- [ ] Frontend acessível via CloudFront
- [ ] Backend funcionando (Lambda)
- [ ] DNS resolvendo corretamente
- [ ] SSL/TLS ativo
- [ ] Performance adequada
- [ ] Monitoramento ativo

## 🚨 **PLANO DE ROLLBACK**

### **Se algo der errado:**
1. **Reverter DNS**: Apontar de volta para Vercel
2. **Manter Lambda**: Backend continua funcionando
3. **Logs**: CloudWatch para debugging
4. **Backup**: Configurações salvas no Git

### **Comandos de Rollback:**
```bash
# Reverter DNS (se necessário)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://rollback-dns.json

# Reativar Vercel (se necessário)
cd frontend-next
vercel --prod
```

## 📈 **MÉTRICAS DE SUCESSO**

### **Performance**
- Tempo de carregamento < 2s
- First Contentful Paint < 1s
- CloudFront cache hit ratio > 80%

### **Disponibilidade**
- Uptime > 99.9%
- Error rate < 0.1%
- Lambda cold starts < 1s

### **Custos**
- Redução ou manutenção dos custos atuais
- Previsibilidade de gastos
- Otimização de recursos

---

**Plano completo para migração para arquitetura Full AWS! 🚀**