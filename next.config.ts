import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: true,
  // Pages await their params outside <Suspense>: an unlisted city or business renders fully on its first visit (real 404s,
  // complete HTML for crawlers), then stays cached.
  partialPrefetching: false,
}

export default nextConfig
