# 🚀 AWS Services Dashboard

**Versão**: v1.1.0 (Atual)  
**Status**: ✅ Funcional com 7 módulos AWS  
**Arquitetura**: Migração para Full AWS em andamento

Uma aplicação web completa para gerenciar serviços AWS com interface moderna e dados reais da sua conta.

## 🚀 Funcionalidades

### 📊 **Dashboard Principal**
- Interface responsiva com design neon futurista
- Autenticação segura com credenciais AWS
- Navegação intuitiva entre módulos
- Status em tempo real dos serviços

### 🗄️ **Amazon S3**
- ✅ **Listagem de buckets reais** da conta AWS
- ✅ **Upload de arquivos** com suporte a multipart
- ✅ **Download individual** e em lote (ZIP)
- ✅ **Navegação em pastas** com breadcrumb
- ✅ **Informações detalhadas** (tamanho, data, tipo)
- ✅ **Operações de exclusão** seguras

### ⚡ **AWS Lambda**
- ✅ **Compactação de imagens** (demo)
- ✅ **Seleção de módulos**: Sharp, ImageMagick, Jimp, Canvas
- ✅ **Estatísticas simuladas** de performance
- ✅ **Interface compatível** com outros módulos
- ✅ **Feedback visual** detalhado

### 🖥️ **Amazon EC2**
- ✅ **Listagem de instâncias reais** + demo
- ✅ **Informações completas**: ID, tipo, IPs, status, tags
- ✅ **Ações simuladas**: Iniciar, Parar, Reiniciar
- ✅ **Indicadores visuais** de status
- ✅ **Segurança**: Operações apenas em demos

### 🗃️ **Amazon DynamoDB**
- ✅ **Listagem de tabelas reais** + demo
- ✅ **Informações detalhadas**: Status, itens, tamanho, capacidade
- ✅ **Operações demo**: Scan, Put Item
- ✅ **Visualização de dados** simulados
- ✅ **Interface consistente** com outros módulos

### 🗄️ **Amazon RDS**
- ✅ **Listagem de instâncias reais** + demo
- ✅ **Informações completas**: Engine, classe, storage, Multi-AZ
- ✅ **Operações demo**: Iniciar, Parar, Backup
- ✅ **Badges REAL/DEMO** para identificação
- ✅ **Interface neon-red** personalizada

### 🌐 **Amazon CloudFront**
- ✅ **Listagem de distribuições reais** + demo
- ✅ **Domínios personalizados** destacados
- ✅ **Informações completas**: Status, origem, aliases
- ✅ **Operações demo**: Invalidar cache, Habilitar/Desabilitar
- ✅ **Pills coloridas** para domínios

### 💰 **Calculadora AWS**
- ✅ **Dados reais de faturamento** via Cost Explorer
- ✅ **Conversão automática** USD → BRL
- ✅ **Última fatura** e **fatura atual**
- ✅ **Breakdown por serviço** AWS
- ✅ **Fallback inteligente** para demo
- ✅ **Cotação em tempo real**

## 🛠️ Tecnologias

### **Frontend**
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Context API** - Gerenciamento de estado
- **Font Awesome** - Ícones

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Framework web
- **AWS SDK v2** - Integração AWS
- **Multer** - Upload de arquivos
- **CORS** - Cross-origin requests

### **AWS Services**
- **S3** - Armazenamento escalável e durável
- **EC2** - Instâncias virtuais
- **RDS** - Bancos de dados relacionais
- **DynamoDB** - Banco NoSQL
- **CloudFront** - CDN
- **Cost Explorer** - Faturamento
- **Lambda** - Computação serverless

## 📦 Instalação

### **Pré-requisitos**
- Node.js 18+
- Credenciais AWS válidas
- Git

### **Clone o repositório**
```bash
git clone https://github.com/Sergio-Sena/AWS-Services.git
cd AWS-Services
```

