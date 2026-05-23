import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.grid} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <span className={`section-label ${styles.pre}`}>// Senior Data Analyst · Market Products & Business Performance</span>
        <h1 className={styles.name}>
          Rodney Seth
          <span className={styles.surname}>Nyagonchong&apos;a</span>
        </h1>
        <p className={styles.tagline}>
          Turning market and product data into clear business performance strategy.
          <br />
          <span>SQL · Python · Power BI · DAX · Product & Revenue Analytics</span>
        </p>
        <div className={styles.actions}>
          <Link to="/projects" className="btn btn-primary">View My Work →</Link>
          <Link to="/contact" className="btn btn-outline">Get In Touch</Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>6+</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>Airtel</span>
            <span className={styles.statLabel}>Current Employer</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>Products &amp; Perf</span>
            <span className={styles.statLabel}>Core Specialisation</span>
          </div>
        </div>
      </div>

      <div className={styles.scroll}>
        <p>Scroll</p>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}
