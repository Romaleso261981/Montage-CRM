import { clientAmountDue } from './orderDisplay'
import { formatMoneyDisplay } from './moneyFormat'
import { formatDayTitleUk } from './installationCalendar'
import type { Order } from '../types/order'

export type InstallationExtractRow = {
  index: number
  clientName: string
  phone: string
  address: string
  time: string
  workSummary: string
  amountDueLabel: string
  installerName: string
}

function hasPositivePrice(value: number | undefined): boolean {
  return value != null && value > 0
}

/** Короткий опис робіт / обладнання без сум по позиціях. */
export function formatOrderWorkSummary(order: Order): string {
  const chunks: string[] = []

  const sd = order.saleDetails
  if (sd?.acModel?.trim()) {
    const brand = sd.acName?.trim()
    const model = sd.acModel.trim()
    chunks.push(brand ? `${brand} ${model}` : model)
  }

  const services: string[] = []
  if (hasPositivePrice(order.installationPrice)) services.push('монтаж')
  if (hasPositivePrice(order.dismantlingPrice)) services.push('демонтаж')
  if (hasPositivePrice(order.refillPrice)) services.push('заправка')
  if (hasPositivePrice(order.repairPrice)) services.push('ремонт')
  if (hasPositivePrice(order.drainCleaningPrice)) services.push('чистка дренажу')
  if (hasPositivePrice(order.acCleaningPrice)) services.push('чистка кондиціонера')

  if (services.length > 0) {
    chunks.push(services.join(', '))
  }

  const comment = order.comment?.trim()
  if (comment) {
    chunks.push(comment)
  }

  return chunks.join(' · ') || '—'
}

function parseTimeMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim())
  if (!match) return 24 * 60
  return Number(match[1]) * 60 + Number(match[2])
}

function sortOrdersForExtract(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const ta = parseTimeMinutes(a.installationTime ?? '')
    const tb = parseTimeMinutes(b.installationTime ?? '')
    if (ta !== tb) return ta - tb
    return a.clientName.localeCompare(b.clientName, 'uk')
  })
}

export function buildInstallationExtractRows(orders: Order[]): InstallationExtractRow[] {
  const sorted = sortOrdersForExtract(orders)
  return sorted.map((order, i) => {
    const due = clientAmountDue(order)
    const amountDueLabel =
      order.paymentStatus === 'paid'
        ? 'Оплачено'
        : due > 0
          ? formatMoneyDisplay(due, 'UAH')
          : '—'

    const time = order.installationTime?.trim() || '—'

    return {
      index: i + 1,
      clientName: order.clientName.trim() || '—',
      phone: order.phone.trim() || '—',
      address: order.address.trim() || '—',
      time,
      workSummary: formatOrderWorkSummary(order),
      amountDueLabel,
      installerName: order.installerName?.trim() || '—',
    }
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPrintDocumentHtml(dateKey: string, rows: InstallationExtractRow[]): string {
  const title = formatDayTitleUk(dateKey)
  const generated = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

  const bodyRows = rows
    .map(
      (r) => `
    <tr>
      <td class="num">${r.index}</td>
      <td>${escapeHtml(r.time)}</td>
      <td><strong>${escapeHtml(r.clientName)}</strong><br/><span class="muted">${escapeHtml(r.phone)}</span></td>
      <td>${escapeHtml(r.address)}</td>
      <td>${escapeHtml(r.workSummary)}</td>
      <td class="due">${escapeHtml(r.amountDueLabel)}</td>
      <td>${escapeHtml(r.installerName)}</td>
    </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <title>Виписка монтажів — ${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: 11pt; color: #0f172a; margin: 16mm; }
    h1 { font-size: 16pt; margin: 0 0 4px; text-transform: capitalize; }
    .meta { color: #64748b; font-size: 9pt; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; text-align: left; }
    th { background: #f1f5f9; font-size: 9pt; font-weight: 600; }
    td.num { width: 28px; text-align: center; }
    td.due { white-space: nowrap; font-weight: 600; }
    .muted { color: #475569; font-size: 9pt; }
    @media print {
      body { margin: 10mm; }
    }
  </style>
</head>
<body>
  <h1>Виписка монтажів</h1>
  <p class="meta">${escapeHtml(title)} · ${rows.length} ${
    rows.length === 1 ? 'заявка' : rows.length < 5 ? 'заявки' : 'заявок'
  } · сформовано ${escapeHtml(generated)}</p>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Час</th>
        <th>Клієнт</th>
        <th>Адреса</th>
        <th>Що робити / обладнання</th>
        <th>До сплати</th>
        <th>Монтажник</th>
      </tr>
    </thead>
    <tbody>
      ${bodyRows}
    </tbody>
  </table>
</body>
</html>`
}

export function openInstallationExtractPrint(dateKey: string, orders: Order[]): void {
  if (orders.length === 0) return
  const rows = buildInstallationExtractRows(orders)
  const html = buildPrintDocumentHtml(dateKey, rows)
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) {
    window.alert('Дозвольте спливаючі вікна, щоб відкрити виписку для друку або PDF.')
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.onload = () => {
    win.print()
  }
  setTimeout(() => win.print(), 300)
}

function buildPlainTextExtract(dateKey: string, rows: InstallationExtractRow[]): string {
  const title = formatDayTitleUk(dateKey)
  const lines: string[] = [
    `Виписка монтажів — ${title}`,
    `Заявок: ${rows.length}`,
    '',
  ]

  for (const r of rows) {
    lines.push(
      `${r.index}. ${r.time} — ${r.clientName}`,
      `   Тел.: ${r.phone}`,
      `   Адреса: ${r.address}`,
      `   Роботи: ${r.workSummary}`,
      `   До сплати: ${r.amountDueLabel}`,
    )
    if (r.installerName !== '—') {
      lines.push(`   Монтажник: ${r.installerName}`)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}

export function downloadInstallationExtractText(dateKey: string, orders: Order[]): void {
  if (orders.length === 0) return
  const rows = buildInstallationExtractRows(orders)
  const text = buildPlainTextExtract(dateKey, rows)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vypyska-montazhiv-${dateKey}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
