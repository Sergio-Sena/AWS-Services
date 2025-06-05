@echo off
echo Corrigindo histórico do Git para remover credenciais...

REM Criar um novo branch temporário
git checkout --orphan temp_branch

REM Adicionar todos os arquivos atuais
git add .

REM Fazer um commit inicial limpo
git commit -m "Versão inicial limpa"

REM Deletar o branch main
git branch -D main

REM Renomear o branch temporário para main
git branch -m main

REM Forçar o push para o repositório remoto
echo.
echo Para enviar as alterações para o GitHub, execute:
echo git push -f origin main
echo.
echo ATENÇÃO: Isso vai sobrescrever o histórico do repositório remoto!
echo Certifique-se de que todos os colaboradores estão cientes desta mudança.