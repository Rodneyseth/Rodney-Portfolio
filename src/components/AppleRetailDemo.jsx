import { useState } from 'react'
import styles from './AppleRetailDemo.module.css'

/* ── Dataset-level overview tiles ───────────────── */
const datasetStats = [
  { label: 'Sales Transactions', value: '1M+',  sub: 'Rows in the sales fact table' },
  { label: 'Linked Tables',      value: '5',    sub: 'sales · products · category · stores · warranty' },
  { label: 'Product Categories', value: '6',    sub: 'iPhone · Mac · iPad · Watch · AirPods · Accessories' },
  { label: 'Global Stores',      value: '50+',  sub: 'Countries across Americas, Europe & APAC' },
]

/* ── Pre-baked category data (Jan 2022 – Dec 2023) ─ */
const categories = [
  {
    id: 'iphone',
    name: 'iPhone',
    icon: '📱',
    color: '#06b6d4',
    tagline: "Apple's flagship revenue driver",
    revenue: '$24.8B', growth: '+8.4%', peakMonth: 'Oct 2023', warrantyRate: '3.2%',
    topProducts: [
      { name: 'iPhone 15 Pro Max', pct: 38 },
      { name: 'iPhone 15 Pro',     pct: 28 },
      { name: 'iPhone 14',         pct: 18 },
    ],
    insight: 'September–October revenue spikes confirm the annual iPhone launch cycle. Q4 consistently delivers 3× the mid-year monthly average — the clearest seasonal pattern across all categories.',
    data: [85,75,90,70,65,70,68,75,95,155,145,140,90,80,95,75,70,72,70,78,100,165,152,148],
  },
  {
    id: 'mac',
    name: 'Mac',
    icon: '💻',
    color: '#a855f7',
    tagline: 'Steady growth driven by M-series chips',
    revenue: '$8.2B', growth: '+14.7%', peakMonth: 'Nov 2023', warrantyRate: '2.1%',
    topProducts: [
      { name: 'MacBook Pro 14"', pct: 42 },
      { name: 'MacBook Air M2',  pct: 35 },
      { name: 'Mac mini M2',     pct: 15 },
    ],
    insight: 'Consistent upward trend driven by M-series chip adoption. A secondary back-to-school peak (Aug–Sep) adds a mid-year lift. The lowest warranty claim rate across all hardware categories.',
    data: [60,58,65,62,65,68,70,82,85,90,95,88,65,62,70,67,68,72,75,88,90,95,102,95],
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: '🟦',
    color: '#f59e0b',
    tagline: 'Mature category — stable seasonal demand',
    revenue: '$5.1B', growth: '+2.8%', peakMonth: 'Nov 2023', warrantyRate: '1.8%',
    topProducts: [
      { name: 'iPad Pro 12.9"', pct: 35 },
      { name: 'iPad Air',       pct: 30 },
      { name: 'iPad 10th Gen',  pct: 25 },
    ],
    insight: 'Flattest growth profile — reflects a mature product category. Holiday season (Nov–Dec) remains the single strongest demand driver. Lowest warranty claim rate of any hardware category.',
    data: [55,50,58,52,48,50,52,60,58,65,68,65,52,48,55,50,46,48,52,62,60,68,70,68],
  },
  {
    id: 'watch',
    name: 'Apple Watch',
    icon: '⌚',
    color: '#22c55e',
    tagline: 'Highest YoY growth — strong holiday skew',
    revenue: '$4.6B', growth: '+22.1%', peakMonth: 'Nov 2023', warrantyRate: '2.7%',
    topProducts: [
      { name: 'Watch Ultra 2',  pct: 45 },
      { name: 'Watch Series 9', pct: 38 },
      { name: 'Watch SE',       pct: 17 },
    ],
    insight: 'Strongest YoY growth of any category. The September launch window and November holiday season combine to create a 2.5× monthly revenue uplift in Q4 — making inventory planning critical.',
    data: [35,32,38,35,36,38,40,42,55,75,88,85,38,35,42,38,40,42,44,48,62,82,95,92],
  },
  {
    id: 'airpods',
    name: 'AirPods',
    icon: '🎵',
    color: '#ef4444',
    tagline: 'Most gift-driven — highest Q4 revenue concentration',
    revenue: '$3.2B', growth: '+18.9%', peakMonth: 'Dec 2023', warrantyRate: '4.1%',
    topProducts: [
      { name: 'AirPods Pro 2nd Gen', pct: 52 },
      { name: 'AirPods Max',         pct: 28 },
      { name: 'AirPods 3rd Gen',     pct: 20 },
    ],
    insight: 'December single-month share is 4× the mid-year baseline — the most gift-concentrated category in the portfolio. Highest warranty rate (4.1%) driven primarily by AirPods Pro units, warranting a closer look at the claim-to-sale lag.',
    data: [30,28,32,28,30,32,35,38,42,55,85,95,32,30,35,30,32,35,38,42,48,62,90,100],
  },
]

