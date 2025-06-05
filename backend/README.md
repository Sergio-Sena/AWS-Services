# AWS S3 Explorer - Backend

API Node.js com Express para interação com o Amazon S3.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` baseado no `.env.example`:
   ```bash
   copy .env.example .env   # Windows
   # ou
   cp .env.example .env     # Linux/Mac
   ```

3. Edite o arquivo `.env` com suas configurações (opcional):
   ```
   PORT=8000                # Porta do servidor
   NODE_ENV=development     # Ambiente (development/production)
   ```

   Nota: Não é necessário incluir credenciais AWS no arquivo `.env` para o funcionamento normal da aplicação, pois elas são fornecidas pelo usuário através da interface.

## Execução

Para iniciar o servidor em modo normal:
```bash
npm start
```

Para desenvolvimento com reinício automático:
```bash
npm run dev
```

## Endpoints da API

### Autenticação
- `POST /auth`: Verifica se as credenciais AWS são válidas
  - Body: `{ "access_key": "...", "secret_key": "..." }`
  - Response: `{ "success": true, "message": "Autenticação bem-sucedida" }`

### Buckets
- `GET /buckets`: Lista todos os buckets
  - Headers: `access_key`, `secret_key`
  - Response: `{ "success": true, "buckets": [...] }`

### Objetos
- `GET /objects/:bucket`: Lista objetos em um bucket
  - Headers: `access_key`, `secret_key`
  - Query params: `prefix` (opcional) - Para navegar em subpastas
  - Response: `{ "success": true, "objects": [...], "prefixes": [...] }`

### Download
- `GET /download/:bucket/:key`: Faz download de um objeto
  - Headers: `access_key`, `secret_key` ou
  - Query params: `access_token`, `secret_token`
  - Response: Stream do arquivo para download

## Estrutura de Arquivos

- `server.js`: Ponto de entrada da aplicação
- `download-service.js`: Serviço para download de objetos S3
- `downloads/`: Pasta temporária para arquivos baixados
- `.env`: Configurações do ambiente (não versionado)
- `.env.example`: Exemplo de configurações

## Segurança

- As credenciais AWS são recebidas do frontend e usadas apenas para operações específicas
- Nenhuma credencial é armazenada no servidor
- Todas as operações são realizadas diretamente com a AWS usando as credenciais fornecidas pelo usuário