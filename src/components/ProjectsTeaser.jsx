import { Link } from 'react-router-dom'
import useInView from '../hooks/useInView'
import { projects } from '../data/projects'
import styles from './ProjectsTeaser.module.css'

export default function ProjectsTeaser() {
  const [ref, visible] = useInView()

  return (
    <section className={styles.section} ref={ref}>
      <div className="container">
        <div className={`${styles.inner} reveal ${visible ? 'visible' : ''}`}>

          {/* Left — text */}
          <div className={styles.left}>
            <span className="section-label">// Projects</span>
            <h2 className={styles.heading}>
              End-to-end analytics,<br />
              from raw data to results.
            </h2>
            <p className={styles.sub}>
              Hands-on projects spanning machine learning, SQL pipelines, Power BI dashboards,
              and Python automation — each documented from raw data to final findings.
            </p>
            <Link to="/projects" className={styles.cta}>
              View all projects
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Right — project cards */}
          <div className={styles.right}>
            {projects.map((p, i) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className={`${styles.card} reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}
                style={{ '--card-accent': p.accent }}
              >
                <div className={styles.cardLeft}>
                  <span className={styles.cardTag} style={{ color: p.accent }}>{p.tag}</span>
                  <span className={styles.cardTitle}>{p.title}</span>
                  <div className={styles.cardMetrics}>
                    {p.metrics.slice(0, 2).map(m => (
                      <span key={m} className={styles.metric} style={{ color: p.accent }}>
                        <span className={styles.metricDot} style={{ background: p.accent }} />
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <span
                    className={styles.status}
                    data-status={p.status === 'Complete' ? 'complete' : 'progress'}
                  >
                    {p.status}
                  </span>
                  <span className={styles.arrow} style={{ color: p.accent }}>→</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
