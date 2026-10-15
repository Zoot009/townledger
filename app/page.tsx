import Link from 'next/link'
import { JsonLd, Meter, Nap, SecHead, Sentence } from '@/components/ui'
import { getCategoryGroups, getCities, getPopularNiches, getSampleLists, getTopRated, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { City } from '@/lib/types'
import { cap, cityName, num, plural, recordNo } from '@/lib/utils'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const pct = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`

export default async function Home() {
  const [t, cities, trades, groups, top, shortcuts] = await Promise.all([
    getTotals(), getCities(), getPopularNiches(24), getCategoryGroups(), getTopRated(11), getSampleLists(4),
  ])
  const tradeCount = groups.reduce((s, g) => s + g.niches.length, 0)
  const [specimen, ...ranked] = top
  const maxReviews = Math.max(1, ...ranked.map(b => b.reviews))

  return (
    <>
      <section className="hero ruled">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">The public register of local business</p>
            <h1 className="display">Every local business, <em className="ink">on the record.</em></h1>
            <p className="lede">
              Addresses, telephone numbers, opening hours and standing for {num(t.businesses)} businesses in {cities.length} cities,
              kept in one consistent format and free to consult.
            </p>
            <Sentence />
            <p className="often">
              Try:{' '}
              {shortcuts.map((l, i) => (
                <span key={`${l.city}/${l.category}`}>
                  <Link href={`/${l.city}/${l.category}`}>{cap(plural(l.trade))} in {l.cityName}</Link>
                  {i < shortcuts.length - 1 && ' · '}
                </span>
              ))}
            </p>
          </div>

          {specimen && (
            <article className="specimen" aria-label="Specimen entry">
              <div className="specimen-top"><span>Specimen entry</span><span>{recordNo(specimen.key)}</span></div>
              <div className="stamp" aria-hidden="true"><span>On<b>Record</b>{SITE.name}</span></div>
              <h3><Link href={`/biz/${specimen.slug}`}>{specimen.title}</Link></h3>
              <p className="trade">{specimen.categories[0]} · {cityName(specimen.city)}</p>
              <Nap b={specimen} />
              <div className="specimen-foot">
                <span>
                  <span className="num" style={{ fontSize: 22 }}>{specimen.rating?.toFixed(1)}</span>
                  <span className="muted mono" style={{ fontSize: 12 }}> /5 · {num(specimen.reviews)} reviews</span>
                  <Meter rating={specimen.rating} />
                </span>
                <Link href={`/biz/${specimen.slug}`} className="link-arrow">Full record →</Link>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="1" title="The register in figures" />
          <div className="figures">
            <div className="fig"><b>{compact.format(t.businesses)}</b><span>Entries</span></div>
            <div className="fig"><b>{cities.length}</b><span>Cities</span></div>
            <div className="fig"><b>{tradeCount}</b><span>Trades</span></div>
            <div className="fig"><b>{compact.format(t.reviews)}</b><span>Reviews counted</span></div>
            <div className="fig"><b>{pct(t.phones, t.businesses)}</b><span>With a telephone</span></div>
            <div className="fig"><b>{pct(t.websites, t.businesses)}</b><span>With a website</span></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="2" title="Index of trades" sub="The most-listed trades, filed A to Z. Pull a drawer to see every city where it has a list." href="/categories" linkText={`All ${tradeCount} trades`} />
          <div className="cabinet">
            <p className="cabinet-plate" aria-hidden="true"><span>Card catalogue</span><span>Trades A–Z</span></p>
            {[...trades].sort((x, y) => x.name.localeCompare(y.name)).map((t, i) => (
              <Link key={t.slug} href={`/categories/${t.slug}`} className="drawer">
                <span className="drawer-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="drawer-label"><b>{cap(plural(t.name))}</b><small>{num(t.count)} cards</small></span>
                <span className="drawer-pull" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="3" title="Highest standing" sub="The best-regarded entries across the register: high ratings from many reviewers." href="/search?sort=rating" linkText="Search by rating" />
          <table className="register reveal">
            <thead>
              <tr><th>No.</th><th>Entry</th><th className="hide-sm">City</th><th className="hide-sm">Telephone</th><th className="r">Rating</th></tr>
            </thead>
            <tbody>
              {ranked.map((b, i) => (
                <tr key={b.key}>
                  <td className="idx">{String(i + 1).padStart(2, '0')}</td>
                  <td><Link href={`/biz/${b.slug}`} className="name">{b.title}</Link><span className="sub">{b.categories[0]}{b.area ? ` · ${b.area}` : ''}</span></td>
                  <td className="hide-sm"><Link href={`/${b.citySlug}`}>{cityName(b.city)}</Link></td>
                  <td className="hide-sm num">{b.phone ?? '—'}</td>
                  <td className="r">
                    <span className="num">{b.rating?.toFixed(1)}</span><span className="sub num">{num(b.reviews)} reviews</span>
                    <span className="weight" aria-hidden="true"><span style={{ width: `${(b.reviews / maxReviews) * 100}%` }} /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="4" title="Gazetteer" sub="The busiest cities in the register, each stamped with its number of entries." href="/cities" linkText={`All ${cities.length} cities`} />
          <div className="postmarks">
            <InkFilter />
            {cities.slice(0, 12).map((c, i) => <Postmark key={c.slug} c={c} n={i + 1} />)}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="5" title="How the register is kept" />
          <dl className="method">
            <dt>Note 1<b>One format</b></dt>
            <dd>Every entry carries the same particulars in the same order: name, address, telephone, website, hours. Consistent details are what customers, maps and search engines rely on.</dd>
            <dt>Note 2<b>Ranked by standing</b></dt>
            <dd>A perfect score from three reviewers shouldn’t outrank a 4.7 from nine hundred. Lists are ordered by each rating weighed against how many people gave it.</dd>
            <dt>Note 3<b>Corrected by hand</b></dt>
            <dd>Owners can file a missing business. Each request is read by a person before it is published; nothing is added automatically.</dd>
          </dl>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="slip">
            <div>
              <p className="eyebrow">Form TL-1 · Listing request</p>
              <h2>Is your business on the record?</h2>
              <p>Add it in a few minutes. Free, checked by a person, and published with your name, address and telephone exactly as you give them.</p>
            </div>
            <Link href="/add-a-business" className="btn btn-accent">File your listing →</Link>
          </div>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url,
        potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/search?q={q}`, 'query-input': 'required name=q' },
      }} />
    </>
  )
}

