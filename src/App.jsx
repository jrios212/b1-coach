import { useState, useEffect, useMemo } from 'react'
import LiveSessionScreen from './LiveSessionScreen'
import DebriefScreen from './DebriefScreen'
import ConversationScreen from './ConversationScreen'
import { generateDebrief, sendChatMessage } from './coachApi'

// ── Goal definitions ───────────────────────────────────────────────────────
// These are the app's predefined coaching focus options.
// Labels, subtitles, and tags are app content — not from an external API.
const ACCENT = '#FF6B1A'
const DASHBOARD_COLOR = '#7B9EB8'

const GOALS = [
  {
    id: 'power',
    label: 'Power & Home Runs',
    subtitle: 'Exit velocity · Launch angle · Distance',
    type: 'power',
    tag: 'Launch Angle 20–35°',
    color: ACCENT,
    dashboard: false,
  },
  {
    id: 'contact',
    label: 'Line Drives & Contact',
    subtitle: 'Barrel rate · Sweet spot · Spray chart',
    type: 'contact',
    tag: 'LA 10–15° · Hard Hit %',
    color: ACCENT,
    dashboard: false,
  },
  {
    id: 'allfields',
    label: 'Hit to All Fields',
    subtitle: 'Pull% · Center% · Opposite field%',
    type: 'allfields',
    tag: 'Spray distribution',
    color: ACCENT,
    dashboard: false,
  },
  {
    id: 'popup',
    label: 'Reduce Pop-Ups',
    subtitle: 'Attack angle · Swing path · Tee work',
    type: 'popup',
    tag: 'LA < 0° ↓ · Drive more',
    color: ACCENT,
    dashboard: false,
  },
  {
    id: 'open',
    label: 'Open Session',
    subtitle: 'Free practice · No target metrics',
    type: 'open',
    tag: 'All metrics tracked',
    color: ACCENT,
    dashboard: false,
  },
  {
    id: 'dashboard',
    label: 'Full Dashboard',
    subtitle: 'All metrics & raw session data',
    type: 'dashboard',
    tag: 'Advanced · All charts',
    color: DASHBOARD_COLOR,
    dashboard: true,
  },
]

