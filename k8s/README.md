# ☸️ Kubernetes Manifests - AWS Services

Manifests Kubernetes completos para deploy da aplicação AWS-Services em cluster K8s.

## 📋 Estrutura

```
k8s/
├── namespace.yaml              # Namespace + ResourceQuota + LimitRange
├── deployments/
│   ├── backend-python.yaml     # Deployment + HPA (FastAPI)
│   ├── backend-node.yaml       # Deployment + HPA (Express)
│   └── frontend.yaml           # Deployment + HPA (Next.js)
├── services/
│   ├── backend-python-svc.yaml # ClusterIP service
│   ├── backend-node-svc.yaml   # ClusterIP service
│   └── frontend-svc.yaml       # LoadBalancer service
├── ingress/
│   └── ingress.yaml            # Nginx Ingress + TLS
├── configmaps/
│   └── app-config.yaml         # App config + Nginx config
└── secrets/
    └── aws-credentials.yaml    # AWS credentials (template)
```

## 🏗️ Arquitetura

```
                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  LoadBalancer   │
                    │  (AWS ELB/ALB)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Nginx Ingress   │
                    │  Controller     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   Frontend     │  │ Backend Node   │  │ Backend Python │
│   (Next.js)    │  │   (Express)    │  │   (FastAPI)    │
│   3 replicas   │  │   2 replicas   │  │   2 replicas   │
└────────────────┘  └────────┬───────┘  └────────┬───────┘
                             │                    │
                    ┌────────▼────────────────────▼───────┐
                    │         AWS Services                │
                    │  (S3, EC2, Lambda, DynamoDB, etc)   │
                    └─────────────────────────────────────┘
```

## 🚀 Deploy

### **Pré-requisitos**

- Kubernetes cluster (Minikube, k3s, EKS, GKE, AKS)
- kubectl configurado
- Nginx Ingress Controller instalado
- (Opcional) cert-manager para TLS

### **1. Criar Namespace**

```bash
kubectl apply -f namespace.yaml
```

### **2. Criar Secrets**

**Opção A: Via kubectl**
```bash
kubectl create secret generic aws-credentials \
  --from-literal=access-key-id=YOUR_ACCESS_KEY \
  --from-literal=secret-access-key=YOUR_SECRET_KEY \
  --namespace=aws-services
```

**Opção B: Editar arquivo**
```bash
# Editar secrets/aws-credentials.yaml com suas credenciais
kubectl apply -f secrets/aws-credentials.yaml
```

### **3. Criar ConfigMaps**

```bash
kubectl apply -f configmaps/app-config.yaml
```

### **4. Deploy Aplicações**

```bash
# Deploy todos os deployments
kubectl apply -f deployments/

# Ou individualmente
kubectl apply -f deployments/backend-python.yaml
kubectl apply -f deployments/backend-node.yaml
kubectl apply -f deployments/frontend.yaml
```

### **5. Criar Services**

```bash
kubectl apply -f services/
```

### **6. Criar Ingress**

```bash
# Editar ingress/ingress.yaml e substituir 'aws-services.example.com' pelo seu domínio
kubectl apply -f ingress/ingress.yaml
```

### **7. Verificar Deploy**

```bash
# Ver todos os recursos
kubectl get all -n aws-services

# Ver pods
kubectl get pods -n aws-services

# Ver services
kubectl get svc -n aws-services

# Ver ingress
kubectl get ingress -n aws-services

# Logs de um pod
kubectl logs -f <pod-name> -n aws-services
```

## 🔧 Configuração

### **Recursos por Pod**

| Componente | Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|------------|----------|-------------|----------------|-----------|--------------|
| **Frontend** | 3 | 100m | 128Mi | 200m | 256Mi |
| **Backend Node** | 2 | 250m | 256Mi | 500m | 512Mi |
| **Backend Python** | 2 | 250m | 256Mi | 500m | 512Mi |

### **Auto-scaling (HPA)**

| Componente | Min | Max | CPU Target | Memory Target |
|------------|-----|-----|------------|---------------|
| **Frontend** | 3 | 20 | 60% | 70% |
| **Backend Node** | 2 | 10 | 70% | 80% |
| **Backend Python** | 2 | 10 | 70% | 80% |

### **Ingress Routing**

| Path | Service | Port | Descrição |
|------|---------|------|-----------|
| `/` | frontend | 80 | Frontend Next.js |
| `/api/python/*` | backend-python | 8000 | API Python (FastAPI) |
| `/api/*` | backend-node | 8000 | API Node.js (Express) |

