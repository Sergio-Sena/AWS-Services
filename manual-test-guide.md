# 🧪 GUIA DE TESTE MANUAL - AWS Services Dashboard

## 🚀 **COMO INICIAR A APLICAÇÃO**

### **1. Iniciar Backend (Terminal 1)**
```bash
cd "c:\Projetos Git\AWS Services\backend"
npm run dev
```
**Aguarde**: `Servidor rodando na porta 8000`

### **2. Iniciar Frontend (Terminal 2)**
```bash
cd "c:\Projetos Git\AWS Services\frontend-next"
npm run dev
```
**Aguarde**: `Ready - started server on 0.0.0.0:3000`

---

## 🔗 **LINKS PARA TESTE MANUAL**

### **📱 APLICAÇÃO PRINCIPAL**
- **🏠 Login**: http://localhost:3000
- **🎯 Dashboard Serviços**: http://localhost:3000/services

### **🗄️ MÓDULOS AWS**
- **S3 Dashboard**: http://localhost:3000/dashboard
- **🆕 RDS (Novo)**: http://localhost:3000/rds
- **EC2 Instâncias**: http://localhost:3000/ec2
- **DynamoDB**: http://localhost:3000/dynamodb
- **CloudFront**: http://localhost:3000/cloudfront
- **Lambda**: http://localhost:3000/lambda
- **💰 Calculadora**: http://localhost:3000/calculator

### **🔧 API ENDPOINTS (Backend)**
- **Health Check**: http://localhost:8000/health
- **RDS API**: http://localhost:8000/api/rds/instances
- **EC2 API**: http://localhost:8000/api/ec2/instances
- **DynamoDB API**: http://localhost:8000/api/dynamodb/tables

---

## 📋 **CHECKLIST DE TESTE MANUAL**

### **✅ TESTE 1: LOGIN E NAVEGAÇÃO**
1. **Abrir**: http://localhost:3000
2. **Verificar**: 
   - [ ] Página de login carrega
   - [ ] Campos Access Key e Secret Key aparecem
   - [ ] Botão "Logar" funciona
   - [ ] Status "Sistema online" aparece

3. **Login**: 
   - Access Key: `AKIAIOSFODNN7EXAMPLE` (teste)
   - Secret Key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (teste)
   - [ ] Redirecionamento para `/services`

### **✅ TESTE 2: PÁGINA DE SERVIÇOS**
**Link**: http://localhost:3000/services

**Verificar cards:**
- [ ] **S3** - Ícone database, cor azul
- [ ] **Lambda** - Ícone code, cor laranja  
- [ ] **EC2** - Ícone server, cor verde
- [ ] **CloudFront** - Ícone globe, cor roxa
- [ ] **DynamoDB** - Ícone table, cor amarela
- [ ] **🆕 RDS** - Ícone database, cor vermelha (NOVO)
- [ ] **Calculadora** - Ícone calculator, cor azul

**Testar navegação:**
- [ ] Clicar em cada card redireciona corretamente
- [ ] Botão "Logout" funciona

### **✅ TESTE 3: MÓDULO RDS (NOVO)**
**Link**: http://localhost:3000/rds

**Verificar interface:**
- [ ] Título "Amazon RDS" aparece
- [ ] Ícone database vermelho
- [ ] 3 cards de estatísticas:
  - Total de Instâncias
  - Instâncias Reais  
  - Instâncias Demo
- [ ] Lista de instâncias RDS
- [ ] Badges "REAL" e "DEMO" aparecem
- [ ] Botões de ação (play, stop, backup) funcionam
- [ ] Informações: Engine, Classe, Storage, Multi-AZ
- [ ] Botão "Atualizar" funciona
- [ ] Botão voltar (seta) funciona

### **✅ TESTE 4: MÓDULO S3**
**Link**: http://localhost:3000/dashboard

**Verificar funcionalidades:**
- [ ] Lista de buckets carrega
- [ ] Navegação em pastas funciona
- [ ] Upload de arquivos funciona
- [ ] Download de arquivos funciona
- [ ] Informações de tamanho aparecem
- [ ] Breadcrumb funciona

