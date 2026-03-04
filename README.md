# ☁️ AWS Services Dashboard

[![Status](https://img.shields.io/badge/Status-✅%20Online-brightgreen)](https://aws-services.sstechnologies-cloud.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Gerencie seus serviços AWS com interface moderna e dados reais da sua conta.

**[🚀 Ver Demo](https://aws-services.sstechnologies-cloud.com)** | **[📖 Docs](docs/)** | **[🐛 Issues](../../issues)**

---

## ✨ Features

| Serviço | Status | Funcionalidades |
|---------|--------|-----------------|
| **S3** | ✅ | Listagem de buckets, upload multipart, download ZIP, navegação em pastas |
| **Lambda** | ✅ | Compactação de imagens (Sharp, ImageMagick, Jimp, Canvas) |
| **EC2** | ✅ | Listagem de instâncias, ações (iniciar/parar/reiniciar), status em tempo real |
| **DynamoDB** | ✅ | Listagem de tabelas, scan, put item, visualização de dados |
| **RDS** | ✅ | Listagem de instâncias, operações (iniciar/parar/backup), Multi-AZ |
| **CloudFront** | ✅ | Listagem de distribuições, invalidar cache, domínios personalizados |
| **Cost Explorer** | ✅ | Faturamento real (USD → BRL), breakdown por serviço, última fatura |

### 🎯 Destaques
- **Dados Reais**: Integração direta com sua conta AWS
- **Fallback Inteligente**: Dados demo quando serviços não disponíveis
- **Interface Neon**: Design futurista responsivo
- **Segurança**: Credenciais não persistidas, operações destrutivas apenas em demos
- **Autenticação**: Login com credenciais AWS (Access Key + Secret Key)

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - Framework React com SSR
- **Tailwind CSS** - Utility-first CSS
- **Context API** - State management
- **Font Awesome** - Ícones

### **Backend**
- **Node.js 18** - Runtime
- **Express.js** - Framework web
- **AWS SDK v2** - Integração AWS
- **Serverless Framework** - Deploy
- **Multer** - Upload de arquivos

### **AWS Services**
- **S3** - Storage + Static hosting
- **CloudFront** - CDN global
- **Lambda** - Serverless backend
- **API Gateway** - REST API
- **EC2, RDS, DynamoDB** - Recursos gerenciados

---

## 🚀 Quick Start

### **Pré-requisitos**
- Node.js 18+
- Credenciais AWS com permissões IAM
- Git

### **1. Clone o repositório**
```bash
git clone https://github.com/Sergio-Sena/AWS-Services.git
cd AWS-Services
```

### **2. Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure AWS_ACCESS_KEY e AWS_SECRET_KEY no .env
npm run dev
```

### **3. Frontend**
```bash
cd frontend-next
npm install
npm run dev
```

### **4. Acesse**
- **Produção**: https://aws-services.sstechnologies-cloud.com
- **Local**: http://localhost:3000 (frontend) + http://localhost:8000 (backend)

---

## ⚙️ Configuração

### **Credenciais AWS**
1. Acesse [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Crie usuário com permissões:
   - `AmazonS3FullAccess`
   - `AmazonEC2ReadOnlyAccess`
   - `AmazonDynamoDBReadOnlyAccess`
   - `CloudFrontReadOnlyAccess`
   - `AWSBillingReadOnlyAccess`
3. Gere Access Key + Secret Key
4. Use no login da aplicação

### **Variáveis de Ambiente**
```env
# backend/.env
AWS_ACCESS_KEY=sua_access_key
AWS_SECRET_KEY=sua_secret_key
PORT=8000

# frontend-next/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📁 Estrutura do Projeto

```
AWS-Services/
├── backend/
│   ├── handlers/              # Lógica de negócio por serviço
│   ├── server.js              # Express server
│   ├── routes.js              # Rotas API
│   └── serverless.yml         # Deploy config
├── frontend-next/
│   ├── pages/                 # Next.js pages
│   ├── context/               # Context API
│   ├── services/              # API calls
│   └── styles/                # Tailwind CSS
├── infrastructure/            # Scripts de deploy AWS
└── docs/                      # Documentação
```

---

## 🎯 Como Usar

### **Login**
1. Insira Access Key e Secret Key
2. Sistema valida conectividade AWS
3. Redirecionamento automático para dashboard

### **Dashboard**
- Cards interativos para cada serviço
- Badges **REAL** (verde) ou **DEMO** (azul)
- Navegação rápida entre módulos

### **Módulos**
- **S3**: Upload/download de arquivos, navegação em pastas
- **Lambda**: Compactação de imagens com diferentes engines
- **EC2**: Gerenciamento de instâncias (start/stop/reboot)
- **DynamoDB**: Visualização de tabelas e dados
- **RDS**: Gerenciamento de bancos de dados
- **CloudFront**: Distribuições e invalidação de cache
- **Cost Explorer**: Faturamento em tempo real

---

## 🚀 Deploy

### **Automático (GitHub Actions)**
```bash
git push origin main
# Deploy automático via CI/CD
```

### **Manual**
```bash
# Backend (Serverless)
cd backend
sls deploy --stage prod

# Frontend (S3 + CloudFront)
cd frontend-next
npm run build
aws s3 sync out/ s3://aws-services-dashboard-prod --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 🔒 Segurança

### **Boas Práticas**
- ✅ Credenciais não armazenadas localmente
- ✅ Validação de entrada em todas as rotas
- ✅ CORS configurado
- ✅ HTTPS em produção
- ✅ Operações destrutivas apenas em demos

### **Permissões IAM Mínimas**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:ListAllMyBuckets",
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject",
      "ec2:DescribeInstances",
      "dynamodb:ListTables",
      "cloudfront:ListDistributions",
      "ce:GetCostAndUsage"
    ],
    "Resource": "*"
  }]
}
```

---

## 🐛 Troubleshooting

### **Backend não conecta**
```bash
netstat -an | findstr :8000
npm run dev
```

### **Credenciais inválidas**
- Verificar Access Key e Secret Key
- Confirmar permissões IAM
- Testar com AWS CLI: `aws sts get-caller-identity`

### **Dados não aparecem**
- Verificar conectividade backend (http://localhost:8000/health)
- Confirmar credenciais no login
- Checar logs do console (F12)

---

## 🗺️ Roadmap

- [ ] Migração para AWS SDK v3
- [ ] SQS/SNS (mensageria)
- [ ] CloudWatch (monitoramento avançado)
- [ ] IAM (usuários e permissões)
- [ ] ECS/EKS (containers)
- [ ] Testes automatizados
- [ ] WAF + Security

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨💻 Autor

**Sergio Sena**
- GitHub: [@Sergio-Sena](https://github.com/Sergio-Sena)
- LinkedIn: [Sergio Sena](https://linkedin.com/in/sergio-sena)
- Portfolio: [dev-cloud.sstechnologies-cloud.com](https://dev-cloud.sstechnologies-cloud.com)

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela!**

[🚀 Ver Demo](https://aws-services.sstechnologies-cloud.com) • [📖 Docs](docs/) • [🐛 Issues](../../issues)

</div>
