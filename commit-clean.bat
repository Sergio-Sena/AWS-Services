@echo off
echo Preparando commit para limpeza do projeto...

REM Adicionar todas as alterações
git add .

REM Fazer o commit
git commit -m "Limpeza do projeto: removidos arquivos de teste e atualizada documentação"

REM Mostrar status
git status

echo.
echo Commit realizado com sucesso!
echo Para enviar as alterações para o GitHub, execute: git push origin main
echo Para enviar a tag v1.0.0, execute: git push origin v1.0.0