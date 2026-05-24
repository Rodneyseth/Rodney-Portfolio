import { Link } from 'react-router-dom'
import styles from './ExperiencePage.module.css'

const jobs = [
  {
    role: 'Senior Marketing BI Analyst',
    company: 'Airtel Kenya',
    location: 'Nairobi, Kenya',
    period: 'May 2021 – Present',
    tenure: '4+ years',
    color: 'var(--accent)',
    context: 'Airtel Kenya is one of Kenya\'s leading telecoms operators, serving millions of subscribers across voice, data, money and enterprise services. I sit within the Marketing Analytics & BI function, acting as a central analytics partner to commercial, CVM, product and regional teams.',
    highlights: [
      { stat: 'Single source of truth', label: 'Power BI dashboards adopted by C-suite' },
      { stat: 'Manual reports eliminated', label: 'Through automated KPI pipelines' },
      { stat: '6M+ customers', label: 'Analysed for churn, segmentation & lifecycle' },
    ],
    responsibilities: [
      {
        area: 'KPI Ownership & Metric Governance',
        detail: 'Define, align and maintain the organisation\'s core KPI framework covering revenue, ARPU, active base, churn, conversion and channel performance. I own the metric definitions that feed every executive report and mediate when teams disagree on numbers — ensuring a single version of the truth across marketing, product, CVM and regional squads.',
      },
      {
        area: 'Executive Dashboard Design & Delivery',
        detail: 'Consolidated multiple legacy Excel and Access reports into a unified Power BI dashboard suite used by senior leadership daily. Built complex DAX measures, star-schema data models, RLS rules and automated refresh pipelines from multiple source systems.',
      },
      {
        area: 'Market Products & Product Performance Analytics',
        detail: 'Lead deep-dive analyses on product uptake, pricing performance, market mix and competitive positioning. Provide insights that directly inform product portfolio decisions — which products to promote, reprice or retire.',
      },
      {
        area: 'Customer Lifecycle & Churn Diagnostics',
        detail: 'Analyse behavioural and transactional data to identify churn patterns, segment at-risk customers, and recommend retention interventions. Monitor active base trends, first-use activation rates, and early churn signals across tenure cohorts.',
      },
      {
        area: 'Campaign Performance & CVM Analytics',
        detail: 'Built near-real-time campaign tracking reports that enabled the CVM and marketing squads to optimise in-flight campaigns. Measuring uplift, redemption rates, revenue impact and customer response rates across all active campaigns.',
      },
      {
        area: 'Cross-functional Stakeholder Engagement',
        detail: 'Facilitate monthly business review sessions, requirement-gathering workshops and dashboard walkthroughs with non-technical stakeholders. Translate business questions into structured analytical briefs and feed findings back in narrative form.',
      },
    ],
    achievements: [
      'Consolidated 10+ siloed legacy reports into a single Power BI dashboard suite — adopted by C-suite within 8 weeks of launch and now the organisation\'s primary commercial performance tool.',
      'Designed Airtel Kenya\'s first unified KPI framework, aligning definitions across marketing, product, CVM and 4 regional teams — eliminating recurring metric disputes in monthly business reviews.',
      'Automated the weekly KPI reporting pipeline, cutting ~12 hours of manual data preparation per cycle and improving delivery from T+3 to same-day.',
      'Delivered market product performance analytics that directly informed 3 major product portfolio decisions, including a pricing restructure and a data bundle consolidation.',
      'Built a near-real-time campaign performance tracker that reduced the CVM squad\'s decision cycle from weekly to daily, improving campaign ROI across active promotions.',
    ],
    tools: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Python', 'Advanced Excel', 'Supabase'],
  },
  {
    role: 'Junior Data Analyst',
    company: 'Rite Solutions Ltd',
    location: 'Nairobi, Kenya',
    period: 'Jan 2020 – Apr 2021',
    tenure: '1 yr 4 mo',
    color: 'var(--accent2)',
    context: 'Rite Solutions is a fintech and financial services company offering payment processing, mobile money integration and digital financial products. I was part of the analytics team supporting transaction monitoring, customer insights and operational reporting.',
    highlights: [
      { stat: 'Real-time monitoring', label: 'Transaction analytics built from scratch' },
      { stat: 'Reporting lag reduced', label: 'Through Excel automation & scripting' },
      { stat: 'Fraud signals identified', label: 'Via behavioural anomaly detection' },
    ],
    responsibilities: [
      {
        area: 'Transaction Monitoring & Fraud Analytics',
        detail: 'Designed and maintained dashboards tracking real-time payment transactions, flagging anomalous patterns for fraud investigation. Built threshold-based alerting rules and behavioural baseline models using Excel and SQL.',
      },
      {
        area: 'Customer Segmentation & Engagement Analytics',
        detail: 'Segmented the customer base by transaction frequency, product usage and value tiers to support targeted marketing and retention strategies. Delivered monthly cohort reports tracking new customer activation and engagement trends.',
      },
      {
        area: 'Sales & Operational Reporting',
        detail: 'Maintained Excel-based dashboards providing weekly and monthly visibility into sales performance, agent activity and product penetration. Built reports consumed by regional managers and the executive team.',
      },
      {
        area: 'Reporting Automation',
        detail: 'Automated high-frequency manual processes using advanced Excel functions and Power Query — reducing reporting turnaround from days to hours and eliminating copy-paste errors in production reports.',
      },
    ],
    achievements: [
      'Built the company\'s first real-time transaction monitoring dashboard from scratch, providing a fraud detection capability that had not previously existed — flagging anomalous patterns within minutes of occurrence.',
      'Automated 6 recurring monthly reports using Power Query and Excel, cutting reporting lag from 3 days to same-day delivery and removing a significant source of manual error.',
      'Developed a 4-tier customer segmentation model based on transaction frequency and value, used by the marketing team to target retention campaigns — contributing to improved customer engagement metrics.',
      'Delivered a consolidated sales performance dashboard adopted by regional managers across all branches, replacing individually maintained spreadsheets with a single consistent view.',
    ],
    tools: ['SQL', 'Advanced Excel', 'Power Query', 'Python basics', 'Power BI'],
  },
  {
    role: 'Data Analyst Intern',
    company: 'Safety Plus Consulting',
    location: 'Nairobi, Kenya',
    period: 'May 2019 – Dec 2019',
    tenure: '8 months',
    color: 'var(--accent3)',
    context: 'Safety Plus is an occupational health, safety and HR consulting firm. My role was primarily customer and digital analytics — measuring the impact of digital marketing activity and helping optimise the company\'s web presence.',
    highlights: [
      { stat: 'Organic traffic growth', label: 'Through SEO audit & keyword optimisation' },
      { stat: 'Campaign performance', label: 'Tracked and reported to leadership' },
      { stat: 'Reporting processes', label: 'Streamlined for internal stakeholders' },
    ],
    responsibilities: [
      {
        area: 'Digital & Website Analytics',
        detail: 'Conducted SEO audits and analysed website performance metrics using Google Analytics and Search Console. Identified content gaps, keyword opportunities and technical issues — contributing to measurable growth in organic search traffic.',
      },
      {
        area: 'Customer & Campaign Analytics',
        detail: 'Analysed customer enquiry and conversion data to assess which acquisition channels and campaigns were performing. Built simple dashboards to give leadership visibility into digital marketing ROI.',
      },
      {
        area: 'Internal Reporting',
        detail: 'Streamlined internal reporting processes, creating cleaner and more consistent Excel-based reports for campaign performance, lead tracking and client engagement metrics.',
      },
    ],
    achievements: [
      'Executed a full SEO audit identifying 20+ on-page and technical issues — subsequent keyword optimisation contributed to a sustained increase in organic website traffic over 6 months.',
      'Built the company\'s first digital analytics dashboard, giving leadership real-time visibility into campaign performance and website conversion metrics.',
      'Streamlined 4 manual internal reporting processes, reducing the time spent on recurring reports by approximately 60% and improving consistency across outputs.',
    ],
    tools: ['Google Analytics', 'Excel', 'Google Search Console', 'Basic SQL'],
  },
]

