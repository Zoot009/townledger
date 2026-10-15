'use server'
import { getCities } from './data'
import { insert, sql } from './db'
import { SITE_DOMAIN } from './site'
import { LISTING_RULES, check, cityRule, matchCity, websiteUrl } from './validate'

// `errors` holds a message per field, shown under that field. The browser runs the same checks first (lib/validate.ts).
export type FormState = { ok: boolean; message: string; values?: Record<string, string>; errors?: Record<string, string> } | null

// Trimmed form text. The rules check lengths; this cap only stops oversized posts.
const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim().slice(0, 10_000)
const opt = (v: string) => v || null
const RELATIONS = new Set(['owner', 'employee', 'customer'])
const FAILED = 'Sorry, we couldn’t file that. Please try again later.'

// New listings go to the shared listing_requests table, stamped with this website's domain, and are checked by hand.
export async function submitBusiness(_: FormState, fd: FormData): Promise<FormState> {
  if (str(fd, 'company')) return { ok: true, message: 'Thanks!' } // honeypot field only bots fill in
  const keys = ['name', 'category', 'address', 'area', 'city', 'phone', 'website', 'hours', 'description', 'contact_name', 'email', 'relationship']
  const values = Object.fromEntries(keys.map(k => [k, str(fd, k)]))
  const cities = await getCities()
  const errors = check({ ...LISTING_RULES, city: cityRule(cities) }, values)
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', values, errors }
  try {
    // A category we list is saved by id. Anything else is kept as typed; the reviewer picks the nearest one.
    const [category] = await sql<{ id: string }>('select id from categories where lower(name) = lower($1)', [values.category])
    await insert(
      `insert into listing_requests (plan, name, category_id, other_category, city_id, address, area, phone, website, hours, description,
         submitter_name, submitter_email, relation, site_domain)
       values ('free', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        values.name, category?.id ?? null, category ? null : values.category, matchCity(cities, values.city)!.id, values.address, opt(values.area),
        opt(values.phone), websiteUrl(values.website), opt(values.hours), opt(values.description), values.contact_name, values.email,
        RELATIONS.has(values.relationship) ? values.relationship : 'owner', SITE_DOMAIN,
      ],
    )
    return { ok: true, message: 'Filed. We check every entry by hand and publish it, usually within a few days.' }
  } catch (err) {
    console.error('[forms] listing request not saved:', err)
    return { ok: false, message: FAILED, values }
  }
}
