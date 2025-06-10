# AWS S3 Explorer

![AWS S3 Explorer](https://img.shields.io/badge/AWS-S3%20Explorer-blue?style=for-the-badge&logo=amazon-aws)

Uma aplicação moderna e intuitiva para explorar e gerenciar buckets e objetos do Amazon S3, com interface neon inspirada em temas cyberpunk. Oferece uma experiência visual atraente enquanto fornece funcionalidades completas para gerenciamento de armazenamento em nuvem.

## ✨ Funcionalidades

- **Autenticação segura** com credenciais AWS (Access Key e Secret Key)
- **Navegação intuitiva** entre buckets e pastas com interface moderna
- **Visualização detalhada** de estatísticas de armazenamento e uso
- **Download de arquivos e pastas** (pastas são baixadas como arquivos ZIP)
- **Upload de arquivos** para qualquer bucket ou pasta
- **Gerenciamento completo** de buckets e objetos (criar, deletar, navegar)
- **Modo offline** para demonstração sem credenciais AWS
- **Interface responsiva** adaptada para dispositivos móveis e desktop

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **AWS SDK** - SDK oficial da Amazon para interação com serviços AWS
- **Archiver** - Biblioteca para criação de arquivos ZIP
- **CORS** - Middleware para habilitar requisições cross-origin
- **Multer** - Middleware para upload de arquivos

### Frontend
- **Next.js** - Framework React com renderização do lado do servidor
- **React** - Biblioteca JavaScript para construção de interfaces
- **TailwindCSS** - Framework CSS utilitário para design responsivo
- **FontAwesome** - Biblioteca de ícones vetoriais
- **Context API** - Gerenciamento de estado global da aplicação
- **Fetch API** - Para comunicação com o backend

## 🏗️ Estrutura do Projeto

- `backend/`: API Node.js/Express para interagir com a AWS S3
- `frontend-next/`: Interface web moderna usando Next.js e TailwindCSS

## 🚀 Como Executar

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

## 🔄 Conexão entre Frontend e Backend

O frontend se conecta ao backend através da API REST. Certifique-se de que:

1. O backend esteja em execução na porta 8000
2. As configurações CORS no backend permitam requisições do frontend
3. A URL da API no frontend está configurada em `.env.local` como `NEXT_PUBLIC_API_URL=http://localhost:8000`

## 📊 Recursos Visuais

- **Tema Neon** - Interface moderna com efeitos de brilho e cores vibrantes
- **Animações suaves** - Transições e efeitos para melhor experiência do usuário
- **Visualização detalhada** - Estatísticas e gráficos para análise de armazenamento
- **Modos de visualização** - Opções de lista e grade para visualização de arquivos

## 🔒 Segurança

- As credenciais AWS são armazenadas apenas na sessão do navegador
- Comunicação segura entre frontend e backend
- Validação de credenciais antes de qualquer operação

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ usando tecnologias modernas para gerenciamento eficiente de armazenamento em nuvem.