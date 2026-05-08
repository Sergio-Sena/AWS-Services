# 🎭 Guia de Uso das Personas Amazon Q

**Última atualização:** 01/03/2026  
**Versão:** 2.0 (Estrutura limpa)

---

## 📋 ÍNDICE RÁPIDO

- [@atlas](#atlas) - Estratégia e Decisões Críticas
- [@maestro](#maestro) - Orquestração Técnica
- [@base](#base) - Implementação Full-Stack
- [@meumanus](#meumanus) - Infraestrutura e DevOps
- [@lyra](#lyra) - Otimização de Prompts
- [Hierarquia](#hierarquia)
- [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 @atlas

**Papel:** Consultor Estratégico Sênior  
**Invocação:** `@atlas`

### Quando usar:
- ✅ Decisões estratégicas críticas
- ✅ Planejamento de projetos complexos
- ✅ Análise de viabilidade e riscos
- ✅ Validação de arquitetura
- ✅ Quando precisar de crítica honesta
- ✅ Quando algo parecer "fácil demais"

### Características:
- 🔴 **Direto e honesto** - Sem rodeios
- 🔴 **Crítico construtivo** - Aponta falhas com soluções
- 🔴 **Questionador** - Faz perguntas difíceis
- 🔴 **Exigente** - Não aceita mediocridade

### Exemplos de uso:
```
@atlas Devo usar Lambda ou ECS para este projeto?
@atlas Revise esta arquitetura e me diga o que está errado
@atlas Analise os riscos deste plano de migração
@atlas Isso faz sentido estrategicamente?
```

### ⚠️ Aviso:
Atlas NÃO vai concordar com você só para agradar. Sua lealdade é com o sucesso do projeto, não com seu ego.

---

## 🎼 @maestro

**Papel:** Orquestrador de Personas  
**Invocação:** `@maestro`

### Quando usar:
- ✅ Projetos que envolvem múltiplas áreas
- ✅ Quando não sabe qual persona usar
- ✅ Tarefas complexas que precisam coordenação
- ✅ Quando precisa de análise + implementação

### Características:
- 🎯 **Coordenador** - Delega para personas apropriadas
- 🎯 **Analítico** - Identifica domínios técnicos
- 🎯 **Eficiente** - Otimiza ordem de execução
- 🎯 **Unificador** - Consolida resultados

### Exemplos de uso:
```
@maestro Preciso criar um SaaS completo do zero
@maestro Analise este projeto e coordene as melhorias
@maestro Não sei qual persona usar para esta tarefa
```

### Como funciona:
1. Analisa sua requisição
2. Identifica personas necessárias
3. Coordena execução
4. Unifica resultados

---

## 🏗️ @base

**Papel:** Arquiteto de Software Full-Stack  
**Invocação:** `@base`

### Quando usar:
- ✅ Desenvolvimento de aplicações
- ✅ Arquitetura de software
- ✅ Implementação de APIs
- ✅ Frontend + Backend
- ✅ Código limpo e documentado

### Características:
- 💻 **Full-Stack** - Frontend, Backend, DevOps
- 💻 **Metodológico** - Usa metodologia C.E.R.T.O
- 💻 **Detalhista** - Código comentado e documentado
- 💻 **Pragmático** - Soluções funcionais e escaláveis

### Stack principal:
- **Frontend:** React, Next.js, Vue.js, TypeScript, Tailwind
- **Backend:** Node.js, Python, Java, .NET
- **Cloud:** AWS Lambda, S3, CloudFront
- **Databases:** PostgreSQL, MongoDB, DynamoDB

### Exemplos de uso:
```
@base Crie uma API REST para gerenciar usuários
@base Implemente autenticação JWT com refresh token
@base Desenvolva um dashboard com React e Tailwind
@base Arquitete um sistema de upload de arquivos
```

---

## ⚙️ @meumanus

**Papel:** Especialista em Infraestrutura e DevOps  
**Invocação:** `@meumanus`

### Quando usar:
- ✅ Infraestrutura AWS
- ✅ Otimização de custos (FinOps)
- ✅ Monitoramento e SLA
- ✅ CI/CD e automação
- ✅ Serverless e Lambda

### Características:
- 🔧 **Infraestrutura** - AWS, Terraform, CloudFormation
- 🔧 **FinOps** - Análise e otimização de custos
- 🔧 **DevOps** - CI/CD, automação, pipelines
- 🔧 **Monitoramento** - CloudWatch, alarmes, health checks

### Especialidades:
- AWS Lambda, S3, CloudFront, DynamoDB
- Cost Explorer e otimização de custos
- CloudWatch Alarms e SNS
- Terraform e Infrastructure as Code

### Exemplos de uso:
```
@meumanus Configure monitoramento para este projeto
@meumanus Analise os custos AWS e sugira otimizações
@meumanus Crie alarmes CloudWatch para estas métricas
@meumanus Configure CI/CD com GitHub Actions
```

---

## ✨ @lyra

**Papel:** Especialista em Otimização de Prompts  
**Invocação:** `@lyra`

### Quando usar:
- ✅ Otimizar prompts para IA
- ✅ Melhorar qualidade de respostas
- ✅ Técnicas avançadas de prompting
- ✅ Adaptar prompts para diferentes IAs

### Características:
- 📝 **Metodologia 4-D** - Desconstruir, Diagnosticar, Desenvolver, Entregar
- 📝 **Técnicas avançadas** - Chain of Thought, Few-Shot Learning
- 📝 **Multi-plataforma** - ChatGPT, Claude, Gemini
- 📝 **Precisa** - Prompts otimizados e eficazes

### Modos de operação:
- **DETALHE:** Faz perguntas de esclarecimento primeiro
- **BÁSICO:** Otimização rápida e direta

### Exemplos de uso:
```
@lyra DETALHE usando Claude - Otimize este prompt
@lyra BÁSICO usando ChatGPT - Melhore esta solicitação
@lyra Como fazer este prompt gerar melhores resultados?
```

---

## 🏛️ HIERARQUIA

```
┌─────────────────────────────────────┐
│         @atlas                      │
│    (Estratégia/Decisão)             │
│  "O que fazer? Vale a pena?"        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         @maestro                    │
│    (Orquestração)                   │
│  "Como coordenar as partes?"        │
└──────────────┬──────────────────────┘
               ↓
┌──────────────┬──────────────┬───────┐
│    @base     │  @meumanus   │ @lyra │
│ (Código)     │  (Infra)     │(Prompt)│
│ "Implementar"│ "Deployar"   │"Otimiz"│
└──────────────┴──────────────┴───────┘
```

### Fluxo de trabalho típico:

1. **@atlas** → Valida se o projeto faz sentido
2. **@maestro** → Coordena as áreas necessárias
3. **@base** → Implementa o código
4. **@meumanus** → Configura infraestrutura
5. **@lyra** → Otimiza comunicação com IA (se necessário)

---

## 💡 EXEMPLOS PRÁTICOS

### Exemplo 1: Novo Projeto SaaS

```
Passo 1: @atlas Quero criar um SaaS de gestão de tarefas. 
         Isso faz sentido? Quais os principais riscos?

Passo 2: @maestro Com base na análise do @atlas, 
         coordene a criação deste SaaS

Passo 3: @base Implemente o backend da API
         @meumanus Configure a infraestrutura AWS
```

### Exemplo 2: Otimização de Custos

```
@meumanus Analise os custos do projeto MidiaFlow 
          e sugira otimizações
```

### Exemplo 3: Revisão de Arquitetura

```
@atlas Revise a arquitetura do projeto SSphere-Backend
       e identifique problemas críticos
```

### Exemplo 4: Desenvolvimento Rápido

```
@base Crie uma API REST para gerenciar produtos
      com CRUD completo e autenticação
```

### Exemplo 5: Melhorar Prompts

```
@lyra DETALHE usando Claude - Otimize este prompt:
      "Crie um sistema de login"
```

---

## 🎯 QUANDO USAR CADA PERSONA

| Situação | Persona | Por quê |
|----------|---------|---------|
| "Devo fazer isso?" | @atlas | Decisão estratégica |
| "Como fazer isso?" | @maestro | Coordenação |
| "Implemente isso" | @base | Código |
| "Configure isso" | @meumanus | Infraestrutura |
| "Melhore este prompt" | @lyra | Otimização |
| "Não sei qual usar" | @maestro | Ele decide |

---

## ⚡ DICAS RÁPIDAS

### ✅ Boas Práticas:
- Use @atlas para decisões importantes
- Use @maestro quando não souber qual persona usar
- Combine personas: `@atlas @maestro Analise este projeto`
- Seja específico nas solicitações

### ❌ Evite:
- Usar @base para decisões estratégicas
- Usar @atlas para implementação de código
- Misturar muitas personas sem necessidade
- Solicitações vagas sem contexto

---

## 🔄 COMBINAÇÕES PODEROSAS

### Análise Completa:
```
@atlas @maestro Analise este projeto e coordene melhorias
```

### Implementação Guiada:
```
@atlas Valide esta arquitetura
@base Implemente conforme validação do @atlas
```

### Deploy Completo:
```
@base Crie a aplicação
@meumanus Configure infraestrutura e deploy
```

---

## 📚 RECURSOS ADICIONAIS

### Arquivos relacionados:
- `manual IA.md` - Diretrizes de comportamento do @atlas
- `.aws/amazonq/personas/` - Configurações das personas
- `.aws/amazonq/prompts/` - Prompts salvos e memórias

### Comandos úteis:
- `@prompt nome-do-arquivo` - Carrega contexto de projeto
- `@workspace` - Inclui contexto do workspace
- `@file` - Inclui arquivo específico

---

## 🆘 TROUBLESHOOTING

**Problema:** Persona não responde como esperado  
**Solução:** Reinicie o Amazon Q no IDE

**Problema:** Não sei qual persona usar  
**Solução:** Use @maestro, ele vai recomendar

**Problema:** Resposta muito genérica  
**Solução:** Seja mais específico ou use @atlas para análise profunda

**Problema:** Preciso de crítica honesta  
**Solução:** Use @atlas, ele não vai concordar só para agradar

---

**Versão:** 2.0  
**Última atualização:** 01/03/2026  
**Personas ativas:** 5 (@atlas, @maestro, @base, @meumanus, @lyra)
