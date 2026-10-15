import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="page-head ruled" style={{ borderBottom: 0, padding: '96px 0 120px' }}>
      <div className="wrap">
        <p className="eyebrow">Error 404 · No such record</p>
        <h1>This page isn’t in the register.</h1>
        <p className="lede">It may have moved, or the business may no longer be listed.</p>
        <div className="actions">
          <Link href="/search" className="btn btn-accent">Search the register</Link>
          <Link href="/" className="btn">Back to the front page</Link>
        </div>
      </div>
    </section>
  )
}
