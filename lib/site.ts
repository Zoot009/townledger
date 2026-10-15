export const SITE = {
  name: 'Townledger',
  tagline: 'The public record of local business',
  url: (process.env.SITE_URL ?? 'https://www.townledger.com').replace(/\/$/, ''),
  email: 'records@townledger.com',
}

// Stamped on listing requests, so the Control Center publishes them on this website.
export const SITE_DOMAIN = new URL(SITE.url).hostname.replace(/^www\./, '')

// Thin pages hurt the whole site (Google's "scaled content" policy), so only publish pages with enough listings.
export const MIN_CATEGORY_LISTINGS = 5 // per city + category page
export const MIN_AREA_LISTINGS = 3 // per city + category + area page
export const PAGE_SIZE = 12
