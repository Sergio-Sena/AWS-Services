# Plano de Deploy Serverless na AWS com OAC e Domínio Personalizado

## Fase 1: Preparação do Projeto

### Passo 1: Versionar o Projeto
- Inicializar repositório Git: `git init`
- Criar arquivo `.gitignore` para excluir arquivos desnecessários
- Adicionar e commitar arquivos: `git add .` e `git commit -m "Versão inicial"`
- Criar repositório no GitHub e conectar o repositório local

### Passo 2: Criar Usuário IAM para Deploy
- Acessar o Console AWS > IAM > Usuários > "Adicionar usuário"
- Nome: `deploy-user`
- Tipo de acesso: "Acesso programático"
- Criar política personalizada com permissões para S3 e CloudFront
- Anexar política ao usuário
- Salvar as credenciais geradas

### Passo 3: Configurar Perfil AWS Local
- Adicionar perfil ao arquivo `~/.aws/credentials`:
```ini
[deploy-user]
aws_access_key_id = CHAVE_DE_ACESSO_DEPLOY
aws_secret_access_key = CHAVE_SECRETA_DEPLOY
```

## Fase 2: Configuração da Infraestrutura AWS

### Passo 4: Criar Bucket S3
- Usar perfil deploy-user: `export AWS_PROFILE=deploy-user`
- Criar bucket: `aws s3 mb s3://portfolio-sergio-sena`
- **Importante**: NÃO configurar para hospedagem estática pública
- Manter o bucket privado (sem política de bucket pública)

### Passo 5: Configurar Domínio no Route 53
- Acessar o console do Route 53
- Se o domínio já estiver registrado em outro lugar:
  - Criar zona hospedada para seu domínio (ex: `sergiosena.com.br`)
  - Copiar os nameservers fornecidos pelo Route 53
  - Atualizar os nameservers no registrador atual do domínio
- Se for registrar um novo domínio:
  - Usar o serviço de registro de domínios do Route 53
  - Seguir o processo de registro e aguardar a ativação

### Passo 6: Solicitar Certificado SSL
- Acessar AWS Certificate Manager (região us-east-1)
- Solicitar certificado público para:
  - Domínio principal: `sergiosena.com.br`
  - Subdomínio (opcional): `www.sergiosena.com.br`
- Escolher validação por DNS
- Criar os registros de validação automaticamente no Route 53
- Aguardar a validação do certificado (pode levar alguns minutos)

### Passo 7: Configurar CloudFront com OAC
- Criar Origin Access Control (OAC) no CloudFront:
  - Console CloudFront > Origin access > Create control setting
  - Nome: `s3-portfolio-oac`
  - Tipo de origem: S3
  - Configuração de assinatura: "Sign requests"
- Criar distribuição CloudFront:
  - Origem: bucket S3
  - Configuração de acesso à origem: selecionar o OAC criado
  - Comportamentos: redirecionar HTTP para HTTPS
  - Nomes de domínio alternativos: `sergiosena.com.br` e `www.sergiosena.com.br`
  - Certificado SSL: selecionar o certificado criado
  - Preço: usar classe de preço mais econômica
  - Configurações de cache: otimizar para conteúdo estático
- Atualizar política de bucket S3 (CloudFront cria automaticamente ou usar modelo abaixo):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::portfolio-sergio-sena/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### Passo 8: Configurar Registros DNS para o Domínio
- Acessar o console do Route 53 > Zonas hospedadas > Seu domínio
- Criar registro A para o domínio raiz:
  - Nome: deixar em branco (domínio raiz)
  - Tipo: A
  - Alias: Sim
  - Destino: Selecionar distribuição CloudFront
- Criar registro A para o subdomínio www (opcional):
  - Nome: www
  - Tipo: A
  - Alias: Sim
  - Destino: Selecionar distribuição CloudFront

## Fase 3: Automação do Deploy

### Passo 9: Criar Script de Deploy Local
- Criar arquivo `deploy.sh`:
```bash
#!/bin/bash
export AWS_PROFILE=deploy-user

echo "Sincronizando arquivos com S3..."
aws s3 sync ./public/ s3://portfolio-sergio-sena --delete
aws s3 sync ./src/ s3://portfolio-sergio-sena/src --delete

echo "Invalidando cache do CloudFront..."
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"

echo "Deploy concluído!"
```
- Tornar executável: `chmod +x deploy.sh`

### Passo 10: Configurar GitHub Actions
- Criar diretório `.github/workflows`
- Criar arquivo `deploy.yml`:
```yaml
name: Deploy Website

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync ./public/ s3://portfolio-sergio-sena --delete
          aws s3 sync ./src/ s3://portfolio-sergio-sena/src --delete
      
      - name: Invalidate CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

- Adicionar secrets no GitHub:
  - AWS_ACCESS_KEY_ID (do deploy-user)
  - AWS_SECRET_ACCESS_KEY (do deploy-user)
  - CLOUDFRONT_DISTRIBUTION_ID

## Fase 4: Teste e Validação

### Passo 11: Testar Deploy Manual
- Executar script de deploy local: `./deploy.sh`
- Verificar se o site está acessível via:
  - URL do CloudFront
  - Domínio personalizado: `https://sergiosena.com.br`
  - Subdomínio www: `https://www.sergiosena.com.br`

### Passo 12: Testar Deploy Automatizado
- Fazer uma pequena alteração no site
- Commitar e enviar para o GitHub
- Verificar se o GitHub Actions executa o workflow
- Confirmar que as alterações aparecem no site

## Fase 5: Monitoramento e Otimização

### Passo 13: Configurar Monitoramento Básico
- Habilitar logs de acesso do CloudFront
- Configurar alertas básicos no CloudWatch
- Configurar monitoramento de disponibilidade do domínio

### Passo 14: Otimizar Performance
- Verificar pontuação no PageSpeed Insights
- Ajustar configurações de cache do CloudFront
- Otimizar imagens e outros recursos estáticos
- Configurar compressão para arquivos CSS, JS e HTML

## Vantagens desta Arquitetura
- **Segurança aprimorada**: bucket S3 privado com acesso apenas via CloudFront
- **Domínio personalizado profissional**: uso do seu próprio domínio com SSL
- **Alta disponibilidade**: distribuição global via CloudFront
- **Baixo custo**: arquitetura serverless com pagamento apenas pelo uso
- **Escalabilidade automática**: sem preocupações com capacidade de servidores
- **Automação completa**: deploy automatizado a cada push para o GitHub
- **SEO otimizado**: URLs limpas e certificado SSL para melhor ranqueamento