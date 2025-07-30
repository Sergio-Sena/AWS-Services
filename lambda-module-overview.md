# 🚀 Módulo Lambda - Funcionalidades

## 🎯 Objetivo Principal
**Demonstrar processamento serverless** com compactação automática de imagens via AWS Lambda.

## 📸 Funcionalidade: Compactação de Imagens

### **Como Funciona:**
```
Usuário → Upload Imagem → S3 → Trigger Lambda → Compacta → S3 (compressed/) → Resultado
```

### **Fluxo Detalhado:**
1. **Upload**: Usuário seleciona imagem na interface
2. **S3 Storage**: Imagem salva em `bucket/lambda-uploads/`
3. **Trigger Automático**: S3 dispara Lambda automaticamente
4. **Processamento**: Lambda compacta imagem (Sharp library)
5. **Armazenamento**: Imagem compactada salva em `bucket/compressed/`
6. **Feedback**: Interface mostra resultado e estatísticas

## 🖥️ Interface do Módulo Lambda

### **Página `/lambda`:**
```
AWS Lambda
├── 📊 Estatísticas de Execução
│   ├── Execuções hoje: 12
│   ├── Tempo médio: 847ms
│   ├── Dados processados: 2.3MB
│   └── Custo estimado: $0.12
├── 📤 Upload e Processamento
│   ├── Área de upload (drag & drop)
│   ├── Status em tempo real
│   └── Progresso da compactação
└── 📋 Histórico de Processamentos
    ├── Lista de imagens processadas
    ├── Tempo de execução
    └── Taxa de compressão
```

## ⚙️ Processamento Lambda

### **Configuração:**
- **Runtime**: Node.js 18
- **Memória**: 1024MB
- **Timeout**: 60 segundos
- **Layer**: Sharp (compactação de imagens)

### **Processo de Compactação:**
```javascript
// Exemplo do que a Lambda faz:
1. Recebe trigger do S3
2. Baixa imagem original
3. Compacta com Sharp:
   - Qualidade: 70%
   - Redimensiona: max 1920x1080
   - Formato: JPEG otimizado
4. Salva imagem compactada
5. Retorna estatísticas
```

## 📊 Métricas e Monitoramento

### **Dados Exibidos:**
- **Performance**:
  - Tempo de execução (ms)
  - Memória utilizada
  - Cold start vs warm start
  
- **Compressão**:
  - Tamanho original vs compactado
  - Taxa de compressão (%)
  - Economia de espaço

- **Custos**:
  - Custo por execução
  - Custo total do dia
  - Projeção mensal

## 🎓 Valor Educativo

### **Demonstra Conceitos AWS:**
- **Serverless Computing**: Sem gerenciamento de servidor
- **Event-Driven**: Processamento por eventos (S3 trigger)
- **Auto-scaling**: Lambda escala automaticamente
- **Pay-per-use**: Paga apenas pelo que usa
- **Integração**: S3 + Lambda + CloudWatch

### **Casos de Uso Reais:**
- Processamento de imagens em e-commerce
- Redimensionamento automático de avatars
- Otimização de imagens para web
- Processamento de uploads em massa

## 🔧 Implementação Técnica

### **Backend (Lambda Functions):**
- `compressImage`: Processa imagem automaticamente
- `getUploadUrl`: Gera URL para upload direto
- `getCompressionStatus`: Monitora progresso

### **Frontend (Interface):**
- Componente de upload com drag & drop
- Monitoramento em tempo real
- Exibição de estatísticas
- Histórico de processamentos

## 🚀 Benefícios

### **Para o Usuário:**
- Interface intuitiva
- Processamento automático
- Feedback em tempo real
- Economia de espaço

### **Para o Desenvolvedor:**
- Exemplo prático de serverless
- Integração S3 + Lambda
- Monitoramento de performance
- Padrões de arquitetura AWS

## 📈 Resultado Esperado

### **Funcionalidade:**
- Upload de imagem: ✅ Funcional
- Compactação automática: ✅ 50-70% redução
- Interface responsiva: ✅ Tempo real
- Estatísticas: ✅ Detalhadas

### **Aprendizado:**
- Conceitos serverless na prática
- Integração de serviços AWS
- Monitoramento e observabilidade
- Otimização de custos

**Resumo**: O módulo Lambda transforma a aplicação em um **exemplo prático de arquitetura serverless**, demonstrando processamento automático de imagens com feedback em tempo real e métricas detalhadas.