import { useEffect, useState, type FormEvent } from 'react'
import { applyDocumentMeta } from '../lib/documentMeta'

const FEEDBACK_EMAIL = 'hello@peakatlas3d.com'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sentHint, setSentHint] = useState(false)

  useEffect(() => {
    applyDocumentMeta({
      title: 'Contact — PeakAtlas3D',
      description:
        'Send feedback, corrections, or ideas for PeakAtlas3D — trip-ready peak guides with 3D terrain.',
      path: '/contact',
    })
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(
      `PeakAtlas3D feedback${name.trim() ? ` from ${name.trim()}` : ''}`,
    )
    const body = encodeURIComponent(
      [
        message.trim(),
        '',
        '—',
        name.trim() ? `Name: ${name.trim()}` : null,
        email.trim() ? `Email: ${email.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    setSentHint(true)
  }

  return (
    <article className="content-article content-article-narrow contact-article">
      <p className="content-eyebrow">Contact</p>
      <h1 className="content-title">Feedback & ideas</h1>
      <p className="content-lede">
        Spot a wrong photo, know a better gate town, or just want to say a peak
        belongs here? We’d love to hear from mountain people.
      </p>

      <form className="contact-form" onSubmit={onSubmit}>
        <label className="contact-field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="contact-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="So we can reply (optional)"
          />
        </label>
        <label className="contact-field">
          <span>Message</span>
          <textarea
            name="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Corrections, peak suggestions, amenity tips, or general feedback…"
          />
        </label>
        <button type="submit" className="content-cta">
          Open email to send
        </button>
      </form>

      {sentHint && (
        <p className="contact-hint" role="status">
          Your email app should open with the message ready. If it doesn’t, write us
          at{' '}
          <a href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a>.
        </p>
      )}

      <p className="contact-direct">
        Or email directly:{' '}
        <a href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a>
      </p>
    </article>
  )
}
