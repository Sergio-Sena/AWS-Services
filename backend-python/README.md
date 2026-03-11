# 🐍 Backend Python - AWS Services

Backend moderno em **Python + FastAPI** com Docker, testes automatizados e observabilidade.

## 🚀 Stack

- **FastAPI** 0.109 - Framework web assíncrono
- **Boto3** - AWS SDK para Python
- **Uvicorn** - ASGI server
- **Pytest** - Testes automatizados
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

## 📁 Estrutura

```
backend-python/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configurações
│   ├── routes/              # Endpoints por serviço
│   │   ├── s3.py
│   │   ├── ec2.py
│   │   ├── lambda.py
│   │   ├── dynamodb.py
│   │   ├── rds.py
│   │   └── cloudfront.py
│   ├── services/
│   │   └── aws_service.py   # Wrapper Boto3
│   └── models/
├── tests/
│   └── test_routes.py       # Testes unitários
├── monitoring/
│   └── prometheus.yml       # Config Prometheus
├── Dockerfile
├── docker-compose.yml       # Orquestração completa
└── requirements.txt
```

## 🛠️ Instalação

### **Opção 1: Docker (Recomendado)**

```bash
# 1. Configure credenciais AWS
cp .env.example .env
# Edite .env com suas credenciais

# 2. Suba todos os serviços
docker-compose up -d

# 3. Acesse
# - Backend Python: http://localhost:8000
# - Backend Node: http://localhost:8001
# - Docs API: http://localhost:8000/docs
# - RabbitMQ: http://localhost:15672 (admin/admin)
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

### **Opção 2: Local**

```bash
# 1. Instale dependências
pip install -r requirements.txt

# 2. Configure .env
cp .env.example .env

# 3. Execute
uvicorn app.main:app --reload --port 8000
```

## 🧪 Testes

```bash
# Executar testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Testes específicos
pytest tests/test_routes.py -v
```

## 📡 API Endpoints

### **S3**
- `GET /s3/buckets` - Lista buckets
- `GET /s3/buckets/{name}/objects` - Lista objetos
- `POST /s3/buckets/{name}/upload` - Upload arquivo

### **EC2**
- `GET /ec2/instances` - Lista instâncias
- `POST /ec2/instances/{id}/start` - Iniciar
- `POST /ec2/instances/{id}/stop` - Parar
- `POST /ec2/instances/{id}/reboot` - Reiniciar

### **DynamoDB**
- `GET /dynamodb/tables` - Lista tabelas
- `GET /dynamodb/tables/{name}/scan` - Scan tabela

### **RDS**
- `GET /rds/instances` - Lista instâncias

### **CloudFront**
- `GET /cloudfront/distributions` - Lista distribuições

### **Lambda**
- `GET /lambda/functions` - Lista funções

## 🔐 Autenticação

Envie credenciais AWS via headers:

```bash
curl -H "X-AWS-Access-Key: YOUR_KEY" \
     -H "X-AWS-Secret-Key: YOUR_SECRET" \
     http://localhost:8000/s3/buckets
```

## 🐳 Docker Compose Services

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **backend-python** | 8000 | FastAPI backend |
| **backend-node** | 8001 | Express backend (legado) |
| **postgres** | 5432 | PostgreSQL 15 |
| **rabbitmq** | 5672, 15672 | Mensageria + UI |
| **prometheus** | 9090 | Métricas |
| **grafana** | 3001 | Dashboards |

## 📊 Observability

### **Prometheus**
- Acesse: http://localhost:9090
- Métricas de todos os serviços
- Queries PromQL

### **Grafana**
- Acesse: http://localhost:3001
- Login: admin/admin
- Adicione Prometheus como datasource: http://prometheus:9090

### **RabbitMQ Management**
- Acesse: http://localhost:15672
- Login: admin/admin
- Monitore filas e mensagens

## 🔄 Comparação com Backend Node.js

| Feature | Node.js | Python |
|---------|---------|--------|
| **Framework** | Express | FastAPI |
| **Performance** | Alto | Alto |
| **Async** | Callbacks/Promises | async/await nativo |
| **Docs** | Manual | Auto-gerado (Swagger) |
| **Tipagem** | Opcional (TS) | Nativa (Pydantic) |
| **AWS SDK** | v2 | Boto3 |

## 🚀 Deploy

### **Docker Hub**
```bash
docker build -t seu-usuario/aws-services-python .
docker push seu-usuario/aws-services-python
```

### **AWS ECS/Fargate**
```bash
# Use Terraform em /terraform/modules/ecs
terraform apply
```

## 🐛 Troubleshooting

### **Erro: ModuleNotFoundError**
```bash
pip install -r requirements.txt
```

### **Erro: Docker não conecta**
```bash
docker-compose down
docker-compose up --build
```

### **Erro: AWS credentials**
- Verifique .env
- Teste: `aws sts get-caller-identity`

## 📝 Próximos Passos

- [ ] Adicionar autenticação JWT
- [ ] Implementar cache Redis
- [ ] Adicionar rate limiting
- [ ] Criar endpoints Cost Explorer
- [ ] Adicionar WebSockets
- [ ] Implementar filas RabbitMQ

## 📄 Licença

MIT License - veja [LICENSE](../LICENSE)

---

**Desenvolvido com ❤️ usando FastAPI + Docker**
