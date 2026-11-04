import { isISODate, KINDS, monthEnd, monthStart, PLATFORMS, STATUSES, todayISO } from './config'
import type { Filters } from './data'

export const STATUS_FILTERS: Record<string, string> = {
  active: 'Any in progress',
  overdue: 'Overdue',
  blocked: 'Blocked',
  ...STATUSES,
}

// Reads dashboard and tracker filters from the address bar, ignoring anything unexpected.
// The dashboard defaults to this month; the tracker shows everything unless a range is set.
export function readFilters(params: Record<string, string | undefined>, defaultRange = true): Filters {
  const today = todayISO()
  let from = params.from && isISODate(params.from) ? params.from : undefined
  let to = params.to && isISODate(params.to) ? params.to : undefined
  if (defaultRange || from || to) {
    from ??= monthStart(today)
    to ??= monthEnd(from)
    if (to < from) [from, to] = [to, from]
  }
  return {
    from,
    to,
    kind: params.kind && params.kind in KINDS ? params.kind : undefined,
    platform: params.platform && params.platform in PLATFORMS ? params.platform : undefined,
    status: params.status && params.status in STATUS_FILTERS ? params.status : undefined,
    owner: params.owner ? params.owner.slice(0, 120) : undefined,
    q: params.q ? params.q.slice(0, 120) : undefined,
  }
}
