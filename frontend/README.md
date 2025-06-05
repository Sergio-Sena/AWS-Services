# S3 Explorer - Frontend

Interface web para o S3 Explorer.

## Estrutura de Arquivos

```
frontend/
├── dashboard.html   # Página principal do dashboard
├── dashboard.js     # Lógica do dashboard
├── index.html       # Página de login
├── login.js         # Lógica de login
└── styles.css       # Estilos CSS
```

## Componentes Principais

### Página de Login (index.html, login.js)

A página de login permite aos usuários autenticar com suas credenciais AWS. As credenciais são validadas pelo backend e armazenadas temporariamente no localStorage para uso nas requisições subsequentes.

**Funcionalidades:**
- Validação de credenciais AWS
- Armazenamento seguro de credenciais no localStorage
- Redirecionamento para o dashboard após autenticação bem-sucedida

### Dashboard (dashboard.html, dashboard.js)

O dashboard é a interface principal para interagir com os buckets e objetos S3.

**Funcionalidades:**
- Listagem de buckets
- Criação de novos buckets
- Navegação por objetos e "pastas" dentro dos buckets
- Upload de arquivos para buckets
- Download de objetos individuais ou em lote

## Fluxo de Dados

1. As credenciais são obtidas do localStorage
2. As requisições para o backend incluem as credenciais nos headers
3. Os dados recebidos do backend são renderizados na interface
4. As ações do usuário (criar bucket, upload, download) são enviadas para o backend

## Estilização

A aplicação usa:
- [Tailwind CSS](https://tailwindcss.com/) para estilização
- [Font Awesome](https://fontawesome.com/) para ícones
- Estilos personalizados em `styles.css`

## Desenvolvimento

Para modificar o frontend:

1. Edite os arquivos HTML, CSS ou JavaScript
2. Teste as alterações abrindo os arquivos no navegador
3. Não é necessário compilar ou construir o frontend