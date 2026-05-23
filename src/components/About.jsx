import useInView from '../hooks/useInView'
import styles from './About.module.css'

const highlights = [
  { icon: '📊', title: 'Executive Dashboards', desc: 'Building Power BI solutions that serve as a single source of truth for commercial, product and business performance.' },
  { icon: '🛒', title: 'Market & Product Analytics', desc: 'Deep expertise in market products data — analysing product performance, pricing, mix and demand signals to drive portfolio decisions.' },
  { icon: '⚡', title: 'Business Performance', desc: 'Translating revenue, KPI and operational data into clear performance narratives that inform executive strategy and planning.' },
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
              Strategic and results-oriented Senior Analyst with over 6 years of experience specialising
              in market products data and business performance analytics — turning complex datasets into
              clear decisions that drive revenue, growth and competitive advantage.
            </p>
            <p className={styles.bio}>
              Skilled in designing data pipelines, building interactive dashboards and leading
              cross-functional initiatives across product, commercial and marketing domains. Experienced
              in product performance analysis, market mix modelling, KPI frameworks and business
              performance reporting within the telecoms industry.
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