// ── Icons ──────────────────────────────────────────────────────────────────
function GoalIcon({ type, color, size = 30 }) {
  const s = { width: size, height: size }
  const p = { fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (type === 'power') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <path d="M24 6L28 18H40L30 26L34 38L24 30L14 38L18 26L8 18H20L24 6Z"
        stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.12" />
      <line x1="38" y1="8" x2="44" y2="4" stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1="40" y1="13" x2="47" y2="11" stroke={color} strokeWidth="2" opacity="0.35" />
    </svg>
  )

  if (type === 'contact') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <circle cx="14" cy="24" r="8" strokeWidth="2" fill={color} fillOpacity="0.12" />
      <rect x="26" y="20" width="6" height="20" rx="3" fill={color} fillOpacity="0.12"
        strokeWidth="2" transform="rotate(-30 29 30)" />
      <circle cx="25" cy="20" r="2.5" fill={color} />
      <line x1="25" y1="14" x2="25" y2="17" strokeWidth="1.5" />
      <line x1="29" y1="15" x2="27" y2="17.5" strokeWidth="1.5" />
    </svg>
  )

  if (type === 'allfields') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <path d="M24 40 L8 40 L8 16 Q24 4 40 16 L40 40 Z" strokeWidth="2" fill={color} fillOpacity="0.08" />
      <path d="M24 36 L10 22" strokeWidth="2" />
      <path d="M24 36 L24 14" strokeWidth="2.5" />
      <path d="M24 36 L38 22" strokeWidth="2" />
      <polyline points="7,24 10,22 12,25" strokeWidth="1.5" fill="none" />
      <polyline points="22,16 24,14 26,16" strokeWidth="1.5" fill="none" />
      <polyline points="36,25 38,22 41,24" strokeWidth="1.5" fill="none" />
    </svg>
  )

  if (type === 'popup') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <path d="M10 38 Q12 10 24 8 Q36 6 38 38" strokeWidth="2" fill="none"
        opacity="0.3" strokeDasharray="3 3" />
      <line x1="28" y1="12" x2="36" y2="20" strokeWidth="2.5" />
      <line x1="36" y1="12" x2="28" y2="20" strokeWidth="2.5" />
      <path d="M10 38 Q18 30 38 32" strokeWidth="2.5" />
      <circle cx="38" cy="32" r="3" fill={color} fillOpacity="0.5" strokeWidth="1.5" />
    </svg>
  )

  if (type === 'open') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <circle cx="24" cy="24" r="16" strokeWidth="2" fill={color} fillOpacity="0.1" />
      <path d="M18 10 Q12 24 18 38" strokeWidth="2" />
      <path d="M30 10 Q36 24 30 38" strokeWidth="2" />
      <line x1="16" y1="18" x2="12" y2="20" strokeWidth="1.5" />
      <line x1="15" y1="23" x2="11" y2="24" strokeWidth="1.5" />
      <line x1="32" y1="18" x2="36" y2="20" strokeWidth="1.5" />
      <line x1="33" y1="23" x2="37" y2="24" strokeWidth="1.5" />
    </svg>
  )

  if (type === 'dashboard') return (
    <svg {...s} viewBox="0 0 48 48" {...p}>
      <rect x="6" y="6" width="16" height="16" rx="3" strokeWidth="1.8" fill={color} fillOpacity="0.08" />
      <rect x="26" y="6" width="16" height="16" rx="3" strokeWidth="1.8" fill={color} fillOpacity="0.08" />
      <rect x="6" y="26" width="16" height="16" rx="3" strokeWidth="1.8" fill={color} fillOpacity="0.08" />
      <rect x="26" y="26" width="16" height="16" rx="3" strokeWidth="1.8" fill={color} fillOpacity="0.08" />
      <rect x="9" y="16" width="3" height="4" rx="1" fill={color} opacity="0.7" />
      <rect x="13" y="12" width="3" height="8" rx="1" fill={color} opacity="0.7" />
      <rect x="17" y="9" width="3" height="11" rx="1" fill={color} opacity="0.7" />
      <polyline points="29,18 33,13 37,15 41,10" strokeWidth="2" fill="none" opacity="0.8" />
      <circle cx="12" cy="36" r="1.5" fill={color} opacity="0.6" />
      <circle cx="17" cy="32" r="1.5" fill={color} opacity="0.6" />
      <circle cx="14" cy="38" r="1.5" fill={color} opacity="0.6" />
      <path d="M31 38 A7 7 0 0 1 41 38" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M31 38 A7 7 0 0 1 37 31" strokeWidth="2.5" fill="none" opacity="0.9" />
      <circle cx="36" cy="38" r="1.5" fill={color} />
    </svg>
  )

  return null
}

// ── Badge ──────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 9px',
      borderRadius: 100,
      background: `${color}1A`,
      border: `1px solid ${color}45`,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: '0.06em',
      color: color,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Advanced pill (for Full Dashboard card) ────────────────────────────────
function AdvancedPill() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 100,
      background: 'rgba(123,158,184,0.15)',
      border: '1px solid rgba(123,158,184,0.35)',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '0.1em',
      color: '#7B9EB8',
      textTransform: 'uppercase',
    }}>
      Advanced
    </span>
  )
}

