import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.name}>Rodney Seth Nyagonchong&apos;a</p>
        <p className={styles.copy}>© {new Date().getFullYear()} · Senior Data Analyst · Nairobi, Kenya</p>
        <div className={styles.links}>
          <a href="https://linkedin.com/in/rodney-nyagonchong-a-7b80ab172" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:sethrodney17@gmail.com">Email</a>
          <a href="tel:+254703120578">+254 703 120 578</a>
        </div>
      </div>
    </footer>
  )
}
