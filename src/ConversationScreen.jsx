import { useState, useEffect, useRef } from 'react'
import {
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar, LabelList,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Cell,
} from 'recharts'

const ACCENT = '#FF6B1A'

const CHART_LABELS = {
  scatter_ev_la:   'Launch Angle vs Exit Velocity',
  trend_ev:        'Exit Velocity Trend',
  bar_distance:    'Distance Distribution',
  spray_direction: 'Spray Chart',
  zone_breakdown:  'Pitch Zone Contact',
}

// ── TrackMan logo ──────────────────────────────────────────────────────────
function TMLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <path d="M16 28C22.627 28 28 22.627 28 16S22.627 4 16 4"
          stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <path d="M16 23C19.866 23 23 19.866 23 16S19.866 9 16 9"
          stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M16 18C17.105 18 18 17.105 18 16S17.105 14 16 14"
          stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill={ACCENT} />
        <line x1="4" y1="28" x2="16" y2="16"
          stroke={ACCENT} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: 9, letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
        }}>Powered by</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: 15, letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
        }}>TrackMan</div>
      </div>
    </div>
  )
}

// ── Goal pill icon ─────────────────────────────────────────────────────────
function GoalPillIcon({ goalId, color }) {
  const s = { width: 12, height: 12 }
  const p = { fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (goalId === 'power') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <path d="M24 6L28 18H40L30 26L34 38L24 30L14 38L18 26L8 18H20L24 6Z"
        strokeWidth="3" fill={color} fillOpacity="0.2" />
    </svg>
  )
  if (goalId === 'contact') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <circle cx="14" cy="24" r="8" strokeWidth="3" fill={color} fillOpacity="0.15" />
      <rect x="26" y="20" width="6" height="20" rx="3" strokeWidth="3"
        fill={color} fillOpacity="0.15" transform="rotate(-30 29 30)" />
    </svg>
  )
  if (goalId === 'allfields') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <path d="M24 36L10 22" strokeWidth="3" />
      <path d="M24 36L24 14" strokeWidth="3" />
      <path d="M24 36L38 22" strokeWidth="3" />
    </svg>
  )
  if (goalId === 'popup') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <line x1="28" y1="12" x2="36" y2="20" strokeWidth="3" />
      <line x1="36" y1="12" x2="28" y2="20" strokeWidth="3" />
      <path d="M10 38 Q18 30 38 32" strokeWidth="3" />
    </svg>
  )
  if (goalId === 'open') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <circle cx="24" cy="24" r="16" strokeWidth="3" />
    </svg>
  )
  return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <rect x="6" y="6" width="16" height="16" rx="3" strokeWidth="3" />
      <rect x="26" y="6" width="16" height="16" rx="3" strokeWidth="3" />
      <rect x="6" y="26" width="16" height="16" rx="3" strokeWidth="3" />
      <rect x="26" y="26" width="16" height="16" rx="3" strokeWidth="3" />
    </svg>
  )
}

// ── Radar decoration ───────────────────────────────────────────────────────
function RadarDecor() {
  return (
    <svg style={{ position: 'absolute', top: -80, right: -80, opacity: 0.025, pointerEvents: 'none' }}
      width="340" height="340" viewBox="0 0 340 340" fill="none">
      {[1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx="300" cy="40" r={i * 55} stroke="white" strokeWidth="1" />
      ))}
      <line x1="300" y1="40" x2="300" y2="300" stroke="white" strokeWidth="1" />
      <line x1="300" y1="40" x2="40" y2="300" stroke="white" strokeWidth="1" />
    </svg>
  )
}

