# Infraestrutura AWS - Portfolio Sergio Sena

## Arquitetura Atual

### CDNs CloudFront
- **Portfolio**: E2O2ZMEA7SGXZ4
  - URL: https://dev-cloud.sstechnologies-cloud.com
  - CloudFront: https://d1isdj4wtq7ler.cloudfront.net
  - Bucket: portfolio-sergio-sena

- **Ritech**: EL2N09H69L9HV
  - URL: https://ritech-fechaduras-digitais.sstechnologies-cloud.com
  - CloudFront: https://d1i0zo3aiwb0ms.cloudfront.net
  - Bucket: ritech-fechaduras-site

### Configurações S3
- **Região**: us-east-1
- **OAC**: Configurado para acesso exclusivo via CloudFront
- **Versionamento**: Habilitado
- **Criptografia**: AES256

### DNS (Route 53)
- **Zona**: Z07937031ROGP6XAEMPWJ
- **Domínio**: sstechnologies-cloud.com
- **Certificado SSL**: arn:aws:acm:us-east-1:969430605054:certificate/aead7baa-e56f-411b-8e35-01577ed2738b

### Segurança
- Buckets S3 privados com OAC
- HTTPS obrigatório
- Certificado SSL wildcard
- Acesso público bloqueado nos buckets

## Custos Estimados
- CloudFront: ~$5-10/mês
- S3: ~$1-3/mês
- Route 53: ~$0.50/mês
- **Total**: ~$6.50-13.50/mês