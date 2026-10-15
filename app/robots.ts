import type { MetadataRoute } from 'next'
import { generateSitemaps } from './sitemap'
import { SITE } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    // Search is endless query-string variations: keep crawlers on the real pages.
    rules: { userAgent: '*', allow: '/', disallow: ['/search'] },
    sitemap: (await generateSitemaps()).map(({ id }) => `${SITE.url}/sitemap/${id}.xml`),
  }
}
