'use client'
import { useActionState, useEffect, useState } from 'react'
import { submitBusiness, type FormState } from '@/lib/actions'
import { fold } from '@/lib/utils'
import { LISTING_RULES, cityRule, type Rules } from '@/lib/validate'

// The "what" field of the sentence search. While it's empty and not in use, it types out example trades one after
// another under a blinking caret; click into it and the animation steps aside. Reduced motion keeps the first example.
export function TradeTyper({ examples, defaultValue }: { examples: string[]; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const [text, setText] = useState(examples[0] ?? '')
  const idle = !value && !focused

  useEffect(() => {
    if (!idle || examples.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let word = 0, chars = examples[0].length, dir = -1
    setText(examples[0])
    // Hold, erase letter by letter, type the next trade, hold again.
    const step = () => {
      chars += dir
      if (chars < 0) { word = (word + 1) % examples.length; chars = 0; dir = 1 }
      setText(examples[word].slice(0, chars))
      let delay = dir < 0 ? 40 : 85
      if (dir > 0 && chars === examples[word].length) { dir = -1; delay = 1900 }
      timer = setTimeout(step, delay)
    }
    let timer = setTimeout(step, 1900)
    return () => clearTimeout(timer)
  }, [idle, examples])

  return (
    <span className="typer">
      <input
        name="q" value={value} list="dl-trades" aria-label="What are you looking for?" autoComplete="off"
        placeholder={focused ? examples[0] : ''}
        onChange={e => setValue(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {idle && <span className="typer-ghost" aria-hidden="true">{text}<i /></span>}
    </span>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })}
    >
      {copied ? 'Copied ✓' : 'Copy citation'}
    </button>
  )
}

// Narrows the atlas on /cities as you type by hiding what doesn't match, so the list itself stays plain server HTML.
export function CityFilter({ total }: { total: number }) {
  const [shown, setShown] = useState(total)
  const filter = (q: string) => {
    const words = fold(q).split(/\s+/).filter(Boolean)
    let n = 0
    for (const row of document.querySelectorAll<HTMLElement>('[data-country]')) {
      let any = false
      for (const li of row.querySelectorAll<HTMLElement>('[data-name]')) {
        const hit = words.every(w => li.dataset.name!.includes(w))
        li.hidden = !hit
        if (hit) { any = true; n++ }
      }
      row.hidden = !any
    }
    const none = document.querySelector<HTMLElement>('.atlas-none')
    if (none) none.hidden = n > 0
    setShown(n)
  }
  return (
    <div className="find-city" role="search">
      <label htmlFor="find-city">Find a city</label>
      <input id="find-city" type="search" placeholder="Lisbon, Pune, Texas…" autoComplete="off" onChange={e => filter(e.target.value)} />
      <output htmlFor="find-city" aria-live="polite">{shown === total ? `${total} cities` : `${shown} of ${total} cities`}</output>
    </div>
  )
}

type Option = { name: string; country: string }

function Field({ n, name, label, optional, hint, error, wide, ...input }: {
  n: string; name: string; label: string; optional?: boolean; hint?: string; error?: string; wide?: boolean
} & React.InputHTMLAttributes<HTMLInputElement> & { textarea?: boolean }) {
  const { textarea, ...rest } = input
  const describedBy = [hint && `${name}-hint`, error && `${name}-err`].filter(Boolean).join(' ') || undefined
  const props = { id: name, name, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy }
  return (
    <div className={`field${wide ? ' wide' : ''}`} data-error={error ? '' : undefined}>
      <label htmlFor={name}><i>{n}</i>{label}{optional && <em> (optional)</em>}</label>
      {textarea
        ? <textarea {...props} defaultValue={rest.defaultValue as string} placeholder={rest.placeholder} rows={4} />
        : <input {...props} {...rest} />}
      {hint && <span className="hint" id={`${name}-hint`}>{hint}</span>}
      {error && <span className="err" id={`${name}-err`}>{error}</span>}
    </div>
  )
}

// Form TL-1. The browser checks each field when you leave it, with the same rules the server applies (lib/validate.ts).
export function ListingForm({ categories, cities }: { categories: string[]; cities: Option[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const next = await submitBusiness(prev, fd)
    setLocal({})
    return next
  }, null)
  const [local, setLocal] = useState<Record<string, string>>({})
  const rules: Rules = { ...LISTING_RULES, city: cityRule(cities) }
  const v = state?.values ?? {}
  // A field checked in the browser since the last submit shows that result ('' = fine); otherwise the server's.
  const err = (k: string) => (k in local ? local[k] : state?.errors?.[k]) || undefined
  // Leaving a field checks it; typing in a field that shows an error re-checks it, so the message clears while you fix it
  // rather than on blur (a message vanishing on blur shifts the button between mousedown and mouseup, losing the click).
  const recheck = (always: boolean) => (e: React.SyntheticEvent<HTMLFormElement>) => {
    const t = e.target as unknown as HTMLInputElement
    const rule = rules[t.name]
    if (rule && (always || err(t.name))) setLocal(l => ({ ...l, [t.name]: rule(t.value.trim()) }))
  }

  if (state?.ok) {
    return (
      <div className="notice ok" role="status">
        <b>Request filed.</b>
        <p>{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} onBlur={recheck(true)} onChange={recheck(false)} noValidate key={JSON.stringify(v)}>
      {state && !state.ok && <div className="notice" role="alert"><b>Not filed yet.</b><p>{state.message}</p></div>}
      <input className="trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <fieldset>
        <legend><small>Part A</small>The business</legend>
        <div className="form-grid">
          <Field n="A1" name="name" label="Business name" defaultValue={v.name} error={err('name')} autoComplete="organization" wide />
          <Field n="A2" name="category" label="Trade" defaultValue={v.category} error={err('category')} list="form-trades" placeholder="Dentist" hint="Pick from the list, or type your own." />
          <Field n="A3" name="city" label="City" defaultValue={v.city} error={err('city')} list="form-cities" placeholder="Pune" />
          <Field n="A4" name="address" label="Street address" defaultValue={v.address} error={err('address')} autoComplete="street-address" wide />
          <Field n="A5" name="area" label="Neighbourhood" optional defaultValue={v.area} error={err('area')} />
          <Field n="A6" name="phone" label="Telephone" optional defaultValue={v.phone} error={err('phone')} type="tel" autoComplete="tel" />
          <Field n="A7" name="website" label="Website" optional defaultValue={v.website} error={err('website')} placeholder="example.com" inputMode="url" />
          <Field n="A8" name="hours" label="Opening hours" optional defaultValue={v.hours} error={err('hours')} placeholder="Mon–Sat 9 AM–6 PM" />
          <Field n="A9" name="description" label="Short description" optional defaultValue={v.description} error={err('description')} textarea wide />
        </div>
      </fieldset>

      <fieldset>
        <legend><small>Part B</small>The person filing</legend>
        <div className="form-grid">
          <Field n="B1" name="contact_name" label="Your name" defaultValue={v.contact_name} error={err('contact_name')} autoComplete="name" />
          <Field n="B2" name="email" label="Email" defaultValue={v.email} error={err('email')} type="email" autoComplete="email" hint="Only used to tell you when the entry is published." />
          <div className="field wide">
            <span className="label"><i>B3</i>Your connection to the business</span>
            <div className="radios">
              {[['owner', 'Owner'], ['employee', 'Employee'], ['customer', 'Customer']].map(([value, label]) => (
                <label key={value}><input type="radio" name="relationship" value={value} defaultChecked={(v.relationship || 'owner') === value} />{label}</label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <button className="btn btn-accent" disabled={pending}>{pending ? 'Filing…' : 'File this listing →'}</button>
      <datalist id="form-trades">{categories.map(c => <option key={c} value={c} />)}</datalist>
      <datalist id="form-cities">{cities.map(c => <option key={`${c.name}-${c.country}`} value={`${c.name}, ${c.country}`} />)}</datalist>
    </form>
  )
}
