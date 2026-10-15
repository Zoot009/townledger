export type Business = {
  key: string
  slug: string
  title: string
  place_id?: string
  city: string // "Pune, Maharashtra"
  cityId: string
  citySlug: string
  area?: string
  areaSlug?: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviews: number
  score: number // rating weighted by review count, for "best of" ordering
  price?: string
  type?: string
  categories: string[] // Google's own types, for display
  niches: string[] // our categories this business is listed under
  nicheSlugs: string[]
  description?: string
  user_review?: string
  operating_hours?: Record<string, string>
  service_options?: Record<string, boolean>
  extensions?: Record<string, string[]>[]
  gps_coordinates?: { latitude: number; longitude: number }
  thumbnail?: string
  unclaimed_listing?: boolean
}

export type Listing = { city: string; citySlug: string; niche: string; nicheSlug: string; items: Business[] }
export type AreaCount = { name: string; slug: string; count: number }
export type City = { id: string; name: string; label: string; slug: string; country: string; countryCode: string; count: number; categories: number }
export type CategoryCount = { name: string; slug: string; count: number; group: string; top?: string; lists?: number }
export type CategoryGroup = { name: string; slug: string; niches: CategoryCount[] }
