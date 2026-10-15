import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Entry, Sentence } from '@/components/ui'
import { getSampleLists, search } from '@/lib/data'
import { PAGE_SIZE } from '@/lib/site'
import { num, one, plural } from '@/lib/utils'

export const metadata: Metadata = { title: 'Search the register', robots: { index: false, follow: true } }

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <Suspense fallback={<div className="wrap search-head"><p className="muted">Consulting the register…</p></div>}>
      <Results searchParams={searchParams} />
    </Suspense>
  )
}

const SORTS = [['', 'Standing'], ['rating', 'Rating'], ['reviews', 'Most reviewed']] as const
const RATINGS = [['', 'Any'], ['4.5', '4.5+'], ['4', '4.0+']] as const

async function Results({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
  const sp = await searchParams
  const p = { q: one(sp.q)?.trim() ?? '', loc: one(sp.loc)?.trim() ?? '', sort: one(sp.sort) ?? '', rating: one(sp.rating) ?? '' }
  const page = Math.max(1, Math.floor(Number(one(sp.page))) || 1)
  const href = (o: Partial<typeof p> & { page?: number }) =>
    `/search?${new URLSearchParams(Object.entries({ ...p, ...o }).filter(([, v]) => v).map(([k, v]) => [k, String(v)]))}`

  const head = (
    <section className="search-head ruled">
      <div className="wrap"><Sentence q={p.q} loc={p.loc} /></div>
    </section>
  )

  if (!p.q && !p.loc && !p.sort) {
    return (
      <>
        {head}
        <Enquiries />
      </>
    )
  }

  const { results, total } = await search({ ...p, page })
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const what = [p.q && `“${p.q}”`, p.loc && `in ${p.loc}`].filter(Boolean).join(' ')

  return (
    <>
      {head}
      <div className="wrap">
        <div className="orderbar">
          <span><b className="num">{num(total)}</b> {total === 1 ? 'entry' : 'entries'} {what}</span>
          <nav aria-label="Order by">
            <span>Order by</span>
            {SORTS.map(([v, label]) => <Link key={v} href={href({ sort: v, page: 1 })} aria-current={p.sort === v || undefined}>{label}</Link>)}
            <span>Rating</span>
            {RATINGS.map(([v, label]) => <Link key={v} href={href({ rating: v, page: 1 })} aria-current={p.rating === v || undefined}>{label}</Link>)}
          </nav>
        </div>
        {results.length ? (
          <div className="entries" style={{ paddingBottom: 64 }}>
            {results.map((b, i) => <Entry key={b.key} b={b} n={(page - 1) * PAGE_SIZE + i + 1} showCity />)}
            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                {page > 1 ? <Link href={href({ page: page - 1 })} className="btn btn-sm">← Previous</Link> : <span />}
                <span>Page {page} of {num(pages)}</span>
                {page < pages ? <Link href={href({ page: page + 1 })} className="btn btn-sm">Next →</Link> : <span />}
              </nav>
            )}
          </div>
        ) : (
          <div className="empty">
            <h2>No entries match.</h2>
            <p>Try a broader trade, or leave the place blank to search every city.</p>
          </div>
        )}
      </div>
    </>
  )
}

// Before a search: sample enquiries written out on ruled paper, with notes in the margin on how to ask.
async function Enquiries() {
  const samples = await getSampleLists(10)
  return (
    <section className="sec">
      <div className="wrap enquiry">
        <div>
          <h2 className="eyebrow">Sample enquiries</h2>
          <ol className="enquiries">
            {samples.map(l => (
              <li key={`${l.city}/${l.category}`}>
                <Link href={`/${l.city}/${l.category}`}>
                  <span>Find <em>{plural(l.trade)}</em> in <em>{l.cityName}</em></span>
                  <span className="num">{l.count} entries →</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <dl className="notes">
          <dt>Note 1 · What</dt>
          <dd>A trade, like “dentist” or “car repair”, or part of a business name.</dd>
          <dt>Note 2 · Where</dt>
          <dd>A city, neighbourhood or street. Leave it blank to search every city.</dd>
          <dt>Note 3 · Order</dt>
          <dd>Results come ranked by standing. Reorder them by rating or by number of reviews.</dd>
          <dt>Or browse</dt>
          <dd><Link href="/categories">The index of trades</Link> · <Link href="/cities">the gazetteer of cities</Link></dd>
        </dl>
      </div>
    </section>
  )
}
