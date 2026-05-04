# Deploy Railway

## Variáveis obrigatórias

- `DATABASE_URL`: injetada pelo plugin Postgres do Railway.
- `ADMIN_PASSWORD_HASH`: SHA-256 hexadecimal da senha do admin.
- `IP_SALT`: string longa e aleatória para hash de IP no rate limit.
- `NEXT_PUBLIC_SITE_URL`: `https://steniofaz55.eteolabs.com.br`.
- `SUPPORT_EMAIL_PROVIDER`: use `resend` para enviar relatórios de RSVP.
- `SUPPORT_RESEND_API_KEY`: API key do Resend.
- `SUPPORT_RESEND_FROM`: remetente validado no Resend, por exemplo `Confirmação de Presença - Stênio faz 55 <convite@seudominio.com>`.
- `SUPPORT_SMTP_FROM`: fallback de endereço remetente, se `SUPPORT_RESEND_FROM` não estiver definido.
- `SUPPORT_SMTP_FROM_NAME`: fallback de nome do remetente.
- `SUPPORT_SMTP_REPLY_TO`: endereço de resposta, se aplicável.
- `RSVP_REPORT_RECIPIENT_EMAIL`: e-mail que recebe o relatório a cada RSVP.

## Comandos

O `railway.toml` já define:

```bash
npx prisma generate && npm run build
npx prisma migrate deploy && npm start
```

## Checklist pós-deploy

- Configurar Postgres no Railway.
- Configurar domínio `steniofaz55.eteolabs.com.br`.
- Confirmar SSL ativo.
- Testar home, RSVP, mural, quiz e admin.
- Confirmar que um RSVP dispara e-mail para `RSVP_REPORT_RECIPIENT_EMAIL`.
- Baixar CSV no admin.
- Baixar `/api/calendar.ics`.
- Abrir `/api/og` e testar preview no WhatsApp.
- Confirmar `/robots.txt` com `Disallow: /`.
