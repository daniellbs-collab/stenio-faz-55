# Deploy Railway

## Variáveis obrigatórias

- `DATABASE_URL`: injetada pelo plugin Postgres do Railway.
- `ADMIN_PASSWORD_HASH`: SHA-256 hexadecimal da senha do admin.
- `IP_SALT`: string longa e aleatória para hash de IP no rate limit.
- `NEXT_PUBLIC_SITE_URL`: `https://steniofaz55.eteolabs.com.br`.

## Comandos

O `railway.toml` já define:

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
npm start
```

## Checklist pós-deploy

- Configurar Postgres no Railway.
- Configurar domínio `steniofaz55.eteolabs.com.br`.
- Confirmar SSL ativo.
- Testar home, RSVP, mural, quiz e admin.
- Baixar CSV no admin.
- Baixar `/api/calendar.ics`.
- Abrir `/api/og` e testar preview no WhatsApp.
- Confirmar `/robots.txt` com `Disallow: /`.
