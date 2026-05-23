import useInView from '../hooks/useInView'
import styles from './Skills.module.css'

const categories = [
  {
    label: 'Tools & Technologies',
    color: 'var(--accent)',
    skills: [
      { name: 'Power BI (DAX, Power Query)', level: 92 },
      { name: 'SQL', level: 90 },
      { name: 'Python', level: 80 },
      { name: 'Advanced Excel', level: 95 },
    ],
  },
  {
    label: 'Analytics Techniques',
    color: 'var(--accent2)',
    skills: [
      { name: 'KPI Modelling', level: 93 },
      { name: 'Segmentation & Cohort', level: 88 },
      { name: 'Churn Diagnostics', level: 87 },
      { name: 'Variance & Root-Cause', level: 90 },
    ],
  },
  {
    label: 'Domain Expertise',
    color: 'var(--accent3)',
    skills: [
      { name: 'Market Products Analytics', level: 92 },
      { name: 'Business Performance & KPIs', level: 90 },
      { name: 'Revenue & P&L Analysis', level: 85 },
      { name: 'CVM & Campaign Analytics', level: 85 },
    ],
  },
]

const tools = [
  'DAX', 'Power Query', 'Data Modelling', 'Product Performance Analysis',
  'Market Mix Analysis', 'Churn Modelling', 'Cohort Analysis',
  'Agile / Scrum', 'Stakeholder Engagement', 'Data Storytelling',
  'Revenue Forecasting', 'Fraud Detection',
]

export default function Skills() {
  const [ref, visible] = useInView()

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">// Skills & Tools</span>
          <h2 className="section-title">My Technical Stack</h2>
          <p className="section-sub">
            A blend of BI tools, analytical techniques and deep market products and business performance expertise built over 6+ years.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.grid}>
          {categories.map((cat, ci) => (
            <div key={cat.label} className={`${styles.card} reveal ${visible ? 'visible' : ''} reveal-delay-${ci + 1}`}>
              <h3 className={styles.catLabel} style={{ color: cat.color }}>{cat.label}</h3>
              <ul className={styles.bars}>
                {cat.skills.map(s => (
                  <li key={s.name}>
                    <div className={styles.barMeta}>
                      <span>{s.name}</span>
                      <span className={styles.pct}>{s.level}%</span>
                    </div>
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{
                          width: visible ? `${s.level}%` : '0%',
                          background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`,
                          transitionDelay: `${ci * 0.1 + 0.3}s`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`${styles.toolsWrap} reveal ${visible ? 'visible' : ''} reveal-delay-4`}>
          <p className={styles.toolsLabel}>// Other techniques &amp; competencies</p>
          <div className={styles.tools}>
            {tools.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}
