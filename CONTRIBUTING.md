# Guia de Contribuição

Obrigado por considerar contribuir para o S3 Explorer! Este documento fornece diretrizes para contribuir com o projeto.

## Fluxo de Trabalho

1. Faça um fork do repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/automacao-s3.git`
3. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
4. Faça suas alterações
5. Commit suas alterações: `git commit -m 'Adiciona nova funcionalidade'`
6. Push para a branch: `git push origin feature/nova-funcionalidade`
7. Abra um Pull Request

## Padrões de Código

### JavaScript

- Use camelCase para variáveis e funções
- Use PascalCase para classes
- Use const para valores que não serão reatribuídos
- Use let para variáveis que serão reatribuídas
- Evite usar var

### HTML/CSS

- Use classes semânticas
- Siga as convenções do Tailwind CSS
- Mantenha a acessibilidade em mente

## Testes

- Teste suas alterações antes de enviar um Pull Request
- Verifique se todas as funcionalidades existentes continuam funcionando

## Documentação

- Atualize a documentação quando necessário
- Adicione comentários ao código para explicar partes complexas
- Use JSDoc para documentar funções e métodos

## Segurança

- Nunca comite credenciais ou segredos
- Siga as melhores práticas de segurança
- Reporte vulnerabilidades de segurança conforme descrito em SECURITY.md