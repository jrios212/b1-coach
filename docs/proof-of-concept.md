*This project was built independently for demonstration purposes. I am not a TrackMan employee, and this application has no official affiliation with TrackMan.*

---

# B1 Coach: Proof of Concept Document

## What we built

B1 Coach is an AI coaching layer built on top of a subset of TrackMan B1 baseball hitting data. After a batting practice session, the app analyzes per-swing metrics — exit velocity, launch angle, pitch location, spray direction, and distance — and delivers feedback the way a coach would: a few specific observations grounded in the actual numbers, two concrete tips for next session, and a conversational AI coach the player can ask follow-up questions. The player selects a goal before each session, and every piece of coaching output is shaped around that goal. The player can have up to four batting sessions for each goal.

## The critical question

Can AI provide a meaningful interpretation layer on top of TrackMan B1 data that genuinely helps high school and college athletes improve?

This is a more fundamental question than "can we build a good hitting app." It is asking whether AI can do something that previously required a human expert — take raw performance data and translate it into actionable, personalized coaching feedback at the level a developing athlete actually needs.

## Why this question matters

*The coaching access gap.* TrackMan B1 puts professional-grade data collection in high school and college programs. But collecting the data and interpreting it are two different things. Most high school programs do not have a hitting coach with the expertise to decode exit velocity trends, launch angle patterns, and pitch location tendencies — let alone communicate those insights in a way a 16-year-old can act on. The data exists. The interpretation layer does not. AI is a credible candidate to fill that gap.

*TrackMan's downmarket opportunity.* Expanding beyond professional and college programs means serving customers who cannot afford the human coaching infrastructure that currently makes TrackMan data actionable. If TrackMan wants to scale into high schools at volume, the product needs to deliver value without requiring an expert on-site to translate it. An AI interpretation layer is the mechanism that makes that scaling possible.

## How we tested it

The proof of concept was deliberately scoped to answer the core question without building a full product. A few key decisions shaped that scope.

*The player is the primary user, not the coach.* TrackMan's existing tools are built for coaches with data literacy. B1 Coach was designed for the athlete who practices without a coach decoding the numbers afterward. This reframe drove every subsequent decision.

*Progressive disclosure over a full dashboard.* Rather than showing all available metrics at once, the app surfaces two charts selected by the AI based on the player's goal and session patterns. The goal selection screen is the first thing the player sees — not the data. This reflects a core belief that showing the right insight at the right moment is more valuable than showing everything.

*Coaching voice, not analyst voice.* The AI was constrained by design to speak like an experienced high school coach, not a data system. Content is written at an eighth-grade reading level. Each tip follows a three-sentence structure: a specific data observation, what it means in baseball terms, and one concrete physical cue. Vague instructions like "improve your launch angle" are explicitly prohibited. The AI is required to cite actual numbers from the session.

*Hallucination risk managed structurally.* Because the AI is interpreting provided data rather than recalling facts from memory, hallucination risk is lower than in many AI applications. Key swing counts and summaries are pre-computed by the app and passed directly to the model, rather than asking the model to count from raw data — a pattern that produced errors in early testing.

## Findings and verdict

*The core concept works.* Across testing with multiple session goals — power, line drives, contact, popup reduction, and open session — the AI consistently produced coaching output that was specific, grounded in the session data, and actionable. Feedback referenced actual swing numbers. Tips identified real patterns. The conversational coach answered follow-up questions accurately using session context. The interpretation layer is viable.

*The delivery mechanism needs to evolve.* The most significant limitation is also the most honest one: the current experience is too text-heavy for the intended user. A high school athlete is not going to read three paragraphs of coaching feedback. A real coaching interaction would show the athlete what good mechanics look like — video, demonstration, physical cues. Text is a placeholder for that experience, not a replacement for it. This proof of concept proved the AI can generate the right insights. It did not prove that text is the right way to deliver them.

## What comes next

*Rich media integration.* Coaching tips should link to drill videos or mechanical demonstrations, not just describe them in words. The AI insight becomes the trigger for the right piece of content, not the content itself.

*Real TrackMan API integration.* The proof of concept runs on mock data structured to match the real B1 API. The swap to live data is a defined integration step, not a rebuild. Player identity, session history, and the full metrics payload would come directly from TrackMan.

*RAG as the next AI architecture step.* The current implementation is prompt engineering with session-specific data, which is the right level for a proof of concept. The next architectural step is Retrieval Augmented Generation, which would connect real player history and coaching research to the AI layer. More importantly, it is where TrackMan's proprietary data becomes a genuine competitive moat. TrackMan has aggregate performance data across thousands of players and sessions that no outside competitor can replicate. Feeding that benchmark data into the AI layer, and asking questions like how does this player's launch angle trend compare to similar athletes who improved, transforms the coaching from generic insight to genuinely proprietary intelligence. That is a defensible product advantage that gets stronger the more data TrackMan has.