# Constituição do Prototype Project

## Core Principles

### I. Código Simples e Legível

O código MUST ser fácil de ler e entender por uma pessoa iniciante.

- A solução mais simples que atende à spec MUST ser escolhida; padrões avançados, abstrações
  genéricas e "otimizações para o futuro" MUST NOT ser usados sem justificativa no `plan.md`.
- Nomes de variáveis, funções e arquivos MUST descrever o que fazem (ex.: `calcularTotal`,
  não `ct`).
- Funções SHOULD ter uma única responsabilidade e caber em uma tela (cerca de 30 linhas).
- Comentários SHOULD explicar o *porquê* de trechos não óbvios, não repetir o que o código faz.
- Bibliotecas e ferramentas além das que fazem parte da stack escolhida MUST NOT ser
  adicionadas sem justificativa no `plan.md`.

**Rationale**: O projeto é de aprendizado; código simples pode ser entendido, corrigido e
modificado sem depender de conhecimento avançado.

### II. Apps Isolados

Cada um dos aplicativos MUST viver em sua própria pasta `apps/<nome-do-app>/`.

- O nome da pasta MUST usar letras minúsculas e hífens (ex.: `apps/lista-de-tarefas/`).
- Todo o código, estilos, imagens e testes de um app MUST ficar dentro da pasta dele.
- Um app MUST NOT importar ou referenciar arquivos de outro app.
- Recursos usados por mais de um app (ex.: estilos comuns) MAY ficar em `shared/`; apps
  MAY usar `shared/`, mas `shared/` MUST NOT depender de nenhum app.
- Cada app MUST funcionar sozinho: apagar a pasta de um app MUST NOT quebrar os outros.

**Rationale**: O isolamento permite trabalhar, testar e descartar cada protótipo sem efeitos
colaterais nos demais.

### III. Testes Mínimos

Cada app MUST ter testes apenas do essencial: o fluxo principal e a lógica importante.

- Cada app MUST ter pelo menos uma verificação do seu fluxo principal — um teste automatizado
  simples ou uma lista de passos manuais na seção "Como testar" do README.
- Funções com regras de negócio (cálculos, validações, transformações de dados) SHOULD ter
  um teste automatizado pequeno.
- Não há meta de cobertura de testes; ferramentas de teste complexas MUST NOT ser adicionadas
  sem justificativa no `plan.md`.
- Antes de cada commit, o fluxo principal do app alterado MUST ser verificado e o console do
  navegador MUST estar sem erros.

**Rationale**: Protótipos mudam rápido; poucos testes focados dão segurança sem se tornarem
um peso de manutenção.

### IV. Interface Consistente

Os apps MUST parecer parte da mesma família visual.

- Cores, fontes, espaçamentos e estilos de botões e campos MUST vir de um tema comum em
  `shared/`, em vez de valores soltos em cada app.
- Elementos com a mesma função (botões principais, mensagens de erro, títulos) MUST ter a
  mesma aparência e o mesmo comportamento em todos os apps.
- Cada tela MUST ter um título claro e MUST ser usável em celular (a partir de 320px de
  largura).
- Imagens não decorativas MUST ter texto `alt`, e elementos interativos MUST funcionar pelo
  teclado.

**Rationale**: Uma base visual comum evita retrabalho e faz os protótipos parecerem
profissionais com pouco esforço.

### V. Documentação Curta

Cada app MUST ter um `README.md` curto em `apps/<nome-do-app>/README.md`.

- O README MUST conter apenas: o que o app faz (1–3 frases), como abrir ou rodar, e como
  testar.
- O README SHOULD caber em uma tela; detalhes de design ficam em `specs/`, não no README.
- O README MUST ser atualizado no mesmo commit que mudar a forma de abrir, rodar ou testar
  o app.
- O `README.md` na raiz SHOULD listar os apps com um link para a pasta de cada um.

**Rationale**: Documentação curta é lida e mantida; documentação longa fica desatualizada.

## Estrutura do Monorepo

- **Pastas**: `apps/` (um subdiretório por app), `shared/` (recursos comuns, como estilos),
  `specs/` (artefatos do Spec Kit) e `.specify/` (configuração do Spec Kit).
- **Raiz**: MAY conter uma página simples (ex.: o `index.html` atual) que lista e linka os
  apps; MUST NOT conter código de nenhum app.
- **Stack**: Ainda não definida. A linguagem e o framework MUST ser escolhidos no primeiro
  `/speckit-plan`, com justificativa, priorizando o que for mais simples para iniciante.
  Todos os apps SHOULD usar a mesma stack; uma stack diferente para um app MUST ser
  justificada no `plan.md` desse app. Após a escolha, esta seção SHOULD ser atualizada via
  `/speckit-constitution`.
- **Dependências externas**: MUST ter versão exata fixada e ser justificadas no `plan.md`.
- **Codificação**: Todos os arquivos MUST ser salvos em UTF-8.
- **Idioma**: O conteúdo visível ao usuário é em português (`lang="pt"`), salvo indicação
  na spec.
- **Segredos**: Senhas, chaves de API e dados pessoais MUST NOT ser commitados.

## Fluxo de Trabalho

- Cada funcionalidade MUST seguir o fluxo do Spec Kit: `/speckit-specify` →
  (`/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Cada spec MUST indicar a qual app pertence (ou `shared/`).
- Cada `plan.md` MUST incluir a verificação da constituição (Constitution Check); qualquer
  exceção MUST ser registrada com justificativa na seção Complexity Tracking.
- Commits MUST ser pequenos, tratar de um só assunto e usar prefixos de Conventional Commits
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`).
- A branch `main` MUST continuar funcionando: todos os apps abrem sem erros no console.

## Governance

Esta constituição tem prioridade sobre qualquer outra prática do projeto. Em caso de
conflito com um plano ou tarefa, vale a constituição, a menos que ela seja alterada.

- **Alterações**: Feitas via `/speckit-constitution`, registradas no Sync Impact Report e
  commitadas com prefixo `docs:`. Specs e planos em andamento MUST ser revistos após uma
  alteração.
- **Versionamento**: Versionamento semântico — MAJOR para remover ou redefinir um princípio,
  MINOR para adicionar um princípio ou seção (ou ampliar bastante uma orientação), PATCH
  para ajustes de texto e esclarecimentos.
- **Conformidade**: Todo `plan.md` MUST passar pela verificação da constituição antes e
  depois do design. Complexidade sem justificativa MUST ser rejeitada.

**Version**: 2.0.0 | **Ratified**: 2026-10-24 | **Last Amended**: 2026-10-24
