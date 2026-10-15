import type { Metadata } from 'next'
import { ListingForm } from '@/components/client'
import { Crumbs } from '@/components/ui'
import { getCategoryGroups, getCities } from '@/lib/data'
import { cap } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'File your listing',
  description: 'File a local business with the register. Free, and checked by hand before it is published.',
  alternates: { canonical: '/add-a-business' },
}

export default async function AddBusinessPage() {
  const [groups, cities] = await Promise.all([getCategoryGroups({ includeEmpty: true }), getCities()])
  return (
    <>
      <section className="page-head ruled">
        <div className="wrap">
          <Crumbs items={[{ name: 'Register', href: '/' }, { name: 'File your listing' }]} />
          <p className="eyebrow">Form TL-1 · Listing request · Free</p>
          <h1>File your listing</h1>
          <p className="lede">
            Give the name, address and telephone exactly as you want them to appear everywhere. A person reads every request before it is
            published, usually within a few days.
          </p>
        </div>
      </section>
      <div className="wrap">
        <div className="form-doc" style={{ paddingTop: 48 }}>
          <ListingForm
            categories={groups.flatMap(g => g.niches.map(n => cap(n.name)))}
            cities={cities.map(c => ({ name: c.name, country: c.country }))}
          />
        </div>
      </div>
    </>
  )
}
