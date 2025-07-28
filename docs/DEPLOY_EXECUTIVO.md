# Plano de Deploy CI/CD - Portfólio Sergio Sena

## ✅ SITUAÇÃO ATUAL
- S3 bucket: `portfolio-sergio-sena` (existente)
- CloudFront: `E2DXHLX2VFCW6L` (configurado)
- GitHub Actions: Configurado
- Certificado SSL: Válido

## 🎯 EXECUÇÃO EM 5 PASSOS

### 1. **Adicionar Alias DNS**
```bash
# Adicionar dev-cloud.sstechnologies-cloud.com ao certificado SSL (se necessário)
# Executar uma única vez
aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://aws/dns-portfolio.json
```

### 2. **Atualizar CloudFront**
```bash
# Executar uma única vez para adicionar o novo alias
aws cloudfront update-distribution --id E2DXHLX2VFCW6L --distribution-config file://aws/update-cloudfront.json
```

### 3. **Deploy Manual (Teste)**
```bash
# Testar deploy local
./deploy-portfolio.ps1
```

### 4. **Deploy Automático**
```bash
# Push para main = deploy automático
git add .
git commit -m "Deploy portfolio"
git push origin main
```

### 5. **Verificação**
- ✅ https://dev-cloud.sstechnologies-cloud.com
- ✅ GitHub Actions executando
- ✅ Cache invalidado

## 🔧 COMANDOS ÚTEIS

### Deploy com atualização do CloudFront:
```bash
./deploy-portfolio.ps1 -UpdateCloudFront
```

### Deploy sem invalidação de cache:
```bash
./deploy-portfolio.ps1 -SkipInvalidation
```

### Deploy manual via GitHub:
- Ir em Actions > Deploy Portfolio to AWS > Run workflow
- Marcar "Update CloudFront configuration" se necessário

## 📊 ESTRUTURA FINAL
```
CloudFront Distribution (E2DXHLX2VFCW6L)
├── ritech-fechaduras-digitais.sstechnologies-cloud.com → S3-ritech-fechaduras
└── dev-cloud.sstechnologies-cloud.com → S3-portfolio (/portfolio/*)
```

## 🚀 VANTAGENS
- ✅ Sem conflito com sites existentes
- ✅ Reutiliza infraestrutura atual
- ✅ Deploy automático via GitHub
- ✅ SSL compartilhado
- ✅ CDN global
- ✅ Custo otimizado