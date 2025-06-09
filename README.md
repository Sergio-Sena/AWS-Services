# AWS S3 Explorer

Aplicação para explorar e gerenciar buckets e objetos do Amazon S3 com interface moderna em Next.js.

## Estrutura do Projeto

- `backend/`: API Node.js/Express para interagir com a AWS S3
- `frontend-next/`: Interface web moderna usando Next.js

## Como Executar

### Backend

1. Entre na pasta do backend:
   ```
   cd backend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure o arquivo `.env` (já existe um exemplo em `.env.example`):
   ```
   PORT=8000
   NODE_ENV=development
   ```

4. Inicie o servidor:
   ```
   npm start
   ```

O backend estará disponível em `http://localhost:8000`.

### Frontend Next.js

1. Entre na pasta do frontend-next:
   ```
   cd frontend-next
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

O frontend Next.js estará disponível em `http://localhost:3000`.

## Conexão entre Frontend e Backend

O frontend se conecta ao backend através da API REST. Certifique-se de que:

1. O backend esteja em execução na porta 8000
2. As configurações CORS no backend permitam requisições do frontend
3. A URL da API no frontend está configurada em `.env.local` como `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Funcionalidades

- Autenticação com credenciais AWS (Access Key e Secret Key)
- Listagem de buckets S3
- Navegação pelos objetos dentro dos buckets
- Upload e download de arquivos
- Criação de novos buckets
- Exclusão de objetos e buckets