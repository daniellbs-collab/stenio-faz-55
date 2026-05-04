type RsvpReportRecord = {
  attending: boolean;
  createdAt: Date;
  guests: number;
  message: string | null;
  name: string;
};

type RsvpReportMetrics = {
  confirmedPeople: number;
  confirmedRsvps: number;
  declinedRsvps: number;
  totalGuests: number;
  totalRsvps: number;
};

type SendRsvpReportEmailInput = {
  latestRsvps: RsvpReportRecord[];
  metrics: RsvpReportMetrics;
  rsvp: RsvpReportRecord;
};

const resendEndpoint = "https://api.resend.com/emails";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatStatus(attending: boolean) {
  return attending ? "Confirmou presença" : "Não vou conseguir";
}

function getRsvpTotal(rsvp: Pick<RsvpReportRecord, "attending" | "guests">) {
  return rsvp.attending ? 1 + rsvp.guests : 0;
}

function getEmailConfig() {
  const provider = process.env.SUPPORT_EMAIL_PROVIDER?.trim().toLowerCase();

  if (provider !== "resend") {
    return null;
  }

  const apiKey = process.env.SUPPORT_RESEND_API_KEY?.trim();
  const to = process.env.RSVP_REPORT_RECIPIENT_EMAIL?.trim();
  const resendFrom = process.env.SUPPORT_RESEND_FROM?.trim();
  const smtpFrom = process.env.SUPPORT_SMTP_FROM?.trim();
  const smtpFromName = process.env.SUPPORT_SMTP_FROM_NAME?.trim();
  const from =
    resendFrom || (smtpFromName && smtpFrom ? `${smtpFromName} <${smtpFrom}>` : smtpFrom);

  if (!apiKey || !to || !from) {
    return null;
  }

  return {
    apiKey,
    from,
    replyTo: process.env.SUPPORT_SMTP_REPLY_TO?.trim(),
    to,
  };
}

function buildPlainText({ latestRsvps, metrics, rsvp }: SendRsvpReportEmailInput) {
  const lines = [
    "Nova confirmação de presença",
    "",
    `Nome: ${rsvp.name}`,
    `Status: ${formatStatus(rsvp.attending)}`,
    `Acompanhantes: ${rsvp.guests}`,
    `Total desta confirmação: ${getRsvpTotal(rsvp)}`,
  ];

  if (rsvp.message) {
    lines.push(`Recado: ${rsvp.message}`);
  }

  lines.push(
    "",
    "KPIs",
    `Pessoas confirmadas: ${metrics.confirmedPeople}`,
    `RSVPs totais: ${metrics.totalRsvps}`,
    `Confirmaram presença: ${metrics.confirmedRsvps}`,
    `Não vão conseguir: ${metrics.declinedRsvps}`,
    `Acompanhantes confirmados: ${metrics.totalGuests}`,
    "",
    "Últimas confirmações",
    ...latestRsvps.map(
      (item) =>
        `${formatDate(item.createdAt)} - ${item.name} - ${formatStatus(
          item.attending,
        )} - ${item.guests} acompanhante(s)`,
    ),
  );

  return lines.join("\n");
}

function buildHtml({ latestRsvps, metrics, rsvp }: SendRsvpReportEmailInput) {
  const metricCards = [
    ["Pessoas confirmadas", metrics.confirmedPeople],
    ["RSVPs totais", metrics.totalRsvps],
    ["Confirmaram presença", metrics.confirmedRsvps],
    ["Não vão conseguir", metrics.declinedRsvps],
    ["Acompanhantes", metrics.totalGuests],
  ];

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirmação de presença</title>
  </head>
  <body style="margin:0;background:#faf6f0;color:#2a2a2a;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:28px 18px;">
      <div style="background:#f5a98a;border-radius:18px;padding:28px 26px;">
        <p style="margin:0 0 8px;color:#1f4d3a;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Nova confirmação</p>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.08;">${escapeHtml(
          rsvp.name,
        )}</h1>
        <p style="margin:14px 0 0;font-size:17px;">${escapeHtml(
          formatStatus(rsvp.attending),
        )} · ${rsvp.guests} acompanhante(s) · total ${getRsvpTotal(rsvp)}</p>
      </div>

      ${
        rsvp.message
          ? `<div style="margin-top:16px;background:#fff;border:1px solid #eaded2;border-radius:14px;padding:18px 20px;">
              <p style="margin:0 0 6px;color:#1f4d3a;font-size:13px;font-weight:700;">Recado</p>
              <p style="margin:0;font-size:16px;line-height:1.5;">${escapeHtml(rsvp.message)}</p>
            </div>`
          : ""
      }

      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:16px;">
        ${metricCards
          .map(
            ([label, value]) => `<div style="background:#fff;border:1px solid #eaded2;border-radius:14px;padding:14px 12px;">
              <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#1f4d3a;">${value}</div>
              <div style="margin-top:4px;font-size:12px;line-height:1.25;color:#6f6a64;">${escapeHtml(
                String(label),
              )}</div>
            </div>`,
          )
          .join("")}
      </div>

      <div style="margin-top:22px;background:#fff;border:1px solid #eaded2;border-radius:14px;overflow:hidden;">
        <div style="padding:16px 18px;border-bottom:1px solid #eaded2;">
          <h2 style="margin:0;font-family:Georgia,serif;font-size:22px;">Últimas confirmações</h2>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tbody>
            ${latestRsvps
              .map(
                (item) => `<tr>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0e7dd;">
                    <strong>${escapeHtml(item.name)}</strong><br />
                    <span style="color:#6f6a64;font-size:13px;">${escapeHtml(
                      formatDate(item.createdAt),
                    )}</span>
                  </td>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0e7dd;text-align:right;">
                    ${escapeHtml(formatStatus(item.attending))}<br />
                    <span style="color:#6f6a64;font-size:13px;">${item.guests} acompanhante(s)</span>
                  </td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendRsvpReportEmail(input: SendRsvpReportEmailInput) {
  const config = getEmailConfig();

  if (!config) {
    console.info("[rsvp-report-email] Email report not configured.");
    return;
  }

  const response = await fetch(resendEndpoint, {
    body: JSON.stringify({
      from: config.from,
      html: buildHtml(input),
      reply_to: config.replyTo,
      subject: `Confirmação de presença - ${input.rsvp.name}`,
      text: buildPlainText(input),
      to: config.to,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    throw new Error(
      `Resend failed with ${response.status}: ${responseText || response.statusText}`,
    );
  }
}
