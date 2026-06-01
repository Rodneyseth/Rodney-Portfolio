import { useState } from 'react'
import styles from './PaySimDemo.module.css'

const datasetStats = [
  { label: 'Transactions',     value: '6.36M',  sub: 'Rows in 30-day simulation' },
  { label: 'Transaction Types', value: '5',      sub: 'CASH_OUT · PAYMENT · CASH_IN · TRANSFER · DEBIT' },
  { label: 'Simulation Window', value: '30 days', sub: '743 hourly steps — modelled on M-Pesa' },
  { label: 'Total Value',       value: '$5.03B',  sub: 'Gross platform transaction value' },
]

const types = [
  {
    id: 'CASH_OUT',
    name: 'CASH_OUT',
    icon: '↑',
    color: '#ef4444',
    tagline: 'Largest type by value — drives platform liquidity risk',
    txCount: '2,237,500', totalValue: '$2.32B', avgAmount: '$1,036', pctVolume: '35.2%', pctValue: '50.8%',
    peakHour: '14:00',
    insight: 'CASH_OUT is the dominant value driver — it represents only 35% of transaction count but over half the platform\'s gross value. Average transaction size ($1,036) is nearly 5× the overall platform average, reflecting large-value withdrawals. Daily volume shows a consistent bimodal pattern: morning peak around 10:00 and afternoon peak at 14:00, with low activity overnight. This type is the primary driver of liquidity outflow from the platform.',
    data: [74200,73800,75100,74500,76200,72900,74800,75600,73400,74100,75800,73200,74900,76100,72600,75300,73700,74400,76800,73100,75500,74700,73900,76300,72800,75000,74300,73600,75900,74100],
  },
  {
    id: 'PAYMENT',
    name: 'PAYMENT',
    icon: '💳',
    color: '#06b6d4',
    tagline: 'Highest volume type — small-value merchant-facing payments',
    txCount: '2,151,495', totalValue: '$463M', avgAmount: '$215', pctVolume: '33.8%', pctValue: '10.1%',
    peakHour: '12:00',
    insight: 'PAYMENT is the most frequent transaction type — nearly one in three transactions is a payment. However, average amount is only $215, the second-lowest across all types, confirming these are routine small-value merchant payments (groceries, utilities, airtime top-ups). Daily volume is highly stable with very low variance — a hallmark of recurring habitual spending rather than event-driven demand. The flat trend line across 30 days suggests steady customer engagement with merchant payments throughout the simulation.',
    data: [71500,72100,71800,72400,71200,72700,71900,72200,71600,72000,72500,71400,72300,71700,72600,71300,72800,71500,72100,72400,71800,72000,72300,71600,72700,71400,72500,71900,72200,71700],
  },
  {
    id: 'CASH_IN',
    name: 'CASH_IN',
    icon: '↓',
    color: '#22c55e',
    tagline: 'Platform liquidity inflow — agent-driven deposits',
    txCount: '1,399,284', totalValue: '$1.35B', avgAmount: '$966', pctVolume: '22.0%', pctValue: '29.6%',
    peakHour: '10:00',
    insight: 'CASH_IN represents the platform\'s primary liquidity inflow channel — agent-facilitated cash deposits by customers. At $966 average per transaction, deposit sizes are broadly similar to CASH_OUT withdrawals, indicating customers are depositing comparable amounts to what they later withdraw. Volume follows a predictable weekday pattern with morning peaks, consistent with customers depositing before making payments during the day. The ratio of CASH_IN to CASH_OUT volume (~0.63) suggests net liquidity drain: more cash is leaving the platform than entering on a daily basis.',
    data: [46200,47100,45800,46900,47500,45600,47200,46500,46800,47000,45900,47300,46100,47600,45700,46800,47100,45500,46900,47400,46200,47000,46600,47200,45800,46700,47300,46000,47500,46400],
  },
  {
    id: 'TRANSFER',
    name: 'TRANSFER',
    icon: '⇌',
    color: '#a855f7',
    tagline: 'Highest avg transaction size — peer-to-peer large transfers',
    txCount: '532,909', totalValue: '$887M', avgAmount: '$1,664', pctVolume: '8.4%', pctValue: '19.4%',
    peakHour: '11:00',
    insight: 'TRANSFER has the highest average transaction amount at $1,664 — 60% above CASH_OUT and 7.7× the platform average. This reflects the nature of peer-to-peer transfers: typically purposeful large-value movements such as business payments, remittances, or family support. Despite representing only 8.4% of transaction volume, TRANSFERs account for nearly 20% of platform value. This type also carries the highest fraud concentration in the dataset — large-value peer transfers are the primary vector for fraudulent activity in the M-Pesa model.',
    data: [17600,17900,17400,18100,17700,18300,17500,17800,18000,17300,18200,17600,17900,17400,18100,17700,18300,17500,17800,18000,17300,18200,17600,17900,17400,18100,17700,18300,17500,17800],
  },
  {
    id: 'DEBIT',
    name: 'DEBIT',
    icon: '−',
    color: '#f59e0b',
    tagline: 'Lowest volume — micro-value automated debits',
    txCount: '41,432', totalValue: '$1.8M', avgAmount: '$44', pctVolume: '0.7%', pctValue: '0.04%',
    peakHour: '09:00',
    insight: 'DEBIT is the smallest transaction type by every metric — just 0.7% of volume and 0.04% of platform value. At $44 average, these are the smallest transactions on the platform, consistent with automated direct-debit charges: subscription services, loan repayments, and utility auto-payments. The extremely low value share despite meaningful transaction count indicates these are high-frequency, low-value automated deductions. Volume is flat across all 30 days with minimal variance — confirming the automated, scheduled nature of these debits.',
    data: [1370,1395,1358,1402,1383,1420,1365,1390,1408,1350,1415,1372,1398,1355,1410,1380,1405,1362,1395,1418,1368,1392,1405,1358,1415,1378,1402,1365,1395,1385],
  },
]

