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

## Step 3: Probability Estimation

For each chain/recommendation, estimate probability of thesis playing out:

### Calibration Guide

| Probability | What it means | When to use |
|------------|---------------|-------------|
| ~80%+ | Near-certain, multiple data points confirm | Only for chains with data tool confirmation + historical precedent + seasonal alignment |
| ~60-75% | More likely than not, good evidence | Chain is STRONG (score 65+), seasonal alignment, 1+ anchor supports |
| ~45-55% | Coin flip, plausible but uncertain | Chain is MODERATE (score 45-64), some evidence but weak links exist |
| ~30-40% | Speculative, worth watching | Chain is WEAK (score <45), or relies on single unconfirmed assumption |
| <30% | Long shot | Don't recommend with conviction. Mention as "outside chance" at most |

### Rules:
- **Chain pre-score maps roughly to probability**: Score 70 ≈ ~65-70% odds. Score 50 ≈ ~50% odds. Score 35 ≈ ~35% odds.
- **Adjust for data confirmation**: If data tool confirms a key assumption, add +10%. If data contradicts, subtract -15%.
- **Adjust for consensus**: If your thesis is consensus (everyone sees it), effective probability of *alpha* drops even if thesis probability is high.
- **Never say 100% or 0%** — markets always have uncertainty.

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

## Step 5: Base Rate Calibration

Before finalizing, ask: "How often does this type of event actually move stocks?"

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
- **Always include one base rate statement** in your response
- Format: "Events like this historically [happened X often] and [moved Y by Z%]"
- If your thesis implies a move larger than the base rate, explain why this time is different
- If you can't find a relevant base rate, say so: "No clear historical base rate for this specific pattern"

---

## Integration with Chain Scores

The mr_if_reason tool returns chain pre-scores. Use them as your starting point:

```
Chain score 70 (STRONG) → Lead with this chain
  → Magnitude: Use anchor-based estimation
  → Probability: Start at ~65-70%, adjust with data
  → Allocate most of your response to this chain

Chain score 55 (MODERATE) → Supporting angle
  → Magnitude: Use historical-precedent-based estimation
  → Probability: Start at ~50-55%, adjust with data
  → Brief mention, don't over-invest in narrative

Chain score 35 (WEAK) → Debunk or mention briefly
  → Either explain WHY it's weak (consensus trap, low materiality)
  → Or skip entirely if you have enough STRONG/MODERATE chains
  → If you include it, clearly flag low probability (~35%)
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
