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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
