import { useState, useEffect, useRef } from 'react'
import { sendChatMessage } from './coachApi'

const ACCENT = '#FF6B1A'
const GOLD   = '#F5A623'

// Layout constants (screen px, same proportions as design)
const PAD = 14
const GAP = 8
const LEFT_W = 290   // Session Summary column + Chat column
const TOP_H  = 352   // top section fixed height

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

// ── Goal pill icon (compact, keyed to goalId) ──────────────────────────────
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
    <svg style={{ position: 'absolute', top: -80, right: -80, opacity: 0.028, pointerEvents: 'none' }}
      width="340" height="340" viewBox="0 0 340 340" fill="none">
      {[1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx="300" cy="40" r={i * 55} stroke="white" strokeWidth="1" />
      ))}
      <line x1="300" y1="40" x2="300" y2="300" stroke="white" strokeWidth="1" />
      <line x1="300" y1="40" x2="40" y2="300" stroke="white" strokeWidth="1" />
    </svg>
  )
}

// ── Status bar icons ───────────────────────────────────────────────────────
function SignalIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 17 12" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 4} y={12 - (4 + i * 2.5)} width="3"
          height={4 + i * 2.5} rx="0.7" fill="rgba(255,255,255,0.5)" />
      ))}
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
      <rect x="0.5" y="0.5" width="13" height="11" rx="2" stroke="rgba(255,255,255,0.32)" />
      <rect x="2" y="2" width="10" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
      <path d="M14.5 4v4c.8-.4 1.5-1.2 1.5-2s-.7-1.6-1.5-2z" fill="rgba(255,255,255,0.28)" />
    </svg>
  )
}

// ── Panel card ─────────────────────────────────────────────────────────────
function Panel({ label, labelColor = 'rgba(255,255,255,0.5)', headerRight, children, style = {}, delay = 0 }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(34,36,44,0.97) 0%, rgba(24,26,33,0.98) 100%)',
      border: '1.5px solid rgba(255,255,255,0.11)',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
      animation: `fadeUp 0.42s ease ${delay}s both`,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: labelColor, opacity: 0.65, borderRadius: '0 3px 3px 0',
      }} />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '14px 16px 14px 20px' }}>
        {/* Panel header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, flexShrink: 0,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 17, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: labelColor,
          }}>
            {label}
          </div>
          {headerRight}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Stat pill ──────────────────────────────────────────────────────────────
function StatPill({ label, value, unit, highlight }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 16px', borderRadius: 12, minWidth: 0,
      background: highlight ? `${ACCENT}18` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${highlight ? ACCENT + '40' : 'rgba(255,255,255,0.08)'}`,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: 28, lineHeight: 1,
        color: highlight ? ACCENT : '#fff',
      }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: 11, color: 'rgba(255,255,255,0.4)',
        marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label}
      </div>
    </div>
  )
}

// ── Chart placeholder ──────────────────────────────────────────────────────
function ChartPlaceholder({ chart }) {
  const label = chart?.type
    ? chart.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Chart'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 10, minHeight: 0,
    }}>
      {/* Placeholder grid */}
      <svg width="100%" height="100%" style={{ opacity: 0.12, position: 'absolute', inset: 0, pointerEvents: 'none' }}
        viewBox="0 0 200 120" preserveAspectRatio="none">
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="white" strokeWidth="0.5" />
        ))}
        {[40, 80, 120, 160].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="white" strokeWidth="0.5" />
        ))}
      </svg>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
        textAlign: 'center', position: 'relative',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: 10, color: 'rgba(255,255,255,0.12)',
        textAlign: 'center', position: 'relative',
      }}>
        Chart will render here
      </div>
    </div>
  )
}

