# Guia de Desenvolvimento - S3 Explorer

Este documento fornece informações para desenvolvedores que desejam contribuir ou modificar o S3 Explorer.

## Estrutura do Projeto

```
Automação S3/
├── backend/       # Servidor Node.js/Express
├── frontend/      # Interface web HTML/CSS/JS
├── docs/          # Documentação
```

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- AWS SDK para JavaScript
- Multer (para upload de arquivos)

### Frontend
- HTML5
- CSS3 (com Tailwind CSS)
- JavaScript (Vanilla)
- Font Awesome (para ícones)

## Configuração do Ambiente de Desenvolvimento

### Backend

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

3. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

### Frontend

O frontend é estático e não requer compilação. Você pode abrir os arquivos HTML diretamente no navegador ou usar um servidor web simples:

```bash
# Usando o servidor http do Python
cd frontend
python -m http.server 8080
```

## Fluxo de Dados

1. **Autenticação**:
   - O usuário fornece credenciais AWS
   - O frontend envia as credenciais para o backend verificar
   - Se válidas, as credenciais são armazenadas no localStorage

2. **Listagem de Buckets**:
   - O frontend solicita a lista de buckets ao backend
   - O backend usa as credenciais para listar buckets via AWS SDK
   - O frontend renderiza a lista de buckets

3. **Listagem de Objetos**:
   - Quando um bucket é selecionado, o frontend solicita seus objetos
   - O backend lista os objetos do bucket via AWS SDK
   - O frontend renderiza a lista de objetos

4. **Upload de Arquivos**:
   - O usuário seleciona arquivos para upload
   - O frontend envia os arquivos para o backend
   - O backend faz upload para o S3 via AWS SDK
   - O frontend atualiza a lista de objetos

5. **Download de Objetos**:
   - O usuário seleciona objetos para download
   - O frontend solicita o download ao backend
   - O backend cria um stream do S3 para o cliente

## Convenções de Código

### JavaScript

- Use camelCase para variáveis e funções
- Use const para valores que não serão reatribuídos
- Use let para variáveis que serão reatribuídas
- Evite usar var

### HTML/CSS

- Use classes semânticas
- Siga as convenções do Tailwind CSS

## Testes

Atualmente, o projeto não possui testes automatizados. Contribuições para adicionar testes são bem-vindas.

## Funcionalidades Futuras

- Deletar objetos
- Deletar buckets
- Configurar permissões de bucket
- Visualizar propriedades de objetos
- Suporte a versionamento de objetos

## Problemas Conhecidos

- O download de múltiplos arquivos grandes pode sobrecarregar o navegador
- Não há suporte para upload de arquivos maiores que 100MB
- A navegação por pastas com muitos objetos pode ser lenta