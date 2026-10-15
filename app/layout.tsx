import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Mono, Public_Sans } from 'next/font/google'
import { Footer, Header } from '@/components/ui'
import { SITE } from '@/lib/site'
import './globals.css'

// Serif display, civic grotesk for text, mono for record data. Extra subsets cover names like Kraków and Hoàn Kiếm.
const serif = Fraunces({ variable: '--f-serif', subsets: ['latin', 'latin-ext', 'vietnamese'], style: ['normal', 'italic'], axes: ['SOFT', 'opsz'] })
const sans = Public_Sans({ variable: '--f-sans', subsets: ['latin', 'latin-ext', 'vietnamese'] })
const mono = IBM_Plex_Mono({ variable: '--f-mono', subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: 'Names, addresses, telephone numbers, opening hours and ratings for local businesses, kept in one consistent format.',
  openGraph: { siteName: SITE.name, type: 'website' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