### **✅ TESTE 5: OUTROS MÓDULOS**

**EC2**: http://localhost:3000/ec2
- [ ] Lista de instâncias
- [ ] Status indicators
- [ ] Badges REAL/DEMO
- [ ] Operações simuladas

**DynamoDB**: http://localhost:3000/dynamodb  
- [ ] Lista de tabelas
- [ ] Informações detalhadas
- [ ] Operações demo

**CloudFront**: http://localhost:3000/cloudfront
- [ ] Lista de distribuições
- [ ] Domínios destacados
- [ ] Pills coloridas

**Lambda**: http://localhost:3000/lambda
- [ ] Interface de compactação
- [ ] Upload de imagens
- [ ] Seleção de módulos

**Calculadora**: http://localhost:3000/calculator
- [ ] Dados de faturamento
- [ ] Conversão BRL
- [ ] Breakdown por serviço

### **✅ TESTE 6: RESPONSIVIDADE**

**Testar em diferentes tamanhos:**
- [ ] **Desktop** (1920x1080): Layout completo
- [ ] **Tablet** (768x1024): Cards reorganizados
- [ ] **Mobile** (375x667): Menu colapsado

**Verificar:**
- [ ] Textos legíveis
- [ ] Botões clicáveis
- [ ] Navegação funcional
- [ ] Sem overflow horizontal

### **✅ TESTE 7: PERFORMANCE**

**Medir tempos:**
- [ ] Login → Services: < 2s
- [ ] Navegação entre páginas: < 1s
- [ ] Carregamento de dados: < 3s
- [ ] Upload de arquivo: Funcional

### **✅ TESTE 8: TRATAMENTO DE ERROS**

**Cenários de teste:**
- [ ] Backend offline (parar servidor)
- [ ] Credenciais inválidas
- [ ] Rede lenta
- [ ] Páginas inexistentes

**Verificar:**
- [ ] Mensagens de erro claras
- [ ] Fallback para dados demo
- [ ] Aplicação não quebra
- [ ] Recovery automático

---

## 🎯 **CRITÉRIOS DE APROVAÇÃO**

### **✅ MÍNIMO ACEITÁVEL (80%)**
- [x] Aplicação inicia sem erros
- [x] Login funciona
- [x] 5+ módulos funcionais
- [x] Interface responsiva básica

### **🚀 IDEAL (95%)**
- [ ] Todos os 7 módulos funcionais
- [ ] Performance otimizada
- [ ] Tratamento de erros completo
- [ ] Interface polida

### **🏆 EXCELENTE (100%)**
- [ ] Zero bugs críticos
- [ ] Performance excepcional  
- [ ] UX impecável
- [ ] Pronto para produção

---

## 📊 **COMO REPORTAR PROBLEMAS**

### **🐛 Se encontrar bugs:**
1. **Anotar**: URL, ação realizada, erro observado
2. **Screenshot**: Se possível
3. **Console**: Verificar erros no F12
4. **Classificar**: Crítico, Alto, Médio, Baixo

### **📝 Template de Bug Report:**
```
**URL**: http://localhost:3000/rds
**Ação**: Cliquei no botão "Iniciar"
**Esperado**: Instância deveria iniciar
**Observado**: Erro 500 na API
**Console**: TypeError: Cannot read property...
**Severidade**: Alto
```

---

## 🎉 **APÓS OS TESTES**

### **✅ Se tudo funcionar (>95%):**
```bash
# Commit das mudanças
git add .
git commit -m "feat: Testes manuais aprovados - aplicação pronta para deploy"

# Criar tag
git tag -a v1.1.0 -m "Versão testada e aprovada"

# Deploy
git push origin main
```

### **❌ Se houver problemas (<95%):**
1. **Documentar** todos os bugs encontrados
2. **Priorizar** correções críticas
3. **Corrigir** problemas identificados
4. **Re-testar** após correções

---

**🚀 Pronto para testar! Abra os links e siga o checklist.**

**Tempo estimado**: 30-45 minutos para teste completo