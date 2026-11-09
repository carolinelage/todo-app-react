# starTodo — decisões arquiteturais

## Visão geral

O starTodo é uma aplicação web de gerenciamento de tarefas construída com Next.js,
React e TypeScript/JavaScript. A interface usa o App Router e prioriza uma experiência
simples, responsiva e orientada à ação.

## Decisões adotadas

### Next.js App Router

As páginas ficam em `src/app`, com `layout.tsx` como raiz compartilhada. A rota
`/` inicia no login e redireciona para `/auth/login`; o dashboard autenticado fica
em `/dashboard`. A tela de cadastro fica em `/auth/register`.

### Componentes cliente apenas quando necessário

O layout e as páginas permanecem componentes de servidor por padrão. `AuthForm` e os
componentes que controlam estado usam `'use client'` quando precisam de estado,
eventos do navegador ou Firebase Authentication.

### Firebase Authentication

O SDK modular é inicializado em `src/lib/firebase.ts`. As credenciais são lidas de
variáveis `NEXT_PUBLIC_FIREBASE_*` em `.env.local`, com `.env.example` como contrato.
Login e cadastro usam e-mail e senha. Novos usuários recebem um e-mail de verificação
e permanecem na sessão enquanto confirmam o endereço. A rota `/auth/verify-email`
recarrega o usuário e redireciona automaticamente ao dashboard quando a confirmação
é detectada. O dashboard aceita apenas sessões autenticadas com e-mail verificado.
O `AuthGuard` valida a sessão no cliente e o logout encerra a sessão no Firebase.

### Proteção de dados e abuso

As regras em `firestore.rules` negam tudo por padrão e permitem acesso apenas ao
caminho de tarefas cujo `userId` coincide com `request.auth.uid`. O App Check usa
reCAPTCHA Enterprise quando `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` está configurada.
Essas camadas complementam, mas não substituem, as regras do Firebase.

### Identidade visual

O nome oficial é **starTodo** e a logo é `public/logo-startodo.png`. A paleta é:

- `#1C0B19` — fundo e contraste principal
- `#35605A` — superfícies verdes
- `#86626E` — superfícies vinho/malva
- `#A4C3B2` — ação primária e destaque

### Dashboard SaaS inicial

A rota `/dashboard` usa uma estrutura de produto SaaS: sidebar persistente com navegação do
workspace, topbar com status da sessão, resumo de produtividade e painel principal
de tarefas. A ação “Nova tarefa” leva diretamente ao campo de criação para evitar
botões sem comportamento. Os números de produtividade são atualmente conteúdo de
apresentação e devem ser derivados dos dados reais quando a persistência for criada.

A rota `/dashboard/tasks` apresenta todas as tarefas da lista selecionada. O usuário
pode trocar a lista pelo dropdown e concluir ou remover tarefas sem sair da tela.

### UI inspirada em Liquid Glass

As superfícies usam transparência, `backdrop-filter: blur`, bordas claras de baixa
opacidade, sombras amplas e gradientes radiais. É uma inspiração visual, não uma API
proprietária do iOS, preservando compatibilidade no navegador.

### Responsividade e acessibilidade

O layout de autenticação é dividido em showcase e formulário em telas grandes e vira
uma coluna em telas menores. Campos têm `label`, `autocomplete` e validação nativa;
erros usam `role="alert"`; o controle da senha possui nome acessível.

### Persistência atual

As listas e tarefas da primeira versão SaaS ficam no estado de `TodoWorkspace` e são
persistidas no `localStorage` do navegador. O Firebase está responsável pela
autenticação nesta etapa. A migração para Firestore deve usar
`/users/{uid}/lists/{listId}` e vincular cada documento ao usuário autenticado.

### Planos e monetização

`/plans` apresenta os planos Grátis, Pro e Business em modo demonstração. Os botões
pagos ainda não cobram nem alteram permissões. O próximo passo é escolher Stripe ou
Mercado Pago e mover o checkout para uma rota server-side/webhook, mantendo a
validação do plano no servidor e não apenas na interface.

### Acesso por plano

Os planos e seus recursos são centralizados em `src/lib/entitlements.ts`. O perfil
do usuário fica em `/users/{uid}` no Firestore e começa sempre com `plan: "free"`.
O cliente lê esse perfil através de `useUserPlan`, mostra o plano atual no dashboard
e aplica o limite de três listas no plano gratuito. As regras do Firestore impedem
que o próprio cliente altere o campo `plan`; somente um backend/webhook confiável
de pagamento deve promover ou rebaixar contas.

## Próximos passos

1. Proteger a home com o estado de sessão do Firebase.
2. Persistir tarefas no Firestore por usuário.
3. Adicionar recuperação de senha e verificação de e-mail.
4. Adicionar testes para os fluxos de autenticação e tarefas.
