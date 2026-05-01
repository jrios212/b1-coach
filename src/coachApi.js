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

For Try This Next Session tips: each tip MUST reference a specific metric or pattern visible in the session numbers. Never give generic advice. Bad: 'Work on your launch angle.' Good: 'You had 6 swings below 20 degrees — try keeping your hands inside the ball longer to get that number above 10 next session.'

If multiple sessions are provided, compare the current session to prior sessions and call out specific improvements or regressions by number.

Respond ONLY with valid JSON matching this exact shape, no preamble, no markdown fences:
{
  "coachingSummary": "2-3 sentences max",
  "whatThisMeans": "1-2 sentences translating the numbers into real baseball terms",
  "nextSessionTips": ["tip1", "tip2"],
  "charts": ["chart_key_1", "chart_key_2"]
}

Available chart keys — pick the 2 most relevant based on goal and data:
- scatter_ev_la: Launch Angle vs Exit Velocity scatter plot
- bar_distance: Distance Distribution bar chart
- spray_direction: Spray Chart showing pull/center/opposite field breakdown
- trend_ev: Exit Velocity Trend line across all swings in sequence
- zone_breakdown: In-Zone vs Out-of-Zone breakdown by swing

Goal-based defaults (deviate if data tells a more interesting story):
- power: scatter_ev_la + bar_distance (use trend_ev instead of bar_distance if EV variance across swings is high)
- contact: scatter_ev_la + spray_direction
- allfields: spray_direction + scatter_ev_la
- popup: scatter_ev_la + trend_ev
- open: choose any two based on the most interesting patterns`

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

Respond ONLY with valid JSON matching this exact shape, no preamble, no markdown fences:
{
  "message": "your coaching response",
  "chart": "chart_key or null"
}

Available chart keys: scatter_ev_la, bar_distance, spray_direction, trend_ev, zone_breakdown. Only include a chart key if it directly helps answer the player's question. Otherwise set chart to null.`

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

${filteredSessions.map((s) => `Session ${s.sessionNumber}:
- Avg Exit Velocity: ${s.stats.avgExitVelocity} mph
- Avg Launch Angle: ${s.stats.avgLaunchAngle} degrees
- In Zone: ${s.stats.inZoneCount}/${s.stats.totalSwings} pitches landed in the strike zone (pitch location only — not related to launch angle or swing outcome)
- Individual swings (exitSpeed mph, angle degrees): ${s.swings.map((sw) => `${sw.hit.launch.exitSpeed}mph/${sw.hit.launch.angle}°`).join(', ')}`
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
- In Zone: ${s.stats.inZoneCount}/${s.stats.totalSwings} pitches landed in the strike zone (pitch location only — not related to launch angle or swing outcome)`
  ).join('\n\n')}

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
