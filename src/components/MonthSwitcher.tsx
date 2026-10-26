import { Link } from 'react-router-dom'
import {
  MONTH_ABBREV,
  MONTH_LABELS,
  MONTH_SLUGS,
  bestPeaksHref,
  type MonthSlug,
} from '../lib/bestPeaks'

type MonthSwitcherProps = {
  current?: MonthSlug | null
  counts?: Partial<Record<MonthSlug, number>>
}

export function MonthSwitcher({ current, counts }: MonthSwitcherProps) {
  return (
    <nav className="month-switcher" aria-label="Months">
      <ul className="month-switcher-list">
        {MONTH_SLUGS.map((slug) => {
          const count = counts?.[slug]
          const label =
            count != null
              ? `${MONTH_ABBREV[slug]} (${count})`
              : MONTH_ABBREV[slug]
          return (
            <li key={slug}>
              <Link
                to={bestPeaksHref(slug)}
                className={slug === current ? 'is-current' : undefined}
                aria-current={slug === current ? 'page' : undefined}
                title={`Best peaks to climb in ${MONTH_LABELS[slug]}`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
