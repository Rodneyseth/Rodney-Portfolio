import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ContactPage.module.css'

const contactInfo = [
  { icon: '✉️', label: 'Email', val: 'sethrodney17@gmail.com', href: 'mailto:sethrodney17@gmail.com' },
  { icon: '📞', label: 'Phone', val: '+254 703 120 578', href: 'tel:+254703120578' },
  { icon: '💼', label: 'LinkedIn', val: 'Rodney Nyagonchong\'a', href: 'https://linkedin.com/in/rodney-nyagonchong-a-7b80ab172' },
  { icon: '📍', label: 'Location', val: 'Nairobi, Kenya', href: null },
]

const openTo = [
  { icon: '📊', title: 'Senior Analyst Roles', desc: 'Lead or senior data analyst positions with a focus on market products, business performance or BI — ideally telecoms, fintech or FMCG.' },
  { icon: '🖥️', title: 'BI Consulting', desc: 'Dashboard design, KPI framework development, Power BI builds and data strategy engagements for growth-stage companies.' },
  { icon: '🤝', title: 'Analytics Partnerships', desc: 'Collaborations on data strategy, reporting infrastructure, or end-to-end analytics projects with a clear business outcome.' },
  { icon: '📚', title: 'Mentorship & Advisory', desc: 'Supporting junior analysts or organisations building out their analytics capability from the ground up.' },
]

const faq = [
  { q: 'What is your availability?', a: 'Currently open to new opportunities. Can start conversations immediately.' },
  { q: 'Are you open to remote work?', a: 'Yes — fully remote, hybrid or on-site (Nairobi). Open to international remote roles.' },
  { q: 'What industries do you work in?', a: 'Deep experience in telecoms and fintech. Open to FMCG, e-commerce, and any data-rich business domain.' },
  { q: 'How quickly do you respond?', a: 'Within 24 hours on business days.' },
]

const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please email me directly.')
      }
    } catch {
      setError('Network error. Please check your connection or email me directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.header}>
          <span className="section-label">// Contact</span>
          <h1 className={styles.title}>Let's Work <span className={styles.grad}>Together</span></h1>
          <p className={styles.sub}>
            Open to senior analyst roles, BI consulting and data strategy engagements.
            Drop me a message and I'll get back within 24 hours.
          </p>
          <div className="divider" />
        </div>

        {/* ── Open to ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>01</span> What I'm Open To
          </h2>
          <div className={styles.openToGrid}>
            {openTo.map(o => (
              <div key={o.title} className={styles.openToCard}>
                <span className={styles.openToIcon}>{o.icon}</span>
                <h3 className={styles.openToTitle}>{o.title}</h3>
                <p className={styles.openToDesc}>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact split ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>02</span> Get In Touch
          </h2>
          <div className={styles.contactGrid}>

            {/* Info */}
            <div className={styles.infoCol}>

              {/* CV Download */}
              <a
                href="/rodney-seth-cv.pdf"
                download="Rodney_Seth_Nyagonchonga_CV.pdf"
                className={styles.cvCard}
              >
                <div className={styles.cvIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.cvText}>
                  <p className={styles.cvLabel}>Curriculum Vitae</p>
                  <p className={styles.cvName}>Rodney Seth Nyagonchong'a</p>
                  <p className={styles.cvMeta}>PDF · Updated May 2026</p>
                </div>
                <div className={styles.cvAction}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16l-4-4h3V4h2v8h3l-4 4ZM4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download
                </div>
              </a>

              <div className={styles.infoList}>
                {contactInfo.map(item => (
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

              {/* FAQ */}
              <div className={styles.faq}>
                <h3 className={styles.faqTitle}>Quick answers</h3>
                {faq.map(f => (
                  <div key={f.q} className={styles.faqItem}>
                    <p className={styles.faqQ}>{f.q}</p>
                    <p className={styles.faqA}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={submit}>
              {sent ? (
                <div className={styles.success}>
                  <span className={styles.successIcon}>🎉</span>
                  <h3>Message sent!</h3>
                  <p>I'll get back to you within 24 hours.</p>
                  <button type="button" className={styles.resetBtn} onClick={() => setSent(false)}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Your Name</label>
                      <input name="name" value={form.name} onChange={handle} placeholder="Jane Doe" required />
                    </div>
                    <div className={styles.field}>
                      <label>Email Address</label>
                      <input name="email" type="email" value={form.email} onChange={handle} placeholder="jane@company.com" required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Subject</label>
                    <input name="subject" value={form.subject} onChange={handle} placeholder="Senior Analyst role · Consulting enquiry · Collaboration..." />
                  </div>
                  <div className={styles.field}>
                    <label>Message</label>
                    <textarea name="message" rows={7} value={form.message} onChange={handle} placeholder="Tell me about the role, project or opportunity — the more detail the better." required />
                  </div>
                  {error && (
                    <p className={styles.errorMsg}>
                      ⚠ {error}
                    </p>
                  )}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Sending…' : 'Send Message →'}
                  </button>
                </>
              )}
            </form>

          </div>
        </section>

        {/* ── CTAs ── */}
        <div className={styles.ctaRow}>
          <Link to="/about" className={styles.ctaBtn} data-variant="outline">← About Me</Link>
          <Link to="/experience" className={styles.ctaBtn} data-variant="outline">← Work History</Link>
          <Link to="/projects" className={styles.ctaBtn} data-variant="outline">← Projects</Link>
        </div>

      </div>
    </div>
  )
}
