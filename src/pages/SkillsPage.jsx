import { Link } from 'react-router-dom'
import useInView from '../hooks/useInView'
import styles from './SkillsPage.module.css'

const stack = [
  {
    category: 'BI & Visualisation',
    color: '#a855f7',
    tools: [
      {
        name: 'Power BI',
        level: 92,
        tags: ['DAX', 'Power Query', 'Data Modelling', 'RLS'],
        desc: 'My primary delivery tool. I design semantic models, write complex DAX measures, build executive dashboards, and embed near-real-time campaign performance reports. Used daily at Airtel Kenya for commercial, usage and campaign reporting.',
      },
      {
        name: 'Advanced Excel',
        level: 95,
        tags: ['Pivot Tables', 'Power Query', 'VBA basics', 'Dynamic Arrays'],
        desc: 'Still one of the most powerful tools in the kit for rapid analysis. I use Excel for financial modelling, KPI worksheets, ad-hoc stakeholder reports and dynamic dashboards built on SQL view exports.',
      },
    ],
  },
  {
    category: 'Data & Query',
    color: '#06b6d4',
    tools: [
      {
        name: 'SQL',
        level: 90,
        tags: ['PostgreSQL', 'Window Functions', 'CTEs', 'Supabase'],
        desc: 'The backbone of all my analytical work. I write complex multi-table queries, cohort-level aggregations, churn summary views, revenue roll-ups and data quality checks. Currently working with PostgreSQL via Supabase on personal projects.',
      },
      {
        name: 'Python',
        level: 80,
        tags: ['pandas', 'scikit-learn', 'XGBoost', 'matplotlib', 'SHAP'],
        desc: 'Used for machine learning pipelines, data transformation, automated reporting (PDF generation) and Supabase data loading. My telco churn project runs a full XGBoost classification pipeline end-to-end in Python.',
      },
    ],
  },
  {
    category: 'Analytics Techniques',
    color: '#f59e0b',
    tools: [
      {
        name: 'KPI Modelling',
        level: 93,
        tags: ['Revenue', 'ARPU', 'Churn', 'Conversion'],
        desc: 'Defining, aligning and tracking KPI frameworks across marketing, product, CVM and regional teams. I own the metric definitions that feed executive reporting at Airtel Kenya and arbitrate discrepancies when teams disagree on numbers.',
      },
      {
        name: 'Segmentation & Cohort Analysis',
        level: 88,
        tags: ['Cohort', 'RFM', 'Tenure Bands', 'Behavioural'],
        desc: 'Building customer segments based on tenure, usage patterns, product mix and behavioural signals. Used to identify high-value retention targets, churn-risk cohorts, and acquisition quality benchmarks.',
      },
      {
        name: 'Churn & Retention Analytics',
        level: 87,
        tags: ['Churn Prediction', 'Survival Analysis', 'Early Warning'],
        desc: 'From diagnostic reporting ("why did churn spike?") to predictive modelling ("who is likely to churn next month?"). My telco churn ML project produced an XGBoost model with 85% recall at AUC 0.891.',
      },
      {
        name: 'Variance & Root-Cause Analysis',
        level: 90,
        tags: ['Revenue Variance', 'Product Mix', 'Waterfall'],
        desc: 'Decomposing revenue and KPI movements into price, volume, mix and quality effects. Critical for monthly business review packs where executives need to understand not just what changed but why.',
      },
    ],
  },
]

const competencies = [
  'Data Storytelling', 'Stakeholder Engagement', 'Agile / Scrum',
  'Revenue Forecasting', 'Market Mix Modelling', 'Product Performance Analysis',
  'Campaign Analytics', 'CVM Analytics', 'Fraud Detection',
  'Data Pipeline Design', 'Cross-functional Workshop Facilitation',
  'Automated Reporting', 'SHAP Explainability',
]

const learning = [
  { item: 'Microsoft PL-300 (Power BI Data Analyst)', status: 'In progress' },
  { item: 'Time-series forecasting with Prophet & ARIMA', status: 'In progress' },
  { item: 'dbt (data build tool) for SQL transformation', status: 'Exploring' },
  { item: 'Streamlit dashboards for Python-native reporting', status: 'Exploring' },
]

export default function SkillsPage() {
  const [ref, visible] = useInView()

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.header}>
          <span className="section-label">// Skills & Stack</span>
          <h1 className={styles.title}>My Technical Stack</h1>
          <p className={styles.sub}>
            Six years of hands-on analytics work across telecoms, fintech and consulting —
            building the tools, techniques and domain knowledge that move numbers into decisions.
          </p>
          <div className="divider" />
        </div>

        {/* ── Tool deep dives ── */}
        <div ref={ref}>
        {stack.map((cat, ci) => (
          <section key={cat.category} className={styles.category}>
            <h2 className={styles.catTitle}>
              <span className={styles.catNum}>{String(ci + 1).padStart(2, '0')}</span>
              <span style={{ color: cat.color }}>{cat.category}</span>
            </h2>
            <div className={styles.toolGrid}>
              {cat.tools.map((tool, ti) => (
                <div key={tool.name} className={styles.toolCard}>
                  <div className={styles.toolHeader}>
                    <div>
                      <h3 className={styles.toolName}>{tool.name}</h3>
                      <div className={styles.toolTags}>
                        {tool.tags.map(t => (
                          <span key={t} className={styles.toolTag} style={{ color: cat.color, borderColor: cat.color + '55', background: cat.color + '18' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.toolLevel} style={{ color: cat.color }}>{tool.level}%</span>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={styles.fill}
                      style={{
                        width: visible ? `${tool.level}%` : '0%',
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`,
                        transitionDelay: `${ci * 0.15 + ti * 0.08}s`,
                      }}
                    />
                  </div>
                  <p className={styles.toolDesc}>{tool.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        </div>

        {/* ── Other competencies ── */}
        <section className={styles.category}>
          <h2 className={styles.catTitle}>
            <span className={styles.catNum}>04</span>
            <span>Other Competencies</span>
          </h2>
          <div className={styles.competencyGrid}>
            {competencies.map(c => (
              <span key={c} className={styles.competency}>{c}</span>
            ))}
          </div>
        </section>

        {/* ── Currently learning ── */}
        <section className={styles.category}>
          <h2 className={styles.catTitle}>
            <span className={styles.catNum}>05</span>
            <span>Currently Learning</span>
          </h2>
          <div className={styles.learningList}>
            {learning.map(l => (
              <div key={l.item} className={styles.learningItem}>
                <span className={styles.learningDot} data-status={l.status === 'In progress' ? 'progress' : 'explore'} />
                <span className={styles.learningText}>{l.item}</span>
                <span className={styles.learningStatus} data-status={l.status === 'In progress' ? 'progress' : 'explore'}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTAs ── */}
        <div className={styles.ctaRow}>
          <Link to="/projects" className={styles.ctaBtn} data-variant="primary">
            See Skills in Action →
          </Link>
          <Link to="/experience" className={styles.ctaBtn} data-variant="outline">
            View Work History →
          </Link>
        </div>

      </div>
    </div>
  )
}
