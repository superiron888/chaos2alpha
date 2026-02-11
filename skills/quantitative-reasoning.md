---
name: quantitative-reasoning
description: "Quantitative reasoning framework for Mr.IF. Guides the LLM to produce probability estimates, magnitude ranges, sensitivity analysis, and base-rate calibrated outputs. Ensures every recommendation includes numbers, not just direction."
version: 1.0.0
---

# Quantitative Reasoning Framework

## Why This Exists

Mr.IF's butterfly-effect chains produce qualitative conclusions: "energy stocks benefit." But a good RIA doesn't stop at direction — they quantify:
- **How much?** (magnitude)
- **How likely?** (probability)
- **What matters most?** (sensitivity)
- **How often does this work?** (base rate)

This skill teaches you to turn qualitative chains into quantified recommendations.

---

## Step 1: Use the Tool's Quantitative Anchors

The mr_if_reason tool now returns structured quantitative anchors:

```
| Metric | Value | Source | How to Use |
```

These are your starting numbers. Rules:
- **Always cite at least 2 anchors** in your response
- **Never invent numbers** — if the tool didn't provide an anchor and you're uncertain, say "needs verification with data tool"
- **Adjust anchors for context** — an anchor says "nat gas ±5-8% on HDD deviation" but if inventories are also low, the move could be larger. Explain your adjustment.

---

## Step 2: Magnitude Estimation

For each ticker recommendation, estimate a magnitude range:

### Method 1: Anchor-Based (preferred)
Use quantitative anchors directly:
```
Anchor: "HDD deviation 10% → nat gas ±5-8%"
Current situation: HDD deviation looks like ~15%
Estimate: nat gas could move +8-12% (extrapolating from anchor)
→ UNG: +8-12%, ET (midstream leverage): +3-6%
```

### Method 2: Historical-Precedent-Based
Use historical case outcomes:
```
Historical: Texas Freeze 2021 → UNG +12% in one week, OXY +15%
Current situation: Cold snap, less extreme than 2021
Estimate: Scale down by ~50% → UNG +5-8%, energy stocks +3-6%
```

### Method 3: Revenue-Impact-Based
Calculate from fundamentals:
```
Event adds ~$2B to diagnostic testing revenue (from anchor)
QDEL's annual revenue ~$2.8B
$2B across industry, QDEL gets ~15% share = ~$300M
= ~10% quarterly revenue uplift → stock likely +8-15% (PE expansion on beat)
```

### Rules:
- Always give a RANGE, never a point estimate (+5-12%, not +8.5%)
- Wider range = more honest about uncertainty
- If you can't estimate within 3x range (e.g., +2-60%), the chain is too speculative — note it

---

## Step 3: Probability Derivation (Base-Rate-Anchored)

For each chain/recommendation, **derive** probability from historical base rates — not from chain scores alone.

### 3a. Start with the Base Rate Prior

Find the closest match from Step 5's base rate library or tool output:
- Severe flu season → healthcare alpha appears ~60% of the time → **Prior ≈ 60%**
- Cold snap (HDD >10%) → nat gas spikes ~70% of winters → **Prior ≈ 70%**
- Geopolitical shock → VIX spike reverts within 4 weeks ~65% of the time → **Prior for safe-haven ≈ 65%**

If no base rate exists: start at **50%** (maximum uncertainty) and state so.

### 3b. Adjust for Current Signal Strength (±5–15%)

How strong is today's evidence vs. the historical average case?
- Strong confirming data (CDC ILI at 4.2%, well above 3.5% threshold): **+10%**
- Weak / early-stage signal (scattered reports, no hard data): **−5 to −10%**
- Multiple independent confirmations (CDC + pharmacy sales + Google Trends): **+10–15%**

### 3c. Adjust for Transmission Reliability (−5% per weak link)

Each intermediary assumption in the chain reduces reliability:
- Direct (event → stock impact): **no discount**
- 1 intermediary assumption: **−5%**
- 2 intermediary assumptions: **−10%**
- Novel / untested transmission path: **−15%**

### 3d. Adjust for Consensus / Priced-In (−5 to −20%)

- Non-consensus / under-the-radar: **no discount**
- Partially priced in: **−5 to −10%**
- Already consensus (widely covered): **−15 to −20%**

### Derivation Example:
```
Base Rate Prior: severe flu → healthcare alpha ~60% of the time
Signal Strength: CDC ILI 4.2% (above threshold) + Google Trends elevated → +10%
Transmission: flu → testing demand → QDEL (1 intermediary) → −5%
Consensus: flu season covered in media but not QDEL specifically → −5%
━━━━━━━━━━
Final: 60 + 10 − 5 − 5 = ~60%
```

### Output Rule:
In the **Base Rate** section of your response, show the derivation trail in 1–2 lines:
> "Severe flu seasons produced healthcare alpha ~60% of the time; current ILI (4.2%) is above-average (+10%), one intermediary step (−5%), partially covered (−5%) → **~60%**"

