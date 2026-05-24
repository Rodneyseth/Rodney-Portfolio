import { Link } from 'react-router-dom'
import useInView from '../hooks/useInView'
import styles from './SectionTeasers.module.css'

const sections = [
  {
    num: '01',
    to: '/about',
    label: 'About',
    accent: '#a855f7',
    headline: 'Who is Rodney Seth?',
    body: 'Strategic and results-oriented Senior Analyst with 6+ years specialising in market products data and business performance analytics. I turn complex datasets into clear decisions that drive revenue, growth and competitive advantage.',
    bullets: [
      'BSc Business Information Technology — Multimedia University of Kenya',
      'Deep specialisation in telecoms market products & commercial analytics',
      'Continuous learner — currently pursuing Microsoft PL-300 certification',
    ],
    cta: 'Read full profile →',
  },
  {
    num: '02',
    to: '/skills',
    label: 'Skills',
    accent: '#06b6d4',
    headline: 'A full-stack analytics toolkit.',
    body: 'From Power BI semantic models and DAX to Python ML pipelines and PostgreSQL — built and battle-tested across 6 years of live commercial data at national scale.',
    bullets: [
      'Power BI · DAX · Power Query · Advanced Excel',
      'SQL (PostgreSQL) · Python (pandas, scikit-learn, XGBoost)',
      'KPI Modelling · Segmentation · Churn Analytics · Variance Analysis',
    ],
    cta: 'Explore the stack →',
  },
  {
    num: '03',
    to: '/projects',
    label: 'Projects',
    accent: '#f59e0b',
    headline: 'End-to-end analytics work.',
    body: 'Hands-on projects documented from raw data all the way to business findings — spanning machine learning, SQL pipelines, Power BI dashboards, and automated reporting.',
    bullets: [
      'Telco Churn Prediction — XGBoost, AUC 0.891, 85% recall',
      'Revenue Forecasting Model — time-series pipeline (in progress)',
      'Each project has a full folder-by-folder breakdown and findings PDF',
    ],
    cta: 'View all projects →',
  },
  {
    num: '04',
    to: '/experience',
    label: 'Experience',
    accent: '#a855f7',
    headline: '6+ years of real-world delivery.',
    body: 'From intern to Senior BI Analyst at one of Kenya\'s largest telecoms operators — with stops in fintech and consulting. Every role added a new layer of domain depth and delivery capability.',
    bullets: [
      'Senior Marketing BI Analyst — Airtel Kenya (2021 – Present)',
      'Junior Data Analyst — Rite Solutions Ltd (2020 – 2021)',
      'Data Analyst Intern — Safety Plus Consulting (2019)',
    ],
    cta: 'See work history →',
  },
  {
    num: '05',
    to: '/contact',
    label: 'Contact',
    accent: '#06b6d4',
    headline: 'Open to the right opportunity.',
    body: 'Available for senior analyst roles, BI consulting engagements and analytics partnerships. Based in Nairobi, open to remote and international opportunities. Responds within 24 hours.',
    bullets: [
      'sethrodney17@gmail.com · +254 703 120 578',
      'Open to: telecoms, fintech, FMCG, e-commerce and any data-rich domain',
      'CV available for download on the contact page',
    ],
    cta: 'Get in touch →',
  },
]

export default function SectionTeasers() {
  const [ref, visible] = useInView()

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={`${styles.header} reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">// Navigate</span>
          <h2 className={styles.title}>Everything in one place.</h2>
          <p className={styles.sub}>
            A full-picture portfolio — explore each section for the complete story.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.list}>
          {sections.map((s, i) => (
            <Link
              key={s.to}
              to={s.to}
              className={`${styles.card} reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}
              style={{ '--s-accent': s.accent }}
            >
              {/* Left: number + label */}
              <div className={styles.cardLeft}>
                <span className={styles.num}>{s.num}</span>
                <span className={styles.label} style={{ color: s.accent }}>{s.label}</span>
              </div>

              {/* Centre: text */}
              <div className={styles.cardBody}>
                <h3 className={styles.headline}>{s.headline}</h3>
                <p className={styles.body}>{s.body}</p>
                <ul className={styles.bullets}>
                  {s.bullets.map(b => (
                    <li key={b}>
                      <span className={styles.bulletDot} style={{ background: s.accent }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: CTA */}
              <div className={styles.cardRight}>
                <span className={styles.cta} style={{ color: s.accent }}>{s.cta}</span>
                <svg className={styles.arrow} width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke={s.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Accent bar on left edge */}
              <div className={styles.accentBar} style={{ background: s.accent }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
