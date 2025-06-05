# S3 Explorer - Backend

Servidor Node.js/Express para o S3 Explorer.

## Estrutura de Arquivos

```
backend/
├── downloads/         # Diretório para downloads temporários
├── uploads/           # Diretório para uploads temporários
├── .env               # Variáveis de ambiente
├── .env.example       # Exemplo de variáveis de ambiente
├── download-service.js # Serviço para download de objetos
├── package.json       # Dependências do projeto
└── server.js          # Servidor Express principal
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente no arquivo `.env`

```
PORT=8000
NODE_ENV=development
```

## Dependências

- [express](https://expressjs.com/) - Framework web
- [cors](https://www.npmjs.com/package/cors) - Middleware para habilitar CORS
- [aws-sdk](https://www.npmjs.com/package/aws-sdk) - SDK da AWS para Node.js
- [dotenv](https://www.npmjs.com/package/dotenv) - Carregamento de variáveis de ambiente
- [multer](https://www.npmjs.com/package/multer) - Middleware para upload de arquivos

## API Endpoints

### Autenticação

- `POST /auth` - Verifica se as credenciais AWS são válidas

### Buckets

- `GET /buckets` - Lista todos os buckets
- `POST /create-bucket` - Cria um novo bucket

### Objetos

- `GET /objects/:bucket` - Lista objetos em um bucket
- `GET /download/:bucket/:key` - Faz download de um objeto
- `POST /upload/:bucket` - Faz upload de arquivos para um bucket

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor em modo de desenvolvimento
npm run dev

# Iniciar servidor em modo de produção
npm start
```

## Testes

```bash
# Testar autenticação
npm run test-auth

# Testar listagem de buckets
npm run test-buckets
```