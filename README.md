# S3 Explorer

Uma aplicação web para gerenciar buckets e objetos no Amazon S3.

## Visão Geral

O S3 Explorer permite aos usuários:
- Autenticar com credenciais AWS
- Listar e criar buckets S3
- Navegar por objetos e "pastas" dentro dos buckets
- Fazer upload de arquivos para buckets
- Fazer download de objetos individuais ou em lote

## Estrutura do Projeto

```
Automação S3/
├── backend/       # Servidor Node.js/Express
├── frontend/      # Interface web HTML/CSS/JS
├── docs/          # Documentação
├── CHANGELOG.md   # Registro de alterações
├── LICENSE        # Licença do projeto
├── README.md      # Este arquivo
└── SECURITY.md    # Políticas de segurança
```

## Requisitos

- Node.js 14.x ou superior
- Navegador web moderno
- Credenciais AWS com permissões para S3

## Instalação

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure suas variáveis de ambiente no arquivo .env
npm start
```

### Frontend

O frontend é estático e não requer instalação. Basta abrir o arquivo `frontend/index.html` em um navegador ou servir os arquivos com um servidor web.

## Uso

1. Abra a aplicação no navegador
2. Faça login com suas credenciais AWS
3. Navegue pelos buckets e objetos
4. Use os botões para criar buckets, fazer upload e download de arquivos

## Documentação

- [Manual do Usuário](docs/MANUAL.md)
- [Documentação da API](docs/API.md)
- [Guia de Desenvolvimento](docs/DESENVOLVIMENTO.md)
- [Documentação do Backend](backend/README.md)
- [Documentação do Frontend](frontend/README.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Políticas de Segurança](SECURITY.md)

## Funcionalidades

- **Autenticação**: Login seguro com credenciais AWS
- **Gerenciamento de Buckets**: Listar e criar buckets S3
- **Navegação de Objetos**: Explorar objetos e "pastas" dentro dos buckets
- **Upload de Arquivos**: Enviar arquivos para buckets S3
- **Download de Objetos**: Baixar objetos individuais ou em lote

## Segurança

- As credenciais AWS são armazenadas apenas localmente no navegador
- As credenciais são enviadas apenas para a AWS, nunca para servidores de terceiros
- Recomendamos usar credenciais com permissões mínimas necessárias

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).