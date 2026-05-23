import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const tabs = [
  { to: '/about',      label: 'About' },
  { to: '/skills',     label: 'Skills' },
  { to: '/projects',   label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/contact',    label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>RS</span>
          <span className={styles.logoDot} />
        </Link>

        <nav className={`${styles.links} ${open ? styles.open : ''}`}>
          {tabs.map(t => (
            <Link
              key={t.to}
              to={t.to}
              className={`${styles.link} ${isActive(t.to) ? styles.linkActive : ''}`}
              onClick={() => setOpen(false)}
            >
              {t.label}
            </Link>
          ))}
          <Link to="/contact" className={`btn btn-primary ${styles.cta}`} onClick={() => setOpen(false)}>
            Hire Me
          </Link>
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
