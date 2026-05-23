import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import styles from './ProjectsPage.module.css'

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">// Projects</span>
          <h1 className={styles.title}>Selected Work</h1>
          <p className={styles.sub}>
            End-to-end analytics projects — from raw data and SQL to machine learning, dashboards, and business findings.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.grid}>
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className={styles.card}
              style={{ '--accent-color': p.accent }}
            >
              <div className={styles.cardTop}>
                <span className={styles.tag} style={{ color: p.accent, borderColor: p.accent + '50', background: p.accent + '10' }}>
                  {p.tag}
                </span>
                <span
                  className={styles.status}
                  data-status={p.status === 'Complete' ? 'complete' : 'progress'}
                >
                  {p.status}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{p.title}</h2>
              <p className={styles.desc}>{p.desc}</p>

              <ul className={styles.metrics}>
                {p.metrics.map(m => (
                  <li key={m} style={{ color: p.accent }}>
                    <span className={styles.dot} style={{ background: p.accent }} />
                    {m}
                  </li>
                ))}
              </ul>

              {p.folders.length > 0 && (
                <div className={styles.folderStrip}>
                  {p.folders.map(f => (
                    <span key={f.id} className={styles.folderPill}>{f.label}</span>
                  ))}
                </div>
              )}

              <div className={styles.cta} style={{ color: p.accent }}>
                Open project →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
