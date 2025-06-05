# Política de Segurança

## Credenciais AWS

Este projeto interage com serviços AWS e requer credenciais para funcionar. Siga estas diretrizes para manter suas credenciais seguras:

1. **Nunca comite credenciais AWS** diretamente no código-fonte
2. **Use variáveis de ambiente** para armazenar credenciais
3. **Crie um arquivo `.env`** baseado no `.env.example` para armazenar suas credenciais localmente
4. **Verifique se `.env` está no `.gitignore`** para evitar que seja commitado acidentalmente

## Boas Práticas

- Use credenciais com permissões mínimas necessárias (princípio do menor privilégio)
- Considere usar IAM Roles quando possível em vez de chaves de acesso
- Rotacione suas chaves de acesso regularmente
- Monitore o uso de suas credenciais através do CloudTrail

## Relatando Problemas de Segurança

Se você descobrir uma vulnerabilidade de segurança neste projeto, por favor, reporte-a através de um dos seguintes canais:

- Abra uma issue no GitHub marcada como "Segurança"
- Entre em contato diretamente com os mantenedores do projeto

## Proteção de Push do GitHub

Este repositório tem a proteção de push do GitHub ativada, que detecta automaticamente credenciais e outros segredos nos commits. Se você receber um erro ao tentar fazer push, siga estas etapas:

1. Remova as credenciais dos arquivos
2. Faça um novo commit com as correções
3. Tente fazer o push novamente

Se você acredita que é um falso positivo, você pode usar o link fornecido pelo GitHub para revisar e permitir o segredo, mas isso é geralmente desencorajado.