// ── Virtual Coach chat panel ───────────────────────────────────────────────
function ChatPanel({ messages = [], onMessagesChange, onExpandChat, delay, sessionContext, onChartSignal }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = () => {
    if (!text.trim() || loading) return
    const msg = text.trim()
    setText('')
    const updatedMessages = [...messages, { role: 'user', content: msg }]
    onMessagesChange?.(updatedMessages)
    setLoading(true)
    sendChatMessage({ ...sessionContext, messages: updatedMessages })
      .then((result) => {
        onMessagesChange?.([...updatedMessages, { role: 'coach', content: result.message }])
        setLoading(false)
        if (result.chart) {
          onChartSignal?.(result.chart)
        }
      })
      .catch(() => {
        onMessagesChange?.([...updatedMessages, { role: 'coach', content: "Sorry, I couldn't connect right now. Try again in a moment." }])
        setLoading(false)
      })
  }

  const expandIcon = (
    <button
      onClick={onExpandChat}
      title="Expand chat"
      style={{
        width: 24, height: 24, borderRadius: 6, border: 'none',
        background: 'rgba(255,255,255,0.06)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M1 7v3h3M10 4V1H7M1 4V1h3M10 7v3H7"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )

  return (
    <Panel
      label="Virtual Coach"
      labelColor={ACCENT}
      headerRight={expandIcon}
      delay={delay}
      style={{ flex: `0 0 ${LEFT_W}px`, width: LEFT_W }}
    >
      {/* Message thread */}
      <div
        className="chat-scroll"
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2 }}
      >
        {messages.length === 0 && !loading && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, padding: '12px 0',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              <path d="M8 13h12M8 17h8" stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 12, color: 'rgba(255,255,255,0.2)',
              textAlign: 'center', lineHeight: 1.5,
            }}>
              Ask your coach about this session
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', gap: 2,
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 10, letterSpacing: '0.04em',
              color: m.role === 'user' ? 'rgba(255,255,255,0.3)' : ACCENT,
              paddingLeft: 2, paddingRight: 2, whiteSpace: 'nowrap',
            }}>
              {m.role === 'user' ? 'You' : 'Coach'}
            </div>
            <div style={{
              maxWidth: '94%', padding: '7px 10px',
              borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: m.role === 'user' ? 'rgba(255,255,255,0.08)' : `${ACCENT}15`,
              border: m.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${ACCENT}30`,
              fontFamily: "'Barlow', sans-serif", fontSize: 12.5, lineHeight: 1.5,
              color: m.role === 'user' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.9)',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '4px 2px' }}>
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
      <div style={{ flexShrink: 0, marginTop: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(16,18,24,0.9)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 11, padding: '0 8px 0 10px', height: 38,
        }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask your coach…"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontFamily: "'Barlow', sans-serif",
              fontSize: 12.5, color: 'rgba(255,255,255,0.85)',
            }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || loading}
            style={{
              width: 26, height: 26, borderRadius: 7, border: 'none',
              cursor: text.trim() ? 'pointer' : 'default',
              background: text.trim() ? ACCENT : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s', flexShrink: 0,
            }}
          >
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5h9M6 1l4 3.5-4 3.5"
                stroke={text.trim() ? 'white' : 'rgba(255,255,255,0.25)'}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </Panel>
  )
}

// ── Debrief Screen ─────────────────────────────────────────────────────────
// Props:
//   player           — { firstName, lastName } from TrackMan API, or null
//   sessionNumber    — integer
//   goalId           — string key, e.g. 'power'
//   goalLabel        — display string, e.g. 'Power & Home Runs'
//   sessionData      — { avgExitVelocity, avgLaunchAngle, inZoneCount, totalSwings }
//   coachingSummary  — string for the Session Summary body (from Anthropic API)
//   whatThisMeans    — string for the What This Means body (from Anthropic API)
//   nextSessionTips  — array of up to 3 strings (from Anthropic API)
//   charts           — array of { type, data } objects (up to 2); rendered as placeholders
//   sessions         — array of session numbers available, e.g. [1, 2, 3]
//   onSessionToggle  — callback(sessionNumber)
//   onExpandChat     — callback for the expand icon in the Virtual Coach panel
export default function DebriefScreen({
  player = null,
  sessionNumber = null,
  goalId = null,
  goalLabel = null,
  sessionData = null,
  coachingSummary = null,
  whatThisMeans = null,
  nextSessionTips = [],
  charts = [],
  sessions = [],
  onSessionToggle,
  onExpandChat,
  onHome = null,
  onNewSession = null,
  chatMessages = [],
  onChatUpdate = null,
  sessionCapReached = false,
  sessionContext = null,
  onChartSignal = null,
}) {
  const [time, setTime] = useState('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Player display
  const initials = player
    ? `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase()
    : null
  const displayName = player
    ? [player.firstName, player.lastName].filter(Boolean).join(', ')
    : null

  // Session data with fallbacks
  const avgEV    = sessionData?.avgExitVelocity ?? null
  const avgLA    = sessionData?.avgLaunchAngle  ?? null
  const inZone   = sessionData?.inZoneCount     ?? null
  const total    = sessionData?.totalSwings     ?? null

  // Normalize charts array to exactly 2 slots for the bottom row
  const chartSlots = [charts[0] ?? null, charts[1] ?? null]

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(155deg, #141518 0%, #0C0D0F 55%, #0E0D12 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <RadarDecor />

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px 5px',
        fontFamily: "'Barlow', sans-serif", fontSize: 12,
        color: 'rgba(255,255,255,0.38)', flexShrink: 0,
      }}>
        <span>{time}</span>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <SignalIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '3px 24px 9px', gap: 14, flexShrink: 0,
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

        {/* Avatar + name */}
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
              {sessionNumber != null ? `Session ${sessionNumber} debrief` : 'Session debrief'}
            </div>
          </div>
        </div>

        {/* Session toggle pills */}
        {sessions.length > 1 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {sessions.map((s) => {
              const active = s === sessionNumber
              return (
                <button
                  key={s}
                  onClick={() => onSessionToggle?.(s)}
                  style={{
                    height: 24, minWidth: 28, paddingInline: 8,
                    borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: active ? ACCENT : 'rgba(255,255,255,0.07)',
                    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 12, letterSpacing: '0.03em',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        )}

        {sessionCapReached ? (
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          }}>
            Session limit reached
          </div>
        ) : onNewSession ? (
          <button
            onClick={onNewSession}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 28, paddingInline: 12, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 13, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Session
          </button>
        ) : null}

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

      {/* ── Content grid ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: PAD, gap: GAP, minHeight: 0,
      }}>

        {/* ── Top row ── */}
        <div style={{ display: 'flex', gap: GAP, height: TOP_H, flexShrink: 0 }}>

          {/* Session Summary */}
          <Panel
            label="Session Summary"
            labelColor={ACCENT}
            delay={0.08}
            style={{ width: LEFT_W, flexShrink: 0 }}
          >
            {/* Body text */}
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 18, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.78)',
              flex: 1, overflowY: 'auto', minHeight: 0,
            }}>
              {coachingSummary ?? (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                  Session summary will appear here once generated by your coach.
                </span>
              )}
            </div>

            {/* Stat pills — highlight thresholds keyed to goalId */}
            {(() => {
              const h = goalId === 'power'
                ? {
                    ev:     avgEV  != null && avgEV  >= 88,
                    la:     avgLA  != null && avgLA  >= 25,
                    inZone: inZone != null && inZone >= 8,
                  }
                : { ev: false, la: false, inZone: false }

              return (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', flexShrink: 0, paddingTop: 10 }}>
                  <StatPill
                    label="Avg EV"
                    value={avgEV ?? '—'}
                    unit={avgEV != null ? ' mph' : ''}
                    highlight={h.ev}
                  />
                  <StatPill
                    label="Avg LA"
                    value={avgLA ?? '—'}
                    unit={avgLA != null ? '°' : ''}
                    highlight={h.la}
                  />
                  <StatPill
                    label="In Zone"
                    value={inZone ?? '—'}
                    unit={total != null && inZone != null ? `/${total}` : ''}
                    highlight={h.inZone}
                  />
                </div>
              )
            })()}
          </Panel>

          {/* Right column — stacked panels */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: GAP }}>

            {/* What This Means */}
            <Panel label="What This Means" labelColor={GOLD} delay={0.14} style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 18, lineHeight: 1.65,
                color: 'rgba(255,255,255,0.78)',
              }}>
                {whatThisMeans ?? (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                    Coaching context will appear here once generated.
                  </span>
                )}
              </div>
            </Panel>

            {/* Try This Next Session */}
            <Panel label="Try This Next Session" labelColor={ACCENT} delay={0.2} style={{ flex: 1 }}>
              {nextSessionTips.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', minHeight: 0 }}>
                  {nextSessionTips.slice(0, 3).map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Numbered badge */}
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: `${ACCENT}20`, border: `1px solid ${ACCENT}35`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 800, fontSize: 12, color: ACCENT,
                        marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{
                        flex: 1,
                        fontFamily: "'Barlow', sans-serif",
                        fontSize: 18, lineHeight: 1.4,
                        color: 'rgba(255,255,255,0.76)',
                      }}>
                        {tip}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 13, color: 'rgba(255,255,255,0.2)',
                  fontStyle: 'italic',
                }}>
                  Tips will appear here once generated.
                </div>
              )}
            </Panel>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={{ display: 'flex', gap: GAP, flex: 1, minHeight: 0 }}>

          {/* Virtual Coach chat */}
          <ChatPanel messages={chatMessages} onMessagesChange={onChatUpdate} onExpandChat={onExpandChat} delay={0.32} sessionContext={sessionContext} onChartSignal={onChartSignal} />

          {/* Chart slots */}
          {chartSlots.map((chart, i) => {
            const label = chart?.type
              ? chart.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : i === 0 ? 'Launch Angle vs Exit Velocity' : 'Distance Distribution'

            return (
              <Panel
                key={i}
                label={label}
                labelColor={ACCENT}
                delay={0.36 + i * 0.04}
                style={{ flex: 1 }}
              >
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative', minHeight: 0, gap: 8,
                }}>
                  {/* Subtle grid */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
                    preserveAspectRatio="none"
                    viewBox="0 0 200 120"
                  >
                    {[25, 50, 75, 100].map((y) => (
                      <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="white" strokeWidth="0.8" />
                    ))}
                    {[50, 100, 150].map((x) => (
                      <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="white" strokeWidth="0.8" />
                    ))}
                  </svg>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.2 }}>
                    <rect x="3" y="3" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
                    <rect x="18" y="3" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
                    <rect x="3" y="18" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
                    <rect x="18" y="18" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
                  </svg>
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 11, color: 'rgba(255,255,255,0.18)',
                    textAlign: 'center', position: 'relative',
                  }}>
                    Chart renders here
                  </div>
                </div>
              </Panel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
