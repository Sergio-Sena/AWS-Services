# 🚀 Configuração do Pipeline CI/CD

## 📋 **Secrets Necessários no GitHub**

Configure os seguintes secrets no GitHub Actions:

### **AWS Credentials**
```
AWS_ACCESS_KEY_ID=<sua-access-key>
AWS_SECRET_ACCESS_KEY=<sua-secret-key>
HOSTED_ZONE_ID=<route53-hosted-zone-id>
```

### **CloudFront Distribution IDs**
```
CLOUDFRONT_DISTRIBUTION_ID=<prod-distribution-id>
CLOUDFRONT_DISTRIBUTION_ID_DEV=<dev-distribution-id>
CLOUDFRONT_DISTRIBUTION_ID_TEST=<test-distribution-id>
```

## 🌿 **Estrutura de Branches**

### **dev** - Desenvolvimento
- Deploy automático para ambiente de desenvolvimento
- S3 Bucket: `aws-services-dashboard-dev`
- Lambda Stage: `dev`
- URL: `https://dev.aws-services.com`

### **test** - Teste
- Deploy automático para ambiente de teste
- S3 Bucket: `aws-services-dashboard-test`
- Lambda Stage: `test`
- URL: `https://test.aws-services.com`

### **main** - Produção
- Deploy automático para ambiente de produção
- S3 Bucket: `aws-services-dashboard-prod`
- Lambda Stage: `prod`
- URL: `https://aws-services.com`

## 🏗️ **Recursos AWS Necessários**

### **S3 Buckets**
```bash
# Criar buckets para cada ambiente
aws s3 mb s3://aws-services-dashboard-dev
aws s3 mb s3://aws-services-dashboard-test
aws s3 mb s3://aws-services-dashboard-prod

# Configurar website hosting
aws s3 website s3://aws-services-dashboard-dev --index-document index.html
aws s3 website s3://aws-services-dashboard-test --index-document index.html
aws s3 website s3://aws-services-dashboard-prod --index-document index.html
```

### **CloudFront Distributions**
- Uma distribuição para cada ambiente
- Configurar origins apontando para os buckets S3
- Configurar domínios customizados (opcional)

### **Route 53 (Opcional)**
- Hosted Zone configurada
- Registros A/CNAME para cada ambiente

## 🔄 **Fluxo de Deploy**

### **1. Development (dev branch)**
```bash
git checkout dev
git add .
git commit -m "feat: nova funcionalidade"
git push origin dev
# → Deploy automático para DEV
```

### **2. Test (test branch)**
```bash
git checkout test
git merge dev
git push origin test
# → Deploy automático para TEST
```

### **3. Production (main branch)**
```bash
git checkout main
git merge test
git push origin main
# → Deploy automático para PROD
```

## 🛡️ **Configuração de Environments**

No GitHub, configure os environments:

### **development**
- Sem proteções
- Deploy imediato

### **test**
- Opcional: Require reviewers
- Deploy após aprovação

### **production**
- Required reviewers: 1+
- Restrict pushes to protected branches
- Deploy após aprovação manual

## 📊 **Monitoramento**

### **CloudWatch Logs**
- Lambda logs por stage
- CloudFront access logs
- S3 access logs

### **Métricas**
- Deploy success rate
- Build time
- Error rate por ambiente

## 🚨 **Troubleshooting**

### **Deploy Falha**
1. Verificar secrets configurados
2. Verificar permissões IAM
3. Verificar se buckets existem
4. Verificar CloudFront distribution IDs

### **Build Falha**
1. Verificar dependências
2. Verificar Node.js version
3. Verificar scripts no package.json

### **Rollback**
```bash
# Reverter para commit anterior
git revert <commit-hash>
git push origin <branch>
```

## ✅ **Checklist de Setup**

- [ ] Secrets configurados no GitHub
- [ ] Buckets S3 criados
- [ ] CloudFront distributions criadas
- [ ] Route 53 configurado (opcional)
- [ ] Environments configurados no GitHub
- [ ] Permissões IAM configuradas
- [ ] Teste de deploy em cada branch

---

**Pipeline configurado e pronto para uso! 🎉**