import { useState } from 'react'
import styles from './AppleRetailDemo.module.css'

/* ── Dataset-level overview tiles ───────────────── */
const datasetStats = [
  { label: 'Sales Transactions', value: '1,040,200', sub: 'Rows in the sales fact table' },
  { label: 'Linked Tables',      value: '5',         sub: 'sales · products · category · stores · warranty' },
  { label: 'Product Categories', value: '10',        sub: 'Smartphone · Tablet · Laptop · Audio · Wearable · Desktop · Accessories · Subscription · Streaming · Smart Speaker' },
  { label: 'Global Stores',      value: '75',        sub: 'Countries across Americas, Europe & APAC' },
]

/* ── Pre-baked category data (Jan 2022 – Dec 2023) ─ */
const categories = [
  {
    id: 'tablet',
    name: 'Tablet',
    icon: '🟦',
    color: '#f59e0b',
    tagline: 'Highest absolute revenue — broad generational mix',
    revenue: '$195.2M', growth: '-0.5%', peakMonth: 'Mar 2022', warrantyRate: '2.80%',
    topProducts: [
      { name: 'iPad mini (5th Generation)', pct: 13 },
      { name: 'iPad (9th Generation)',       pct: 13 },
      { name: 'iPad Pro (M2)',               pct: 12 },
    ],
    insight: 'Tablet leads all categories by 2023 revenue despite a -0.5% YoY decline. Revenue is distributed across four hardware generations in parallel with no single product above 13% — reflecting a broad installed base upgrading at different rates rather than a concentrated launch-driven demand cycle.',
    data: [17290,14916,17625,15295,16789,16282,15833,16982,15379,16155,16453,17161,16414,14906,16703,15797,15838,15542,16954,17046,16322,17367,16140,16191],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: '🔌',
    color: '#f97316',
    tagline: 'Flat, high-attach-rate revenue — MagSafe ecosystem',
    revenue: '$191.0M', growth: '-0.4%', peakMonth: 'Aug 2022', warrantyRate: '2.84%',
    topProducts: [
      { name: 'MagSafe Charger',                   pct: 12 },
      { name: 'Apple Pencil (2nd Generation)',      pct: 10 },
      { name: 'Lightning to USB Cable',             pct: 10 },
    ],
    insight: 'Accessories revenue is nearly flat across the full 24-month window with the lowest peak-to-trough ratio of all hardware categories. The MagSafe ecosystem drives consistent attach-rate sales independent of launch cycles — revenue moves with the installed base, not product announcements.',
    data: [16150,14281,16799,15576,16454,15382,16303,16877,15806,15787,15964,16302,16437,14372,16537,15892,16395,15523,15783,16085,15646,16032,15787,16500],
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    icon: '📱',
    color: '#06b6d4',
    tagline: 'Flat seasonal profile — multi-generation product mix',
    revenue: '$176.0M', growth: '-1.5%', peakMonth: 'Jan 2022', warrantyRate: '2.74%',
    topProducts: [
      { name: 'iPhone 12 mini', pct: 12 },
      { name: 'iPhone 14',      pct: 11 },
      { name: 'iPhone 12',      pct: 11 },
    ],
    insight: 'Unlike the classic Apple launch-cycle spike, smartphone revenue shows a notably flat seasonal profile — the highest single month (Jan 2022) is only 11% above the category average. Three iPhone 12-series models each claim ~11-12% share, indicating multiple generations active simultaneously with no single launch event dominating.',
    data: [15555,14375,15228,14840,15186,15279,14675,14797,14513,15047,14684,14501,14650,13740,14846,14593,14578,14286,14857,15313,14306,15417,14254,15184],
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: '🎧',
    color: '#ef4444',
    tagline: 'Evenly split across Beats and AirPods product lines',
    revenue: '$161.5M', growth: '-1.9%', peakMonth: 'Jul 2023', warrantyRate: '3.05%',
    topProducts: [
      { name: 'Beats Fit Pro',            pct: 15 },
      { name: 'AirPods (3rd Generation)', pct: 15 },
      { name: 'Beats Solo Pro',           pct: 14 },
    ],
    insight: 'Audio is the most evenly distributed category by product — Beats Fit Pro, AirPods 3rd Gen, and Beats Solo Pro each claim roughly equal share (~14-15%). Revenue declined 1.9% YoY with the July 2023 peak driven by mid-year promotional activity rather than a product launch.',
    data: [14014,12732,13871,13686,14106,13556,13779,13969,13341,14025,13732,13723,13661,12006,13549,13327,13528,13310,14292,13631,13216,13650,13833,13454],
  },
  {
    id: 'laptop',
    name: 'Laptop',
    icon: '💻',
    color: '#a855f7',
    tagline: 'Only hardware category with positive YoY revenue growth',
    revenue: '$156.8M', growth: '+1.1%', peakMonth: 'May 2022', warrantyRate: '3.08%',
    topProducts: [
      { name: 'MacBook Air (Retina)', pct: 15 },
      { name: 'MacBook Air (M1)',     pct: 15 },
      { name: 'MacBook Air (M2)',     pct: 13 },
    ],
    insight: 'Laptop is the only hardware category showing positive YoY growth (+1.1%), driven by the MacBook Air line which holds three of the top four revenue positions. The M1→M2 transition created a double-peak effect with both generations selling concurrently through early 2023, maintaining momentum through the chip transition.',
    data: [13525,11500,13181,13101,13842,12772,13121,12970,11872,13292,13147,12703,13029,12064,13085,12925,13599,13478,13333,13338,12973,13183,12906,12897],
  },
  {
    id: 'wearable',
    name: 'Wearable',
    icon: '⌚',
    color: '#22c55e',
    tagline: 'Premium-tier demand anchors consistent wearable revenue',
    revenue: '$134.8M', growth: '-1.6%', peakMonth: 'Oct 2022', warrantyRate: '2.67%',
    topProducts: [
      { name: 'Apple Watch Hermès', pct: 17 },
      { name: 'Apple Watch Series 8', pct: 15 },
      { name: 'Apple Watch SE',       pct: 15 },
    ],
    insight: 'Wearable revenue peaked in October 2022 and trended slightly lower (-1.6% YoY), consistent with the Apple Watch Series 8 cycle winding down before Series 9 launches. The Apple Watch Hermès edition leads at 17% — higher than any mainstream model — pointing to resilient demand at the premium tier.',
    data: [11460,10587,11707,11246,11471,11390,11496,11385,11311,11903,11660,11404,11476,10449,11465,11564,10974,11322,11220,11575,11410,11116,11066,11192],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    icon: '🖥️',
    color: '#6366f1',
    tagline: 'iMac-driven — steady enterprise refresh demand',
    revenue: '$110.0M', growth: '-1.0%', peakMonth: 'Aug 2022', warrantyRate: '2.80%',
    topProducts: [
      { name: 'iMac 27-inch',    pct: 23 },
      { name: 'Mac Pro (Rack)',   pct: 17 },
      { name: 'iMac Pro',        pct: 13 },
    ],
    insight: 'Desktop revenue is steady but declining slightly (-1.0% YoY), largely on the strength of the iMac 27-inch which commands nearly a quarter of category revenue. No strong consumer seasonal pattern — desktop purchases correlate with enterprise hardware refresh cycles rather than product launch events.',
    data: [9350,8976,9553,8968,9373,8694,9716,9768,8787,9627,8785,9466,9420,8917,9154,8976,9686,9008,8841,8825,8990,9549,9403,9234],
  },
  {
    id: 'subscription',
    name: 'Subscription Service',
    icon: '☁️',
    color: '#8b5cf6',
    tagline: 'Smoothest revenue profile — services floor in the portfolio',
    revenue: '$76.5M', growth: '+0.4%', peakMonth: 'Dec 2022', warrantyRate: '2.95%',
    topProducts: [
      { name: 'Apple Music',    pct: 34 },
      { name: 'iCloud',         pct: 21 },
      { name: 'Apple Fitness+', pct: 16 },
    ],
    insight: 'Subscription Service is the most predictable revenue stream in the portfolio — the smoothest monthly profile with the smallest seasonal variance of any category. Apple Music commands 34% share, nearly double iCloud, reflecting the broader Apple services growth narrative. Revenue grew modestly (+0.4% YoY), consistent with subscriber base expansion.',
    data: [6540,6073,6561,5989,6434,6327,6223,6531,6225,5985,6432,6838,6803,5686,6287,6540,6573,6230,6436,6297,6406,6236,6531,6429],
  },
  {
    id: 'streaming',
    name: 'Streaming Device',
    icon: '📺',
    color: '#14b8a6',
    tagline: 'Fastest YoY growth — dual Apple TV model parity',
    revenue: '$39.7M', growth: '+3.3%', peakMonth: 'Dec 2022', warrantyRate: '2.64%',
    topProducts: [
      { name: 'Apple TV HD',                   pct: 42 },
      { name: 'Apple TV 4K',                   pct: 42 },
      { name: 'Apple TV (3rd Generation)',      pct: 16 },
    ],
    insight: 'Streaming Device posts the highest YoY growth in the portfolio (+3.3%), with Apple TV HD and Apple TV 4K perfectly matched at 42% share — an unusually symmetric split indicating both models address distinct customer segments with minimal cannibalization. December peaks confirm a strong gifting use case.',
    data: [3080,3042,3318,3232,3291,3148,3059,3137,3175,3302,2973,3722,3352,2908,3531,3199,3162,3209,3506,3396,3468,3290,3325,3388],
  },
  {
    id: 'smart-speaker',
    name: 'Smart Speaker',
    icon: '🔊',
    color: '#ec4899',
    tagline: 'HomePod dominates — steepest YoY revenue decline',
    revenue: '$19.9M', growth: '-3.4%', peakMonth: 'Apr 2022', warrantyRate: '3.14%',
    topProducts: [
      { name: 'HomePod',      pct: 82 },
      { name: 'HomePod mini', pct: 18 },
    ],
    insight: 'Smart Speaker is the smallest revenue category and the only one with a two-SKU product mix. HomePod commands 82% of category revenue, making this the most concentrated product-to-revenue ratio in the dataset. The -3.4% YoY decline is the steepest in the portfolio, reflecting category headwinds and limited SKU diversity.',
    data: [1716,1622,1809,1874,1799,1535,1802,1619,1705,1655,1785,1704,1570,1679,1595,1677,1854,1741,1749,1561,1515,1723,1689,1566],
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
          All outputs derived from the Apple Retail Sales dataset (1,040,200 transactions, Jan 2022 – Dec 2023).
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
          { label: '2023 Revenue',         value: selected.revenue,      sub: 'Annual total from SQL aggregation' },
          { label: 'YoY Revenue Growth',   value: selected.growth,       sub: '2022 → 2023' },
          { label: 'Peak Month',           value: selected.peakMonth,    sub: 'Highest single-month index' },
          { label: 'Warranty Claim Rate',  value: selected.warrantyRate, sub: '% of units sold with a claim' },
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
            Revenue share derived from category-level SQL aggregation via sales × products join.
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
