# AWS S3 Explorer

Aplicação web para explorar e gerenciar buckets e objetos do Amazon S3.

## Funcionalidades

- ✅ Autenticação com credenciais AWS
- ✅ Listagem de buckets S3
- ✅ Navegação por pastas dentro de buckets
- ✅ Download de arquivos individuais
- ✅ Download de múltiplos arquivos selecionados
- ✅ Download de todos os arquivos visíveis em um bucket

## Estrutura do Projeto

- `frontend/`: Interface de usuário com HTML, CSS e JavaScript
- `backend/`: API Node.js com Express para interação com AWS S3

## Requisitos

- Node.js 14+ e npm
- Conta AWS com credenciais de acesso (Access Key e Secret Key)
- Navegador web moderno

## Configuração Rápida

### 1. Configurar o Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo de configuração
copy .env.example .env

# Editar o arquivo .env com um editor de texto
# Não é necessário preencher as credenciais AWS no .env
```

### 2. Iniciar o Servidor

```bash
# Na pasta backend
npm start
```

O servidor será iniciado na porta 8000 por padrão.

### 3. Acessar o Frontend

Abra o arquivo `frontend/index.html` em seu navegador.

## Segurança

- As credenciais AWS são armazenadas apenas temporariamente no localStorage do navegador
- As credenciais não são persistidas no servidor
- Todas as operações são realizadas usando as credenciais fornecidas pelo usuário
- Recomendamos usar credenciais com permissões limitadas (apenas para S3)

## Guia de Uso

1. Faça login com suas credenciais AWS na página inicial
2. Navegue pelos seus buckets S3 no painel lateral esquerdo
3. Clique em um bucket para ver seu conteúdo
4. Navegue pelas pastas clicando nelas
5. Use a navegação de breadcrumbs para voltar a níveis anteriores
6. Selecione arquivos para download usando as caixas de seleção
7. Use os botões de download para baixar arquivos selecionados ou todo o bucket
8. Clique em "Logout" para sair e limpar suas credenciais

## Desenvolvimento

Para executar o servidor em modo de desenvolvimento com reinício automático:

```bash
cd backend
npm run dev
```