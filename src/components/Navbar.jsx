import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const links = [
  { href: '#about',      label: 'About' },
  { href: '#skills',     label: 'Skills' },
  { href: '#projects',   label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact',    label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#hero" className={styles.logo}>
          <span className={styles.logoText}>RS</span>
          <span className={styles.logoDot} />
        </a>

        <nav className={`${styles.links} ${open ? styles.open : ''}`}>
          {links.map(l => (
            <a key={l.href} href={l.href} className={styles.link} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className={`btn btn-primary ${styles.cta}`} onClick={() => setOpen(false)}>
            Hire Me
          </a>
        </nav>

        <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span className={open ? styles.barOpen : ''} />
          <span className={open ? styles.barOpen : ''} />
          <span className={open ? styles.barOpen : ''} />
        </button>
      </div>
    </header>
  )
}
