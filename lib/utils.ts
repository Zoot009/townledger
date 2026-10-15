export const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ'’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// "dentist" → "dentists", for "Dentists in Pune" headings. Title-cased labels and service nouns stay as they are.
export const plural = (s: string) =>
  /\s/.test(s) && s.split(/\s+/).every(w => /^[A-Z&]/.test(w)) ? s
  : /(s|repair|cleaning|care|law|massage|control|laundry)$/i.test(s) ? s
  : /(sh|ch|x)$/i.test(s) ? `${s}es`
  : /[^aeiou]y$/i.test(s) ? `${s.slice(0, -1)}ies`
  : `${s}s`

export const cityName = (city: string) => city.split(',')[0].trim()

// Lower case without accents, for matching what people type: "sao paulo" finds São Paulo.
export const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

// searchParams values can be string | string[] | undefined; we only ever want one string.
export const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

// Scraped data is untrusted: only ever emit http(s) links.
export const safeUrl = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : undefined)

// Google photo URLs end in a size such as "=w163-h92-k-no"; ask for the size we actually display.
export const photoSize = (url: string, w: number, h: number) => url.replace(/=w\d+-h\d+[^/=]*$/, `=w${w}-h${h}-k-no`)

export const hostname = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '')

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const featureLabel = (key: string) => cap(key.replace(/_/g, ' '))

export const num = (n: number) => n.toLocaleString('en-US')

// A stable record number per business, shown like a register entry: "TL-04A7-91C2". FNV-1a plus a final mix, so
// neighbouring ids (12345, 12346) get unrelated numbers.
export const recordNo = (id: string) => {
  let h = 0x811c9dc5
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  const hex = ((h ^ (h >>> 16)) >>> 0).toString(16).toUpperCase().padStart(8, '0')
  return `TL-${hex.slice(0, 4)}-${hex.slice(4)}`
}

export const directionsUrl = (address: string, placeId?: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}${
    placeId ? `&destination_place_id=${encodeURIComponent(placeId)}` : ''
  }`

// No API key needed: Google's embeddable map for one address.
export const mapEmbedUrl = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
