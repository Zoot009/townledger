import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CopyButton } from '@/components/client'
import { Crumbs, JsonLd, Meter, Plate } from '@/components/ui'
import { getBusiness, getListing, getSimilar, getTopRated } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { Business } from '@/lib/types'
import { cap, cityName, directionsUrl, featureLabel, hostname, mapEmbedUrl, num, plural, recordNo, safeUrl, telHref } from '@/lib/utils'

export async function generateStaticParams() {
  return (await getTopRated(40)).map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: PageProps<'/biz/[slug]'>): Promise<Metadata> {
  const b = await getBusiness((await params).slug)
  if (!b) return {}
  const where = [b.area, cityName(b.city)].filter(Boolean).join(', ')
  return {
    title: `${b.title}, ${b.categories[0] ?? cap(b.niches[0] ?? 'business')} in ${where}`,
    description: `${b.title}, ${b.address}.${b.phone ? ` Telephone ${b.phone}.` : ''} Opening hours, rating and directions.`,
    alternates: { canonical: `/biz/${b.slug}` },
  }
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Google's extras ([{ accessibility: [...] }, ...]) plus yes/no service options, as labelled groups. The scraped data repeats
// itself (service_options in both places, "Wi-Fi" twice), so groups and items are merged by name.
function amenities(b: Business) {
  const groups = new Map<string, Map<string, boolean>>()
  const add = (group: string, label: string, yes: boolean) => groups.set(group, (groups.get(group) ?? new Map()).set(label, yes))
  for (const [k, v] of Object.entries(b.service_options ?? {})) add('Service options', featureLabel(k), v)
  for (const ext of b.extensions ?? []) {
    for (const [k, v] of Object.entries(ext)) if (Array.isArray(v)) v.forEach(label => add(featureLabel(k), String(label), true))
  }
  return [...groups].map(([name, items]) => ({ name, items: [...items].map(([label, yes]) => ({ label, yes })) }))
}

export default async function BusinessPage({ params }: PageProps<'/biz/[slug]'>) {
  const b = await getBusiness((await params).slug)
  if (!b) notFound()
  const [listing, similar] = await Promise.all([b.nicheSlugs[0] ? getListing(b.citySlug, b.nicheSlugs[0]) : undefined, getSimilar(b)])
  const rank = listing ? listing.items.findIndex(x => x.key === b.key) + 1 : 0
  const city = cityName(b.city)
  const trade = b.categories[0] ?? cap(b.niches[0] ?? '')
  const web = safeUrl(b.website)
  const hours = Object.fromEntries(Object.entries(b.operating_hours ?? {}).map(([d, h]) => [d.toLowerCase(), h]))
  const days = DAYS.filter(d => hours[d])
  const extras = amenities(b)
  const citation = [b.title, b.address, b.phone, web].filter(Boolean).join('\n')
  const mapQuery = b.gps_coordinates ? `${b.gps_coordinates.latitude},${b.gps_coordinates.longitude}` : `${b.title}, ${b.address}`
  const id = recordNo(b.key)

  return (
    <>
      <div className="ruled">
        <div className="wrap record-head">
          <div>
            <Crumbs items={[
              { name: 'Register', href: '/' }, { name: city, href: `/${b.citySlug}` },
              ...(listing ? [{ name: cap(plural(listing.niche)), href: `/${b.citySlug}/${listing.nicheSlug}` }] : []),
              { name: b.title },
            ]} />
            <h1>{b.title}</h1>
            <p className="trade">{trade} in {[b.area, b.city].filter(Boolean).join(', ')}</p>
            <p className="record-no">
              <span>Record <b>{id}</b></span>
              {rank > 0 && listing && <span>No. {rank} of {listing.items.length} {plural(listing.niche)} in {city}</span>}
              {b.unclaimed_listing && <span>Not yet claimed by its owner</span>}
            </p>
            <div className="actions">
              {b.phone && <a href={telHref(b.phone)} className="btn btn-accent">Call {b.phone}</a>}
              {web && <a href={web} className="btn" rel="nofollow noopener" target="_blank">Visit {hostname(web)}</a>}
              <a href={directionsUrl(b.address, b.place_id)} className="btn" rel="noopener" target="_blank">Directions</a>
            </div>
          </div>
          <Plate b={b} size={600} eager caption={b.thumbnail ? 'Plate I · as listed on Google Maps' : undefined} />
        </div>
      </div>

      <div className="wrap record-body">
        <section className="part">
          <h2>Citation<small>Name, address and telephone, the way they should read everywhere.</small></h2>
          <div className="citation">
            <b>{b.title}</b><br />
            {b.address}
            {b.phone && <><br /><span className="num" style={{ fontSize: '0.85em' }}>{b.phone}</span></>}
            {web && <><br /><span style={{ fontSize: '0.85em' }}>{hostname(web)}</span></>}
            <CopyButton text={citation} />
          </div>
        </section>

        <section className="part">
          <h2>Particulars</h2>
          <dl className="fields">
            <dt>Trade</dt><dd>{trade}</dd>
            {b.categories.length > 1 && <><dt>Also</dt><dd>{b.categories.slice(1).join(', ')}</dd></>}
            {b.area && <><dt>Locality</dt><dd>{b.area}</dd></>}
            <dt>City</dt><dd><Link href={`/${b.citySlug}`}>{b.city}</Link></dd>
            <dt>Address</dt><dd>{b.address}</dd>
            {b.phone && <><dt>Telephone</dt><dd className="num"><a href={telHref(b.phone)}>{b.phone}</a></dd></>}
            {web && <><dt>Website</dt><dd><a href={web} rel="nofollow noopener" target="_blank">{hostname(web)}</a></dd></>}
            {b.price && <><dt>Price</dt><dd>{b.price}</dd></>}
            {b.gps_coordinates && <><dt>Position</dt><dd className="num">{b.gps_coordinates.latitude.toFixed(5)}, {b.gps_coordinates.longitude.toFixed(5)}</dd></>}
            <dt>Record</dt><dd className="num">{id}</dd>
          </dl>
        </section>

        {days.length > 0 && (
          <section className="part">
            <h2>Hours<small>As published by the business. Holidays may differ.</small></h2>
            <table className="hours">
              <tbody>{days.map(d => <tr key={d}><th scope="row">{cap(d)}</th><td>{hours[d]}</td></tr>)}</tbody>
            </table>
          </section>
        )}

        <section className="part">
          <h2>Standing</h2>
          <div>
            <div className="big-score">
              <span className="score">{b.rating ? b.rating.toFixed(1) : '—'}</span>
              <div>
                <Meter rating={b.rating} />
                <p style={{ marginTop: 10 }}>
                  {b.rating ? <>Out of 5, from {num(b.reviews)} {b.reviews === 1 ? 'review' : 'reviews'} on Google.</> : 'No ratings yet.'}
                  {rank > 0 && listing && <> Ranked <b>No. {rank}</b> of {listing.items.length} {plural(listing.niche)} in {city}.</>}
                </p>
              </div>
            </div>
            {b.user_review && (
              <figure className="pull" style={{ marginInline: 0 }}>
                <blockquote style={{ margin: 0 }}>{b.user_review.replace(/^"|"$/g, '')}</blockquote>
                <figcaption>A Google reviewer</figcaption>
              </figure>
            )}
          </div>
        </section>

        {b.description && (
          <section className="part">
            <h2>About</h2>
            <div className="prose"><p>{b.description}</p></div>
          </section>
        )}

        {extras.length > 0 && (
          <section className="part">
            <h2>Amenities</h2>
            <div className="checks">
              {extras.map(g => (
                <div key={g.name}>
                  <h3>{g.name}</h3>
                  <ul>{g.items.map(i => <li key={i.label} className={i.yes ? undefined : 'no'}>{i.label}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="part">
          <h2>Location</h2>
          <div>
            <iframe className="map" src={mapEmbedUrl(mapQuery)} title={`Map of ${b.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <p className="map-note">
              <span>{b.address}</span>
              <a href={directionsUrl(b.address, b.place_id)} rel="noopener" target="_blank">Get directions →</a>
            </p>
          </div>
        </section>

        {similar.length > 0 && (
          <section className="part">
            <h2>Nearby entries<small>Same trade in {city}, closest locality first.</small></h2>
            <ul className="compact">
              {similar.map(s => (
                <li key={s.key}>
                  <Link href={`/biz/${s.slug}`}>
                    <span><b>{s.title}</b><small>{[s.area, s.address].filter(Boolean)[0]}</small></span>
                    <span className="num">{s.rating?.toFixed(1) ?? '—'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE.url}/biz/${b.slug}`,
        name: b.title,
        url: `${SITE.url}/biz/${b.slug}`,
        ...(web && { sameAs: [web] }),
        ...(b.phone && { telephone: b.phone }),
        ...(safeUrl(b.thumbnail) && { image: safeUrl(b.thumbnail) }),
        ...(b.price && { priceRange: b.price }),
        ...(b.description && { description: b.description }),
        address: { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: city },
        ...(b.gps_coordinates && { geo: { '@type': 'GeoCoordinates', latitude: b.gps_coordinates.latitude, longitude: b.gps_coordinates.longitude } }),
        ...(b.rating && b.reviews && { aggregateRating: { '@type': 'AggregateRating', ratingValue: b.rating, reviewCount: b.reviews, bestRating: 5 } }),
      }} />
    </>
  )
}
