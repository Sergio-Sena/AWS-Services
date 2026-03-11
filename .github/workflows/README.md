# 🚀 CI/CD Pipeline - GitHub Actions

Pipelines automatizados para testes, build e deploy do projeto AWS-Services.

## 📋 Workflows

### **1. Backend Python** (`backend-python.yml`)
**Trigger**: Push/PR em `backend-python/**`

**Jobs**:
- ✅ **Test**: Pytest + Coverage
- 🐳 **Build**: Docker image → GitHub Container Registry

**Badges**:
```markdown
![Backend Python CI](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/backend-python.yml/badge.svg)
```

---

### **2. Backend Node.js** (`backend-node.yml`)
**Trigger**: Push/PR em `backend/**`

**Jobs**:
- ✅ **Test**: Lint + Unit tests
- 🚀 **Deploy**: Serverless Framework → AWS Lambda (apenas `main`)

**Secrets necessários**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

### **3. Frontend Next.js** (`frontend.yml`)
**Trigger**: Push/PR em `frontend-next/**`

**Jobs**:
- ✅ **Test**: Lint + Build
- 🚀 **Deploy**: S3 + CloudFront invalidation (apenas `main`)

**Secrets necessários**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_API_URL`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

---

### **4. Terraform** (`terraform.yml`)
**Trigger**: Push/PR em `terraform/**`

**Jobs**:
- ✅ **Validate**: Format + Init + Validate
- 📋 **Plan**: Terraform plan (apenas PRs)

---

### **5. Main Pipeline** (`main.yml`)
**Trigger**: Push/PR em qualquer branch

**Features**:
- 🔍 Detecta mudanças por diretório
- 🔄 Executa apenas workflows necessários
- 📊 Status consolidado

---

## 🔐 Secrets Necessários

Configure em: **Settings → Secrets and variables → Actions**

| Secret | Descrição | Usado em |
|--------|-----------|----------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | Backend Node, Frontend, Terraform |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Backend Node, Frontend, Terraform |
| `NEXT_PUBLIC_API_URL` | URL da API backend | Frontend |
| `S3_BUCKET_NAME` | Nome do bucket S3 | Frontend |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição CloudFront | Frontend |
| `GITHUB_TOKEN` | Token automático | Backend Python (GHCR) |

---

## 📊 Status Badges

Adicione ao README principal:

```markdown
## CI/CD Status

[![CI/CD Pipeline](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/main.yml/badge.svg)](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/main.yml)
[![Backend Python](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/backend-python.yml/badge.svg)](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/backend-python.yml)
[![Backend Node](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/backend-node.yml/badge.svg)](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/backend-node.yml)
[![Frontend](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/frontend.yml/badge.svg)](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/frontend.yml)
[![Terraform](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/terraform.yml/badge.svg)](https://github.com/Sergio-Sena/AWS-Services/actions/workflows/terraform.yml)
```

---

## 🔄 Fluxo de Deploy

### **Develop Branch**
```
Push → Test → Build Docker → Push GHCR
```

### **Main Branch**
```
Push → Test → Build → Deploy AWS (Lambda + S3 + CloudFront)
```

---

## 🧪 Testar Localmente

### **Backend Python**
```bash
cd backend-python
pytest tests/ -v --cov=app
```

### **Backend Node.js**
```bash
cd backend
npm test
```

### **Frontend**
```bash
cd frontend-next
npm run build
```

### **Terraform**
```bash
cd terraform/environments/dev
terraform fmt -check
terraform validate
```

---

## 🐛 Troubleshooting

### **Erro: Docker build failed**
- Verifique Dockerfile
- Teste local: `docker build -t test .`

### **Erro: AWS credentials**
- Verifique secrets no GitHub
- Teste local: `aws sts get-caller-identity`

### **Erro: Terraform plan failed**
- Verifique sintaxe: `terraform fmt`
- Valide: `terraform validate`

---

## 📝 Próximas Melhorias

- [ ] Adicionar testes E2E
- [ ] Implementar deploy staging
- [ ] Adicionar notificações Slack
- [ ] Implementar rollback automático
- [ ] Adicionar security scanning (Snyk, Trivy)

---

**Desenvolvido com ❤️ usando GitHub Actions**
