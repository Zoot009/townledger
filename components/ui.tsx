import Link from 'next/link'
import { TradeTyper } from './client'
import type { ReactNode } from 'react'
import { getCategoryCities, getCategoryGroups, getCities, getCityCategories, getPopularNiches, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { AreaCount, Business } from '@/lib/types'
import { cap, cityName, hostname, num, photoSize, plural, recordNo, safeUrl, telHref } from '@/lib/utils'

// Ruled ledger paper with a margin line: the mark, the favicon (app/icon.svg) and the masthead share it.
export function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="2" fill="#8a1c2c" />
      <path d="M10 5v22" stroke="#fff" strokeWidth="1.5" />
      <path d="M6 11h20M6 16h20M6 21h14" stroke="#fff" strokeWidth="2" strokeLinecap="square" />
    </svg>
  )
}

export async function Header() {
  const [t, cities, groups] = await Promise.all([getTotals(), getCities(), getCategoryGroups()])
  return (
    <header>
      <div className="strip">
        <div className="wrap">
          <span>Register of {num(t.businesses)} local businesses<span className="hide-sm"> · {num(t.reviews)} reviews counted</span></span>
          <span className="hide-sm">{cities.length} cities · {groups.reduce((s, g) => s + g.niches.length, 0)} trades</span>
        </div>
      </div>
      <div className="masthead">
        <div className="wrap">
          <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
            <Logo />
            <span><b>{SITE.name}</b><small>Local business register</small></span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Link href="/cities">Cities</Link>
            <Link href="/categories">Trades</Link>
            <Link href="/search">Search</Link>
            <Link href="/about">About the register</Link>
          </nav>
          <Link href="/add-a-business" className="btn btn-accent btn-sm">File your listing</Link>
        </div>
      </div>
    </header>
  )
}

export async function Footer() {
  const [cities, trades] = await Promise.all([getCities(), getPopularNiches(6)])
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand"><Logo size={32} /><b>{SITE.name}</b></Link>
            <p className="footer-blurb">
              {SITE.tagline}. Names, addresses, telephone numbers and hours, kept in one consistent format and free to consult.
            </p>
          </div>
          <nav aria-label="Most consulted cities">
            <h2>Cities</h2>
            <ul>{cities.slice(0, 6).map(c => <li key={c.slug}><Link href={`/${c.slug}`}>{c.name}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Popular trades">
            <h2>Trades</h2>
            <ul>{trades.map(n => <li key={n.slug}><Link href={`/categories/${n.slug}`}>{cap(plural(n.name))}</Link></li>)}</ul>
          </nav>
          <nav aria-label="The register">
            <h2>The register</h2>
            <ul>
              <li><Link href="/cities">All cities</Link></li>
              <li><Link href="/categories">Index of trades</Link></li>
              <li><Link href="/add-a-business">File your listing</Link></li>
              <li><Link href="/about">How entries are kept</Link></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            </ul>
          </nav>
        </div>
        <div className="colophon">
          <span>© {SITE.name}. Compiled from public sources. Confirm details with the business before you visit.</span>
          <span>Set in Fraunces, Public Sans &amp; IBM Plex Mono</span>
        </div>
      </div>
    </footer>
  )
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((c, i) => (
          <li key={i}>{c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>
        ))}
      </ol>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href && { item: `${SITE.url}${c.href}` }) })),
      }} />
    </nav>
  )
}

export function SecHead({ mark, title, sub, href, linkText = 'See all' }: { mark: string; title: string; sub?: ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="sec-head">
      <span className="sec-mark">§ {mark}</span>
      <h2>{title}</h2>
      {href ? <Link href={href} className="link-arrow">{linkText} →</Link> : <span />}
      {sub && <p>{sub}</p>}
    </div>
  )
}