// ── Goal Card ──────────────────────────────────────────────────────────────
function GoalCard({ goal, onNavigate, index, revealed }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <div
      onClick={() => onNavigate(goal.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        position: 'relative',
        borderRadius: 18,
        cursor: 'pointer',
        overflow: 'hidden',
        animation: revealed
          ? `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) ${0.06 + index * 0.055}s both`
          : 'none',
        transform: pressed
          ? 'scale(0.974)'
          : hovered
          ? 'scale(1.012)'
          : 'scale(1)',
        transition:
          'transform 0.16s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.22s ease',
        border: hovered
          ? `1.5px solid ${goal.color}CC`
          : '1.5px solid rgba(255,255,255,0.16)',
        boxShadow: hovered
          ? `0 0 0 1px ${goal.color}30, 0 8px 32px ${goal.color}25, 0 2px 12px rgba(0,0,0,0.55)`
          : '0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        background: hovered
          ? `linear-gradient(140deg, ${goal.color}12 0%, rgba(30,32,38,0.98) 55%)`
          : 'linear-gradient(160deg, rgba(34,36,43,0.97) 0%, rgba(26,28,34,0.98) 100%)',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: hovered ? 6 : 5,
          background: goal.color,
          opacity: hovered ? 1 : 0.65,
          transition: 'width 0.2s, opacity 0.2s',
          borderRadius: '0 3px 3px 0',
        }}
      />

      {/* Hover radial glow */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 12% 50%, ${goal.color}12 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Card content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '16px 18px 16px 24px',
        }}
      >
        {/* Icon row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hovered ? `${goal.color}22` : `${goal.color}12`,
                borderRadius: 16,
                border: `1px solid ${goal.color}${hovered ? '50' : '28'}`,
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
            >
              <GoalIcon
                type={goal.type}
                color={hovered ? goal.color : `${goal.color}CC`}
                size={38}
              />
            </div>
            {goal.dashboard && <AdvancedPill />}
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 23,
            lineHeight: 1.05,
            letterSpacing: '0.005em',
            color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
            marginBottom: 6,
            transition: 'color 0.2s',
          }}
        >
          {goal.label}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 13,
            lineHeight: 1.45,
            color: hovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)',
            marginBottom: 12,
            flex: 1,
            transition: 'color 0.2s',
          }}
        >
          {goal.subtitle}
        </div>

        {/* Metric badge */}
        <div>
          <Badge
            label={goal.tag}
            color={hovered ? goal.color : `${goal.color}AA`}
          />
        </div>
      </div>
    </div>
  )
}

// ── TrackMan logo mark ─────────────────────────────────────────────────────
function TrackManLogo({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 28C22.627 28 28 22.627 28 16S22.627 4 16 4"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M16 23C19.866 23 23 19.866 23 16S19.866 9 16 9"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M16 18C17.105 18 18 17.105 18 16S17.105 14 16 14"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2" fill={color} />
        <line
          x1="4"
          y1="28"
          x2="16"
          y2="16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}
        >
          Powered by
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
          }}
        >
          TrackMan
        </span>
      </div>
    </div>
  )
}

// ── Decorative radar background ────────────────────────────────────────────
function RadarDecor() {
  return (
    <svg
      style={{
        position: 'absolute',
        top: -80,
        right: -80,
        opacity: 0.035,
        pointerEvents: 'none',
      }}
      width="360"
      height="360"
      viewBox="0 0 360 360"
      fill="none"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx="320" cy="40" r={i * 55} stroke="white" strokeWidth="1" />
      ))}
      <line x1="320" y1="40" x2="320" y2="340" stroke="white" strokeWidth="1" />
      <line x1="320" y1="40" x2="20" y2="340" stroke="white" strokeWidth="1" />
      <line x1="320" y1="40" x2="170" y2="360" stroke="white" strokeWidth="1" />
    </svg>
  )
}

