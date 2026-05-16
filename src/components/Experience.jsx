import useInView from '../hooks/useInView'
import styles from './Experience.module.css'

const jobs = [
  {
    role: 'Senior Marketing BI Analyst',
    company: 'Airtel Kenya · Nairobi, Kenya',
    period: 'May 2021 – Present',
    points: [
      'Lead end-to-end analysis of Voice, Data, SMS and customer lifecycle datasets to support acquisition, retention, engagement and revenue growth initiatives.',
      'Define and track core KPIs — covering revenue, usage, ARPU, churn, conversion and channel performance — ensuring consistency across marketing, product, CVM and regional teams.',
      'Design, build and maintain automated Power BI dashboards serving as a single source of truth for commercial, usage and campaign performance.',
      'Partner with product and marketing squads to translate business needs into structured analytical problems and actionable insights.',
      'Facilitate cross-functional workshops to gather requirements, align stakeholders and embed data-driven performance rituals.',
    ],
  },
  {
    role: 'Junior Data Analyst',
    company: 'Rite Solutions Ltd · Nairobi, Kenya',
    period: 'Jan 2020 – Apr 2021',
    points: [
      'Performed real-time transaction monitoring and behavioural analytics to support strategic planning, segmentation and fraud detection initiatives.',
      'Designed and maintained Excel-based dashboards providing rapid visibility into market, sales and operational performance.',
      'Automated manual data processing and reporting workflows using advanced Excel functions and scripting, reducing reporting lag and enabling faster decision-making.',
      'Delivered actionable insights that supported enhanced customer engagement and retention strategies.',
    ],
  },
  {
    role: 'Data Analyst Intern',
    company: 'Safety Plus Consulting · Nairobi, Kenya',
    period: 'May 2019 – Dec 2019',
    points: [
      'Conducted customer and digital performance analysis to support sales and marketing alignment.',
      'Executed SEO audits and analysed website performance metrics to inform content optimisation strategies.',
      'Increased organic website traffic through targeted SEO improvements and keyword optimisation.',
      'Helped streamline internal reporting processes, improving visibility into campaign performance.',
    ],
  },
]

export default function Experience() {
  const [ref, visible] = useInView()

  return (
    <section id="experience" className={styles.exp} ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">// Experience</span>
          <h2 className="section-title">Work History</h2>
          <p className="section-sub">
            6+ years delivering data analytics and BI solutions across telecoms, fintech and consulting.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.timeline}>
          {jobs.map((j, i) => (
            <div key={i} className={`${styles.item} reveal ${visible ? 'visible' : ''} reveal-delay-${i + 1}`}>
              <div className={styles.connector}>
                <div className={styles.dot} />
                {i < jobs.length - 1 && <div className={styles.line} />}
              </div>
              <div className={styles.body}>
                <div className={styles.header}>
                  <div>
                    <h3 className={styles.role}>{j.role}</h3>
                    <span className={styles.company}>{j.company}</span>
                  </div>
                  <span className={styles.period}>{j.period}</span>
                </div>
                <ul className={styles.points}>
                  {j.points.map(pt => <li key={pt}>{pt}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
