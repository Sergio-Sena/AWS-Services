# 🚀 **GUIA DE DEPLOY - AWS SERVICES DASHBOARD**

## 📋 **ARQUITETURA**

### **Frontend**
- **Vercel** - Next.js com CDN global
- **Route 53** - DNS personalizado
- **Domínios**: `aws-services.com`, `test.aws-services.com`, `dev.aws-services.com`

### **Backend**
- **AWS Lambda** - Serverless functions
- **API Gateway** - REST API management
- **Route 53** - DNS para API
- **Domínios**: `api.aws-services.com`, `api-test.aws-services.com`, `api-dev.aws-services.com`

---

## 💰 **CUSTOS ESTIMADOS**

| Serviço | Desenvolvimento | Produção |
|---------|----------------|----------|
| Vercel | Gratuito | $0-20/mês |
| Route 53 | $0.50/mês | $2-5/mês |
| Lambda | Gratuito | $0-10/mês |
| API Gateway | Gratuito | $0-5/mês |
| **Total** | **$0.50/mês** | **$2-40/mês** |

---

## 🌳 **BRANCHES E AMBIENTES**

```
main (produção)     → aws-services.com + api.aws-services.com
├── test            → test.aws-services.com + api-test.aws-services.com
└── dev             → dev.aws-services.com + api-dev.aws-services.com
```

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### **1. Preparar Repositório**
```bash
# Criar branches
git checkout -b dev
git checkout -b test
git push origin dev test

# Estrutura de arquivos
mkdir -p .github/workflows
mkdir -p docs
mkdir -p infrastructure
```

### **2. Configurar Vercel**
```bash
# Instalar CLI
npm i -g vercel

# Conectar projeto
vercel link

# Configurar domínios
vercel domains add aws-services.com
vercel domains add test.aws-services.com
vercel domains add dev.aws-services.com
```

### **3. Configurar AWS**
```bash
# Instalar Serverless
npm install -g serverless

# Configurar credenciais
aws configure
# ou
serverless config credentials --provider aws --key ACCESS_KEY --secret SECRET_KEY
```

---

## 📁 **ARQUIVOS DE CONFIGURAÇÃO**

### **Frontend - vercel.json**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.aws-services.com"
  },
  "github": {
    "enabled": true
  },
  "git": {
    "deploymentEnabled": {
      "main": true,
      "test": true,
      "dev": true
    }
  }
}
```

### **Backend - serverless.yml**
```yaml
service: aws-services-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}

functions:
  api:
    handler: server.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors:
            origin: 
              - https://aws-services.com
              - https://test.aws-services.com
              - https://dev.aws-services.com
            headers:
              - Content-Type
              - Authorization
              - access_key
              - secret_key

custom:
  customDomain:
    domainName: api-${self:provider.stage}.aws-services.com
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true

plugins:
  - serverless-domain-manager
```

### **GitHub Actions - deploy-lambda-prod.yml**
```yaml
name: Deploy Lambda PROD
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Install Serverless
        run: npm install -g serverless
        
      - name: Deploy to PROD
        run: |
          cd backend
          serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 🚀 **COMANDOS DE DEPLOY**

### **Deploy Automático (Recomendado)**
```bash
# Frontend (Vercel automático)
git push origin dev    # → dev.aws-services.com
git push origin test   # → test.aws-services.com
git push origin main   # → aws-services.com

# Backend (GitHub Actions automático)
git push origin dev    # → api-dev.aws-services.com
git push origin test   # → api-test.aws-services.com
git push origin main   # → api.aws-services.com
```

### **Deploy Manual (Se necessário)**
```bash
# Backend
cd backend
serverless deploy --stage dev
serverless deploy --stage test
serverless deploy --stage prod

# Frontend
vercel --prod
```

---

## 🔍 **MONITORAMENTO**

### **URLs de Monitoramento**
- **Frontend DEV**: https://dev.aws-services.com
- **Frontend TEST**: https://test.aws-services.com
- **Frontend PROD**: https://aws-services.com
- **API DEV**: https://api-dev.aws-services.com/health
- **API TEST**: https://api-test.aws-services.com/health
- **API PROD**: https://api.aws-services.com/health

