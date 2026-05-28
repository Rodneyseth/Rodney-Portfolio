import { Link } from 'react-router-dom'
import styles from './AboutPage.module.css'

const principles = [
  {
    icon: '🎯',
    title: 'Business-first, data-second',
    body: 'I start with the decision that needs to be made, then work backwards to the data. The best analysis is the one that changes behaviour — not the most technically impressive one.',
  },
  {
    icon: '🔍',
    title: 'Curiosity over confirmation',
    body: 'I ask "why" at every layer. Reporting what happened is the floor, not the ceiling. Root-cause diagnostics and forward-looking signals are where real value is created.',
  },
  {
    icon: '🗣️',
    title: 'Insight without communication is noise',
    body: 'A chart nobody reads solves nothing. I invest in the narrative around the numbers — making findings accessible to engineers, executives and everyone in between.',
  },
  {
    icon: '⚙️',
    title: 'Automate the repeatable',
    body: 'If I am running the same query or building the same report twice, something has gone wrong. Automation frees analysts to think, not to copy-paste.',
  },
]

const education = [
  {
    degree: 'BSc Business Information Technology',
    school: 'Multimedia University of Kenya',
    year: '2015 – 2019',
    note: 'Core modules: Database Systems, Business Intelligence, Systems Analysis, Statistics, Project Management.',
  },
]

const certifications = [
  { name: 'Microsoft Power BI Data Analyst', issuer: 'Microsoft (PL-300)', year: 'In progress' },
  { name: 'Google Data Analytics', issuer: 'Google / Coursera', year: '2022' },
  { name: 'SQL for Data Science', issuer: 'UC Davis / Coursera', year: '2021' },
]

const interests = [
  { label: 'Telecoms & market products data', icon: '📡' },
  { label: 'Churn modelling & retention strategy', icon: '📉' },
  { label: 'Revenue forecasting & P&L analytics', icon: '📈' },
  { label: 'ML explainability (SHAP, LIME)', icon: '🧠' },
  { label: 'Open-source data tooling', icon: '🛠️' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Hero strip ── */}
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <span className="section-label">// About Me</span>
            <h1 className={styles.name}>Rodney Seth Nyagonchong'a</h1>
            <p className={styles.role}>Senior Data Analyst · Market Products & Business Performance</p>
            <p className={styles.location}>📍 Nairobi, Kenya &nbsp;·&nbsp; ✉️ sethrodney17@gmail.com</p>
            <div className={styles.heroBadges}>
              <span className={styles.badge} data-color="accent">6+ yrs experience</span>
              <span className={styles.badge} data-color="accent2">Telecoms · Fintech</span>
              <span className={styles.badge} data-color="accent3">Open to roles</span>
            </div>
          </div>

          {/* Illustration panel */}
          <div className={styles.illustrationWrap}>
            <img
              src="/rodney-illustration.png"
              alt="Artistic identity illustration"
              className={styles.illustration}
            />
            <div className={styles.illustrationOverlay} />
            <div className={styles.illustrationCaption}>
              <span className={styles.captionLine} />
              <span>Consistent. Focused. Precise.</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* ── Bio ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>01</span> Who I Am
          </h2>
          <div className={styles.bioCols}>
            <div className={styles.bioBlock}>
              <p>
                I am a strategic and results-oriented Senior Data Analyst with over six years of experience
                specialising in market products data and business performance analytics. My work lives at the
                intersection of telecoms, product strategy and data — turning complex, high-volume datasets
                into the clear, trusted decisions that drive revenue, growth and competitive advantage.
              </p>
              <p>
                My career has been shaped by Airtel Kenya, where I sit at the centre of commercial,
                marketing and product analytics. I own KPI frameworks, build the dashboards that executives
                use daily, and lead the analysis behind some of the company's biggest strategic decisions —
                from market product performance to customer lifecycle and churn management.
              </p>
            </div>
            <div className={styles.bioBlock}>
              <p>
                Before Airtel, I built my analytical foundation at Rite Solutions Ltd and Safety Plus
                Consulting — developing skills in transaction monitoring, customer segmentation, digital
                performance analytics and automated reporting that I still apply every day.
              </p>
              <p>
                Outside of work I am a continuous learner — currently deepening my machine learning
                skills with a focus on churn modelling and revenue forecasting, and working towards
                the Microsoft PL-300 Power BI certification. I believe the best analysts never stop
                being curious.
              </p>
            </div>
          </div>
        </section>

        {/* ── Principles ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>02</span> How I Think About Analytics
          </h2>
          <div className={styles.principlesGrid}>
            {principles.map(p => (
              <div key={p.title} className={styles.principleCard}>
                <span className={styles.principleIcon}>{p.icon}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Specialisations ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>03</span> Areas of Deep Interest
          </h2>
          <div className={styles.interestsList}>
            {interests.map(i => (
              <div key={i.label} className={styles.interestItem}>
                <span className={styles.interestIcon}>{i.icon}</span>
                <span>{i.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>04</span> Education
          </h2>
          <div className={styles.eduList}>
            {education.map(e => (
              <div key={e.degree} className={styles.eduCard}>
                <div className={styles.eduLeft}>
                  <h3 className={styles.eduDegree}>{e.degree}</h3>
                  <p className={styles.eduSchool}>{e.school}</p>
                  <p className={styles.eduNote}>{e.note}</p>
                </div>
                <span className={styles.eduYear}>{e.year}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Certifications ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>05</span> Certifications & Learning
          </h2>
          <div className={styles.certList}>
            {certifications.map(c => (
              <div key={c.name} className={styles.certItem}>
                <div className={styles.certDot} data-status={c.year === 'In progress' ? 'progress' : 'done'} />
                <div>
                  <p className={styles.certName}>{c.name}</p>
                  <p className={styles.certIssuer}>{c.issuer}</p>
                </div>
                <span className={styles.certYear} data-status={c.year === 'In progress' ? 'progress' : 'done'}>
                  {c.year}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTAs ── */}
        <div className={styles.ctaRow}>
          <Link to="/experience" className={styles.ctaBtn} data-variant="primary">
            View Work History →
          </Link>
          <Link to="/projects" className={styles.ctaBtn} data-variant="outline">
            See My Projects →
          </Link>
          <Link to="/contact" className={styles.ctaBtn} data-variant="outline">
            Get In Touch →
          </Link>
        </div>

      </div>
    </div>
  )
}
