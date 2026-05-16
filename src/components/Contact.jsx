import { useState } from 'react'
import useInView from '../hooks/useInView'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [ref, visible] = useInView()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className={styles.contact} ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">// Contact</span>
          <h2 className="section-title">Let&apos;s Work <span className="gradient-text">Together</span></h2>
          <p className="section-sub">
            Open to senior analyst roles, BI consulting and data strategy engagements. Drop me a message.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.grid}>
          <div className={`${styles.info} reveal ${visible ? 'visible' : ''} reveal-delay-1`}>
            {[
              { icon: '✉️', label: 'Email', val: 'sethrodney17@gmail.com', href: 'mailto:sethrodney17@gmail.com' },
              { icon: '📞', label: 'Phone', val: '+254 703 120 578', href: 'tel:+254703120578' },
              { icon: '💼', label: 'LinkedIn', val: 'Rodney Nyagonchong\'a', href: 'https://linkedin.com/in/rodney-nyagonchong-a-7b80ab172' },
              { icon: '📍', label: 'Location', val: 'Nairobi, Kenya', href: null },
            ].map(item => (
              <div key={item.label} className={styles.infoItem}>
                <span className={styles.infoIcon}>{item.icon}</span>
                <div>
                  <p className={styles.infoLabel}>{item.label}</p>
                  {item.href
                    ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={styles.infoVal}>{item.val}</a>
                    : <p className={styles.infoVal}>{item.val}</p>
                  }
                </div>
              </div>
            ))}
          </div>

          <form className={`${styles.form} reveal ${visible ? 'visible' : ''} reveal-delay-2`} onSubmit={submit}>
            {sent ? (
              <div className={styles.success}>
                <span>🎉</span>
                <p>Message sent! I&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Your Name</label>
                    <input name="name" value={form.name} onChange={handle} placeholder="John Doe" required />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handle} placeholder="john@example.com" required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Message</label>
                  <textarea name="message" rows={6} value={form.message} onChange={handle} placeholder="Tell me about your project or opportunity..." required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Send Message →
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