### **Logs**
```bash
# Lambda logs
serverless logs -f api --stage prod --tail

# Vercel logs
vercel logs aws-services.com
```

### **CloudWatch**
- Console AWS → CloudWatch → Log Groups
- `/aws/lambda/aws-services-api-prod-api`

---

## 🔒 **SECRETS E VARIÁVEIS**

### **GitHub Secrets**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### **Vercel Environment Variables**
```
NEXT_PUBLIC_API_URL (por ambiente)
```

---

## 🛠️ **TROUBLESHOOTING**

### **Problemas Comuns**

**1. Domain não funciona**
```bash
# Verificar DNS
nslookup aws-services.com

# Recriar domínio
serverless delete_domain --stage prod
serverless create_domain --stage prod
```

**2. CORS Error**
```javascript
// Verificar origins no serverless.yml
cors:
  origin: 
    - https://aws-services.com
    - https://test.aws-services.com
    - https://dev.aws-services.com
```

**3. Lambda Cold Start**
```yaml
# Adicionar warmup plugin
plugins:
  - serverless-plugin-warmup

functions:
  api:
    warmup: true
```

**4. Build Error Vercel**
```bash
# Limpar cache
vercel --prod --force

# Verificar logs
vercel logs
```

---

## 📊 **HEALTH CHECKS**

### **Verificar Status**
```bash
# API Health
curl https://api.aws-services.com/health

# Frontend
curl -I https://aws-services.com

# DNS
dig aws-services.com
```

### **Resposta Esperada API**
```json
{
  "status": "ok",
  "stage": "prod",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔄 **ROLLBACK**

### **Frontend (Vercel)**
```bash
# Listar deployments
vercel ls

# Rollback para deployment anterior
vercel rollback [deployment-url]
```

### **Backend (Lambda)**
```bash
# Rollback para versão anterior
serverless rollback --stage prod --timestamp 2024-01-15T10:30:00

# Ou usar Git
git revert HEAD
git push origin main
```

---

## 📈 **OTIMIZAÇÃO**

### **Performance**
- ✅ Vercel CDN global ativo
- ✅ Lambda provisioned concurrency (se necessário)
- ✅ API Gateway caching
- ✅ Route 53 health checks

### **Custos**
- ✅ Lambda on-demand pricing
- ✅ DynamoDB on-demand
- ✅ S3 lifecycle policies
- ✅ CloudWatch log retention

---

## 🎯 **FLUXO DE TRABALHO**

### **Desenvolvimento**
1. `git checkout dev`
2. Fazer alterações
3. `git push origin dev`
4. **Automático**: Deploy para ambientes DEV

### **Teste**
1. `git checkout test`
2. `git merge dev`
3. `git push origin test`
4. **Automático**: Deploy para ambientes TEST

### **Produção**
1. `git checkout main`
2. `git merge test`
3. `git push origin main`
4. **Automático**: Deploy para ambientes PROD

---

## 📞 **SUPORTE**

### **Documentação**
- [Vercel Docs](https://vercel.com/docs)
- [Serverless Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)

### **Comandos Úteis**
```bash
# Status dos serviços
vercel ls
serverless info --stage prod

# Logs em tempo real
serverless logs -f api --stage prod --tail
vercel logs --follow

# Limpar cache
vercel --prod --force
serverless deploy --stage prod --force
```

---

## ✅ **CHECKLIST DE DEPLOY**

### **Primeira Vez**
- [ ] Configurar Route 53 hosted zone
- [ ] Configurar domínios na Vercel
- [ ] Configurar secrets no GitHub
- [ ] Deploy inicial do backend
- [ ] Testar health checks
- [ ] Configurar monitoramento

### **Deploy Regular**
- [ ] Testar em DEV
- [ ] Testar em TEST
- [ ] Deploy para PROD
- [ ] Verificar health checks
- [ ] Monitorar logs

---

**Guia completo para deploy e manutenção do AWS Services Dashboard! 🚀**