// Worn-ink texture shared by every postmark: noise punches small gaps in the strokes, like a rubber stamp.
function InkFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="pm-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.75" result="wear" />
        <feComposite in="SourceGraphic" in2="wear" operator="in" />
      </filter>
    </svg>
  )
}

// A city as a circular postmark: name around the top, country around the bottom, entries in the middle, cancellation waves.
function Postmark({ c, n }: { c: City; n: number }) {
  const top = `pm-t-${c.slug}`, bottom = `pm-b-${c.slug}`
  const waves = [54, 68, 82, 96].map(y => `M162,${y} q9,-7 18,0 t18,0 t18,0 t18,0 t18,0`).join(' ')
  // Long names are squeezed to fit their half of the ring.
  const fit = (text: string, max: number, room: number) => (text.length > max ? { textLength: room, lengthAdjust: 'spacingAndGlyphs' as const } : {})
  return (
    <Link href={`/${c.slug}`} className="postmark" aria-label={`${c.name}, ${c.country}: ${num(c.count)} entries`}>
      <svg viewBox="0 0 260 160" aria-hidden="true">
        <defs>
          <path id={top} d="M28,80 a52,52 0 1,1 104,0" />
          <path id={bottom} d="M18,80 a62,62 0 0,0 124,0" />
        </defs>
        <g filter="url(#pm-ink)">
          <circle cx="80" cy="80" r="74" />
          <circle cx="80" cy="80" r="69" className="thin" />
          <circle cx="80" cy="80" r="40" className="thin" />
          <text className="arc"><textPath href={`#${top}`} startOffset="50%" textAnchor="middle" {...fit(c.name, 17, 150)}>{c.name.toUpperCase()}</textPath></text>
          <text className="arc small"><textPath href={`#${bottom}`} startOffset="50%" textAnchor="middle" {...fit(c.country, 24, 170)}>{c.country.toUpperCase()}</textPath></text>
          <text x="80" y="82" className="count" textAnchor="middle">{num(c.count)}</text>
          <text x="80" y="98" className="label" textAnchor="middle">ENTRIES · NO.{n}</text>
          <path className="waves" d={waves} />
        </g>
      </svg>
    </Link>
  )
}
