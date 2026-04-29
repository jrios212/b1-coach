import { useState, useEffect, useRef } from 'react'

const ACCENT = '#FF6B1A'

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

// ── Chart placeholder panel ────────────────────────────────────────────────
// isPadded — true when this is a default-filled third slot with no real chart data
function ChartPanel({ label, delay, flexStyle, isPadded = false }) {
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
        {/* Placeholder body */}
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', gap: 8,
        }}>
          {/* Subtle grid */}
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
      </div>
    </div>
  )
}

// ── Bottom stat pill ───────────────────────────────────────────────────────
function StatPill({ label, value, highlight }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      borderRadius: 10,
      background: highlight ? `${ACCENT}18` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${highlight ? ACCENT + '40' : 'rgba(255,255,255,0.07)'}`,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: 18, lineHeight: 1,
        color: highlight ? ACCENT : 'rgba(255,255,255,0.85)',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: 9.5, color: 'rgba(255,255,255,0.35)',
        marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label}
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
    ? [player.firstName, player.lastName].filter(Boolean).join(' ')
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
        <TMLogo />
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
                label={
                  chart?.label ??
                  (chart?.type
                    ? chart.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : `Chart ${i + 1}`)
                }
                delay={0.14 + i * 0.06}
                flexStyle={flexStyle}
                isPadded={isPadded}
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
