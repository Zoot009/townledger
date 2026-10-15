import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListingView } from '@/components/ui'
import { getListing, getListingAreas, getTopListings } from '@/lib/data'
import { cap, cityName, plural } from '@/lib/utils'

export async function generateStaticParams() {
  return (await getTopListings(60)).map(l => ({ city: l.city, category: l.category }))
}

export async function generateMetadata({ params }: PageProps<'/[city]/[category]'>): Promise<Metadata> {
  const { city, category } = await params
  const l = await getListing(city, category)
  if (!l) return {}
  return {
    title: `${cap(plural(l.niche))} in ${cityName(l.city)}`,
    description: `${l.items.length} ${plural(l.niche)} in ${l.city}, ranked by standing, with addresses, telephone numbers, hours and ratings.`,
    alternates: { canonical: `/${city}/${category}` },
  }
}

export default async function ListingPage({ params }: PageProps<'/[city]/[category]'>) {
  const { city, category } = await params
  const [l, areas] = await Promise.all([getListing(city, category), getListingAreas(city, category)])
  if (!l) notFound()
  return <ListingView citySlug={city} nicheSlug={category} niche={l.niche} city={l.city} items={l.items} areas={areas} />
}