### Guard Rails:

| Final Probability | Conviction | Action |
|---|---|---|
| >75% | HIGH | Lead recommendation |
| 55–75% | MEDIUM-HIGH | Standard recommendation with confidence |
| 40–55% | MEDIUM | Mention with caveats |
| <40% | LOW | "Also on radar" at most; don't recommend with conviction |

### Rules:
- **Base Rate is the anchor** — chain pre-score is a cross-check, not the source. If they conflict, explain the gap.
- **Never say 100% or 0%** — markets always have uncertainty.
- **If adjustments exceed ±20% from base rate**: pause and justify — large deviations need strong evidence.
- **If no base rate available**: state "no historical base rate; probability estimated from signal strength and chain logic alone" and use chain score as fallback.

---

## Step 4: Sensitivity Analysis

For each response, identify the **single most important variable**:

### How to find it:
1. Look at your chains — which step has the weakest link or biggest assumption?
2. Ask: "If I'm wrong about ONE thing, which one breaks the entire thesis?"
3. That variable is your key sensitivity.

### Examples:
- Weather thesis → "Hinges on whether cold snap extends past March 5" (NOAA forecast)
- Flu season thesis → "Hinges on CDC ILI staying above 3.5% baseline" (CDC weekly report)
- Geopolitical thesis → "Hinges on whether rhetoric escalates to actual sanctions" (news flow)
- Tech thesis → "Hinges on NVDA guidance beating Street estimates by >5%" (earnings date)

### Output format:
Always include one line:
> **Key Sensitivity:** [The variable]. If [opposite happens], [what breaks].

---

## Step 5: Base Rate Calibration (Feeds into Step 3 Probability)

Before finalizing, ask: "How often does this type of event actually move stocks?" The answer becomes **Step 3a's Prior**.

### Base Rate Library:

| Event Type | Historical Base Rate | Source |
|-----------|---------------------|--------|
| Severe flu season (CDC ILI >3.5%) | ~Every 3-5 years, healthcare alpha +1-3% | CDC/S&P data |
| Cold snap (HDD >10% deviation) | ~2-3 times per winter, nat gas moves ±5-8% | EIA data |
| Geopolitical shock (VIX >25) | ~2-4 times per year, most revert in 2-4 weeks | Historical VIX |
| Fed policy surprise | ~1-2 major surprises per year, sector rotation ±5-10% | CME FedWatch |
| Tech paradigm shift | ~Once per decade, leaders +100-500% | Historical |
| Supply chain disruption | ~3-5 significant events per year, affected stocks ±5-20% | Industry data |
| Hurricane (Cat 3+, Gulf) | ~1-2 per year during season, oil +5-15% short-term | NOAA/EIA |
| Earnings surprise (>10% beat) | Individual stock +5-15% on beat | Historical earnings |

### Rules:
- **Always include one base rate statement** in your response — this is also the **Prior for Step 3a**
- Format: "Events like this historically [happened X often] and [moved Y by Z%]"
- If your thesis implies a move larger than the base rate, explain why this time is different
- If you can't find a relevant base rate, say so: "No clear historical base rate for this specific pattern" — and use 50% as Step 3a prior

---

## Integration with Chain Scores

The mr_if_reason tool returns chain pre-scores. Use them to **allocate effort and cross-check**, NOT as the probability source:

```
Chain score 70 (STRONG) → Lead with this chain
  → Magnitude: Use anchor-based estimation
  → Probability: Derive from Base Rate (Step 3). Chain score 70 = cross-check; if Base Rate says ~60%, don't inflate to 70% just because the score is high.
  → Allocate most of your response to this chain

Chain score 55 (MODERATE) → Supporting angle
  → Magnitude: Use historical-precedent-based estimation
  → Probability: Derive from Base Rate (Step 3). If base rate is higher than chain score suggests, explain why.
  → Brief mention, don't over-invest in narrative

Chain score 35 (WEAK) → Debunk or mention briefly
  → Either explain WHY it's weak (consensus trap, low materiality)
  → Or skip entirely if you have enough STRONG/MODERATE chains
  → Probability likely <40% regardless of derivation
```

---

## Anti-Patterns

1. **False precision**: "+7.3% expected return" — you don't know this. Use ranges.
2. **Missing ranges**: "Will go up" — always include magnitude range.
3. **Invented base rates**: "This happens 73.2% of the time" — either cite source or use round numbers.
4. **Probability without calibration**: "High probability" without a number — use ~60-70%, etc.
5. **Ignoring the anchor**: Tool gives you "nat gas ±5-8% on HDD deviation" and you say "nat gas could go up 50%" — explain the deviation from anchor.
6. **Sensitivity to everything**: "This depends on the Fed, earnings, weather, and global trade" — pick THE ONE variable that matters most.

---

## Keyword Triggers

quantitative reasoning, probability, magnitude, base rate, sensitivity, calibration,
how much, how likely, what probability, expected return, risk-reward
