import nodemailer from 'nodemailer'
import { Resend } from 'resend'

export type AnnouncementEmailParams = {
  to: string[]
  communityName: string
  title: string
  body: string
  type: string
  requiresAck: boolean
  announcementUrl: string
  senderName: string
}

const TYPE_LABELS: Record<string, string> = {
  aviso: 'Aviso general',
  convocatoria: 'Convocatoria',
  resolucion: 'Resolución',
  urgente: 'URGENTE',
}

const TYPE_COLORS: Record<string, string> = {
  aviso: '#6b7280',
  convocatoria: '#2563eb',
  resolucion: '#7c3aed',
  urgente: '#dc2626',
}

export async function sendAnnouncementEmail(params: AnnouncementEmailParams) {
  const subject = `[${TYPE_LABELS[params.type] ?? params.type}] ${params.title}`
  const html = buildAnnouncementHtml(params)
  const from = process.env.RESEND_FROM_EMAIL ?? 'GestionFinca <no-reply@gestionfinca.app>'

  if (process.env.RESEND_API_KEY) {
    // Production: send via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from, to: params.to, subject, html })
  } else {
    // Development: send to local Inbucket SMTP (http://127.0.0.1:54324)
    const transporter = nodemailer.createTransport({
      host: '127.0.0.1',
      port: 54325,
      secure: false,
      ignoreTLS: true,
    })
    await transporter.sendMail({ from, to: params.to.join(', '), subject, html })
  }
}

function buildAnnouncementHtml(p: AnnouncementEmailParams): string {
  const label = TYPE_LABELS[p.type] ?? p.type
  const color = TYPE_COLORS[p.type] ?? '#6b7280'
  const excerpt =
    p.body.length > 300 ? p.body.slice(0, 300).trimEnd() + '…' : p.body
  const bodyLines = excerpt.replace(/\n/g, '<br>')

  const ackBanner = p.requiresAck
    ? `<tr>
        <td style="padding:12px 32px;background:#fefce8;border-left:4px solid #eab308;font-family:sans-serif;font-size:14px;color:#854d0e;">
          Este comunicado requiere <strong>acuse de recibo</strong>. Por favor, accede a la plataforma para confirmarlo.
        </td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background:#18181b;">
              <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">GestiónFinca</span>
              <span style="font-size:13px;color:#a1a1aa;margin-left:8px;">${p.communityName}</span>
            </td>
          </tr>

          <!-- Type badge -->
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:inline-block;padding:4px 12px;border-radius:9999px;background:${color};color:#fff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">
                ${label}
              </span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:12px 32px 0;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">${p.title}</h1>
            </td>
          </tr>

          <!-- Meta -->
          <tr>
            <td style="padding:8px 32px 0;font-size:13px;color:#71717a;">
              Publicado por <strong>${p.senderName}</strong>
            </td>
          </tr>

          <!-- Excerpt -->
          <tr>
            <td style="padding:20px 32px;font-size:15px;color:#3f3f46;line-height:1.6;border-top:1px solid #f4f4f5;margin-top:16px;">
              ${bodyLines}
            </td>
          </tr>

          <!-- Ack banner -->
          ${ackBanner}

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px;">
              <a href="${p.announcementUrl}"
                 style="display:inline-block;padding:12px 24px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
                Ver comunicado completo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #f4f4f5;font-size:12px;color:#a1a1aa;">
              Has recibido este correo porque eres miembro de <strong>${p.communityName}</strong>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
