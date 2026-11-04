// Desk emails in the public site's design: ink utility bar, masthead with logo and tagline,
// Georgia headlines, red labels and buttons, ink footer. Built from tables with inline styles,
// which is what email apps (Gmail, Outlook, Apple Mail) reliably render.

export type EmailRow = { title: string; href?: string; meta?: string; flag?: string }
export type EmailSection = { heading: string; rows?: EmailRow[]; text?: string; empty?: string }
export type EmailContent = {
  label: string
  title: string
  intro?: string
  sections?: EmailSection[]
  action?: { label: string; href: string }
  // Short line some apps show next to the subject
  preheader?: string
}

const C = { red: '#b51f2a', ink: '#171c19', muted: '#535d56', paper: '#f8f7f2', line: '#d7ddd5', soft: '#eeefe8', footText: '#d0d7cf', footLine: '#526053' }
const SANS = 'Arial, Helvetica, sans-serif'
// Single quotes only: these go inside style="…" attributes
const SERIF = "Georgia, 'Times New Roman', serif"

export function siteBase() {
  return (process.env.DESK_BASE_URL || process.env.URL || 'https://thenarrativenetwork.org').replace(/\/$/, '')
}

// Links in emails must be absolute
export function absolute(href: string) {
  return href.startsWith('/') ? `${siteBase()}${href}` : href
}

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const paragraphs = (text: string) =>
  escape(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font:16px/1.6 ${SANS};color:${C.ink};">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

function row(r: EmailRow) {
  const title = r.href
    ? `<a href="${escape(absolute(r.href))}" style="color:${C.ink};font-weight:bold;text-decoration:underline;">${escape(r.title)}</a>`
    : `<strong>${escape(r.title)}</strong>`
  const flag = r.flag
    ? `<span style="display:inline-block;margin-left:6px;padding:1px 5px;border:1px solid ${C.red};color:${C.red};font:bold 10px ${SANS};letter-spacing:.6px;text-transform:uppercase;">${escape(r.flag)}</span>`
    : ''
  const meta = r.meta ? `<div style="margin-top:2px;font:13px/1.5 ${SANS};color:${C.muted};">${escape(r.meta)}</div>` : ''
  return `<tr><td style="padding:11px 0;border-bottom:1px solid ${C.line};font:15px/1.5 ${SANS};color:${C.ink};">${title}${flag}${meta}</td></tr>`
}

function section(s: EmailSection) {
  const count = s.rows ? ` <span style="font:13px ${SANS};color:${C.muted};font-weight:normal;">(${s.rows.length})</span>` : ''
  const body = s.text
    ? `<tr><td style="padding-top:12px;">${paragraphs(s.text)}</td></tr>`
    : s.rows?.length
      ? s.rows.map(row).join('')
      : `<tr><td style="padding:11px 0;font:14px ${SANS};color:${C.muted};">${escape(s.empty ?? 'None.')}</td></tr>`
  return `
    <tr><td style="padding:26px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-bottom:2px solid ${C.ink};padding-bottom:8px;font:bold 21px/1.2 ${SERIF};color:${C.ink};">${escape(s.heading)}${count}</td></tr>
        ${body}
      </table>
    </td></tr>`
}

export function renderEmail(content: EmailContent) {
  const base = siteBase()
  const year = new Date().getFullYear()
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${escape(content.title)}</title>
<style>
  @media (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding-left: 18px !important; padding-right: 18px !important; }
    .utility-right, .tagline { display: none !important; }
    .headline { font-size: 28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.paper};">${escape(content.preheader ?? content.intro ?? content.title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
<tr><td align="center">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ink};">
    <tr><td align="center">
      <table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="pad" style="padding:8px 24px;font:11px ${SANS};letter-spacing:1.4px;color:#ffffff;">TNN EDITORIAL DESK</td>
          <td class="pad utility-right" align="right" style="padding:8px 24px;font:11px ${SANS};letter-spacing:1.4px;color:#ffffff;">PRIVATE · APPROVED ACCOUNTS ONLY</td>
        </tr>
      </table>
    </td></tr>
  </table>

  <table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0">
    <tr><td class="pad" style="padding:22px 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:2px solid ${C.ink};">
        <tr>
          <td width="120" style="vertical-align:middle;padding-bottom:18px;">
            <a href="${base}/desk"><img src="${base}/email/tnn-logo.png" width="118" height="60" alt="The Narrative Network" style="display:block;border:0;width:118px;height:60px;"></a>
          </td>
          <td class="tagline" align="right" style="vertical-align:middle;padding-bottom:18px;font:italic 16px ${SERIF};color:${C.muted};">Shaping Africa’s Story, One Voice at a Time.</td>
        </tr>
      </table>
    </td></tr>

    <tr><td class="pad" style="padding:28px 24px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font:bold 11px ${SANS};letter-spacing:1.3px;text-transform:uppercase;color:${C.red};">${escape(content.label)}</td></tr>
        <tr><td class="headline" style="padding:8px 0 14px;font:bold 34px/1.15 ${SERIF};letter-spacing:-.5px;color:${C.ink};">${escape(content.title)}</td></tr>
        ${content.intro ? `<tr><td style="font:19px/1.55 ${SERIF};color:${C.muted};">${escape(content.intro)}</td></tr>` : ''}
        ${(content.sections ?? []).map(section).join('')}
        ${
          content.action
            ? `<tr><td style="padding:28px 0 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="background:${C.red};">
                    <a href="${escape(absolute(content.action.href))}" style="display:inline-block;padding:13px 20px;font:bold 14px ${SANS};color:#ffffff;text-decoration:none;">${escape(content.action.label)} &#8599;</a>
                  </td>
                </tr></table>
              </td></tr>`
            : ''
        }
        <tr><td style="padding:22px 0 0;font:13px/1.6 ${SANS};color:${C.muted};">
          This email is for approved TNN Editorial Desk accounts only. Please don’t forward it.
        </td></tr>
      </table>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ink};margin-top:36px;">
    <tr><td align="center">
      <table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0">
        <tr><td class="pad" style="padding:30px 24px 0;">
          <img src="${base}/email/tnn-logo-white.png" width="112" height="57" alt="The Narrative Network" style="display:block;border:0;width:112px;height:57px;">
          <p style="margin:16px 0 0;font:13px/1.6 ${SANS};color:${C.footText};">Shaping Africa’s Story, One Voice at a Time.<br>Zimbabwe rooted. Africa focused.</p>
        </td></tr>
        <tr><td class="pad" style="padding:18px 24px 22px;">
          <div style="border-top:1px solid ${C.footLine};padding-top:14px;font:12px/1.6 ${SANS};color:${C.footText};">
            © ${year} The Narrative Network · <a href="${base}/desk" style="color:${C.footText};">Editorial Desk</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`

  return { html, text: renderText(content) }
}

// Plain-text copy for apps that don't show HTML
function renderText(content: EmailContent) {
  const out = [`TNN EDITORIAL DESK · ${content.label.toUpperCase()}`, '', content.title]
  if (content.intro) out.push('', content.intro)
  for (const s of content.sections ?? []) {
    out.push('', `${s.heading}${s.rows ? ` (${s.rows.length})` : ''}`)
    if (s.text) out.push(s.text)
    else if (s.rows?.length) for (const r of s.rows) out.push(`- ${r.title}${r.flag ? ` [${r.flag}]` : ''}${r.meta ? ` · ${r.meta}` : ''}${r.href ? `\n  ${absolute(r.href)}` : ''}`)
    else out.push(s.empty ?? 'None.')
  }
  if (content.action) out.push('', `${content.action.label}: ${absolute(content.action.href)}`)
  out.push('', '—', 'The Narrative Network · Shaping Africa’s Story, One Voice at a Time.', 'For approved TNN Editorial Desk accounts only.')
  return out.join('\n')
}

export const INVITE_DAYS = 3

// Invitation to set up a Desk account. The link is single use; no password is ever emailed.
export function inviteEmail(name: string, roleName: string, link: string): EmailContent {
  return {
    label: 'Invitation',
    title: `${name.split(' ')[0]}, your Editorial Desk account is ready`,
    intro: `You’ve been given ${roleName} access to the TNN Editorial Desk, the private workspace for editorial plans, reports and decisions.`,
    preheader: `Set up your TNN Editorial Desk account. The link works for ${INVITE_DAYS} days.`,
    sections: [
      {
        heading: 'Setting up takes two minutes',
        text: [
          '1. Click the button below.',
          '2. Choose your own password (at least 12 characters).',
          '3. Connect an authenticator app on your phone, such as Google Authenticator or Microsoft Authenticator, by scanning the QR code shown.',
          '',
          `The link works once and expires in ${INVITE_DAYS} days. If it has expired, ask the CEO to send a new one. If you weren’t expecting this email, you can ignore it.`,
        ].join('\n'),
      },
    ],
    action: { label: 'Set up your account', href: link },
  }
}