// ── Goal Selection Screen ──────────────────────────────────────────────────
// Props:
//   player   — object from TrackMan API: { firstName, lastName } or null while loading
//   onSelect — callback(goalId) called immediately when a card is clicked
function GoalSelectionScreen({ player = null, onSelect }) {
  const [revealed, setRevealed] = useState(false)

  // Stagger-in animation trigger
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Player display values — empty state until TrackMan API provides data
  const firstName = player?.firstName ?? null
  const initials =
    player
      ? `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase()
      : null

  const accentColor = ACCENT

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(155deg, #141518 0%, #0C0D0F 55%, #0E0D12 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <RadarDecor />

      {/* Header row: logo | divider | headline | avatar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 28px 10px',
          gap: 24,
          flexShrink: 0,
          animation: revealed ? 'fadeUp 0.45s ease both' : 'none',
        }}
      >
        <TrackManLogo color={accentColor} />

        <div
          style={{
            width: 1,
            height: 36,
            background: 'rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        />

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 36,
              lineHeight: 1.0,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            {firstName ? (
              <>
                {firstName},{' '}
                <span style={{ color: accentColor, fontStyle: 'italic' }}>
                  what are you working on
                </span>{' '}
                today?
              </>
            ) : (
              <>
                What are you{' '}
                <span style={{ color: accentColor, fontStyle: 'italic' }}>
                  working on
                </span>{' '}
                today?
              </>
            )}
          </div>
          <div
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.38)',
              marginTop: 3,
            }}
          >
            TrackMan tracks every swing. You pick the target.
          </div>
        </div>

        {/* Avatar — empty state until player data loads */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {initials ?? ''}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          margin: '0 28px',
          flexShrink: 0,
        }}
      />

      {/* 3×2 card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 10,
          padding: '12px 28px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {GOALS.map((g, i) => (
          <GoalCard
            key={g.id}
            goal={g}
            onNavigate={onSelect}
            index={i}
            revealed={revealed}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 28px 14px', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 11,
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          Session data synced automatically
        </div>
      </div>
    </div>
  )
}

// ── App root ───────────────────────────────────────────────────────────────
const SESSION_MEMORY_DEPTH = 4

const NICKNAMES = [
  'The Great Bambino',
  'The Sultan of Swat',
  'The Iron Horse',
  'The Say Hey Kid',
  'The Splendid Splinter',
  'Charlie Hustle',
  'The Wizard',
  'Mr. October',
  'The Kid',
  'The Commerce Comet',
]

export default function App() {
  const mockSwings = [
    { plateLocHeight: 2.8, plateLocSide:  0.2, hit: { launch: { exitSpeed: 91, angle: 28, direction:   2 }, landing: { distance: 382 } } },
    { plateLocHeight: 1.2, plateLocSide: -0.3, hit: { launch: { exitSpeed: 87, angle: 15, direction: -22 }, landing: { distance: 305 } } },
    { plateLocHeight: 3.1, plateLocSide: -0.5, hit: { launch: { exitSpeed: 94, angle: 32, direction:   1 }, landing: { distance: 418 } } },
    { plateLocHeight: 2.3, plateLocSide:  0.9, hit: { launch: { exitSpeed: 82, angle:  8, direction: -12 }, landing: { distance: 268 } } },
    { plateLocHeight: 2.6, plateLocSide:  0.4, hit: { launch: { exitSpeed: 96, angle: 30, direction:   4 }, landing: { distance: 431 } } },
    { plateLocHeight: 3.8, plateLocSide:  0.1, hit: { launch: { exitSpeed: 89, angle: 22, direction: -18 }, landing: { distance: 352 } } },
    { plateLocHeight: 2.1, plateLocSide: -0.6, hit: { launch: { exitSpeed: 85, angle: 12, direction:   8 }, landing: { distance: 290 } } },
    { plateLocHeight: 2.9, plateLocSide:  0.3, hit: { launch: { exitSpeed: 93, angle: 35, direction:   0 }, landing: { distance: 408 } } },
    { plateLocHeight: 1.4, plateLocSide:  0.5, hit: { launch: { exitSpeed: 88, angle: 26, direction:  25 }, landing: { distance: 365 } } },
    { plateLocHeight: 3.3, plateLocSide: -0.4, hit: { launch: { exitSpeed: 90, angle: 18, direction:   6 }, landing: { distance: 335 } } },
    { plateLocHeight: 2.7, plateLocSide:  0.6, hit: { launch: { exitSpeed: 95, angle: 29, direction:  -2 }, landing: { distance: 425 } } },
    { plateLocHeight: 0.8, plateLocSide: -0.2, hit: { launch: { exitSpeed: 83, angle:  5, direction:  15 }, landing: { distance: 255 } } },
    { plateLocHeight: 2.4, plateLocSide: -0.3, hit: { launch: { exitSpeed: 92, angle: 31, direction: -28 }, landing: { distance: 395 } } },
    { plateLocHeight: 3.6, plateLocSide:  0.8, hit: { launch: { exitSpeed: 86, angle: 20, direction:  20 }, landing: { distance: 320 } } },
    { plateLocHeight: 2.5, plateLocSide:  0.1, hit: { launch: { exitSpeed: 98, angle: 27, direction:   1 }, landing: { distance: 445 } } },
  ]

  const [screen, setScreen] = useState('goal')
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [dashboardMessage, setDashboardMessage] = useState(false)
  const [sessionNumber, setSessionNumber] = useState(1)
  const [sessions, setSessions] = useState([1])
  const [activeSwings, setActiveSwings] = useState(mockSwings)
  const player = useMemo(() => ({
    firstName: 'Bill',
    lastName: NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)],
  }), [])

  const [sessionHistory, setSessionHistory] = useState([])
  const [viewingSession, setViewingSession] = useState(null)
  const [debriefContent, setDebriefContent] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationStats, setConversationStats] = useState(null)
  const [conversationCharts, setConversationCharts] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)

  const computeStats = (swings) => {
    const total = swings.length
    const avgExitVelocity = Math.round(swings.reduce((s, w) => s + w.hit.launch.exitSpeed, 0) / total)
    const avgLaunchAngle = Math.round(swings.reduce((s, w) => s + w.hit.launch.angle, 0) / total)
    const inZoneCount = swings.filter((w) =>
      w.plateLocHeight >= 1.5 && w.plateLocHeight <= 3.5 &&
      w.plateLocSide >= -0.7 && w.plateLocSide <= 0.7
    ).length
    return { avgExitVelocity, avgLaunchAngle, inZoneCount, totalSwings: total }
  }

  const generateSwings = (prevSwings, sessionNum = 2) => {
    const prevEV = prevSwings.reduce((s, w) => s + w.hit.launch.exitSpeed, 0) / prevSwings.length
    const prevLA = prevSwings.reduce((s, w) => s + w.hit.launch.angle, 0) / prevSwings.length

    // 65/35 improvement bias on session average
    const improving = Math.random() < 0.65
    const sessionEV = prevEV + (improving ? (1 + Math.random() * 3) : -(1 + Math.random() * 2))
    const sessionLA = prevLA + (improving ? (0.5 + Math.random() * 2) : -(0.5 + Math.random() * 1.5))

    // Variance shrinks naturally as sessions progress (more consistent with practice)
    // Session 2: ~87% of session 1 spread, Session 3: ~75%, Session 4: ~65%
    const varianceFactor = Math.max(0.65, 1 - (sessionNum - 2) * 0.12)

    return Array.from({ length: 15 }, () => {
      const ev = Math.round(Math.max(72, Math.min(105, sessionEV + (Math.random() - 0.5) * 16 * varianceFactor)))
      const la = Math.round(Math.max(-5, Math.min(45, sessionLA + (Math.random() - 0.5) * 20 * varianceFactor)))
      const dir = Math.round((Math.random() - 0.5) * 50 * varianceFactor)
      const dist = Math.round(ev * 4.0 + la * 1.8)
      const inZonePitch = Math.random() < 0.70
      const plateLocHeight = inZonePitch
        ? 1.5 + Math.random() * 2.0
        : Math.random() < 0.5
          ? 0.5 + Math.random() * 0.9
          : 3.6 + Math.random() * 0.8
      const plateLocSide = inZonePitch
        ? -0.7 + Math.random() * 1.4
        : Math.random() < 0.5
          ? -1.3 - Math.random() * 0.4
          : 0.8 + Math.random() * 0.4
      return { plateLocHeight: Math.round(plateLocHeight * 100) / 100, plateLocSide: Math.round(plateLocSide * 100) / 100, hit: { launch: { exitSpeed: ev, angle: la, direction: dir }, landing: { distance: dist } } }
    })
  }

  const handleHome = () => {
    setSelectedGoal(null)
    setSessionNumber(1)
    setSessions([1])
    setActiveSwings(mockSwings)
    setSessionHistory([])
    setViewingSession(null)
    setScreen('goal')
  }

  const handleEndSession = () => {
    const stats = computeStats(activeSwings)
    const newEntry = { sessionNumber, swings: activeSwings, stats, messages: [] }
    const updatedHistory = [...sessionHistory, newEntry]

    setSessionHistory(updatedHistory)
    setViewingSession(sessionNumber)
    setScreen('loading')

    const sessionsForDebrief = updatedHistory.filter((s) => s.sessionNumber <= sessionNumber)

    generateDebrief({
      goal: selectedGoal,
      player,
      sessions: sessionsForDebrief,
      viewingSessionNumber: sessionNumber,
    })
      .then((result) => {
        setDebriefContent(result)
        if (result.nextSessionTips?.length > 0) {
          setSessionHistory((prev) =>
            prev.map((s) =>
              s.sessionNumber === sessionNumber
                ? { ...s, messages: [{ role: 'coach', content: '__tips__', tips: result.nextSessionTips }] }
                : s
            )
          )
        }
        setScreen('debrief')
      })
      .catch(() => {
        setDebriefContent(null)
        setScreen('debrief')
      })
  }

  if (screen === 'goal') {
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <GoalSelectionScreen
          player={player}
          onSelect={(goalId) => {
            if (goalId === 'dashboard') {
              setDashboardMessage(true)
              return
            }
            setSelectedGoal(GOALS.find((g) => g.id === goalId))
            setScreen('live')
          }}
        />
        {dashboardMessage && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(30,32,40,0.98) 0%, rgba(20,22,28,0.99) 100%)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: '32px 36px',
              maxWidth: 420,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 20, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#fff',
                marginBottom: 14,
              }}>
                Full Dashboard
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 15, lineHeight: 1.65,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 24,
              }}>
                Full Dashboard is not part of this prototype. This would show all raw TrackMan metrics and advanced charts similar to the current app experience.
              </div>
              <button
                onClick={() => setDashboardMessage(false)}
                style={{
                  height: 42, paddingInline: 24, borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, #FF6B1A 0%, #FF6B1ACC 100%)`,
                  color: '#fff',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 15, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255,107,26,0.35)',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (screen === 'live') {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LiveSessionScreen
          player={player}
          sessionNumber={sessionNumber}
          goalId={selectedGoal?.id}
          goalLabel={selectedGoal?.label}
          swings={activeSwings.map((s) => ({
            exitSpeed: s.hit.launch.exitSpeed,
            angle: s.hit.launch.angle,
            dist: s.hit.landing.distance,
          }))}
          sessionComplete={true}
          onEndSession={handleEndSession}
          onHome={handleHome}
        />
      </div>
    )
  }

  if (screen === 'loading') {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'linear-gradient(155deg, #141518 0%, #0C0D0F 55%, #0E0D12 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20,
      }}>
        <TrackManLogo color={ACCENT} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              animation: `blink 1.2s ease ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 14, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.02em',
        }}>
          Your coach is reviewing the session…
        </div>
      </div>
    )
  }

  if (screen === 'debrief') {
    const viewed = sessionHistory.find((s) => s.sessionNumber === viewingSession) ?? sessionHistory.at(-1)

    const rawSwings = viewed?.swings ?? []
    const topEV = viewed?.swings
      ? Math.max(...viewed.swings.map(s => s.hit.launch.exitSpeed))
      : null

    const sessionContext = {
      goal: selectedGoal,
      player,
      sessions: sessionHistory.filter((s) => s.sessionNumber <= viewingSession),
      viewingSessionNumber: viewingSession,
    }

    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <DebriefScreen
          player={player}
          sessionNumber={viewed?.sessionNumber ?? sessionNumber}
          goalId={selectedGoal?.id}
          goalLabel={selectedGoal?.label}
          sessionData={viewed?.stats ?? null}
          coachingSummary={debriefContent?.coachingSummary ?? null}
          whatThisMeans={debriefContent?.whatThisMeans ?? null}
          charts={debriefContent?.charts ?? []}
          sessions={sessions}
          onSessionToggle={(num) => setViewingSession(num)}
          onExpandChat={() => {
            setConversationMessages(viewed?.messages ?? [])
            setConversationStats(viewed?.stats ?? null)
            setScreen('conversation')
          }}
          onHome={handleHome}
          chatMessages={viewed?.messages ?? []}
          onChatUpdate={(newMessages) =>
            setSessionHistory((prev) =>
              prev.map((s) =>
                s.sessionNumber === viewed?.sessionNumber
                  ? { ...s, messages: newMessages }
                  : s
              )
            )
          }
          sessionCapReached={sessionHistory.length >= SESSION_MEMORY_DEPTH}
          onNewSession={() => {
            if (sessionHistory.length >= SESSION_MEMORY_DEPTH) return
            const newSwings = generateSwings(activeSwings, sessionNumber + 1)
            const newNum = sessionNumber + 1
            setActiveSwings(newSwings)
            setSessionNumber(newNum)
            setSessions((prev) => [...prev, newNum])
            setScreen('live')
          }}
          sessionContext={sessionContext}
          onChartSignal={(chartKey, currentMessages) => {
            if (chartKey) {
              setConversationMessages(currentMessages ?? [])
              setConversationStats(viewed?.stats ?? null)
              setConversationCharts(chartKey ? [{ type: chartKey }] : [])
              setScreen('conversation')
            }
          }}
          rawSwings={rawSwings}
          topEV={topEV}
        />
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ConversationScreen
        player={player}
        sessionNumber={viewingSession ?? sessionNumber}
        goalId={selectedGoal?.id ?? 'power'}
        goalLabel={selectedGoal?.label ?? 'Power & Home Runs'}
        messages={conversationMessages}
        charts={[
          ...(debriefContent?.charts?.map((key) => ({ type: key })) ?? []),
          ...conversationCharts,
        ]}
        sessionStats={conversationStats}
        topEV={conversationStats ? Math.max(...(sessionHistory.find((s) => s.sessionNumber === (viewingSession ?? sessionNumber))?.swings.map((s) => s.hit.launch.exitSpeed) ?? [0])) : null}
        swings={sessionHistory.find((s) => s.sessionNumber === (viewingSession ?? sessionNumber))?.swings ?? []}
        onSendMessage={async (msg) => {
          const updatedMessages = [...conversationMessages, { role: 'user', content: msg }]
          setConversationMessages(updatedMessages)
          setConversationLoading(true)
          try {
            const result = await sendChatMessage({
              goal: selectedGoal,
              player,
              sessions: sessionHistory.filter((s) => s.sessionNumber <= (viewingSession ?? sessionNumber)),
              viewingSessionNumber: viewingSession ?? sessionNumber,
              messages: updatedMessages,
            })
            const finalMessages = [...updatedMessages, { role: 'coach', content: result.message }]
            setConversationMessages(finalMessages)
            setSessionHistory(prev =>
              prev.map(s =>
                s.sessionNumber === (viewingSession ?? sessionNumber)
                  ? { ...s, messages: finalMessages }
                  : s
              )
            )
            if (result.chart) {
              setConversationCharts(() => {
                const debrief = debriefContent?.charts ?? []
                if (debrief.includes(result.chart)) return []
                return [{ type: result.chart }]
              })
            }
          } finally {
            setConversationLoading(false)
          }
        }}
        onCollapse={() => setScreen('debrief')}
        onHome={handleHome}
        isLoading={conversationLoading}
      />
    </div>
  )
}
