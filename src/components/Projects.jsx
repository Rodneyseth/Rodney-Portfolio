import useInView from '../hooks/useInView'
import styles from './Projects.module.css'

const projects = [
  {
    tag: 'Power BI · DAX · Power Query',
    title: 'Executive BI Dashboard — Single Source of Truth',
    desc: 'Consolidated multiple legacy reports into a single executive Power BI dashboard at Airtel Kenya, giving leadership unified visibility into commercial, usage and campaign performance.',
    metrics: ['Legacy reports eliminated', 'Faster decision turnaround', 'C-suite adopted'],
    accent: 'var(--accent)',
  },
  {
    tag: 'Python · SQL · KPI Modelling',
    title: 'Automated KPI Reporting Pipeline',
    desc: 'Automated recurring KPI reporting covering revenue, ARPU, churn, conversion and channel performance — eliminating manual effort and improving accuracy and timeliness across teams.',
    metrics: ['Manual effort eliminated', 'Improved accuracy', 'Weekly & monthly cadence'],
    accent: 'var(--accent2)',
  },
  {
    tag: 'SQL · CDR Analytics · Segmentation',
    title: 'Customer Lifecycle & Churn Analytics',
    desc: 'Led deep analyses on consumer behaviour, GSM usage data and CDRs to identify churn signals and growth opportunities, directly contributing to active customer base growth at Airtel Kenya.',
    metrics: ['Active base growth', 'Churn risk identified', 'Retention uplift'],
    accent: 'var(--accent3)',
  },
  {
    tag: 'Power BI · Campaign Analytics · CVM',
    title: 'Near-Real-Time Campaign Performance Tracker',
    desc: 'Enabled faster campaign optimisation through near-real-time performance tracking and diagnostic reporting, supporting CVM and marketing squads to improve ROI and customer lifetime value.',
    metrics: ['Near-real-time tracking', 'Faster optimisation', 'ROI improvement'],
    accent: 'var(--accent)',
  },
]

export default function Projects() {
  const [ref, visible] = useInView()

  return (
    <section id="projects" className={styles.projects} ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">// Projects</span>
          <h2 className="section-title">Selected Work</h2>
          <p className="section-sub">
            Key analytics initiatives delivered at Airtel Kenya and beyond, with measurable business impact.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.grid}>
          {projects.map((p, i) => (
            <article
              key={p.title}
              className={`${styles.card} reveal ${visible ? 'visible' : ''} reveal-delay-${i + 1}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.tag} style={{ color: p.accent, borderColor: p.accent + '50', background: p.accent + '10' }}>
                  {p.tag}
                </span>
              </div>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <ul className={styles.metrics}>
                {p.metrics.map(m => (
                  <li key={m} style={{ color: p.accent }}>
                    <span className={styles.dot} style={{ background: p.accent }} />
                    {m}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
