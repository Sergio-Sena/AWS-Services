# ☁️ AWS Services Dashboard

[![Status](https://img.shields.io/badge/Status-✅%20Production-brightgreen)](https://aws-services.sstechnologies-cloud.com)
[![Pipeline](https://img.shields.io/github/actions/workflow/status/Sergio-Sena/AWS-Services/deploy-production.yml?label=CI%2FCD)](https://github.com/Sergio-Sena/AWS-Services/actions)
[![AWS](https://img.shields.io/badge/AWS-7%20Services-FF9900?logo=amazonaws)](https://aws.amazon.com/)
[![AI](https://img.shields.io/badge/AI-6%20Agents-purple)]()
[![FinOps](https://img.shields.io/badge/FinOps-Automated-00FFFF)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Dashboard para gerenciar serviços AWS com dados reais, interface neon e automação DevOps completa.

**[🚀 Live Demo](https://aws-services.sstechnologies-cloud.com)** | **[📐 Arquitetura](#-arquitetura)** | **[💰 FinOps](#-finops--ai-insights)**

---

## 🎯 Problema → Solução → Resultado

| | Descrição |
|---|---|
| **Problema** | Como gerenciar múltiplos serviços AWS sem alternar entre consoles, com visibilidade de custos? |
| **Solução** | Dashboard unificado com dados reais, CI/CD automatizado e FinOps com AI insights |
| **Resultado** | 7 serviços AWS em 1 interface, deploy em ~3 min, custos visíveis por projeto |

---

## 📐 Arquitetura

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│  Client  │───▶│  CloudFront  │───▶│  S3 Frontend │    │  Backend    │
│ (Browser)│    │  CDN Global  │    │  Next.js 14  │    │  Node/Python│
└──────────┘    └──────────────┘    └──────────────┘    └──────┬──────┘
                                                               │
                                              ┌────────────────┼────────────────┐
                                              │                │                │
                                    ┌─────────▼──┐  ┌─────────▼──┐  ┌─────────▼──┐
                                    │     S3     │  │    EC2     │  │  DynamoDB  │
                                    │  Buckets   │  │ Instances  │  │   Tables   │
                                    └────────────┘  └────────────┘  └────────────┘
                                    ┌────────────┐  ┌────────────┐  ┌────────────┐
                                    │    RDS     │  │ CloudFront │  │    Cost    │
                                    │ Databases  │  │   Distros  │  │  Explorer  │
                                    └────────────┘  └────────────┘  └────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline (GitHub Actions)                           │
│  ai-audit (6 agents) → build → deploy (S3+CDN) → health-check → finops    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Serviço | Funcionalidades |
|---|---|
| **S3** | Listagem de buckets, upload multipart, download ZIP, navegação em pastas |
| **Lambda** | Compactação de imagens (Sharp, ImageMagick, Jimp, Canvas) |
| **EC2** | Listagem, start/stop/reboot, status em tempo real |
| **DynamoDB** | Listagem de tabelas, scan, put item, visualização |
| **RDS** | Listagem, start/stop/backup, Multi-AZ |
| **CloudFront** | Distribuições, invalidar cache, domínios |
| **Cost Explorer** | Faturamento real (USD → BRL), breakdown por serviço |

### Destaques
- **Dados Reais** — Integração direta com sua conta AWS
- **Fallback Inteligente** — Dados demo quando serviços não disponíveis
- **Interface Neon** — Design futurista dark theme responsivo
- **Segurança** — Credenciais não persistidas

---

## 🚀 CI/CD Pipeline

```
┌──────────┐    ┌────────┐    ┌────────┐    ┌──────────┐    ┌────────┐    ┌────────┐
│ AI Audit │───▶│ Build  │───▶│ Deploy │───▶│  Health  │───▶│ FinOps │───▶│ Notify │
│ 6 Agents │    │Next.js │    │S3 + CDN│    │  Check   │    │Cost+AI │    │ Status │
└──────────┘    └────────┘    └────────┘    └──────────┘    └────────┘    └────────┘
```

| Métrica | Valor |
|---|---|
| **Tempo total** | ~3 minutos |
| **Trigger** | Push to `main` |
| **AI Agents** | 6 (Security, FinOps, Code, Compliance, Performance, Leader) |
| **Rollback** | `git revert HEAD && git push` |

---

## 🤖 AI Agents (Bedrock)

| Agente | O que audita |
|---|---|
| Security | Secrets expostos, IAM permissivo, encryption |
| FinOps | Right-sizing, storage classes, idle resources |
| Code Quality | Error handling, hardcoded values, validation |
| Compliance | LGPD/GDPR, dados pessoais, retenção |
| Performance | Cold starts, connection reuse, N+1 queries |
| Leader | Orquestra todos, decide APPROVED/BLOCKED |

---

## 💰 FinOps & AI Insights

Após cada deploy:
1. Cost Explorer filtra custos por tag `Project=AWS-Services`
2. Bedrock Claude 3 Haiku gera 3 insights de otimização
3. Relatório HTML enviado por email via SES

---

## 🛠️ Tech Stack

### Frontend
| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework (Static Export) |
| Tailwind CSS | Styling |
| Context API | State management |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js 18 + Express | API principal |
| Python 3.11 + FastAPI | Backend alternativo |
| Docker | Containerização |
| Serverless Framework | Deploy Lambda |

### Infraestrutura
| Serviço | Uso |
|---|---|
| S3 | Storage + Hosting |
| CloudFront | CDN (unificado) |
| Terraform | IaC (módulos: VPC, S3, RDS, EKS, CloudFront, Monitoring) |
| Kubernetes | Manifests (deployments, services, ingress) |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Sergio-Sena/AWS-Services.git
cd AWS-Services

# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (outro terminal)
cd frontend-next && npm install && npm run dev
```

**Produção:** https://aws-services.sstechnologies-cloud.com

---

## 📁 Estrutura

```
AWS-Services/
├── .github/workflows/        # CI/CD Pipeline
│   └── deploy-production.yml # ai-audit → build → deploy → finops
├── frontend-next/            # Next.js 14 (Static Export)
├── backend/                  # Node.js + Express
├── backend-python/           # FastAPI + Docker
├── terraform/                # IaC (VPC, S3, RDS, EKS, CloudFront)
├── k8s/                      # Kubernetes manifests
├── scripts/
│   ├── agents/ai-audit.py   # 6 AI Agents (Bedrock)
│   └── finops/cost-report.py # Cost + AI + Email
└── .amazonq/                 # Rules + MCP config
```

---

## 🔐 Segurança

| Controle | Implementação |
|---|---|
| Credenciais | Não persistidas, fornecidas no login |
| HTTPS | CloudFront TLS 1.2+ |
| CORS | Configurado em todas as rotas |
| IAM | Permissões mínimas documentadas |
| Operações destrutivas | Apenas em modo demo |

---

## 🗺️ Roadmap

### ✅ Concluído
- ✅ Dashboard com 7 serviços AWS (dados reais)
- ✅ Backend Node.js + Python (FastAPI + Docker)
- ✅ Terraform IaC (6 módulos)
- ✅ Kubernetes manifests
- ✅ CI/CD com AI Audit + FinOps
- ✅ Testes unitários (Jest + Pytest)

### 🔜 Próximo
- [ ] Migração AWS SDK v3
- [ ] SQS/SNS (mensageria)
- [ ] CloudWatch (monitoramento avançado)
- [ ] ECS/EKS deploy real
- [ ] WAF + Security Hub

---

## 👨💻 Autor

**Sergio Sena** — Cloud & DevOps Engineer

[![GitHub](https://img.shields.io/badge/GitHub-Sergio--Sena-181717?logo=github)](https://github.com/Sergio-Sena)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sergio%20Sena-0A66C2?logo=linkedin)](https://linkedin.com/in/sergio-sena)
[![Portfolio](https://img.shields.io/badge/Portfolio-dev--cloud-00FFFF)](https://dev-cloud.sstechnologies-cloud.com)

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela!**

</div>
