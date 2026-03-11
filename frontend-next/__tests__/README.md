# 🧪 Frontend Next.js - Testes

Testes automatizados para o frontend Next.js usando Jest + React Testing Library.

## 📋 Estrutura

```
__tests__/
├── pages/
│   └── index.test.js         # Testes página de login
├── components/
│   └── ServiceCard.test.js   # Testes componentes
└── services/
    └── api.test.js           # Testes serviço API
```

## 🚀 Executar Testes

### **Instalar dependências**
```bash
npm install
```

### **Rodar todos os testes**
```bash
npm test
```

### **Rodar com watch mode**
```bash
npm run test:watch
```

### **Rodar com coverage**
```bash
npm run test:coverage
```

## 📊 Coverage

Os testes geram relatório de cobertura em `coverage/`:

```bash
npm run test:coverage
# Abre coverage/lcov-report/index.html no navegador
```

**Meta de cobertura**: 40%+ (configurado em jest.config.js)

## ✅ O Que É Testado

### **1. Páginas**
- Renderização de componentes
- Interações do usuário (cliques, inputs)
- Navegação (router)
- Estados de loading
- Validação de formulários

### **2. Serviços API**
- Chamadas HTTP (fetch)
- Tratamento de erros
- Validação de credenciais
- Fallback quando backend offline

### **3. Componentes**
- Props corretas
- Renderização condicional
- Estados internos
- Eventos (onClick, onChange)

## 🎯 Exemplos de Testes

### **Teste de Renderização**
```javascript
test('deve renderizar formulário de login', () => {
  render(<Login showNotification={mockFn} />)

  expect(screen.getByText('AWS Services')).toBeInTheDocument()
  expect(screen.getByLabelText(/Access Key ID/i)).toBeInTheDocument()
})
```

### **Teste de Interação**
```javascript
test('deve alternar visibilidade da senha', () => {
  render(<Login showNotification={mockFn} />)

  const passwordInput = screen.getByLabelText(/Secret Access Key/i)
  const toggleButton = screen.getByRole('button', { name: /toggle/i })

  fireEvent.click(toggleButton)
  expect(passwordInput).toHaveAttribute('type', 'text')
})
```

### **Teste de API**
```javascript
test('deve validar credenciais corretas', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true })
  })

  const result = await apiService.validateCredentials('key', 'secret')
  expect(result.success).toBe(true)
})
```

### **Teste Assíncrono**
```javascript
test('deve fazer login com credenciais válidas', async () => {
  mockLogin.mockResolvedValue({ success: true })

  render(<Login showNotification={mockFn} />)
  
  fireEvent.click(screen.getByRole('button', { name: /Logar/i }))

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalled()
  })
})
```

## 🛠️ Configuração

### **jest.config.js**
- Usa `next/jest` para configuração automática
- Suporta aliases (`@/components`, `@/services`)
- Coverage threshold: 40%

### **jest.setup.js**
- Importa `@testing-library/jest-dom`
- Mock `window.matchMedia`
- Mock `IntersectionObserver`
- Mock `fetch` global

### **.eslintrc.json**
- Extends `next/core-web-vitals`
- Plugin `testing-library/react`
- Regras customizadas

## 🐛 Troubleshooting

### **Erro: Cannot find module '@/...'**
```bash
# Verificar jest.config.js moduleNameMapper
```

### **Erro: window is not defined**
```bash
# Adicionar mock em jest.setup.js
```

### **Testes falhando**
```bash
# Limpar cache
npm test -- --clearCache

# Rodar teste específico
npm test -- index.test.js

# Modo verbose
npm test -- --verbose
```

### **Coverage baixo**
- Adicionar mais casos de teste
- Testar edge cases
- Testar caminhos de erro
- Testar estados de loading

## 📝 Adicionar Novos Testes

1. Criar arquivo em `__tests__/`
2. Importar componente/serviço
3. Mockar dependências (router, context, API)
4. Escrever testes com `describe` e `test`
5. Usar `render`, `screen`, `fireEvent`, `waitFor`
6. Rodar `npm test`

## 🎯 Boas Práticas

- ✅ Testar comportamento, não implementação
- ✅ Usar `screen.getByRole` quando possível
- ✅ Usar `waitFor` para operações assíncronas
- ✅ Mockar dependências externas
- ✅ Limpar mocks entre testes (`beforeEach`)
- ✅ Testar casos de sucesso E erro
- ✅ Testar estados de loading
- ✅ Usar `data-testid` apenas quando necessário

## 🚀 Próximos Passos

- [ ] Aumentar coverage para 60%+
- [ ] Adicionar testes E2E (Playwright/Cypress)
- [ ] Testar todas as páginas
- [ ] Testar todos os componentes
- [ ] Adicionar testes de acessibilidade
- [ ] Configurar CI/CD para rodar testes

---

**Desenvolvido com ❤️ usando Jest + React Testing Library**
