import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crumbs } from '@/components/ui'
import { getCategory, getCategoryCities, getPopularNiches } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

export async function generateStaticParams() {
  return (await getPopularNiches(20)).map(n => ({ category: n.slug }))
}

export async function generateMetadata({ params }: PageProps<'/categories/[category]'>): Promise<Metadata> {
  const t = await getCategory((await params).category)
  if (!t) return {}
  return {
    title: `${cap(plural(t.name))} by city`,
    description: `${num(t.count)} ${plural(t.name)} on record. Choose a city for a ranked list with addresses, telephone numbers and ratings.`,
    alternates: { canonical: `/categories/${t.slug}` },
  }
}

export default async function CategoryPage({ params }: PageProps<'/categories/[category]'>) {
  const t = await getCategory((await params).category)
  if (!t) notFound()
  const cities = await getCategoryCities(t.slug)
  const name = cap(plural(t.name))
  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'Trades', href: '/categories' }, { name }]} />
          <p className="eyebrow">{t.group} · {num(t.count)} entries</p>
          <h1>{name}</h1>
          <p className="lede">{name} have a ranked list in {cities.length} {cities.length === 1 ? 'city' : 'cities'}. Choose one.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <table className="register">
            <thead><tr><th>No.</th><th>List</th><th className="r">Entries</th></tr></thead>
            <tbody>
              {cities.map((c, i) => (
                <tr key={c.slug}>
                  <td className="idx">{String(i + 1).padStart(2, '0')}</td>
                  <td><Link href={`/${c.slug}/${t.slug}`} className="name">{name} in {c.name}</Link></td>
                  <td className="r num">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