export default function ExperiencePage() {
  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.header}>
          <span className="section-label">// Experience</span>
          <h1 className={styles.title}>Work History</h1>
          <p className={styles.sub}>
            6+ years delivering analytics and BI solutions across telecoms, fintech and consulting —
            from junior dashboards to owning KPI governance for a national operator.
          </p>
          <div className="divider" />
        </div>

        <div className={styles.timeline}>
          {jobs.map((job, ji) => (
            <div key={ji} className={styles.job}>

              {/* Connector */}
              <div className={styles.connector}>
                <div className={styles.dot} style={{ background: job.color, boxShadow: `0 0 12px ${job.color}60` }} />
                {ji < jobs.length - 1 && <div className={styles.line} />}
              </div>

              {/* Card */}
              <div className={styles.card}>

                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.role}>{job.role}</h2>
                    <p className={styles.company} style={{ color: job.color }}>{job.company} · {job.location}</p>
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.period}>{job.period}</span>
                    <span className={styles.tenure}>{job.tenure}</span>
                  </div>
                </div>

                {/* Context */}
                <p className={styles.context}>{job.context}</p>

                {/* Highlights */}
                <div className={styles.highlights}>
                  {job.highlights.map(h => (
                    <div key={h.label} className={styles.highlight} style={{ borderColor: job.color + '30', background: job.color + '08' }}>
                      <span className={styles.highlightStat} style={{ color: job.color }}>{h.stat}</span>
                      <span className={styles.highlightLabel}>{h.label}</span>
                    </div>
                  ))}
                </div>

                {/* Responsibilities */}
                <div className={styles.responsibilities}>
                  <h3 className={styles.respTitle}>Key Responsibilities</h3>
                  <div className={styles.respList}>
                    {job.responsibilities.map(r => (
                      <div key={r.area} className={styles.respItem}>
                        <div className={styles.respDot} style={{ background: job.color }} />
                        <div>
                          <p className={styles.respArea}>{r.area}</p>
                          <p className={styles.respDetail}>{r.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className={styles.achievements}>
                  <h3 className={styles.achTitle}>Key Achievements</h3>
                  <ul className={styles.achList}>
                    {job.achievements.map((a, ai) => (
                      <li key={ai} className={styles.achItem} style={{ borderColor: job.color + '25', background: job.color + '08' }}>
                        <span className={styles.achIcon} style={{ color: job.color }}>★</span>
                        <span className={styles.achText}>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools */}
                <div className={styles.tools}>
                  {job.tools.map(t => (
                    <span key={t} className={styles.tool} style={{ color: job.color, borderColor: job.color + '40', background: job.color + '10' }}>
                      {t}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* ── CTAs ── */}
        <div className={styles.ctaRow}>
          <Link to="/projects" className={styles.ctaBtn} data-variant="primary">
            See Project Work →
          </Link>
          <Link to="/skills" className={styles.ctaBtn} data-variant="outline">
            View Skills →
          </Link>
          <Link to="/contact" className={styles.ctaBtn} data-variant="outline">
            Get In Touch →
          </Link>
        </div>

      </div>
    </div>
  )
}
