# Documentação do Projeto de Portfólio

## Estrutura do Projeto

O projeto foi reorganizado seguindo boas práticas de desenvolvimento web, com a seguinte estrutura:

```
/
├── public/                 # Arquivos HTML e recursos públicos
│   ├── index.html          # Página principal
│   ├── certificates.html   # Página de certificados
│   └── project-details.html # Página de detalhes dos projetos
│
├── src/                    # Código fonte principal
│   ├── assets/             # Recursos estáticos
│   │   ├── images/         # Imagens
│   │   ├── icons/          # Ícones
│   │   ├── fonts/          # Fontes (se houver)
│   │   └── portfolio/      # Projetos de portfólio
│   │
│   ├── css/                # Estilos CSS
│   │   ├── components/     # Estilos de componentes específicos
│   │   ├── pages/          # Estilos específicos de páginas
│   │   ├── vendor/         # CSS de terceiros (como Tailwind)
│   │   └── style.css       # Arquivo CSS principal
│   │
│   ├── js/                 # Scripts JavaScript
│   │   ├── components/     # Scripts de componentes específicos
│   │   ├── utils/          # Funções utilitárias
│   │   ├── pages/          # Scripts específicos de páginas
│   │   ├── vendor/         # Scripts de terceiros
│   │   └── main.js         # Script principal
│   │
│   └── data/               # Dados estáticos (como projetos, certificados)
│       ├── projects.js     # Dados dos projetos
│       └── certificates.js # Dados dos certificados
│
└── docs/                   # Documentação do projeto
    └── ESTRUTURA.md        # Este arquivo
```

## Como Reverter para a Estrutura Anterior

Se for necessário reverter para a estrutura anterior, siga estes passos:

1. Remova as pastas `public`, `src` e `docs`
2. Restaure os arquivos da pasta `backup-estrutura-atual-*`

## Arquivos Principais

### HTML

- `public/index.html`: Página principal do site
- `public/certificates.html`: Página de certificados
- `public/project-details.html`: Página de detalhes dos projetos

### CSS

- `src/css/style.css`: Estilos principais
- `src/css/components/portfolio-compat.css`: Estilos de compatibilidade para projetos de portfólio
- `src/css/components/credly-badge.css`: Estilos para badges do Credly

### JavaScript

- `src/js/main.js`: Script principal
- `src/js/components/contact.js`: Script para o formulário de contato
- `src/js/pages/certificates.js`: Script para a página de certificados
- `src/js/pages/project-details.js`: Script para a página de detalhes do projeto
- `src/js/utils/portfolio-compat.js`: Script de compatibilidade para projetos de portfólio
- `src/js/utils/iframe-compat.js`: Script de compatibilidade para iframes

### Dados

- `src/data/projects.js`: Dados dos projetos
- `src/data/certificates.js`: Dados dos certificados

## Melhorias Implementadas

1. **Separação de Responsabilidades**: Código, estilos e dados estão agora separados em diretórios específicos
2. **Centralização de Dados**: Dados dos projetos e certificados estão centralizados em arquivos específicos
3. **Organização de Componentes**: Scripts e estilos de componentes específicos estão em diretórios dedicados
4. **Documentação**: Adição de documentação para facilitar a manutenção do projeto