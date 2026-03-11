# 🏗️ AWS Services - Infraestrutura como Código (Terraform)

Infraestrutura completa para o projeto AWS Services usando Terraform.

## 📋 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                        │
│                    (Global Distribution)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Public Subnets (3 AZs)                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   NAT    │  │   NAT    │  │   NAT    │          │   │
│  │  │ Gateway  │  │ Gateway  │  │ Gateway  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Private Subnets (3 AZs)                  │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │         EKS Cluster (Kubernetes)              │  │   │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐          │  │   │
│  │  │  │  Node  │  │  Node  │  │  Node  │          │  │   │
│  │  │  │ t3.med │  │ t3.med │  │ t3.med │          │  │   │
│  │  │  └────────┘  └────────┘  └────────┘          │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │      RDS PostgreSQL (db.t3.micro)            │  │   │
│  │  │      - 20GB Storage                           │  │   │
│  │  │      - Automated Backups                      │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      S3 Buckets                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Frontend Bucket │  │  Uploads Bucket  │                │
│  │  (Versioning)    │  │  (Lifecycle)     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CloudWatch Monitoring                     │
│  - EKS Logs  - Application Logs  - RDS Alarms               │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Estrutura

```
terraform/
├── modules/                    # Módulos reutilizáveis
│   ├── vpc/                   # Networking (VPC, Subnets, NAT)
│   ├── eks/                   # Kubernetes Cluster
│   ├── rds/                   # PostgreSQL Database
│   ├── s3/                    # Storage Buckets
│   ├── cloudfront/            # CDN Distribution
│   └── monitoring/            # CloudWatch Logs & Alarms
├── environments/
│   └── dev/                   # Ambiente de desenvolvimento
│       ├── main.tf            # Orquestração dos módulos
│       ├── variables.tf       # Variáveis
│       ├── outputs.tf         # Outputs
│       └── terraform.tfvars.example
└── README.md
```

## 🚀 Como Usar

### **Pré-requisitos**
- Terraform >= 1.0
- AWS CLI configurado
- Credenciais AWS com permissões adequadas

### **1. Configurar Variáveis**
```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars com seus valores
```

### **2. Inicializar Terraform**
```bash
terraform init
```

### **3. Validar Configuração**
```bash
terraform validate
terraform fmt -recursive
```

### **4. Planejar Infraestrutura**
```bash
terraform plan
```

### **5. Provisionar (ATENÇÃO: GERA CUSTO)**
```bash
terraform apply
```

### **6. Destruir Infraestrutura**
```bash
terraform destroy
```

## 💰 Estimativa de Custos

### **Ambiente DEV**
| Recurso | Especificação | Custo/Mês |
|---------|---------------|-----------|
| EKS Control Plane | - | $73 |
| EC2 Nodes | 2x t3.medium | $60 |
| RDS | db.t3.micro | $15 |
| NAT Gateway | 3x NAT | $96 |
| S3 + CloudFront | 10GB | $4 |
| **TOTAL** | | **~$248/mês** |

### **Reduzir Custos**
- Desabilitar NAT Gateway: `enable_nat_gateway = false` (-$96/mês)
- Reduzir nodes EKS: `eks_node_desired_size = 1` (-$30/mês)
- Usar t3.small: `eks_node_instance_type = "t3.small"` (-$15/mês)

## 📦 Módulos

### **VPC**
- VPC com CIDR 10.0.0.0/16
- 3 subnets públicas + 3 privadas
- Internet Gateway + NAT Gateways
- Route Tables configuradas

### **EKS**
- Cluster Kubernetes 1.28
- Node Group com Auto Scaling
- IAM Roles e Policies
- Security Groups

### **RDS**
- PostgreSQL 15.4
- Backups automáticos (7 dias)
- Storage criptografado
- Multi-AZ opcional

### **S3**
- Bucket frontend (versionamento)
- Bucket uploads (lifecycle)
- CORS configurado
- Block Public Access

### **CloudFront**
- Distribuição global
- OAC (Origin Access Control)
- HTTPS redirect
- Cache otimizado

### **Monitoring**
- CloudWatch Log Groups
- Alarmes RDS (CPU, Storage)
- SNS para notificações
- Retenção de 7 dias

## 🔧 Variáveis Principais

```hcl
# VPC
vpc_cidr             = "10.0.0.0/16"
enable_nat_gateway   = true

# EKS
eks_cluster_version    = "1.28"
eks_node_instance_type = "t3.medium"
eks_node_desired_size  = 2

# RDS
rds_instance_class = "db.t3.micro"
rds_multi_az       = false
rds_master_password = "CHANGE_ME"

# Monitoring
alarm_email = "your-email@example.com"
```

## 📤 Outputs

Após `terraform apply`, você terá:

```bash
vpc_id                    = "vpc-xxxxx"
eks_cluster_endpoint      = "https://xxxxx.eks.amazonaws.com"
eks_cluster_name          = "aws-services-cluster"
rds_endpoint              = "xxxxx.rds.amazonaws.com:5432"
frontend_bucket           = "aws-services-frontend-dev"
cloudfront_domain         = "xxxxx.cloudfront.net"
```

## 🔐 Backend State

O state do Terraform é armazenado remotamente no S3:

```hcl
backend "s3" {
  bucket         = "aws-services-terraform-state"
  key            = "dev/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

**Criar bucket antes do primeiro apply:**
```bash
aws s3 mb s3://aws-services-terraform-state
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## 🎯 Próximos Passos

1. ✅ Infraestrutura criada (Fase 1)
2. ⏳ Backend Python + FastAPI (Fase 2)
3. ⏳ CI/CD Pipeline (Fase 3)
4. ⏳ Observability (Fase 4)

## 📚 Recursos

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)

---

**Criado por:** @base  
**Data:** 2025-01-XX  
**Versão:** 1.0.0