// ── Chart components (shared with DebriefScreen) ───────────────────────────
function ScatterEVLA({ swings }) {
  const data = swings.map((swing) => ({
    ev: swing.hit.launch.exitSpeed,
    la: swing.hit.launch.angle,
  }))
  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <ReferenceArea y1={25} y2={35} fill="#FF6B1A" fillOpacity={0.08} stroke="#FF6B1A" strokeOpacity={0.25} />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="ev" type="number" domain={['auto', 'auto']}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'EXIT VELOCITY (MPH)', position: 'insideBottom', offset: -15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <YAxis dataKey="la" type="number" domain={[dataMin => Math.min(dataMin - 2, 0), dataMax => Math.max(dataMax + 2, 38)]}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'LAUNCH ANG.', angle: -90, position: 'insideLeft', offset: 15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <ReferenceLine y={25} stroke="#FF6B1A" strokeOpacity={0.4} strokeDasharray="4 4" />
          <ReferenceLine y={35} stroke="#FF6B1A" strokeOpacity={0.4} strokeDasharray="4 4" />
          <Scatter data={data} name="Swings">
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.la >= 25 && entry.la <= 35 ? '#FF6B1A' : 'rgba(255,255,255,0.3)'}
                fillOpacity={entry.la >= 25 && entry.la <= 35 ? 0.9 : 0.5} />
            ))}
          </Scatter>
          <Tooltip cursor={false} contentStyle={{ background: 'rgba(20,22,28,0.95)', border: '1px solid rgba(255,107,26,0.3)', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow', sans-serif" }}
            itemStyle={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif" }}
            formatter={(value, name) => {
              if (name === 'ev') return [`${value} mph`, 'Exit Velo']
              if (name === 'la') return [`${value}°`, 'Launch Angle']
              return [value, name]
            }} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendEV({ swings }) {
  const data = swings.map((swing, i) => ({ swing: i + 1, ev: swing.hit.launch.exitSpeed }))
  const avgEV = Math.round(data.reduce((sum, d) => sum + d.ev, 0) / data.length)
  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="swing" type="number" domain={[1, 15]} ticks={[1, 3, 5, 7, 9, 11, 13, 15]}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'SWING #', position: 'insideBottom', offset: -15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <YAxis dataKey="ev" type="number" domain={[dataMin => dataMin - 3, dataMax => dataMax + 3]}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'EXIT VELO', angle: -90, position: 'insideLeft', offset: 15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <ReferenceLine y={avgEV} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4"
            label={{ value: `avg ${avgEV}`, position: 'right', fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Barlow' }} />
          <Line type="monotone" dataKey="ev" stroke="#FF6B1A" strokeWidth={2}
            dot={{ fill: '#FF6B1A', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#FF6B1A' }} />
          <Tooltip cursor={false} contentStyle={{ background: 'rgba(20,22,28,0.95)', border: '1px solid rgba(255,107,26,0.3)', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif" }}
            itemStyle={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif" }}
            labelFormatter={(value) => `Swing ${value}`}
            formatter={(value) => [`${value} mph`, 'Exit Velo']} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarDistance({ swings }) {
  const buckets = [
    { range: '160-220', min: 160, max: 220 },
    { range: '220-260', min: 220, max: 260 },
    { range: '260-300', min: 260, max: 300 },
    { range: '300-340', min: 300, max: 340 },
    { range: '340+',    min: 340, max: Infinity },
  ]
  const data = buckets.map(({ range, min, max }) => ({
    range,
    count: swings.filter((s) => { const d = s.hit.landing.distance; return d >= min && d < max }).length,
  }))
  const maxCount = Math.max(...data.map((d) => d.count))
  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="range"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'DISTANCE (FT)', position: 'insideBottom', offset: -15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <YAxis dataKey="count" allowDecimals={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'SWINGS', angle: -90, position: 'insideLeft', offset: 15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.count === maxCount ? '#FF6B1A' : 'rgba(255,107,26,0.35)'} />
            ))}
            <LabelList dataKey="count" position="top"
              style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Barlow Condensed, sans-serif' }} />
          </Bar>
          <Tooltip cursor={false} contentStyle={{ background: 'rgba(20,22,28,0.95)', border: '1px solid rgba(255,107,26,0.3)', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 12 }}
            labelFormatter={(value) => value}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow', sans-serif" }}
            itemStyle={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif" }}
            formatter={(value) => [`${value}`, 'Swings']} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SprayDirection({ swings }) {
  const cx = 150
  const cy = 200
  const arcPoint = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
  }
  const arcPath = (r) => {
    const l = arcPoint(-45, r)
    const rp = arcPoint(45, r)
    return `M ${l.x} ${l.y} A ${r} ${r} 0 0 1 ${rp.x} ${rp.y}`
  }
  const leftLine  = arcPoint(-45, 190)
  const rightLine = arcPoint(45, 190)
  const fairPath = [`M ${cx} ${cy}`, `L ${leftLine.x} ${leftLine.y}`, `A 190 190 0 0 1 ${rightLine.x} ${rightLine.y}`, 'Z'].join(' ')
  const infieldLabel  = arcPoint(0, 120)
  const outfieldLabel = arcPoint(0, 178)
  const renderShape = (x, y, dir, i) => {
    if (dir < -15) return <circle key={i} cx={x} cy={y} r={5} fill="#FF6B1A" fillOpacity={0.8} />
    if (dir > 15) {
      const pts = `${x},${y - 6} ${x - 5},${y + 4} ${x + 5},${y + 4}`
      return <polygon key={i} points={pts} fill="rgba(180,180,255,0.8)" fillOpacity={0.8} />
    }
    return <rect key={i} x={x - 4} y={y - 4} width={8} height={8} fill="rgba(255,200,100,0.8)" fillOpacity={0.8} transform={`rotate(45, ${x}, ${y})`} />
  }
  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
      <svg width="100%" height="100%" viewBox="0 0 300 222" preserveAspectRatio="xMidYMid meet">
        <path d={fairPath} fill="rgba(255,255,255,0.03)" />
        <line x1={cx} y1={cy} x2={leftLine.x}  y2={leftLine.y}  stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={cx} y1={cy} x2={rightLine.x} y2={rightLine.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <path d={arcPath(120)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d={arcPath(185)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <text x={infieldLabel.x}  y={infieldLabel.y  - 5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="Barlow, sans-serif">200ft</text>
        <text x={outfieldLabel.x} y={outfieldLabel.y - 5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="Barlow, sans-serif">350ft+</text>
        {swings.map((swing, i) => {
          const dir  = swing.hit.launch.direction
          const dist = swing.hit.landing.distance
          const scale = Math.min(dist / 420, 1) * 140
          const rad = (dir * Math.PI) / 180
          const x = cx + scale * Math.sin(rad)
          const y = cy - scale * Math.cos(rad)
          return renderShape(x, y, dir, i)
        })}
        <circle cx={86} cy={217} r={5} fill="#FF6B1A" fillOpacity={0.8} />
        <text x={97} y={221} fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Barlow, sans-serif">Pull</text>
        <rect x={129} y={213} width={8} height={8} fill="rgba(255,200,100,0.8)" fillOpacity={0.8} transform="rotate(45, 133, 217)" />
        <text x={145} y={221} fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Barlow, sans-serif">Center</text>
        <polygon points="192,212 187,221 197,221" fill="rgba(180,180,255,0.8)" fillOpacity={0.8} />
        <text x={203} y={221} fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Barlow, sans-serif">Oppo</text>
      </svg>
    </div>
  )
}

function ZoneBreakdown({ swings }) {
  const inZone    = swings.filter((s) =>
    s.plateLocHeight >= 1.5 && s.plateLocHeight <= 3.5 &&
    s.plateLocSide >= -0.7 && s.plateLocSide <= 0.7
  ).length
  const outOfZone = swings.length - inZone
  const data = [
    { label: 'In Zone',     count: inZone },
    { label: 'Out of Zone', count: outOfZone },
  ]
  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" allowDecimals={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
            label={{ value: 'SWINGS', position: 'insideBottom', offset: -15,
              style: { fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" } }} />
          <YAxis type="category" dataKey="label" width={72}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Barlow, sans-serif' }} />
          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.label === 'In Zone' ? '#FF6B1A' : 'rgba(255,107,26,0.3)'} />
            ))}
            <LabelList dataKey="count" position="right"
              style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif' }} />
          </Bar>
          <Tooltip cursor={false} contentStyle={{ background: 'rgba(20,22,28,0.95)', border: '1px solid rgba(255,107,26,0.3)', borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 12 }}
            labelFormatter={() => 'Distance Range'}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow', sans-serif" }}
            itemStyle={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Barlow', sans-serif" }}
            formatter={(value) => [`${value}`, 'Swings']} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart placeholder panel ────────────────────────────────────────────────
// isPadded — true when this is a default-filled third slot with no real chart data
function ChartPanel({ label, delay, flexStyle, isPadded = false, chart = null, swings = null, goalId = null }) {
  if (isPadded) {
    return (
      <div style={{
        ...flexStyle,
        background: 'rgba(20,21,26,0.55)',
        border: '1.5px solid rgba(255,255,255,0.11)',
        borderRadius: 14,
        boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
        animation: `fadeUp 0.42s ease ${delay}s both`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 18px',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: ACCENT, opacity: 0.6, borderRadius: '0 3px 3px 0',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: 0.15 }}>
            <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.2" />
            <path d="M7 14 Q9 8 11 11 Q13 14 15 8" stroke="white" strokeWidth="1.2"
              strokeLinecap="round" fill="none" />
          </svg>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 10.5, color: 'rgba(255,255,255,0.14)',
            textAlign: 'center', lineHeight: 1.5,
            maxWidth: 160,
          }}>
            Keep chatting — more insights may surface
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      ...flexStyle,
      background: 'linear-gradient(145deg, rgba(34,36,44,0.97) 0%, rgba(24,26,33,0.98) 100%)',
      border: '1.5px solid rgba(255,255,255,0.11)',
      borderRadius: 14,
      boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
      animation: `fadeUp 0.42s ease ${delay}s both`,
      position: 'relative', overflow: 'hidden',
      minHeight: 0,
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: ACCENT, opacity: 0.65, borderRadius: '0 3px 3px 0',
      }} />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px 12px 10px 18px' }}>
        {/* Label */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: 17, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: ACCENT,
          marginBottom: 8, flexShrink: 0,
        }}>
          {label}
        </div>
        {/* Chart body */}
        {chart?.type === 'scatter_ev_la' ? (
          <ScatterEVLA swings={swings ?? []} />
        ) : chart?.type === 'trend_ev' ? (
          <TrendEV swings={swings ?? []} />
        ) : chart?.type === 'bar_distance' ? (
          <BarDistance swings={swings ?? []} />
        ) : chart?.type === 'spray_direction' ? (
          <SprayDirection swings={swings ?? []} />
        ) : chart?.type === 'zone_breakdown' ? (
          <ZoneBreakdown swings={swings ?? []} />
        ) : (
          <div style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', gap: 8,
          }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
              viewBox="0 0 200 100" preserveAspectRatio="none">
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="white" strokeWidth="0.8" />
              ))}
              {[50, 100, 150].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="white" strokeWidth="0.8" />
              ))}
            </svg>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.18 }}>
              <rect x="2" y="2" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
              <rect x="15" y="2" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
              <rect x="2" y="15" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
              <rect x="15" y="15" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
            </svg>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 11, color: 'rgba(255,255,255,0.18)',
              textAlign: 'center', position: 'relative',
            }}>
              Chart renders here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Conversation Screen ────────────────────────────────────────────────────
// Props:
//   player          — { firstName, lastName } from TrackMan API, or null
//   sessionNumber   — integer
//   goalId          — string key, e.g. 'power'
//   goalLabel       — display string, e.g. 'Power & Home Runs'
//   messages        — array of { role: 'user' | 'coach', content: string }
//   charts          — array of up to 3 { type, label } objects
//   sessionStats    — { avgExitVelocity, avgLaunchAngle, inZoneCount, totalSwings }
//   onSendMessage   — callback(messageString) — parent handles API call + appending reply
//   onCollapse      — callback to return to the debrief screen
//   isLoading       — true while a coach reply is in-flight
export default function ConversationScreen({
  player = null,
  sessionNumber = null,
  goalId = null,
  goalLabel = null,
  messages = [],
  charts = [],
  sessionStats = null,
  onSendMessage,
  onCollapse,
  isLoading = false,
  topEV = null,
  onHome = null,
  swings = null,
}) {
  const [text, setText] = useState('')
  const [revealed, setRevealed] = useState(false)
  const bottomRef = useRef(null)

  // Stagger-in
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = () => {
    if (!text.trim() || isLoading) return
    const msg = text.trim()
    setText('')
    onSendMessage?.(msg)
  }

  // Player display
  const initials = player
    ? `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase()
    : null
  const displayName = player
    ? [player.firstName, player.lastName].filter(Boolean).join(', ')
    : null

  // Session stats with fallbacks
  const avgEV  = sessionStats?.avgExitVelocity ?? null
  const avgLA  = sessionStats?.avgLaunchAngle  ?? null
  const inZone = sessionStats?.inZoneCount     ?? null
  const total  = sessionStats?.totalSwings     ?? null

  // Fill chart slots to exactly 3; track which are padded defaults vs. real props
  const hasThird = charts.length >= 3
  const chartSlots = [
    { chart: charts[0] ?? { label: 'Contact Point Map' },             isPadded: false,     flexStyle: { flex: 1, minHeight: 0 } },
    { chart: charts[1] ?? { label: 'Launch Angle vs Exit Velocity' }, isPadded: false,     flexStyle: { flex: 1, minHeight: 0 } },
    { chart: charts[2] ?? null,                                        isPadded: !hasThird, flexStyle: hasThird ? { flex: 1, minHeight: 0 } : { flexShrink: 0, maxHeight: 115 } },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(155deg, #141518 0%, #0C0D0F 55%, #0E0D12 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <RadarDecor />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '11px 24px 9px', gap: 14, flexShrink: 0,
        animation: revealed ? 'fadeUp 0.4s ease both' : 'none',
      }}>
        <div
          onClick={onHome ?? undefined}
          style={{ cursor: onHome ? 'pointer' : 'default', opacity: 0.85, transition: 'opacity 0.15s' }}
          onMouseEnter={onHome ? (e) => (e.currentTarget.style.opacity = '1') : undefined}
          onMouseLeave={onHome ? (e) => (e.currentTarget.style.opacity = '0.85') : undefined}
        >
          <TMLogo />
        </div>
        <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Avatar + player info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: `${ACCENT}20`, border: `1.5px solid ${ACCENT}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 12, color: ACCENT,
          }}>
            {initials ?? ''}
          </div>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 15,
              color: 'rgba(255,255,255,0.9)', lineHeight: 1,
            }}>
              {displayName ?? <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>}
            </div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1,
            }}>
              {sessionNumber != null ? `Session ${sessionNumber} debrief · Follow-up` : 'Session debrief · Follow-up'}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Goal pill */}
        {goalId && goalLabel && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 11px', borderRadius: 9,
            background: `${ACCENT}15`, border: `1px solid ${ACCENT}35`,
          }}>
            <GoalPillIcon goalId={goalId} color={ACCENT} />
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 12, color: ACCENT,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {goalLabel}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, gap: 10, minHeight: 0 }}>

        {/* Main row: charts (40%) + chat */}
        <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0 }}>

          {/* ── Left: 3 stacked chart placeholders ── */}
          <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {chartSlots.map(({ chart, isPadded, flexStyle }, i) => (
              <ChartPanel
                key={i}
                label={CHART_LABELS[chart?.type] ?? chart?.label ?? `Chart ${i + 1}`}
                delay={0.14 + i * 0.06}
                flexStyle={flexStyle}
                isPadded={isPadded}
                chart={chart}
                swings={swings}
                goalId={goalId}
              />
            ))}
          </div>

          {/* ── Right: chat panel ── */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(145deg, rgba(34,36,44,0.97) 0%, rgba(24,26,33,0.98) 100%)',
            border: '1.5px solid rgba(255,255,255,0.11)',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.45)',
            animation: revealed ? 'fadeUp 0.42s ease 0.08s both' : 'none',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Left accent bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
              background: ACCENT, opacity: 0.65, borderRadius: '0 3px 3px 0',
            }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px 10px 18px', minHeight: 0 }}>

              {/* Chat panel header: label + collapse button */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10, flexShrink: 0,
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 17, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: ACCENT,
                }}>
                  Virtual Coach
                </div>
                <button
                  onClick={onCollapse}
                  title="Back to debrief"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 26, paddingInline: 9, borderRadius: 7, border: 'none',
                    background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                    transition: 'background 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M11 5H1M5 1L1 5l4 4"
                      stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600, fontSize: 11, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
                  }}>
                    Debrief
                  </span>
                </button>
              </div>

              {/* Message thread */}
              <div
                className="chat-scroll"
                style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}
              >
                {messages.length === 0 && !isLoading && (
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: '24px 0',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                      <path d="M9 15h14M9 19h9" stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 13, color: 'rgba(255,255,255,0.2)',
                      textAlign: 'center', lineHeight: 1.5,
                    }}>
                      Continue the conversation with your coach
                    </div>
                  </div>
                )}

                {messages.map((m, i) => {
                  if (m.content === '__tips__' && Array.isArray(m.tips)) {
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700, fontSize: 10, letterSpacing: '0.04em',
                          color: ACCENT, paddingLeft: 2, paddingRight: 2, whiteSpace: 'nowrap',
                        }}>
                          Coach
                        </div>
                        <div style={{
                          maxWidth: '88%', padding: '9px 13px',
                          borderRadius: '12px 12px 12px 4px',
                          background: `${ACCENT}15`,
                          border: `1px solid ${ACCENT}30`,
                          fontFamily: "'Barlow', sans-serif", fontSize: 14, lineHeight: 1.5,
                          color: 'rgba(255,255,255,0.9)',
                        }}>
                          <div style={{ marginBottom: 8 }}>Here are your top priorities for next session:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {m.tips.map((tip, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                <div style={{
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: `${ACCENT}25`, border: `1.5px solid ${ACCENT}60`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0, marginTop: 2,
                                }}>
                                  <span style={{
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontWeight: 800, fontSize: 9, color: ACCENT,
                                  }}>{j + 1}</span>
                                </div>
                                <div style={{
                                  fontFamily: "'Barlow', sans-serif",
                                  fontSize: 14, lineHeight: 1.5,
                                  color: 'rgba(255,255,255,0.85)',
                                }}>{tip}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  const isUser = m.role === 'user'
                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column', gap: 3,
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700, fontSize: 10, letterSpacing: '0.04em',
                        color: isUser ? 'rgba(255,255,255,0.3)' : ACCENT,
                        paddingLeft: 2, paddingRight: 2, whiteSpace: 'nowrap',
                      }}>
                        {isUser ? 'You' : 'Coach'}
                      </div>
                      <div style={{
                        maxWidth: '88%', padding: '9px 13px',
                        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        background: isUser ? 'rgba(255,255,255,0.07)' : `${ACCENT}12`,
                        border: isUser ? '1px solid rgba(255,255,255,0.09)' : `1px solid ${ACCENT}28`,
                        fontFamily: "'Barlow', sans-serif",
                        fontSize: 14, lineHeight: 1.6,
                        color: isUser ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.92)',
                      }}>
                        {m.content}
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {isLoading && (
                  <div style={{ display: 'flex', gap: 4, padding: '4px 2px', alignItems: 'center' }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, fontSize: 10, color: ACCENT, marginRight: 4,
                    }}>
                      Coach
                    </div>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 5, height: 5, borderRadius: '50%', background: ACCENT,
                        animation: `blink 1.2s ease ${i * 0.18}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ flexShrink: 0, marginTop: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(14,15,20,0.95)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 11, padding: '0 8px 0 12px', height: 40,
                }}>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Continue the conversation…"
                    style={{
                      flex: 1, background: 'transparent',
                      border: 'none', outline: 'none',
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 14, color: 'rgba(255,255,255,0.85)',
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={!text.trim() || isLoading}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: 'none',
                      cursor: text.trim() ? 'pointer' : 'default',
                      background: text.trim() ? ACCENT : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.18s', flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5h10M7 1.5l4 3.5-4 3.5"
                        stroke={text.trim() ? 'white' : 'rgba(255,255,255,0.25)'}
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom stat bar ── */}
        <div style={{
          display: 'flex', gap: 1, flexShrink: 0, height: 56,
          animation: revealed ? 'fadeUp 0.42s ease 0.32s both' : 'none',
        }}>
          {[
            { label: 'Avg EV',  value: avgEV != null ? `${avgEV} mph` : '—',                          highlight: avgEV != null && avgEV >= 88 },
            { label: 'Avg LA',  value: avgLA != null ? `${avgLA}°` : '—',                             highlight: false },
            { label: 'In Zone', value: inZone != null && total != null ? `${inZone}/${total}` : '—',  highlight: false },
            { label: 'Top EV',  value: topEV != null ? `${topEV} mph` : '—',                         highlight: topEV != null && topEV >= 95 },
          ].map((tile) => (
            <div key={tile.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: tile.highlight ? `${ACCENT}18` : 'rgba(255,255,255,0.04)',
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 18, lineHeight: 1,
                color: tile.highlight ? ACCENT : 'rgba(255,255,255,0.85)',
              }}>
                {tile.value}
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 10, color: 'rgba(255,255,255,0.35)',
                marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {tile.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
