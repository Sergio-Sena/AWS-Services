# AWS S3 Explorer - Frontend

Interface de usuário para explorar e gerenciar buckets e objetos do Amazon S3.

## Estrutura de Arquivos

- `index.html`: Página de login com autenticação AWS
- `dashboard.html`: Dashboard principal para exploração de buckets e objetos
- `dashboard.js`: Lógica do dashboard e interação com a API
- `styles.css`: Estilos da aplicação com efeitos visuais modernos

## Como Usar

1. Certifique-se de que o servidor backend está rodando na porta 8000
2. Abra o arquivo `index.html` em um navegador web moderno
3. Faça login com suas credenciais AWS (Access Key ID e Secret Access Key)
4. No dashboard:
   - Navegue pelos seus buckets S3 no painel lateral esquerdo
   - Clique em um bucket para ver seu conteúdo
   - Navegue pelas pastas clicando nelas
   - Use a navegação de breadcrumbs para voltar a níveis anteriores
   - Filtre objetos digitando um prefixo e pressionando Enter
   - Selecione arquivos para download usando as caixas de seleção
   - Use os botões de download para baixar arquivos selecionados ou todo o bucket
   - Clique em "Logout" para sair e limpar suas credenciais

## Funcionalidades

- ✅ Login com credenciais AWS
- ✅ Listagem de buckets S3
- ✅ Navegação por pastas dentro de buckets
- ✅ Filtro de objetos por prefixo
- ✅ Seleção múltipla de arquivos
- ✅ Download de arquivos individuais
- ✅ Download de múltiplos arquivos selecionados
- ✅ Download de todos os arquivos visíveis
- ✅ Logout seguro

## Segurança

- As credenciais AWS são armazenadas apenas no localStorage do navegador
- As credenciais são removidas ao fazer logout ou fechar a sessão
- Nenhuma credencial é persistida no servidor
- Todas as operações são realizadas através da API backend

## Requisitos Técnicos

- Navegador web moderno com suporte a JavaScript ES6+
- Servidor backend rodando na porta 8000
- Conexão com a internet para acessar os serviços AWS