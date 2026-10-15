import type { Metadata } from 'next'
import Link from 'next/link'
import { CityFilter } from '@/components/client'
import { Crumbs } from '@/components/ui'
import { getCities } from '@/lib/data'
import type { City } from '@/lib/types'
import { fold, num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Gazetteer of cities',
  description: 'Every city in the register, country by country, with how many local businesses each has on record.',
  alternates: { canonical: '/cities' },
}

// An atlas index: countries A to Z with a marginal letter, each country's cities running on in one line.
export default async function CitiesPage() {
  const cities = await getCities()
  const byCountry = new Map<string, City[]>()
  for (const c of cities) byCountry.set(c.country, [...(byCountry.get(c.country) ?? []), c])
  const countries = [...byCountry].sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'Cities' }]} />
          <p className="eyebrow">Gazetteer · {cities.length} cities in {countries.length} countries</p>
          <h1>Gazetteer of cities</h1>
          <p className="lede">{num(cities.reduce((s, c) => s + c.count, 0))} businesses on record. Countries run A to Z; within each, the busiest city comes first.</p>
          <CityFilter total={cities.length} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap atlas">
          {countries.map(([country, list], i) => {
            const letter = country[0].toUpperCase()
            const first = i === 0 || countries[i - 1][0][0].toUpperCase() !== letter
            return (
              <section key={country} className="atlas-row" data-country>
                <span className="atlas-letter" aria-hidden="true">{first ? letter : ''}</span>
                <h2>{country}<small>{list.length} {list.length === 1 ? 'city' : 'cities'} · {num(list.reduce((s, c) => s + c.count, 0))} entries</small></h2>
                <ul className="atlas-cities">
                  {list.map(c => (
                    <li key={c.slug} data-name={fold(`${c.name} ${c.label} ${country}`)}>
                      <Link href={`/${c.slug}`}>{c.name}</Link><sup className="num">{num(c.count)}</sup>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
          <p className="atlas-none" hidden>No city by that name in the register yet.</p>
        </div>
      </section>
    </>
  )
}