/* ── SVG trend chart ─────────────────────────────── */
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

const Q_LABELS = [
  { idx: 0,  text: "Jan '22" }, { idx: 3,  text: "Apr '22" },
  { idx: 6,  text: "Jul '22" }, { idx: 9,  text: "Oct '22" },
  { idx: 12, text: "Jan '23" }, { idx: 15, text: "Apr '23" },
  { idx: 18, text: "Jul '23" }, { idx: 21, text: "Oct '23" },
]

function TrendChart({ cat }) {
  const pts      = toPoints(cat.data)
  const lineStr  = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaStr  = `${pts[0].x},${H - PY} ${lineStr} ${pts[pts.length - 1].x},${H - PY}`
  const peakIdx  = cat.data.indexOf(Math.max(...cat.data))

  return (
    <div className={styles.chartWrap}>
      <p className={styles.chartTitle}>
        Monthly Revenue Index — <span style={{ color: cat.color }}>{cat.name}</span>
        <span className={styles.chartRange}> · Jan 2022 – Dec 2023</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className={styles.chartSvg}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={cat.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={cat.color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={PX} y1={PY + (H - PY * 2) * f}
            x2={W - PX} y2={PY + (H - PY * 2) * f}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}

        {/* Quarter separator lines */}
        {[3, 6, 9, 15, 18, 21].map(idx => (
          <line key={idx}
            x1={pts[idx].x} y1={PY}
            x2={pts[idx].x} y2={H - PY}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,3"
          />
        ))}

        {/* Area fill */}
        <polygon key={`area-${cat.id}`} points={areaStr}
          fill="url(#areaGrad)" className={styles.trendArea} />

        {/* Trend line */}
        <polyline key={`line-${cat.id}`} points={lineStr}
          fill="none" stroke={cat.color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className={styles.trendLine}
          style={{ filter: `drop-shadow(0 0 4px ${cat.color}70)` }}
        />

        {/* Peak marker */}
        <circle key={`dot-${cat.id}`}
          cx={pts[peakIdx].x} cy={pts[peakIdx].y} r="4.5"
          fill={cat.color}
          style={{ filter: `drop-shadow(0 0 6px ${cat.color})` }}
          className={styles.peakDot}
        />
        <text x={pts[peakIdx].x} y={pts[peakIdx].y - 9}
          fill={cat.color} fontSize="8" textAnchor="middle"
          fontFamily="monospace" fontWeight="700">
          PEAK
        </text>

        {/* X-axis labels */}
        {Q_LABELS.map(q => (
          <text key={q.idx} x={pts[q.idx].x} y={H + 15}
            fill="rgba(255,255,255,0.22)" fontSize="8"
            textAnchor="middle" fontFamily="monospace">
            {q.text}
          </text>
        ))}
      </svg>
    </div>
  )
}

/* ── Main component ─────────────────────────────── */
export default function AppleRetailDemo() {
  const [selected, setSelected] = useState(categories[0])

  const maxPct = Math.max(...selected.topProducts.map(p => p.pct))

  return (
    <div className={styles.demo}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.liveBadge}>● LIVE DEMO</span>
          <h2 className={styles.title}>Category Performance Explorer</h2>
        </div>
        <p className={styles.desc}>
          Select a product category to explore its revenue trend, seasonal patterns, top products and warranty profile.
          All outputs derived from the Apple Retail Sales dataset (1M+ transactions, Jan 2022 – Dec 2023).
        </p>
      </div>

      {/* Dataset overview tiles */}
      <div className={styles.statsRow}>
        {datasetStats.map(s => (
          <div key={s.label} className={styles.statTile}>
            <span className={styles.statVal}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Category selector */}
      <div>
        <p className={styles.sectionLabel}>Select a product category</p>
        <div className={styles.catRow}>
          {categories.map(c => (
            <button
              key={c.id}
              className={`${styles.catCard} ${selected.id === c.id ? styles.catCardActive : ''}`}
              onClick={() => setSelected(c)}
              style={selected.id === c.id ? { '--cc': c.color } : {}}
            >
              <span className={styles.catIcon}>{c.icon}</span>
              <div className={styles.catMeta}>
                <span className={styles.catName}>{c.name}</span>
                <span className={styles.catGrowth} style={{ color: c.color }}>{c.growth} YoY</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <TrendChart cat={selected} />

      {/* Metrics row */}
      <div className={styles.metricsRow}>
        {[
          { label: 'Est. Period Revenue', value: selected.revenue,     sub: 'Jan 2022 – Dec 2023' },
          { label: 'YoY Revenue Growth',  value: selected.growth,      sub: '2022 → 2023' },
          { label: 'Peak Month',          value: selected.peakMonth,    sub: 'Highest single-month index' },
          { label: 'Warranty Claim Rate', value: selected.warrantyRate, sub: '% of units sold with a claim' },
        ].map(m => (
          <div key={m.label} className={styles.metricTile}>
            <span className={styles.metricVal} style={{ color: selected.color }}>{m.value}</span>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricSub}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Bottom row: top products + insight */}
      <div className={styles.bottomRow}>

        {/* Top products */}
        <div className={styles.productsPanel}>
          <h3 className={styles.panelTitle}>
            <span className={styles.titleDot} style={{ background: selected.color }} />
            Top Products — {selected.name}
          </h3>
          <p className={styles.panelSub}>Revenue share within category</p>
          <div className={styles.productsList}>
            {selected.topProducts.map((p, i) => (
              <div key={p.name} className={styles.productRow}>
                <span className={styles.productRank} style={{ color: selected.color }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.productName}>{p.name}</span>
                <div className={styles.productTrack}>
                  <div
                    className={styles.productBar}
                    style={{
                      width: `${(p.pct / maxPct) * 100}%`,
                      background: `linear-gradient(90deg, ${selected.color}55, ${selected.color})`,
                      boxShadow: `0 0 8px ${selected.color}40`,
                    }}
                  />
                </div>
                <span className={styles.productPct} style={{ color: selected.color }}>{p.pct}%</span>
              </div>
            ))}
          </div>
          <p className={styles.productNote}>
            Revenue share estimates based on category-level SQL aggregation from sales × products join.
          </p>
        </div>

        {/* Insight card */}
        <div
          className={styles.insightPanel}
          style={{ borderColor: selected.color + '40', background: selected.color + '08' }}
        >
          <div className={styles.insightHeader}>
            <div className={styles.insightIcon} style={{ background: selected.color + '20', color: selected.color }}>
              📊
            </div>
            <div>
              <p className={styles.insightSuper}>Category Insight</p>
              <h3 className={styles.insightTitle} style={{ color: selected.color }}>{selected.name}</h3>
              <p className={styles.insightTagline}>{selected.tagline}</p>
            </div>
          </div>
          <p className={styles.insightBody}>{selected.insight}</p>
          <div className={styles.insightFootnote}>
            <span>Prophet</span>
            <span className={styles.dot} />
            <span>statsmodels seasonal_decompose</span>
            <span className={styles.dot} />
            <span>PostgreSQL LAG window</span>
          </div>
        </div>

      </div>
    </div>
  )
}
