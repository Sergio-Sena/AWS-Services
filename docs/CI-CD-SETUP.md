# Configuração CI/CD - GitHub Actions

## GitHub Secrets Necessários

Configure os seguintes secrets no GitHub:

1. **AWS_ACCESS_KEY_ID**: Chave de acesso do usuário deploy-user
2. **AWS_SECRET_ACCESS_KEY**: Chave secreta do usuário deploy-user

### Como configurar:
1. Vá para Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret

## IAM User AWS

Usuário: **deploy-user** (já configurado com as seguintes permissões):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::portfolio-sergio-sena",
                "arn:aws:s3:::portfolio-sergio-sena/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "arn:aws:cloudfront::969430605054:distribution/E2O2ZMEA7SGXZ4"
        }
    ]
}
```

## Fluxo de Deploy

1. **Push para main** → Deploy automático
2. **Outras branches** → Apenas GitHub (sem deploy)

## Recursos Utilizados

- **S3 Bucket**: portfolio-sergio-sena
- **CloudFront**: E2O2ZMEA7SGXZ4
- **URL**: https://dev-cloud.sstechnologies-cloud.com

## Proteção de Branch

Configure proteção na branch main:
1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. ✅ Require pull request reviews
4. ✅ Require status checks to pass