// "Find [a dentist] in [Pune] →". Native datalists suggest trades and cities; free text works too.
export async function Sentence({ q, loc, small }: { q?: string; loc?: string; small?: boolean }) {
  const [trades, cities] = await Promise.all([getPopularNiches(200), getCities()])
  // "a restaurant", "an accountant"…: plain lower-case trades short enough for the field (custom Title Case ones read oddly).
  const examples = trades
    .filter(n => n.name === n.name.toLowerCase())
    .map(n => `${/^[aeiou]/.test(n.name) ? 'an' : 'a'} ${n.name}`)
    .filter(e => e.length <= 16)
    .slice(0, 12)
  return (
    <form action="/search" className={`sentence${small ? ' sentence-sm' : ''}`} role="search">
      <span>Find</span>
      <TradeTyper examples={examples} defaultValue={q} />
      <span>in</span>
      <input name="loc" defaultValue={loc} placeholder="any city" list="dl-places" aria-label="Where?" autoComplete="off" />
      <button className="btn btn-accent">Search the register →</button>
      <datalist id="dl-trades">{trades.map(n => <option key={n.slug} value={cap(n.name)} />)}</datalist>
      <datalist id="dl-places">{cities.map(c => <option key={c.slug} value={c.name}>{c.country}</option>)}</datalist>
    </form>
  )
}

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so scraped text can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function Plate({ b, size = 240, eager, caption }: { b: Business; size?: number; eager?: boolean; caption?: string }) {
  const src = safeUrl(b.thumbnail)
  const initials = b.title.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <figure className="plate" style={{ margin: 0 }}>
      {src
        // Plain img: Google photos are already sized by their URL (photoSize).
        ? <img src={photoSize(src, size, size)} alt={b.title} width={size} height={size} loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
        : <span className="mono-gram" aria-hidden="true">{initials || '§'}</span>}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function Meter({ rating }: { rating?: number }) {
  return <span className="meter" aria-hidden="true"><span style={{ width: `${((rating ?? 0) / 5) * 100}%` }} /></span>
}

// Name, address, telephone: the three facts a citation has to get right.
export function Nap({ b }: { b: Business }) {
  const web = safeUrl(b.website)
  return (
    <dl className="fields">
      <dt>Address</dt><dd>{b.address}</dd>
      {b.phone && <><dt>Telephone</dt><dd className="num"><a href={telHref(b.phone)}>{b.phone}</a></dd></>}
      {web && <><dt>Web</dt><dd><a href={web} rel="nofollow noopener" target="_blank">{hostname(web)}</a></dd></>}
    </dl>
  )
}

export function Entry({ b, n, showCity }: { b: Business; n: number; showCity?: boolean }) {
  const trade = b.categories[0] ?? cap(b.niches[0] ?? '')
  const where = [b.area, showCity ? cityName(b.city) : undefined].filter(Boolean).join(', ')
  return (
    <article className="entry" id={`e-${n}`}>
      <div className="entry-no">No.<b>{n}</b></div>
      <Link href={`/biz/${b.slug}`} className="entry-plate" tabIndex={-1} aria-hidden="true"><Plate b={b} /></Link>
      <div>
        <h3><Link href={`/biz/${b.slug}`}>{b.title}</Link></h3>
        <p className="trade">{[trade, where].filter(Boolean).join(' · ')}<span className="mono"> · {recordNo(b.key)}</span></p>
        <Nap b={b} />
        {b.user_review && <p className="quote">{b.user_review.replace(/^"|"$/g, '')}</p>}
      </div>
      <div className="standing">
        {b.rating ? <span className="score">{b.rating.toFixed(1)}<small>/5</small></span> : <span className="score muted">—</span>}
        <Meter rating={b.rating} />
        <span className="meta">{b.reviews ? `${num(b.reviews)} reviews` : 'No reviews yet'}</span>
        <Link href={`/biz/${b.slug}`} className="btn btn-sm">Full record</Link>
      </div>
    </article>
  )
}

// "Dentists in Pune" and "Dentists in Kothrud, Pune": the ranked entries with a contents column.
export async function ListingView({ citySlug, nicheSlug, niche, city, items, areas, area }: {
  citySlug: string; nicheSlug: string; niche: string; city: string; items: Business[]; areas: AreaCount[]; area?: AreaCount
}) {
  const [cityTrades, elsewhere] = await Promise.all([getCityCategories(citySlug), getCategoryCities(nicheSlug)])
  const place = area ? `${area.name}, ${cityName(city)}` : cityName(city)
  const title = `${cap(plural(niche))} in ${place}`
  const base = `/${citySlug}/${nicheSlug}`
  const rated = items.filter(b => b.rating)
  const avg = rated.length ? rated.reduce((s, b) => s + b.rating!, 0) / rated.length : 0
  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[
            { name: 'Register', href: '/' }, { name: cityName(city), href: `/${citySlug}` },
            ...(area ? [{ name: cap(plural(niche)), href: base }, { name: area.name }] : [{ name: cap(plural(niche)) }]),
          ]} />
          <p className="eyebrow">Register extract · {items.length} entries · ranked by standing</p>
          <h1>{title}</h1>
          <p className="lede">
            {items.length} {plural(niche)} on record in {place}{avg ? `, averaging ${avg.toFixed(1)} out of 5` : ''}. Ranked by standing:
            each rating weighed against how many people gave it.
          </p>
        </div>
      </section>
      <div className="wrap listing">
        <aside className="contents">
          <div className="toc">
            <h2>Contents</h2>
            <ol>{items.slice(0, 40).map((b, i) => <li key={b.key}><a href={`#e-${i + 1}`}>{b.title}</a></li>)}</ol>
          </div>
          {areas.length > 0 && (
            <>
              <h2>By neighbourhood</h2>
              <ul>
                {area && <li><Link href={base}>All of {cityName(city)}</Link></li>}
                {areas.map(a => (
                  <li key={a.slug}>
                    <Link href={`${base}/${a.slug}`} aria-current={a.slug === area?.slug ? 'page' : undefined}>
                      {a.name}<span className="num">{a.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
        <div>
          <div className="entries">{items.map((b, i) => <Entry key={b.key} b={b} n={i + 1} />)}</div>
          <div className="related">
            <div>
              <h2>Other trades in {cityName(city)}</h2>
              <ul className="inline-list">
                {cityTrades.filter(t => t.slug !== nicheSlug).slice(0, 24).map(t => (
                  <li key={t.slug}><Link href={`/${citySlug}/${t.slug}`}>{cap(plural(t.name))}</Link><span className="num">{t.count}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{cap(plural(niche))} elsewhere</h2>
              <ul className="inline-list">
                {elsewhere.filter(c => c.slug !== citySlug).slice(0, 24).map(c => (
                  <li key={c.slug}><Link href={`/${c.slug}/${nicheSlug}`}>{c.name}</Link><span className="num">{c.count}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/biz/${b.slug}`, name: b.title })),
      }} />
    </>
  )
}

