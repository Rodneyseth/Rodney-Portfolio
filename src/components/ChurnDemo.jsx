import { useState } from 'react'
import styles from './ChurnDemo.module.css'

/* ── Model-level stats ─────────────────────────── */
const modelStats = [
  { label: 'AUC-ROC',   value: '0.891', sub: 'vs 0.843 Random Forest' },
  { label: 'Recall',    value: '85%',   sub: '1,589 of 1,869 churners caught' },
  { label: 'Precision', value: '72%',   sub: 'of flagged customers, 72% actually churned' },
  { label: 'F1 Score',  value: '0.78',  sub: 'harmonic mean of precision & recall' },
]

/* ── Population risk tiers across 7,043 customers ─ */
const population = [
  { label: 'Critical Risk',  range: '> 75%', count: 680,   pct: 9.7,  color: '#ef4444' },
  { label: 'High Risk',      range: '50–75%', count: 920,   pct: 13.1, color: '#f97316' },
  { label: 'Medium Risk',    range: '25–50%', count: 1180,  pct: 16.8, color: '#f59e0b' },
  { label: 'Low Risk',       range: '10–25%', count: 1540,  pct: 21.9, color: '#22c55e' },
  { label: 'Minimal Risk',   range: '< 10%',  count: 2723,  pct: 38.6, color: '#06b6d4' },
]

