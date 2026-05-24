import { useState } from 'react'
import styles from './ChurnDemo.module.css'

const profiles = [
  {
    id: 'p1',
    name: 'Michael O.',
    initials: 'MO',
    label: 'Critical Risk',
    prob: 87,
    color: '#ef4444',
    attrs: [
      { label: 'Tenure', value: '2 months' },
      { label: 'Contract', value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$89.50' },
      { label: 'Internet Service', value: 'Fiber optic' },
      { label: 'Payment Method', value: 'Electronic check' },
      { label: 'Tech Support', value: 'No' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.42, direction: 'up' },
      { feature: 'Very low tenure (2m)', value: 0.38, direction: 'up' },
      { feature: 'High monthly charges', value: 0.28, direction: 'up' },
      { feature: 'No online security', value: 0.22, direction: 'up' },
      { feature: 'No tech support', value: 0.18, direction: 'up' },
    ],
    action: 'Immediate Intervention',
    actionDetail: 'Priority retention call within 24 hours. Offer a 3-month loyalty discount plus a security and tech support bundle upgrade.',
  },
  {
    id: 'p2',
    name: 'Sarah K.',
    initials: 'SK',
    label: 'High Risk',
    prob: 64,
    color: '#f97316',
    attrs: [
      { label: 'Tenure', value: '8 months' },
      { label: 'Contract', value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$74.20' },
      { label: 'Internet Service', value: 'Fiber optic' },
      { label: 'Payment Method', value: 'Mailed check' },
      { label: 'Online Security', value: 'Yes' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.35, direction: 'up' },
      { feature: 'Short tenure (8m)', value: 0.24, direction: 'up' },
      { feature: 'Higher monthly charges', value: 0.19, direction: 'up' },
      { feature: 'No tech support', value: 0.15, direction: 'up' },
      { feature: 'Has online security', value: 0.08, direction: 'down' },
    ],
    action: 'Proactive Outreach',
    actionDetail: 'Offer 1-year contract migration with a 10% loyalty discount. Emphasise total savings versus ongoing month-to-month billing.',
  },
  {
    id: 'p3',
    name: 'David M.',
    initials: 'DM',
    label: 'Medium Risk',
    prob: 38,
    color: '#f59e0b',
    attrs: [
      { label: 'Tenure', value: '18 months' },
      { label: 'Contract', value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$55.30' },
      { label: 'Internet Service', value: 'DSL' },
      { label: 'Payment Method', value: 'Bank transfer' },
      { label: 'Tech Support', value: 'Yes' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.28, direction: 'up' },
      { feature: 'Active tech support', value: 0.18, direction: 'down' },
      { feature: 'Online security active', value: 0.15, direction: 'down' },
      { feature: 'Moderate charges', value: 0.10, direction: 'up' },
      { feature: 'Growing tenure (18m)', value: 0.08, direction: 'down' },
    ],
    action: 'Monitor & Nurture',
    actionDetail: 'Add to the monthly check-in list. Stable profile but contract type remains the primary risk. Propose an annual plan upgrade at the next billing cycle.',
  },
  {
    id: 'p4',
    name: 'Grace W.',
    initials: 'GW',
    label: 'Low Risk',
    prob: 14,
    color: '#22c55e',
    attrs: [
      { label: 'Tenure', value: '34 months' },
      { label: 'Contract', value: 'One year' },
      { label: 'Monthly Charges', value: '$62.80' },
      { label: 'Internet Service', value: 'Fiber optic' },
      { label: 'Payment Method', value: 'Credit card' },
      { label: 'Tech Support', value: 'Yes' },
    ],
    shap: [
      { feature: 'Annual contract', value: 0.32, direction: 'down' },
      { feature: 'Strong tenure (34m)', value: 0.28, direction: 'down' },
      { feature: 'Active tech support', value: 0.15, direction: 'down' },
      { feature: 'Credit card payment', value: 0.10, direction: 'down' },
      { feature: 'Monthly charges', value: 0.08, direction: 'up' },
    ],
    action: 'Loyalty Programme',
    actionDetail: 'Strong retention profile. Enrol in the referral scheme and VIP loyalty tier. An ideal NPS survey candidate for the quarter.',
  },
  {
    id: 'p5',
    name: 'James A.',
    initials: 'JA',
    label: 'Minimal Risk',
    prob: 4,
    color: '#06b6d4',
    attrs: [
      { label: 'Tenure', value: '58 months' },
      { label: 'Contract', value: 'Two year' },
      { label: 'Monthly Charges', value: '$79.90' },
      { label: 'Internet Service', value: 'Fiber optic' },
      { label: 'Payment Method', value: 'Credit card' },
      { label: 'Tech Support', value: 'Yes' },
    ],
    shap: [
      { feature: 'Two-year contract', value: 0.45, direction: 'down' },
      { feature: 'Long tenure (58m)', value: 0.38, direction: 'down' },
      { feature: 'Credit card payment', value: 0.12, direction: 'down' },
      { feature: 'Active tech support', value: 0.10, direction: 'down' },
      { feature: 'Higher monthly charges', value: 0.06, direction: 'up' },
    ],
    action: 'VIP Retention',
    actionDetail: 'High-value loyal customer. Flag as brand ambassador candidate. Maintain the relationship with an annual account review and personalised rewards.',
  },
]

const GAUGE_R = 63
const GAUGE_CX = 85
const GAUGE_CY = 85
const GAUGE_PATH_LEN = Math.PI * GAUGE_R

function ProbGauge({ prob, color }) {
  const filled = (prob / 100) * GAUGE_PATH_LEN
  const lx = GAUGE_CX - GAUGE_R
  const rx = GAUGE_CX + GAUGE_R
  const cy = GAUGE_CY
  const d = `M ${lx} ${cy} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${rx} ${cy}`

  return (
    <div className={styles.gaugeWrap}>
      <svg viewBox="0 0 170 90" className={styles.gaugeSvg} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${GAUGE_PATH_LEN}`}
          style={{
            transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div className={styles.gaugeLabel}>
        <span
          key={prob}
          className={styles.gaugeNum}
          style={{ color, textShadow: `0 0 24px ${color}50` }}
        >
          {prob}%
        </span>
        <span className={styles.gaugeCaption}>Churn Probability</span>
      </div>
    </div>
  )
}

export default function ChurnDemo() {
  const [selected, setSelected] = useState(profiles[0])
  const [animate, setAnimate] = useState(true)

  function selectProfile(p) {
    if (p.id === selected.id) return
    setAnimate(false)
    setSelected(p)
    setTimeout(() => setAnimate(true), 60)
  }

  const maxShap = Math.max(...selected.shap.map(s => s.value))

  return (
    <div className={styles.demo}>

      {/* Header */}
      <div className={styles.demoHeader}>
        <div className={styles.demoTitleRow}>
          <span className={styles.liveBadge}>● LIVE</span>
          <h2 className={styles.demoTitle}>Interactive Churn Prediction Demo</h2>
        </div>
        <p className={styles.demoDesc}>
          Five customer profiles derived from real XGBoost model outputs. Select any profile to see the predicted churn probability, SHAP-driven feature explanations, and the recommended retention action.
        </p>
      </div>

      {/* Profile selector */}
      <div className={styles.profileRow}>
        {profiles.map(p => (
          <button
            key={p.id}
            className={`${styles.profileCard} ${selected.id === p.id ? styles.profileCardActive : ''}`}
            onClick={() => selectProfile(p)}
            style={selected.id === p.id ? { '--cc': p.color } : {}}
          >
            <div className={styles.avatar} style={{ color: p.color, background: p.color + '1a' }}>
              {p.initials}
            </div>
            <div className={styles.profileMeta}>
              <span className={styles.profileName}>{p.name}</span>
              <span className={styles.riskTag} style={{ color: p.color, background: p.color + '18' }}>
                {p.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Gauge + SHAP row */}
      <div className={styles.outputRow}>

        <div className={styles.gaugePanel}>
          <ProbGauge prob={selected.prob} color={selected.color} />
          <div
            className={styles.riskBanner}
            style={{ borderColor: selected.color + '40', background: selected.color + '12' }}
          >
            <span
              className={styles.riskPulse}
              style={{ background: selected.color, boxShadow: `0 0 8px ${selected.color}` }}
            />
            <span style={{ color: selected.color, fontWeight: 700, fontSize: 13 }}>
              {selected.label}
            </span>
          </div>
        </div>

        <div className={styles.shapPanel}>
          <div className={styles.shapHeader}>
            <h3 className={styles.shapTitle}>Prediction Drivers</h3>
            <span className={styles.shapSubtitle}>SHAP feature contributions</span>
          </div>
          <div className={styles.shapList}>
            {selected.shap.map((s, i) => {
              const isUp = s.direction === 'up'
              const barColor = isUp ? '#ef4444' : '#06b6d4'
              const barPct = (s.value / maxShap) * 100
              return (
                <div key={s.feature} className={styles.shapRow}>
                  <div className={styles.shapLabelWrap}>
                    <span className={styles.shapArrow} style={{ color: barColor }}>
                      {isUp ? '▲' : '▼'}
                    </span>
                    <span className={styles.shapLabel}>{s.feature}</span>
                  </div>
                  <div className={styles.shapTrack}>
                    <div
                      className={styles.shapBar}
                      style={{
                        width: animate ? `${barPct}%` : '0%',
                        background: `linear-gradient(90deg, ${barColor}55, ${barColor})`,
                        transitionDelay: animate ? `${i * 70}ms` : '0ms',
                        boxShadow: animate ? `0 0 8px ${barColor}40` : 'none',
                      }}
                    />
                  </div>
                  <span className={styles.shapVal} style={{ color: barColor }}>
                    {s.value.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className={styles.shapLegend}>
            <span><span style={{ color: '#ef4444' }}>▲</span> Increases churn risk</span>
            <span><span style={{ color: '#06b6d4' }}>▼</span> Reduces churn risk</span>
          </div>
        </div>
      </div>

      {/* Attributes + Recommendation */}
      <div className={styles.bottomRow}>

        <div className={styles.attrsPanel}>
          <h3 className={styles.attrsTitle}>
            <span className={styles.attrsDot} style={{ background: selected.color }} />
            {selected.name} — Profile
          </h3>
          <div className={styles.attrsGrid}>
            {selected.attrs.map(a => (
              <div key={a.label} className={styles.attrCell}>
                <span className={styles.attrLabel}>{a.label}</span>
                <span className={styles.attrValue}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={styles.recPanel}
          style={{ borderColor: selected.color + '45', background: selected.color + '0a' }}
        >
          <div className={styles.recHeader}>
            <div
              className={styles.recIcon}
              style={{ background: selected.color + '20', color: selected.color }}
            >
              ⚡
            </div>
            <div>
              <p className={styles.recSuper}>Recommended Action</p>
              <h3 className={styles.recAction} style={{ color: selected.color }}>
                {selected.action}
              </h3>
            </div>
          </div>
          <p className={styles.recDetail}>{selected.actionDetail}</p>
          <div className={styles.recFootnote}>
            <span>XGBoost</span>
            <span className={styles.recDot} />
            <span>scale_pos_weight = 2.85</span>
            <span className={styles.recDot} />
            <span>AUC 0.891</span>
            <span className={styles.recDot} />
            <span>Recall 85%</span>
          </div>
        </div>

      </div>
    </div>
  )
}
