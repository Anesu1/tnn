import Link from "next/link"

import { KINDS, PLATFORMS } from "@/lib/desk/config"
import type { Filters as FilterValues } from "@/lib/desk/data"
import { STATUS_FILTERS } from "@/lib/desk/filters"

// A plain GET form: filters live in the address, so a filtered view can be bookmarked or shared
export function Filters({ action, filters, owners, search = false }: { action: string; filters: FilterValues; owners: string[]; search?: boolean }) {
  return (
    <form method="get" action={action} className="filters" aria-label="Filters">
      {search && (
        <label>
          Search
          <input type="search" name="q" defaultValue={filters.q} placeholder="Title or next action" />
        </label>
      )}
      <label>
        From
        <input type="date" name="from" defaultValue={filters.from} />
      </label>
      <label>
        To
        <input type="date" name="to" defaultValue={filters.to} />
      </label>
      <label>
        Type
        <select name="kind" defaultValue={filters.kind ?? ""}>
          <option value="">All types</option>
          {Object.entries(KINDS).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Platform
        <select name="platform" defaultValue={filters.platform ?? ""}>
          <option value="">All platforms</option>
          {Object.entries(PLATFORMS).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select name="status" defaultValue={filters.status ?? ""}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_FILTERS).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Owner
        <select name="owner" defaultValue={filters.owner ?? ""}>
          <option value="">Everyone</option>
          {owners.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <div className="filter-actions">
        <button className="button small dark">Apply</button>
        <Link href={action}>Clear</Link>
      </div>
    </form>
  )
}