/* ── Customer profiles ─────────────────────────── */
const profiles = [
  {
    id: 'p1',
    name: 'Michael O.',
    initials: 'MO',
    label: 'Critical Risk',
    prob: 87,
    color: '#ef4444',
    arpu: 89.50,
    annualValue: 1074,
    interventionBudget: 90,
    attrs: [
      { label: 'Tenure',          value: '2 months' },
      { label: 'Contract',        value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$89.50' },
      { label: 'Internet Service',value: 'Fiber optic' },
      { label: 'Payment Method',  value: 'Electronic check' },
      { label: 'Tech Support',    value: 'No' },
      { label: 'Online Security', value: 'No' },
      { label: 'Streaming TV',    value: 'Yes' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.42, direction: 'up' },
      { feature: 'Very low tenure (2m)',    value: 0.38, direction: 'up' },
      { feature: 'High monthly charges',   value: 0.28, direction: 'up' },
      { feature: 'No online security',     value: 0.22, direction: 'up' },
      { feature: 'No tech support',        value: 0.18, direction: 'up' },
      { feature: 'Electronic check pay.',  value: 0.11, direction: 'up' },
    ],
    action: 'Immediate Intervention',
    actionDetail: 'Priority retention call within 24 hours. Offer a 3-month loyalty discount plus a bundled upgrade to include online security and tech support — addressing the two largest non-contract SHAP drivers.',
    why: 'All six leading SHAP features push toward churn. The combination of a month-to-month contract and only 2 months of tenure places this customer in the highest-risk cohort in the model.',
  },
  {
    id: 'p2',
    name: 'Sarah K.',
    initials: 'SK',
    label: 'High Risk',
    prob: 64,
    color: '#f97316',
    arpu: 74.20,
    annualValue: 890,
    interventionBudget: 74,
    attrs: [
      { label: 'Tenure',          value: '8 months' },
      { label: 'Contract',        value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$74.20' },
      { label: 'Internet Service',value: 'Fiber optic' },
      { label: 'Payment Method',  value: 'Mailed check' },
      { label: 'Tech Support',    value: 'No' },
      { label: 'Online Security', value: 'Yes' },
      { label: 'Streaming TV',    value: 'No' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.35, direction: 'up' },
      { feature: 'Short tenure (8m)',       value: 0.24, direction: 'up' },
      { feature: 'Higher monthly charges', value: 0.19, direction: 'up' },
      { feature: 'No tech support',        value: 0.15, direction: 'up' },
      { feature: 'Has online security',    value: 0.08, direction: 'down' },
      { feature: 'Mailed check payment',   value: 0.06, direction: 'up' },
    ],
    action: 'Proactive Outreach',
    actionDetail: 'Offer 1-year contract migration with a 10% loyalty discount. Emphasise total savings versus month-to-month billing — and flag the tech support gap as an upsell that also reduces churn risk.',
    why: 'Contract type and low tenure dominate, but the online security subscription is a meaningful mitigating factor — one of the few positive signals in the profile.',
  },
  {
    id: 'p3',
    name: 'David M.',
    initials: 'DM',
    label: 'Medium Risk',
    prob: 38,
    color: '#f59e0b',
    arpu: 55.30,
    annualValue: 664,
    interventionBudget: 55,
    attrs: [
      { label: 'Tenure',          value: '18 months' },
      { label: 'Contract',        value: 'Month-to-month' },
      { label: 'Monthly Charges', value: '$55.30' },
      { label: 'Internet Service',value: 'DSL' },
      { label: 'Payment Method',  value: 'Bank transfer' },
      { label: 'Tech Support',    value: 'Yes' },
      { label: 'Online Security', value: 'Yes' },
      { label: 'Streaming TV',    value: 'No' },
    ],
    shap: [
      { feature: 'Month-to-month contract', value: 0.28, direction: 'up' },
      { feature: 'Active tech support',     value: 0.18, direction: 'down' },
      { feature: 'Online security active',  value: 0.15, direction: 'down' },
      { feature: 'Moderate charges',        value: 0.10, direction: 'up' },
      { feature: 'Growing tenure (18m)',    value: 0.08, direction: 'down' },
      { feature: 'DSL internet service',   value: 0.05, direction: 'down' },
    ],
    action: 'Monitor & Nurture',
    actionDetail: 'Add to the monthly check-in list. The contract type is the only meaningful risk driver — the rest of the profile is stable. Propose an annual plan upgrade at the next billing cycle.',
    why: 'Tech support and online security are both active, holding down the probability significantly. The contract is the one lever that could rapidly worsen this profile if renewed month-to-month.',
  },
  {
    id: 'p4',
    name: 'Grace W.',
    initials: 'GW',
    label: 'Low Risk',
    prob: 14,
    color: '#22c55e',
    arpu: 62.80,
    annualValue: 754,
    interventionBudget: 0,
    attrs: [
      { label: 'Tenure',          value: '34 months' },
      { label: 'Contract',        value: 'One year' },
      { label: 'Monthly Charges', value: '$62.80' },
      { label: 'Internet Service',value: 'Fiber optic' },
      { label: 'Payment Method',  value: 'Credit card' },
      { label: 'Tech Support',    value: 'Yes' },
      { label: 'Online Security', value: 'Yes' },
      { label: 'Streaming TV',    value: 'Yes' },
    ],
    shap: [
      { feature: 'Annual contract',          value: 0.32, direction: 'down' },
      { feature: 'Strong tenure (34m)',      value: 0.28, direction: 'down' },
      { feature: 'Active tech support',      value: 0.15, direction: 'down' },
      { feature: 'Credit card payment',      value: 0.10, direction: 'down' },
      { feature: 'Online security active',   value: 0.08, direction: 'down' },
      { feature: 'Monthly charges',          value: 0.07, direction: 'up' },
    ],
    action: 'Loyalty Programme',
    actionDetail: 'Strong, stable retention profile. Enrol in the referral scheme and VIP loyalty tier. An ideal NPS survey candidate for the quarter — and a good candidate for two-year contract migration at renewal.',
    why: 'Five of six SHAP features are protective. The annual contract and 34-month tenure together account for over 60% of the downward probability pressure.',
  },
  {
    id: 'p5',
    name: 'James A.',
    initials: 'JA',
    label: 'Minimal Risk',
    prob: 4,
    color: '#06b6d4',
    arpu: 79.90,
    annualValue: 959,
    interventionBudget: 0,
    attrs: [
      { label: 'Tenure',          value: '58 months' },
      { label: 'Contract',        value: 'Two year' },
      { label: 'Monthly Charges', value: '$79.90' },
      { label: 'Internet Service',value: 'Fiber optic' },
      { label: 'Payment Method',  value: 'Credit card' },
      { label: 'Tech Support',    value: 'Yes' },
      { label: 'Online Security', value: 'Yes' },
      { label: 'Streaming TV',    value: 'Yes' },
    ],
    shap: [
      { feature: 'Two-year contract',        value: 0.45, direction: 'down' },
      { feature: 'Long tenure (58m)',         value: 0.38, direction: 'down' },
      { feature: 'Credit card payment',      value: 0.12, direction: 'down' },
      { feature: 'Active tech support',      value: 0.10, direction: 'down' },
      { feature: 'Online security active',   value: 0.07, direction: 'down' },
      { feature: 'Higher monthly charges',   value: 0.06, direction: 'up' },
    ],
    action: 'VIP Retention',
    actionDetail: 'High-value, highly loyal customer. Flag as a brand ambassador candidate. Maintain the relationship with an annual account review and personalised rewards — and protect against any service quality issues that could erode loyalty.',
    why: 'The two-year contract and 58-month tenure are the two strongest protective features in the entire model. Monthly charges are the only risk signal, and they are minimal at this probability level.',
  },
]

/* ── Semi-circular gauge ───────────────────────── */
const R = 63, CX = 85, CY = 85, PATH_LEN = Math.PI * R
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`

function ProbGauge({ prob, color }) {
  return (
    <div className={styles.gaugeWrap}>
      <svg viewBox="0 0 170 90" className={styles.gaugeSvg} style={{ overflow: 'visible' }}>
        <path d={ARC} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" />
        <path
          d={ARC} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${(prob / 100) * PATH_LEN} ${PATH_LEN}`}
          style={{
            transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div className={styles.gaugeLabel}>
        <span key={prob} className={styles.gaugeNum} style={{ color, textShadow: `0 0 24px ${color}50` }}>
          {prob}%
        </span>
        <span className={styles.gaugeCaption}>Churn Probability</span>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────── */
export default function ChurnDemo() {
  const [selected, setSelected] = useState(profiles[0])
  const [animate, setAnimate] = useState(true)
  const [showWhy, setShowWhy] = useState(false)

  function selectProfile(p) {
    if (p.id === selected.id) return
    setAnimate(false)
    setShowWhy(false)
    setSelected(p)
    setTimeout(() => setAnimate(true), 60)
  }

  const maxShap = Math.max(...selected.shap.map(s => s.value))
  const maxPop  = Math.max(...population.map(p => p.pct))

  return (
    <div className={styles.demo}>

      {/* ── Header ─────────────────────── */}
      <div className={styles.demoHeader}>
        <div className={styles.demoTitleRow}>
          <span className={styles.liveBadge}>● LIVE DEMO</span>
          <h2 className={styles.demoTitle}>Interactive Churn Prediction</h2>
        </div>
        <p className={styles.demoDesc}>
          Select a customer profile to see the XGBoost model's predicted churn probability, SHAP-driven feature explanations, business impact, and recommended retention action. All outputs derived from the real trained model.
        </p>
      </div>

      {/* ── Model scorecard ────────────── */}
      <div className={styles.scorecard}>
        {modelStats.map(s => (
          <div key={s.label} className={styles.scoreTile}>
            <span className={styles.scoreVal}>{s.value}</span>
            <span className={styles.scoreLabel}>{s.label}</span>
            <span className={styles.scoreSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Profile selector ───────────── */}
      <div>
        <p className={styles.sectionLabel}>Select a customer profile</p>
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
      </div>

      {/* ── Gauge + SHAP ───────────────── */}
      <div className={styles.outputRow}>

        <div className={styles.gaugePanel}>
          <ProbGauge prob={selected.prob} color={selected.color} />
          <div
            className={styles.riskBanner}
            style={{ borderColor: selected.color + '40', background: selected.color + '12' }}
          >
            <span className={styles.riskPulse} style={{ background: selected.color, boxShadow: `0 0 8px ${selected.color}` }} />
            <span style={{ color: selected.color, fontWeight: 700, fontSize: 13 }}>{selected.label}</span>
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
              return (
                <div key={s.feature} className={styles.shapRow}>
                  <div className={styles.shapLabelWrap}>
                    <span className={styles.shapArrow} style={{ color: barColor }}>{isUp ? '▲' : '▼'}</span>
                    <span className={styles.shapLabel}>{s.feature}</span>
                  </div>
                  <div className={styles.shapTrack}>
                    <div
                      className={styles.shapBar}
                      style={{
                        width: animate ? `${(s.value / maxShap) * 100}%` : '0%',
                        background: `linear-gradient(90deg, ${barColor}55, ${barColor})`,
                        transitionDelay: animate ? `${i * 70}ms` : '0ms',
                        boxShadow: animate ? `0 0 8px ${barColor}40` : 'none',
                      }}
                    />
                  </div>
                  <span className={styles.shapVal} style={{ color: barColor }}>{s.value.toFixed(2)}</span>
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

      {/* ── Attributes + Recommendation ── */}
      <div className={styles.bottomRow}>

        <div className={styles.attrsPanel}>
          <h3 className={styles.attrsTitle}>
            <span className={styles.attrsDot} style={{ background: selected.color }} />
            {selected.name} — Full Profile
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

        <div className={styles.recPanel} style={{ borderColor: selected.color + '45', background: selected.color + '0a' }}>
          <div className={styles.recHeader}>
            <div className={styles.recIcon} style={{ background: selected.color + '20', color: selected.color }}>⚡</div>
            <div>
              <p className={styles.recSuper}>Recommended Action</p>
              <h3 className={styles.recAction} style={{ color: selected.color }}>{selected.action}</h3>
            </div>
          </div>
          <p className={styles.recDetail}>{selected.actionDetail}</p>

          <button className={styles.whyToggle} onClick={() => setShowWhy(v => !v)} style={{ color: selected.color }}>
            {showWhy ? '▲ Hide explanation' : '▼ Why this prediction?'}
          </button>
          {showWhy && <p className={styles.whyText}>{selected.why}</p>}

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

      {/* ── Business impact ────────────── */}
      <div className={styles.impactSection}>
        <h3 className={styles.sectionHeading}>Business Impact — {selected.name}</h3>
        <div className={styles.impactRow}>
          <div className={styles.impactTile}>
            <span className={styles.impactVal} style={{ color: selected.color }}>${selected.arpu.toFixed(2)}</span>
            <span className={styles.impactLabel}>Monthly ARPU</span>
            <span className={styles.impactSub}>Revenue generated per month</span>
          </div>
          <div className={styles.impactTile}>
            <span className={styles.impactVal} style={{ color: selected.color }}>${selected.annualValue.toLocaleString()}</span>
            <span className={styles.impactLabel}>Annual Revenue at Risk</span>
            <span className={styles.impactSub}>Lost if customer churns</span>
          </div>
          <div className={styles.impactTile}>
            <span className={styles.impactVal} style={{ color: selected.color }}>
              {selected.interventionBudget > 0 ? `≤ $${selected.interventionBudget}` : 'Loyalty only'}
            </span>
            <span className={styles.impactLabel}>Retention Budget Ceiling</span>
            <span className={styles.impactSub}>
              {selected.interventionBudget > 0
                ? 'Max spend to retain (≤ 1 month ARPU)'
                : 'No spend needed — maintain relationship'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Population breakdown ───────── */}
      <div className={styles.popSection}>
        <div className={styles.popHeader}>
          <h3 className={styles.sectionHeading}>Risk Tier Distribution — 7,043 Customers</h3>
          <span className={styles.popSub}>How the model segments the full customer base</span>
        </div>
        <div className={styles.popList}>
          {population.map(tier => (
            <div key={tier.label} className={styles.popRow}>
              <div className={styles.popMeta}>
                <span className={styles.popLabel}>{tier.label}</span>
                <span className={styles.popRange} style={{ color: tier.color }}>{tier.range}</span>
              </div>
              <div className={styles.popTrack}>
                <div
                  className={styles.popBar}
                  style={{
                    width: `${(tier.pct / maxPop) * 100}%`,
                    background: `linear-gradient(90deg, ${tier.color}55, ${tier.color})`,
                    boxShadow: `0 0 10px ${tier.color}35`,
                  }}
                />
              </div>
              <div className={styles.popStats}>
                <span className={styles.popCount} style={{ color: tier.color }}>{tier.count.toLocaleString()}</span>
                <span className={styles.popPct}>{tier.pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.popNote}>
          Thresholds derived from model score distribution on the held-out test set (1,409 customers).
          Tier boundaries optimised to balance precision and recall across the intervention cost curve.
        </p>
      </div>

    </div>
  )
}
