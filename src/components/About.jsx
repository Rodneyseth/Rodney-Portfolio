import useInView from '../hooks/useInView'
import styles from './About.module.css'

const highlights = [
  { icon: '📊', title: 'Executive Dashboards', desc: 'Building Power BI solutions that serve as a single source of truth for commercial, usage and campaign performance.' },
  { icon: '📡', title: 'Telecom Analytics', desc: 'Deep expertise in GSM usage data, CDRs and customer lifecycle analytics across Voice, Data and SMS.' },
  { icon: '⚡', title: 'Automation & Scale', desc: 'Eliminating manual reporting effort through automated pipelines, enabling faster and more accurate decision-making.' },
]

export default function About() {
  const [ref, visible] = useInView()

  return (
    <section id="about" className={styles.about} ref={ref}>
      <div className="container">
        <div className={styles.grid}>
          <div className={`reveal ${visible ? 'visible' : ''}`}>
            <span className="section-label">// About Me</span>
            <h2 className="section-title">Data-driven,<br /><span className="gradient-text">impact-focused</span></h2>
            <div className="divider" />
            <p className={styles.bio}>
              Strategic and results-oriented Senior Analyst with over 6 years of experience leveraging
              data to drive business intelligence, customer insights and product strategy within the
              telecommunications sector.
            </p>
            <p className={styles.bio}>
              Skilled in designing data pipelines, building interactive dashboards and leading
              cross-functional initiatives that turn complex data into clear and actionable strategies.
              Experienced with GSM usage data, call detail records (CDRs) and customer lifecycle
              analytics to support acquisition, retention and targeting programmes.
            </p>
            <div className={styles.meta}>
              <span>📍 Nairobi, Kenya</span>
              <span>🎓 BSc Business &amp; IT — Multimedia University of Kenya</span>
              <span>✉️ sethrodney17@gmail.com</span>
            </div>
          </div>

          <div className={styles.right}>
            {highlights.map((h, i) => (
              <div key={h.title} className={`${styles.card} reveal ${visible ? 'visible' : ''} reveal-delay-${i + 1}`}>
                <span className={styles.icon}>{h.icon}</span>
                <div>
                  <h3>{h.title}</h3>
                  <p>{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
