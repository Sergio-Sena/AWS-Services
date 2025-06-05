# Manual do Usuário - S3 Explorer

## Introdução

O S3 Explorer é uma aplicação web que permite gerenciar buckets e objetos no Amazon S3 de forma simples e intuitiva. Este manual explica como usar as principais funcionalidades da aplicação.

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Credenciais AWS com permissões para S3

## Primeiros Passos

### Login

1. Abra a aplicação no navegador
2. Insira suas credenciais AWS:
   - Access Key ID
   - Secret Access Key
3. Clique em "Sign In"

**Nota de Segurança**: Suas credenciais são armazenadas apenas localmente no navegador e não são enviadas para nenhum servidor além da AWS.

## Navegação

### Visualização de Buckets

Após o login, você verá uma lista de buckets S3 no painel lateral esquerdo. Clique em um bucket para visualizar seu conteúdo.

### Navegação por Pastas

- Clique em uma pasta para navegar para dentro dela
- Use a navegação de breadcrumbs no topo para voltar a pastas anteriores
- Clique em "Raiz" para voltar ao nível principal do bucket

### Filtrar Conteúdo

Use o campo de filtro para buscar objetos por prefixo (caminho parcial). Digite o prefixo e pressione Enter para filtrar.

## Operações com Buckets

### Criar um Novo Bucket

1. Clique no botão "Criar Novo Bucket" no painel lateral
2. Insira um nome para o bucket
   - O nome deve ser único globalmente
   - Use apenas letras minúsculas, números, pontos e hífens
   - O nome deve ter entre 3 e 63 caracteres
3. Selecione a região onde o bucket será criado
4. Clique em "Criar Bucket"

## Operações com Arquivos

### Upload de Arquivos

1. Selecione um bucket na lista
2. Clique no botão "Enviar Arquivos"
3. Selecione os arquivos que deseja enviar
4. Opcionalmente, especifique uma pasta de destino
5. Clique em "Enviar"

### Download de Arquivos

#### Download de Arquivos Individuais

1. Selecione os arquivos que deseja baixar marcando as caixas de seleção
2. Clique no botão "Download Selecionados"

#### Download de Todo o Bucket

1. Clique no botão "Download Todo o Bucket"
2. Confirme a operação

## Solução de Problemas

### Erro ao Carregar Buckets

- Verifique se suas credenciais AWS estão corretas
- Verifique se suas credenciais têm permissões para listar buckets S3

### Erro ao Criar Bucket

- Verifique se o nome do bucket segue as regras de nomenclatura da AWS
- Verifique se o nome do bucket não está em uso por outro usuário da AWS

### Erro ao Fazer Upload

- Verifique se o arquivo não excede o tamanho máximo permitido
- Verifique se você tem permissões para escrever no bucket

## Segurança

- Faça logout quando terminar de usar a aplicação
- Não compartilhe suas credenciais AWS
- Use credenciais com permissões mínimas necessárias