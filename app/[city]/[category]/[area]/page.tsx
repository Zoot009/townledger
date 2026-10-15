import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListingView } from '@/components/ui'
import { getAreaListing, getTopAreaListings } from '@/lib/data'
import { cap, cityName, plural } from '@/lib/utils'

export async function generateStaticParams() {
  return getTopAreaListings(20)
}

export async function generateMetadata({ params }: PageProps<'/[city]/[category]/[area]'>): Promise<Metadata> {
  const { city, category, area } = await params
  const r = await getAreaListing(city, category, area)
  if (!r) return {}
  return {
    title: `${cap(plural(r.listing.niche))} in ${r.area.name}, ${cityName(r.listing.city)}`,
    description: `${r.items.length} ${plural(r.listing.niche)} in ${r.area.name}, ${r.listing.city}, with addresses, telephone numbers and ratings.`,
    alternates: { canonical: `/${city}/${category}/${area}` },
  }
}

export default async function AreaPage({ params }: PageProps<'/[city]/[category]/[area]'>) {
  const { city, category, area } = await params
  const r = await getAreaListing(city, category, area)
  if (!r) notFound()
  return <ListingView citySlug={city} nicheSlug={category} niche={r.listing.niche} city={r.listing.city} items={r.items} areas={r.areas} area={r.area} />
}