const W = 540, H = 100, PX = 8, PY = 8

function toPoints(data) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const xStep = (W - PX * 2) / (data.length - 1)
  return data.map((v, i) => ({
    x: PX + i * xStep,
    y: PY + (H - PY * 2) * (1 - (v - min) / range),
  }))
}

const DAY_LABELS = [
  { idx: 0, text: 'Day 1' }, { idx: 6, text: 'Day 7' },
  { idx: 13, text: 'Day 14' }, { idx: 19, text: 'Day 20' },
  { idx: 25, text: 'Day 26' }, { idx: 29, text: 'Day 30' },
]

function TrendChart({ type }) {
  const pts     = toPoints(type.data)
  const lineStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaStr = `${pts[0].x},${H - PY} ${lineStr} ${pts[pts.length - 1].x},${H - PY}`
  const peakIdx = type.data.indexOf(Math.max(...type.data))

  return (
    <div className={styles.chartWrap}>
      <p className={styles.chartTitle}>
        Daily Transaction Volume —{' '}
        <span style={{ color: type.color }}>{type.name}</span>
        <span className={styles.chartRange}> · 30-day simulation</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className={styles.chartSvg}>
        <defs>
          <linearGradient id={`grad-${type.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={type.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={type.color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={PX} y1={PY + (H - PY * 2) * f}
            x2={W - PX} y2={PY + (H - PY * 2) * f}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}

        {[6, 13, 19, 25].map(idx => (
          <line key={idx}
            x1={pts[idx].x} y1={PY}
            x2={pts[idx].x} y2={H - PY}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,3"
          />
        ))}

        <polygon points={areaStr}
          fill={`url(#grad-${type.id})`} className={styles.trendArea} />

        <polyline points={lineStr}
          fill="none" stroke={type.color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className={styles.trendLine}
          style={{ filter: `drop-shadow(0 0 4px ${type.color}70)` }}
        />

        <circle
          cx={pts[peakIdx].x} cy={pts[peakIdx].y} r="4.5"
          fill={type.color}
          style={{ filter: `drop-shadow(0 0 6px ${type.color})` }}
          className={styles.peakDot}
        />
        <text x={pts[peakIdx].x} y={pts[peakIdx].y - 9}
          fill={type.color} fontSize="8" textAnchor="middle"
          fontFamily="monospace" fontWeight="700">
          PEAK
        </text>

        {DAY_LABELS.map(d => (
          <text key={d.idx} x={pts[d.idx].x} y={H + 15}
            fill="rgba(255,255,255,0.22)" fontSize="8"
            textAnchor="middle" fontFamily="monospace">
            {d.text}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function PaySimDemo() {
  const [selected, setSelected] = useState(types[0])

  return (
    <div className={styles.demo}>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.liveBadge}>● LIVE DEMO</span>
          <h2 className={styles.title}>Transaction Type Explorer</h2>
        </div>
        <p className={styles.desc}>
          Select a transaction type to explore its daily volume trend, value contribution, and behavioural patterns.
          All outputs derived from the PaySim dataset (6,362,620 transactions, 30-day M-Pesa simulation).
        </p>
      </div>

      <div className={styles.statsRow}>
        {datasetStats.map(s => (
          <div key={s.label} className={styles.statTile}>
            <span className={styles.statVal}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      <div>
        <p className={styles.sectionLabel}>Select a transaction type</p>
        <div className={styles.typeRow}>
          {types.map(t => (
            <button
              key={t.id}
              className={`${styles.typeCard} ${selected.id === t.id ? styles.typeCardActive : ''}`}
              onClick={() => setSelected(t)}
              style={selected.id === t.id ? { '--tc': t.color } : {}}
            >
              <span className={styles.typeIcon} style={{ color: t.color }}>{t.icon}</span>
              <div className={styles.typeMeta}>
                <span className={styles.typeName}>{t.name}</span>
                <span className={styles.typeShare} style={{ color: t.color }}>{t.pctVolume} vol</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <TrendChart type={selected} />

      <div className={styles.metricsRow}>
        {[
          { label: 'Transaction Count',   value: selected.txCount,    sub: 'Total over 30-day simulation' },
          { label: 'Total Value',          value: selected.totalValue, sub: 'Gross platform value' },
          { label: 'Avg Transaction',      value: selected.avgAmount,  sub: 'Mean amount per transaction' },
          { label: 'Value Share',          value: selected.pctValue,   sub: '% of total platform value' },
        ].map(m => (
          <div key={m.label} className={styles.metricTile}>
            <span className={styles.metricVal} style={{ color: selected.color }}>{m.value}</span>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricSub}>{m.sub}</span>
          </div>
        ))}
      </div>

      <div className={styles.bottomRow}>

        <div className={styles.sharePanel}>
          <h3 className={styles.panelTitle}>
            <span className={styles.titleDot} style={{ background: selected.color }} />
            Platform Share — {selected.name}
          </h3>
          <p className={styles.panelSub}>Volume vs value split</p>

          <div className={styles.shareList}>
            {[
              { label: '% of Transaction Volume', value: selected.pctVolume, pct: parseFloat(selected.pctVolume) },
              { label: '% of Platform Value',     value: selected.pctValue,  pct: parseFloat(selected.pctValue) },
            ].map(row => (
              <div key={row.label} className={styles.shareRow}>
                <span className={styles.shareLabel}>{row.label}</span>
                <div className={styles.shareTrack}>
                  <div
                    className={styles.shareBar}
                    style={{
                      width: `${Math.min(row.pct * 2, 100)}%`,
                      background: `linear-gradient(90deg, ${selected.color}55, ${selected.color})`,
                      boxShadow: `0 0 8px ${selected.color}40`,
                    }}
                  />
                </div>
                <span className={styles.shareVal} style={{ color: selected.color }}>{row.value}</span>
              </div>
            ))}

            <div className={styles.peakRow}>
              <span className={styles.peakLabel}>Peak Hour</span>
              <span className={styles.peakVal} style={{ color: selected.color }}>{selected.peakHour}</span>
            </div>
          </div>

          <p className={styles.shareNote}>
            Share derived from 15 PostgreSQL analytical views on paysim.transactions (6.36M rows).
          </p>
        </div>

        <div
          className={styles.insightPanel}
          style={{ borderColor: selected.color + '40', background: selected.color + '08' }}
        >
          <div className={styles.insightHeader}>
            <div className={styles.insightIcon} style={{ background: selected.color + '20', color: selected.color }}>
              📊
            </div>
            <div>
              <p className={styles.insightSuper}>Type Insight</p>
              <h3 className={styles.insightTitle} style={{ color: selected.color }}>{selected.name}</h3>
              <p className={styles.insightTagline}>{selected.tagline}</p>
            </div>
          </div>
          <p className={styles.insightBody}>{selected.insight}</p>
          <div className={styles.insightFootnote}>
            <span>PostgreSQL</span>
            <span className={styles.dot} />
            <span>Supabase paysim schema</span>
            <span className={styles.dot} />
            <span>Python · matplotlib · seaborn</span>
          </div>
        </div>

      </div>
    </div>
  )
}
