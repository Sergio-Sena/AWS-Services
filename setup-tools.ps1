# Setup Tools - Terraform + kubectl
# Execute como Administrador

Write-Host "=== Atualizando Terraform ===" -ForegroundColor Cyan
choco upgrade terraform -y

Write-Host "`n=== Instalando kubectl ===" -ForegroundColor Cyan
choco install kubernetes-cli -y

Write-Host "`n=== Verificando instalações ===" -ForegroundColor Green
terraform --version
kubectl version --client

Write-Host "`n=== Concluído! ===" -ForegroundColor Green
Write-Host "Feche e reabra o terminal para aplicar as mudanças." -ForegroundColor Yellow
