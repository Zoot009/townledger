import type { Metadata } from 'next'
import Link from 'next/link'
import { Crumbs, SecHead } from '@/components/ui'
import { getCities, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import { num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'About the register',
  description: `How ${SITE.name} compiles, ranks and corrects its register of local businesses.`,
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [t, cities] = await Promise.all([getTotals(), getCities()])
  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'About' }]} />
          <p className="eyebrow">Colophon</p>
          <h1>About the register</h1>
          <p className="lede">
            {SITE.name} keeps {num(t.businesses)} local businesses in {cities.length} cities on record: who they are, where they are and
            how to reach them, in one consistent format.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead mark="1" title="What an entry holds" />
          <dl className="method">
            <dt>Particulars<b>Name, address, telephone</b></dt>
            <dd>
              The three facts customers, maps and search engines check against each other. Each entry also carries its website, opening hours,
              trade, locality and position where they are known.
            </dd>
            <dt>Sources<b>Public listings</b></dt>
            <dd>
              Entries are compiled from public map listings and refreshed periodically. Ratings and review counts are those published on Google;
              we don’t sell placement and we don’t accept payment for rank.
            </dd>
            <dt>Ranking<b>Standing</b></dt>
            <dd>
              Lists are ordered by standing: each rating weighed against how many people gave it, so a handful of perfect scores can’t outrank
              hundreds of very good ones. Lists with fewer than five businesses aren’t published.
            </dd>
            <dt>Corrections<b>By hand</b></dt>
            <dd>
              Owners can <Link href="/add-a-business">file a missing business</Link>. To correct an existing entry, write to{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with its record number (shown on every entry, like TL-04A7-91C2).
            </dd>
          </dl>
        </div>
      </section>
    </>
  )
}
