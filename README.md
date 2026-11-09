# ✦ starTodo

> Pequenos passos. Grandes constelações.

O **starTodo** é um SaaS de organização pessoal com uma interface acolhedora,
autenticação por e-mail e senha, múltiplas listas e uma experiência visual inspirada
em glassmorphism. Este projeto foi criado como um case de portfólio para explorar
produto, design system e arquitetura de uma aplicação web moderna.

## ✨ O que existe hoje

- Login, cadastro e verificação de e-mail com Firebase Authentication
- Dashboard responsivo com linguagem visual própria
- Criação, edição e exclusão de listas
- Criação, conclusão e remoção de tarefas
- Tela “Minhas tarefas” com seleção visual de listas
- Planos Grátis, Pro e Business em modo demonstrativo
- Controle inicial de recursos por plano
- Regras de Firestore com acesso por usuário
- App Check preparado para reCAPTCHA Enterprise

> O checkout ainda é uma demonstração: nenhum botão de plano realiza cobrança.
> A integração de pagamentos deve ser adicionada por backend e webhooks antes de
> qualquer uso comercial.

## 🧰 Stack

- [Next.js](https://nextjs.org/) com App Router
- [React](https://react.dev/)
- TypeScript e JavaScript
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- React Icons
- CSS responsivo com transparência, blur e gradientes suaves

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 20+
- npm
- Um projeto Firebase Web

### Instalação

```bash
npm install
```

Crie `.env.local` a partir de `.env.example`:

```bash
copy .env.example .env.local
```

Preencha as variáveis do app Web do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=
```

Inicie o ambiente:

```bash
npm run dev
```

Rotas principais:

- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/dashboard`
- `/dashboard/tasks`
- `/plans`

Para validar a versão de produção:

```bash
npm run build
npm run start
```

## 🔐 Segurança antes de publicar

As variáveis `NEXT_PUBLIC_FIREBASE_*` são configurações públicas do Firebase Web.
Isso é esperado. **Nunca** adicione ao frontend ou ao Git:

- Service Account JSON
- `FIREBASE_ADMIN_PRIVATE_KEY`
- tokens administrativos
- credenciais de gateway de pagamento
- arquivos `.env.local`

Antes do deploy:

1. Ative E-mail/senha no Firebase Authentication.
2. Configure verificação de e-mail.
3. Adicione somente seus domínios em Authorized domains.
4. Publique as regras de [`firestore.rules`](./firestore.rules).
5. Restrinja a API key por domínio e APIs usadas.
6. Configure App Check em produção.
7. Rotacione qualquer chave que tenha sido compartilhada fora do ambiente seguro.

As chaves públicas do Firebase não substituem regras de segurança. A autorização de
dados deve continuar nas regras do Firestore e, para pagamentos, em um backend
confiável.

## 🏗️ Decisões de arquitetura

### App Router

Rotas e layouts ficam em `src/app`. A raiz `/` leva ao login, enquanto `/dashboard`
é uma área protegida pelo `AuthGuard`.

### Autenticação no cliente

O Firebase SDK modular é inicializado em [`src/lib/firebase.ts`](./src/lib/firebase.ts).
O cadastro envia verificação de e-mail e o dashboard aceita somente usuários
autenticados e verificados.

### Acesso por plano

Planos e recursos são centralizados em
[`src/lib/entitlements.ts`](./src/lib/entitlements.ts). O perfil do usuário começa
com o plano `free`. O cliente pode ler o próprio plano, mas não pode promovê-lo:
essa alteração deverá ser feita por um backend ou webhook de pagamento confiável.

### Dados

A experiência atual persiste listas localmente para facilitar o protótipo. A estrutura
de Firestore já define isolamento por usuário e está preparada para a migração de
listas e tarefas para `/users/{uid}/lists/{listId}`.

### Design

O starTodo usa a paleta `#1C0B19`, `#35605A`, `#86626E` e `#A4C3B2`. A interface
combina superfícies translúcidas, blur, bordas suaves e espaços responsivos — uma
interpretação web do conceito Liquid Glass, sem depender de APIs proprietárias.

## 🗺️ Próximos passos

- Persistir listas e tarefas no Firestore
- Integrar Stripe ou Mercado Pago no servidor
- Implementar webhooks para conceder e revogar planos
- Adicionar recuperação de senha
- Adicionar testes automatizados
- Derivar métricas do dashboard a partir dos dados reais

## 💛 Portfólio

Este projeto demonstra uma evolução de um todo app para um produto SaaS: identidade
visual, autenticação, autorização, planos, responsividade e preocupação com segurança.

Feito com carinho por **Caroline Lage**.
