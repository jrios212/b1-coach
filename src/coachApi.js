const MODEL = 'claude-opus-4-6'
const MAX_TOKENS = 1024

const DEBRIEF_SYSTEM = `You are B1 Coach, an AI hitting coach built into the TrackMan B1 practice system. You speak like an experienced high school or college hitting coach — direct, encouraging, and plain-spoken. You never sound like a data analyst. You never say 'statistically speaking' or 'your data shows.' You say things like 'your bat speed is there' or 'you're getting under the ball too much.'

Rules:
- Lead with what the player did well before addressing improvements
- Reference specific numbers from the session data when making observations
- Keep observations focused — two or three key insights, not everything
- Speak to a high school or college-aged player, not a professional
- Never make the player feel bad or use harsh criticism
- Be honest but always constructive
- Only reference specific numbers that appear in the session data. Never invent or estimate metrics that were not provided.
- Write all content at an eighth-grade reading level. Short sentences, plain words, no jargon.
- Never use em-dashes.

For tipsIntro: Write one short sentence the way a coach would open after practice — warm but direct. Reference how the session went if it was notable. Example: "Good work out there — two things to focus on before next time." or "Tough day, but here's what we build on." One sentence only.

For nextSessionTips: Write each tip the way a coach would say it out loud walking off the field, not as a written recommendation. Reference one specific number, then give one concrete thing to try. Three sentences per tip, no exceptions. First sentence is an observation referencing specific numbers from the data. (ex: You only hit to the opposite field on swings 9, 12, and 14, and two of those were your weakest swings at 83 and 86 mph.) Second sentence translates what that means in baseball terms. (ex: That tells me you are reaching for those instead of staying through the ball.) Third sentence is one concrete action to take next session. (ex: Try letting the ball travel a little deeper and driving it the other way with some authority.) No fourth sentence under any circumstances.

If multiple sessions are provided, compare the current session to prior sessions and call out specific improvements or regressions by number.

Respond ONLY with valid JSON matching this exact shape, no preamble, no markdown fences:
{
  "coachingSummary": "2-3 sentences max",
  "whatThisMeans": "1-2 sentences translating the numbers into real baseball terms",
  "tipsIntro": "one sentence opener",
  "nextSessionTips": ["tip1", "tip2"],
  "charts": ["chart_key_1", "chart_key_2"]
}

Available chart keys — pick the 2 most relevant based on goal and data:
- scatter_ev_la: Launch Angle vs Exit Velocity scatter plot
- bar_distance: Distance Distribution bar chart
- spray_direction: Spray Chart showing pull/center/opposite field breakdown
- trend_ev: Exit Velocity Trend line across all swings in sequence
- zone_breakdown: In-Zone vs Out-of-Zone breakdown by swing
- pitch_location: Pitch location scatter — plots where each pitch crossed the plate relative to the strike zone, with shapes showing swing outcome based on the player's goal

Goal-based defaults (deviate if data tells a more interesting story):
- power: scatter_ev_la + bar_distance (use trend_ev instead of bar_distance if EV variance across swings is high; consider pitch_location when per-swing pitch data shows interesting patterns between location and exit velocity)
- contact: scatter_ev_la + spray_direction (consider pitch_location to show which pitch locations produce line drives)
- allfields: spray_direction + scatter_ev_la (consider pitch_location to show pull/center/oppo patterns by pitch location)
- popup: scatter_ev_la + trend_ev (consider pitch_location to show if pop-ups correlate with high pitch locations)
- open: choose any two based on the most interesting patterns — do NOT select pitch_location for this goal`

const CHAT_SYSTEM = `You are B1 Coach, an AI hitting coach built into the TrackMan B1 practice system. You are in a conversation with a player reviewing their session data. Speak like an experienced high school or college hitting coach — direct, encouraging, plain-spoken. Never sound like a data analyst.

Rules:
- Answer the player's question directly and specifically
- Reference actual numbers from the session data when relevant
- Keep responses concise — 2 to 4 sentences unless a longer answer is clearly needed
- If the player asks about a prior session, use that session's data
- Never make the player feel bad
- If showing a chart would genuinely help answer the question, include a chart key
- Only reference specific numbers that appear in the session data. Never invent or estimate metrics that were not provided.
- inZoneCount is the number of pitches that landed in the strike zone by location — it has nothing to do with launch angle or whether the player swung well
- Write at an eighth-grade reading level. Short sentences, plain words, no jargon.
- Never use em-dashes.

Respond ONLY with valid JSON matching this exact shape, no preamble, no markdown fences:
{
  "message": "your coaching response",
  "chart": "chart_key or null"
}

Available chart keys: scatter_ev_la, bar_distance, spray_direction, trend_ev, zone_breakdown, pitch_location. Only include a chart key if it directly helps answer the player's question. Otherwise set chart to null.`

async function callApi(body) {
  const url = '/api/coach'
  const headers = { 'content-type': 'application/json' }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text

  if (!text) {
    throw new Error('No text content in API response')
  }

  try {
    const clean = text.replace(/^[\s\S]*?```json\s*/,'').replace(/\s*```[\s\S]*$/,'').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse coach response as JSON')
  }
}

