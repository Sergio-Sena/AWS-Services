# 🔧 SCRIPT POWERSHELL PARA CORRIGIR S3 + OAC + CLOUDFRONT
# Resolve problemas de acesso negado configurando OAC corretamente

# Variáveis
$BUCKET_NAME = "portfolio-sergio-sena"
$REGION = "us-east-1"
$DISTRIBUTION_ID = "EKF35P9NYEDBS"
$ACCOUNT_ID = "969430605054"

Write-Host "🔧 Corrigindo configuração S3 + OAC..." -ForegroundColor Green

# PASSO 1: Remover política pública do bucket
Write-Host "🔒 Removendo acesso público do bucket..." -ForegroundColor Yellow
try {
    aws s3api delete-bucket-policy --bucket $BUCKET_NAME
} catch {
    Write-Host "Política já removida ou não existe" -ForegroundColor Gray
}

# PASSO 2: Bloquear acesso público
Write-Host "🚫 Bloqueando acesso público..." -ForegroundColor Yellow
aws s3api put-public-access-block `
  --bucket $BUCKET_NAME `
  --public-access-block-configuration `
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# PASSO 3: Criar política para OAC
Write-Host "📝 Criando política para OAC..." -ForegroundColor Yellow
$oacPolicy = @'
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
      "Resource": "arn:aws:s3:::BUCKET_NAME_PLACEHOLDER/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID_PLACEHOLDER:distribution/DISTRIBUTION_ID_PLACEHOLDER"
        }
      }
    }
  ]
}
'@

$oacPolicy = $oacPolicy.Replace("BUCKET_NAME_PLACEHOLDER", $BUCKET_NAME)
$oacPolicy = $oacPolicy.Replace("ACCOUNT_ID_PLACEHOLDER", $ACCOUNT_ID)
$oacPolicy = $oacPolicy.Replace("DISTRIBUTION_ID_PLACEHOLDER", $DISTRIBUTION_ID)
$oacPolicy | Out-File -FilePath "oac-bucket-policy.json" -Encoding UTF8

# PASSO 4: Aplicar política OAC
Write-Host "🔐 Aplicando política OAC ao bucket..." -ForegroundColor Yellow
aws s3api put-bucket-policy `
  --bucket $BUCKET_NAME `
  --policy file://oac-bucket-policy.json

# PASSO 5: Verificar configuração do CloudFront
Write-Host "☁️ Verificando configuração do CloudFront..." -ForegroundColor Yellow
$oacId = aws cloudfront get-distribution --id $DISTRIBUTION_ID `
  --query 'Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId' `
  --output text

Write-Host "OAC ID configurado: $oacId" -ForegroundColor Cyan

# PASSO 6: Invalidar cache do CloudFront
Write-Host "🔄 Invalidando cache do CloudFront..." -ForegroundColor Yellow
aws cloudfront create-invalidation `
  --distribution-id $DISTRIBUTION_ID `
  --paths "/*"

Write-Host "✅ Configuração OAC corrigida!" -ForegroundColor Green
Write-Host "📋 Verificações realizadas:" -ForegroundColor White
Write-Host "   ✓ Acesso público removido do S3" -ForegroundColor Green
Write-Host "   ✓ Política OAC aplicada" -ForegroundColor Green
Write-Host "   ✓ Cache invalidado" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Teste o acesso em: https://dev-cloud.sstechnologies-cloud.com" -ForegroundColor Cyan

# Cleanup
Remove-Item "oac-bucket-policy.json" -ErrorAction SilentlyContinue

Write-Host "⏰ Aguarde 5-10 minutos para propagação completa" -ForegroundColor Yellow