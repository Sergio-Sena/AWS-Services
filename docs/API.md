# Documentação da API - S3 Explorer

Esta documentação descreve os endpoints da API do backend do S3 Explorer.

## Base URL

Por padrão, a API está disponível em `http://localhost:8000`.

## Autenticação

Todas as rotas (exceto `/auth`) requerem credenciais AWS nos headers da requisição:

```
access_key: SUA_ACCESS_KEY_ID
secret_key: SUA_SECRET_ACCESS_KEY
```

## Endpoints

### Autenticação

#### Verificar Credenciais

```
POST /auth
```

Verifica se as credenciais AWS fornecidas são válidas.

**Corpo da Requisição:**
```json
{
  "access_key": "SUA_ACCESS_KEY_ID",
  "secret_key": "SUA_SECRET_ACCESS_KEY"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Autenticação bem-sucedida"
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "message": "Credenciais inválidas",
  "error": "Mensagem de erro detalhada"
}
```

### Buckets

#### Listar Buckets

```
GET /buckets
```

Lista todos os buckets disponíveis para as credenciais fornecidas.

**Resposta de Sucesso:**
```json
{
  "success": true,
  "buckets": [
    {
      "Name": "nome-do-bucket",
      "CreationDate": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Criar Bucket

```
POST /create-bucket
```

Cria um novo bucket S3.

**Corpo da Requisição:**
```json
{
  "bucket_name": "nome-do-bucket",
  "region": "us-east-1"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Bucket criado com sucesso"
}
```

### Objetos

#### Listar Objetos

```
GET /objects/:bucket
```

Lista objetos em um bucket específico.

**Parâmetros de URL:**
- `bucket`: Nome do bucket

**Parâmetros de Query:**
- `prefix` (opcional): Prefixo para filtrar objetos

**Resposta de Sucesso:**
```json
{
  "success": true,
  "objects": [
    {
      "Key": "arquivo.txt",
      "LastModified": "2023-01-01T00:00:00.000Z",
      "Size": 1024,
      "ETag": "\"hash-do-arquivo\""
    }
  ],
  "prefixes": [
    {
      "Prefix": "pasta/"
    }
  ]
}
```

#### Download de Objeto

```
GET /download/:bucket/:key
```

Faz download de um objeto específico.

**Parâmetros de URL:**
- `bucket`: Nome do bucket
- `key`: Chave do objeto (caminho completo)

**Parâmetros de Query (alternativos aos headers):**
- `access_token`: Access Key ID
- `secret_token`: Secret Access Key

**Resposta:**
Stream do arquivo para download.

#### Upload de Arquivos

```
POST /upload/:bucket
```

Faz upload de arquivos para um bucket específico.

**Parâmetros de URL:**
- `bucket`: Nome do bucket

**Corpo da Requisição:**
- `files`: Arquivos para upload (multipart/form-data)
- `prefix` (opcional): Prefixo (pasta) para os arquivos

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "2 arquivo(s) enviado(s) com sucesso"
}
```

## Códigos de Status

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Parâmetros inválidos ou ausentes
- `401 Unauthorized`: Credenciais inválidas
- `500 Internal Server Error`: Erro no servidor