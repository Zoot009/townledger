import type { Metadata } from 'next'
import Link from 'next/link'
import { Crumbs } from '@/components/ui'
import { getCategoryGroups } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Index of trades',
  description: 'Every trade in the register, chapter by chapter, with how many local businesses and city lists each has.',
  alternates: { canonical: '/categories' },
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']
const roman = (i: number) => ROMAN[i] ?? String(i + 1)

// The register as a book: each group of trades is a chapter, biggest first, with a contents column.
export default async function CategoriesPage() {
  const groups = await getCategoryGroups()
  const trades = groups.flatMap(g => g.niches).length
  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'Trades' }]} />
          <p className="eyebrow">Index · {trades} trades in {groups.length} chapters</p>
          <h1>Index of trades</h1>
          <p className="lede">The register, chapter by chapter. Choose a trade to see every city where it has a ranked list.</p>
        </div>
      </section>
      <div className="wrap listing">
        <aside className="contents">
          <h2>Chapters</h2>
          <ul>
            {groups.map((g, i) => (
              <li key={g.slug}><a href={`#${g.slug}`}><span className="roman">{roman(i)}</span>{g.name}<span className="num">{g.niches.length}</span></a></li>
            ))}
          </ul>
        </aside>
        <div>
          {groups.map((g, i) => (
            <section key={g.slug} id={g.slug} className="chapter">
              <header className="chapter-head">
                <span className="chapter-no"><small>Chapter</small>{roman(i)}</span>
                <h2>{g.name}</h2>
                <p>{g.niches.length} {g.niches.length === 1 ? 'trade' : 'trades'} · {num(g.niches.reduce((s, n) => s + n.count, 0))} entries</p>
              </header>
              <table className="register">
                <thead><tr><th>Trade</th><th className="r hide-sm">Cities with a list</th><th className="r">Entries</th></tr></thead>
                <tbody>
                  {[...g.niches].sort((a, b) => b.count - a.count).map(n => (
                    <tr key={n.slug}>
                      <td><Link href={`/categories/${n.slug}`} className="name">{cap(plural(n.name))}</Link></td>
                      <td className="r num hide-sm">{n.lists}</td>
                      <td className="r num">{num(n.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