### **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure suas credenciais AWS no .env
npm run dev
```

### **Frontend**
```bash
cd frontend-next
npm install
npm run dev
```

### **Acessar**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## ⚙️ Configuração

### **Credenciais AWS**
1. Acesse o [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Crie um usuário com as permissões:
   - `AmazonS3FullAccess`
   - `AmazonEC2ReadOnlyAccess`
   - `AmazonDynamoDBReadOnlyAccess`
   - `CloudFrontReadOnlyAccess`
   - `AWSBillingReadOnlyAccess`
3. Gere Access Key e Secret Key
4. Use no login da aplicação

### **Variáveis de Ambiente**
```env
# Backend (.env)
AWS_ACCESS_KEY=sua_access_key
AWS_SECRET_KEY=sua_secret_key
PORT=8000
NODE_ENV=development

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Como Usar

### **1. Login**
- Insira suas credenciais AWS
- Sistema verifica automaticamente a conectividade
- Redirecionamento automático após autenticação

### **2. Dashboard**
- Visão geral de todos os serviços
- Cards interativos com status
- Navegação rápida entre módulos

### **3. Módulos**
- **Dados Reais**: Badge verde "REAL"
- **Dados Demo**: Badge azul "DEMO"
- **Fallback Automático**: Sem quebras na interface

### **4. Segurança**
- Credenciais não armazenadas
- Operações destrutivas apenas em demos
- Validação em todas as requisições

## 🔧 Desenvolvimento

### **Estrutura do Projeto**
```
AWS-Services/
├── backend/
│   ├── handlers/          # Lógica de negócio
│   ├── server.js          # Servidor Express
│   └── package.json
├── frontend-next/
│   ├── pages/             # Páginas Next.js
│   ├── context/           # Context API
│   ├── services/          # API calls
│   └── styles/            # CSS/Tailwind
└── README.md
```

### **Adicionar Novo Módulo**
1. Criar handler em `backend/handlers/`
2. Adicionar rotas em `server.js`
3. Criar página em `frontend-next/pages/`
4. Atualizar `services.js` com novo card
5. Seguir padrão REAL/DEMO

### **Scripts Disponíveis**
```bash
# Backend
npm run dev          # Desenvolvimento
npm start           # Produção

# Frontend
npm run dev         # Desenvolvimento
npm run build       # Build produção
npm start          # Servir build
```

## 🚀 Deploy

### **Vercel (Frontend)**
```bash
cd frontend-next
vercel --prod
```

### **AWS EC2 (Backend)**
```bash
# PM2 para produção
npm install -g pm2
pm2 start server.js --name aws-services
pm2 startup
pm2 save
```

## 🔒 Segurança

### **Boas Práticas Implementadas**
- ✅ Credenciais não persistidas
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Rate limiting (recomendado)
- ✅ HTTPS em produção (recomendado)

### **Permissões AWS Mínimas**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "ec2:DescribeInstances",
        "dynamodb:ListTables",
        "dynamodb:DescribeTable",
        "cloudfront:ListDistributions",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🐛 Troubleshooting

### **Problemas Comuns**

**Backend não conecta:**
```bash
# Verificar porta
netstat -an | findstr :8000
# Reiniciar servidor
npm run dev
```

**Credenciais inválidas:**
- Verificar Access Key e Secret Key
- Confirmar permissões IAM
- Testar com AWS CLI

**Dados não aparecem:**
- Verificar conectividade backend
- Confirmar credenciais no login
- Checar logs do console

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] **RDS**: Gerenciamento de bancos
- [ ] **SQS/SNS**: Mensageria
- [ ] **CloudWatch**: Monitoramento
- [ ] **Route 53**: DNS
- [ ] **IAM**: Usuários e permissões

### **Melhorias Técnicas**
- [ ] Migração para AWS SDK v3
- [ ] Testes automatizados
- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Monitoramento APM

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Sergio Sena**
- GitHub: [@Sergio-Sena](https://github.com/Sergio-Sena)
- LinkedIn: [Sergio Sena](https://linkedin.com/in/sergio-sena)

## 🙏 Agradecimentos

- AWS pela documentação completa
- Comunidade Next.js
- Tailwind CSS team
- Todos os contribuidores

---

⭐ **Se este projeto foi útil, deixe uma estrela!**