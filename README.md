This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Na primeira vez (ou para atualizar bandeiras em `public/flags`):

```bash
npm run setup
```

Depois, use **apenas um** terminal com o servidor de desenvolvimento:

```bash
npm run dev
```

O `dev` usa Webpack (`--webpack`), não Turbopack. No Next.js 16 o Turbopack vem por padrão, mas no Windows pode vazar memória e abrir muitos processos Node.

Se algo travar após várias execuções:

```bash
npm run clean
npm run free-port
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

**Importante:** não dispare o servidor várias vezes (vários terminais, Ctrl+Shift+B no editor, depuração + terminal ao mesmo tempo).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) e escolha o preset **Next.js** (não use **Other**).
2. **Root Directory**: deixe vazio (o `package.json` está na raiz do repositório).
3. **Output Directory**: deixe vazio — a Vercel define isso automaticamente para Next.js. Se estiver `.next`, `out` ou `dist`, apague e salve.
4. **Build Command**: `npm run build` (padrão).
5. Faça o deploy e abra a URL que aparece em **Deployments → Visit** (ex.: `seu-projeto.vercel.app`).

### Página 404 (`NOT_FOUND`) com build OK

Se o log mostra a rota `/` mas o site exibe o 404 branco da Vercel:

- Confirme **Framework Preset = Next.js** em *Settings → General → Build & Development Settings*.
- Remova qualquer **Output Directory** customizado.
- Teste a URL exata do último deployment (não um domínio antigo).
- Se o domínio customizado falhar, teste primeiro o `*.vercel.app`.
- Redeploy com **Clear build cache** ou reimporte o projeto no dashboard.

O arquivo `vercel.json` na raiz só fixa os comandos de build; o preset **Next.js** no painel é obrigatório.