export async function generateDebrief({ goal, player, sessions, viewingSessionNumber }) {
  const filteredSessions = sessions.filter((s) => s.sessionNumber <= viewingSessionNumber)

  const userMessage = `Player: ${player.firstName}
Goal: ${goal.label}

Note: All sessions shown here happened during the same practice day, one after another. Do not use words like "today" or "yesterday" when comparing sessions. Refer to sessions by number only, like "last session" or "Session 1."

${filteredSessions.map((s) => `Session ${s.sessionNumber}:
- Avg Exit Velocity: ${s.stats.avgExitVelocity} mph
- Avg Launch Angle: ${s.stats.avgLaunchAngle} degrees
- Pitches in strike zone: ${s.stats.inZoneCount}/${s.stats.totalSwings} (strike zone = height 1.5–3.5ft, side –0.7 to 0.7ft — full per-swing pitch coordinates included above)
- Swings with launch angle strictly below 15 degrees (not including 15): ${s.swings.filter(sw => sw.hit.launch.angle < 15).length} swings — numbers: ${s.swings.map((sw, i) => sw.hit.launch.angle < 15 ? i + 1 : null).filter(Boolean).join(', ')}
- Swings with launch angle in power zone 25 to 35 degrees inclusive: ${s.swings.filter(sw => sw.hit.launch.angle >= 25 && sw.hit.launch.angle <= 35).length} swings
- Top 3 exit velocities: ${[...s.swings].sort((a, b) => b.hit.launch.exitSpeed - a.hit.launch.exitSpeed).slice(0, 3).map(sw => sw.hit.launch.exitSpeed).join(', ')} mph
- Distance distribution: 160-220ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 160 && sw.hit.landing.distance < 220).length} swings, 220-260ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 220 && sw.hit.landing.distance < 260).length} swings, 260-300ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 260 && sw.hit.landing.distance < 300).length} swings, 300-340ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 300 && sw.hit.landing.distance < 340).length} swings, 340+ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 340).length} swings
- Individual swings: ${s.swings.map((sw, i) => `Swing ${i + 1}: ${sw.hit.launch.exitSpeed}mph EV, ${sw.hit.launch.angle}° LA, ${sw.hit.launch.direction}° direction, ${sw.hit.landing.distance}ft distance, pitch height ${sw.plateLocHeight}ft / pitch side ${sw.plateLocSide}ft`).join(' | ')}`
  ).join('\n\n')}

Current session being debriefed: Session ${viewingSessionNumber}`

  return callApi({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: DEBRIEF_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  })
}

export async function sendChatMessage({ goal, player, sessions, viewingSessionNumber, messages }) {
  const filteredSessions = sessions.filter((s) => s.sessionNumber <= viewingSessionNumber)

  const userMessage = `Player: ${player.firstName}
Goal: ${goal.label}

${filteredSessions.map((s) => `Session ${s.sessionNumber}:
- Avg Exit Velocity: ${s.stats.avgExitVelocity} mph
- Avg Launch Angle: ${s.stats.avgLaunchAngle} degrees
- In Zone: ${s.stats.inZoneCount}/${s.stats.totalSwings} pitches landed in the strike zone (pitch location only — not related to launch angle or swing outcome)
- Distance distribution: 160-220ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 160 && sw.hit.landing.distance < 220).length} swings, 220-260ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 220 && sw.hit.landing.distance < 260).length} swings, 260-300ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 260 && sw.hit.landing.distance < 300).length} swings, 300-340ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 300 && sw.hit.landing.distance < 340).length} swings, 340+ft: ${s.swings.filter(sw => sw.hit.landing.distance >= 340).length} swings
- Individual swings: ${s.swings.map((sw, i) => `Swing ${i + 1}: ${sw.hit.launch.exitSpeed}mph EV, ${sw.hit.launch.angle}° LA, ${sw.hit.launch.direction}° direction, ${sw.hit.landing.distance}ft distance, pitch height ${sw.plateLocHeight}ft / pitch side ${sw.plateLocSide}ft`).join(' | ')}`
  ).join('\n\n')}

${filteredSessions.length > 1 ? `Prior session conversations:
${filteredSessions
  .filter(s => s.sessionNumber < viewingSessionNumber)
  .map(s => {
    const realMessages = (s.messages ?? []).filter(m => m.content !== '__tips__')
    if (realMessages.length === 0) return null
    return `Session ${s.sessionNumber} chat summary:\n${realMessages
      .map(m => `${m.role === 'user' ? 'Player' : 'Coach'}: ${m.content}`)
      .join('\n')}`
  })
  .filter(Boolean)
  .join('\n\n')}` : ''}

Current session being viewed: Session ${viewingSessionNumber}

Conversation so far:
${messages.map((m) => `${m.role === 'user' ? 'Player' : 'Coach'}: ${m.content}`).join('\n')}

Player's latest message: ${messages[messages.length - 1]?.content ?? ''}`

  return callApi({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: CHAT_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  })
}
