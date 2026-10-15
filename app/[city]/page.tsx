import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crumbs, Entry, SecHead, Sentence } from '@/components/ui'
import { getCities, getCity, getCityAreas, getCityCategories, getTopRated } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

// The busiest cities are built ahead of time; the rest render on their first visit and are then cached.
export async function generateStaticParams() {
  return (await getCities()).slice(0, 40).map(c => ({ city: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[city]'>): Promise<Metadata> {
  const c = await getCity((await params).city)
  if (!c) return {}
  return {
    title: `Local businesses in ${c.name}`,
    description: `${num(c.count)} local businesses on record in ${c.label}, across ${c.categories} trades: addresses, telephone numbers, hours and ratings.`,
    alternates: { canonical: `/${c.slug}` },
  }
}

export default async function CityPage({ params }: PageProps<'/[city]'>) {
  const c = await getCity((await params).city)
  if (!c) notFound()
  const [trades, areas, top] = await Promise.all([getCityCategories(c.slug), getCityAreas(c.slug), getTopRated(6, c.slug)])

  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'Cities', href: '/cities' }, { name: c.name }]} />
          <p className="eyebrow">Gazetteer entry · {c.country}</p>
          <h1>{c.name}</h1>
          <p className="lede">{c.label} · {num(c.count)} businesses on record in {trades.length} trades.</p>
          <Sentence loc={c.name} small />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="1" title={`Trades in ${c.name}`} sub="Each list is ranked by standing. The leading entry is shown alongside." />
          <table className="register">
            <thead><tr><th>Trade</th><th className="hide-sm">Leading entry</th><th className="r">Entries</th></tr></thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.slug}>
                  <td><Link href={`/${c.slug}/${t.slug}`} className="name">{cap(plural(t.name))}</Link><span className="sub">{t.group}</span></td>
                  <td className="hide-sm">{t.top}</td>
                  <td className="r num">{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead mark="2" title="Neighbourhoods" sub={`Search the register by locality within ${c.name}.`} />
            <ul className="inline-list">
              {areas.map(a => (
                <li key={a.slug}><Link href={`/search?loc=${encodeURIComponent(`${a.name}, ${c.name}`)}`}>{a.name}</Link><span className="num">{a.count}</span></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {top.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead mark={areas.length ? '3' : '2'} title={`Highest standing in ${c.name}`} href={`/search?loc=${encodeURIComponent(c.name)}&sort=rating`} linkText="More" />
            <div className="entries">{top.map((b, i) => <Entry key={b.key} b={b} n={i + 1} />)}</div>
          </div>
        </section>
      )}
    </>
  )
}