## 🧪 Testar Localmente (Minikube)

### **1. Instalar Minikube**

```bash
# Windows (Chocolatey)
choco install minikube

# macOS (Homebrew)
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### **2. Iniciar Cluster**

```bash
minikube start --cpus=4 --memory=8192
```

### **3. Habilitar Ingress**

```bash
minikube addons enable ingress
```

### **4. Deploy Aplicação**

```bash
# Criar namespace
kubectl apply -f namespace.yaml

# Criar secrets
kubectl create secret generic aws-credentials \
  --from-literal=access-key-id=test \
  --from-literal=secret-access-key=test \
  --namespace=aws-services

# Deploy tudo
kubectl apply -f configmaps/
kubectl apply -f deployments/
kubectl apply -f services/
kubectl apply -f ingress/
```

### **5. Acessar Aplicação**

```bash
# Obter IP do Minikube
minikube ip

# Adicionar ao /etc/hosts (Linux/Mac) ou C:\Windows\System32\drivers\etc\hosts (Windows)
# <minikube-ip> aws-services.example.com

# Ou usar port-forward
kubectl port-forward svc/frontend 8080:80 -n aws-services

# Acessar: http://localhost:8080
```

## 📊 Monitoramento

### **Ver Status dos Pods**

```bash
kubectl get pods -n aws-services -w
```

### **Ver Logs**

```bash
# Logs de um pod específico
kubectl logs -f backend-python-<pod-id> -n aws-services

# Logs de todos os pods de um deployment
kubectl logs -f deployment/backend-python -n aws-services

# Logs anteriores (se pod crashou)
kubectl logs --previous backend-python-<pod-id> -n aws-services
```

### **Métricas**

```bash
# Uso de recursos por pod
kubectl top pods -n aws-services

# Uso de recursos por node
kubectl top nodes
```

### **Eventos**

```bash
kubectl get events -n aws-services --sort-by='.lastTimestamp'
```

## 🔄 Atualizar Aplicação

### **Rolling Update**

```bash
# Atualizar imagem do backend Python
kubectl set image deployment/backend-python \
  backend-python=ghcr.io/sergio-sena/aws-services/backend-python:v2.0.0 \
  -n aws-services

# Ver status do rollout
kubectl rollout status deployment/backend-python -n aws-services

# Histórico de rollouts
kubectl rollout history deployment/backend-python -n aws-services

# Rollback
kubectl rollout undo deployment/backend-python -n aws-services
```

## 🗑️ Limpar Recursos

```bash
# Deletar tudo do namespace
kubectl delete namespace aws-services

# Ou deletar individualmente
kubectl delete -f ingress/
kubectl delete -f services/
kubectl delete -f deployments/
kubectl delete -f configmaps/
kubectl delete -f secrets/
kubectl delete -f namespace.yaml
```

## 💰 Estimativa de Custos

### **Minikube (Local)** - $0/mês
- Roda na sua máquina
- Ideal para desenvolvimento e testes

### **AWS EKS** - $72-200/mês
- Control Plane: $72/mês
- Worker Nodes (t3.medium x2): $60/mês
- Load Balancer: $18/mês
- Data Transfer: $10-40/mês

### **GKE (Google)** - $50-150/mês
- Control Plane: Grátis (cluster zonal)
- Worker Nodes (e2-medium x2): $50/mês
- Load Balancer: $18/mês
- Data Transfer: $10-30/mês

### **AKS (Azure)** - $60-180/mês
- Control Plane: Grátis
- Worker Nodes (Standard_B2s x2): $60/mês
- Load Balancer: $18/mês
- Data Transfer: $10-40/mês

## 🎯 Próximos Passos

- [ ] Adicionar Prometheus + Grafana para monitoramento
- [ ] Configurar cert-manager para TLS automático
- [ ] Adicionar Persistent Volumes para PostgreSQL
- [ ] Implementar Network Policies
- [ ] Configurar Service Mesh (Istio/Linkerd)
- [ ] Adicionar Horizontal Pod Autoscaler baseado em métricas customizadas
- [ ] Implementar Blue/Green deployment
- [ ] Configurar backup automático

## 📚 Referências

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager](https://cert-manager.io/)
- [Minikube](https://minikube.sigs.k8s.io/)
- [k3s](https://k3s.io/)

---

**Desenvolvido com ❤️ para demonstrar orquestração Kubernetes**

*Last updated: 2026-03-11*
