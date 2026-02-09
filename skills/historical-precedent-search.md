# Dynamic Historical Precedent Search

## Purpose

This skill guides you in dynamically searching for and evaluating historical precedents when the static case library doesn't provide a strong match. The `mr_if_reason` tool will tell you when dynamic search is recommended and provide optimized search queries.

## When to Use

- `mr_if_reason` output includes a **[STRONGLY RECOMMENDED]** or **[RECOMMENDED]** dynamic search section
- You encounter a novel event with no obvious historical parallel in the static cases
- You want to strengthen a thesis with specific historical data points (dates, percentages, timelines)
- The user asks about a specific event and you need precise historical context

## How to Search

### Step 1: Execute Search

Use `网络检索工具` with 1-2 queries from the list provided by `mr_if_reason`. Prioritize:
- The most specific query (contains the exact event keyword)
- The query targeting your strongest chain template

If the first search yields poor results, try rephrasing:
- Add a year range ("2020-2025")
- Add "stock market reaction" or "sector impact"
- Try both English and Chinese queries if bilingual input

### Step 2: Evaluate Search Results

For each historical case you find, extract and score using this rubric:

| Criteria | Weight | Score 1 (weak) | Score 3 (strong) |
|----------|--------|-----------------|-------------------|
| Mechanism match | 30% | "Vaguely similar event" | "Same causal mechanism (e.g., both are supply shocks)" |
| Magnitude match | 20% | "Very different scale" | "Similar severity/scale" |
| Macro context match | 25% | "Completely different rate/inflation regime" | "Similar macro backdrop (rates, inflation, cycle position)" |
| Recency | 15% | ">15 years ago" | "<5 years ago" |
| Data quality | 10% | "Anecdotal, no specific numbers" | "Has specific tickers, % moves, timelines" |

**Threshold**: Only use a case in your analysis if weighted score >= 2.0 (out of 3.0).

### Step 3: Structure the Extracted Precedent

For each valid historical case, capture:

```
Event: [What happened]
Date: [When]
Mechanism: [Why it matters — the causal chain]
Market reaction:
  - [Ticker/Sector]: [Direction] [Magnitude] over [Timeframe]
  - [Ticker/Sector]: [Direction] [Magnitude] over [Timeframe]
Sustained or reverted: [Did the move stick, or was it a 1-2 week blip?]
Key lesson: [One sentence takeaway]
Relevance to current event: [Why this parallel matters now / what's different]
```

### Step 4: Integrate into Your Analysis

- **Strong match (score >= 2.5)**: Lead with this precedent. "In [year], when [event], [sector/ticker] moved [X%] — and we're seeing similar conditions now."
- **Moderate match (2.0-2.5)**: Use as supporting evidence. "This rhymes with [year] when [event], though the macro context was different because [reason]."
- **Weak match (<2.0)**: Mention briefly with disclaimer, or skip entirely. "The closest precedent I can find is [year], but the parallel is imperfect because [reason]."

## Search Query Design Principles

Good search queries follow this pattern:
- **Specific event + market context**: "yield curve inversion 2019 sector rotation performance"
- **Quantitative angle**: "NVDA earnings surprise stock price reaction history"
- **Time-bounded**: Adding "2020-2025" filters for recency

Bad search queries:
- Too broad: "stock market crash" (too many results, no specificity)
- Too narrow: "NVDA Q3 2024 earnings stock price after-hours" (too specific, may not find generalizable pattern)
- Missing financial angle: "yield curve inversion explained" (explains concept, doesn't give market reaction data)

## Common Precedent Patterns by Event Type

### Market Events
- Yield curve inversions: Search "2Y-10Y inversion [year] sector rotation 12 months after"
- VIX spikes: Search "VIX above [level] historical recovery timeline stocks"
- Credit spreads: Search "credit spread widening [year] stock market contagion"

### Corporate Events
- Earnings surprises: Search "[company] earnings [beat/miss] [year] sector peer reaction"
- M&A: Search "[industry] M&A wave [year] target premium acquirer reaction"
- Guidance cuts: Search "[sector] earnings guidance cut [year] stock market reaction"

### FX/Commodity Events
- Dollar surges: Search "DXY [level] US multinational earnings impact historical"
- Oil spikes: Search "oil price [spike/crash] [year] stock market sector winners losers"
- Gold: Search "gold price surge [year] real yields stock market positioning"

### Daily-Life/Cross-Domain Events
- Health: Search "flu season severe [year] pharma diagnostics stock performance"
- Weather: Search "[weather event] [year] energy stocks natural gas impact"
- Geopolitical: Search "[country/conflict] [year] defense energy safe haven stocks"

## Anti-Patterns

- [WRONG] Cherry-picking only supportive cases — always look for cases where the expected reaction DIDN'T happen
- [WRONG] Using a single case as proof — one precedent is an anecdote, two is a pattern, three is evidence
- [WRONG] Ignoring the macro regime — a precedent from ZIRP (2020-2021) may not apply in a high-rate environment (2023-2025)
- [WRONG] Treating all historical moves as permanent — most event-driven moves revert within 2-4 weeks unless there's a structural supply change
- [WRONG] Presenting search results as your own knowledge — always attribute: "Historical data shows..." or "In [year], when..."
- [WRONG] Over-searching — 1-2 targeted searches is enough. Don't burn 5 searches trying to find the perfect historical match. If nothing good comes up, acknowledge the novelty.

## Integration with Static Cases

The static case library (18 cases in `mr_if_reason`) covers major, well-known events. Dynamic search supplements in two ways:

1. **Depth**: Finding more granular data about events the static library already covers (e.g., specific sector rotation numbers post-2019 inversion)
2. **Breadth**: Finding precedents for events the static library doesn't cover (e.g., a specific biotech FDA approval, a rare OPEC emergency meeting)

Always start with static cases first (they're faster and pre-evaluated), then supplement with dynamic search when needed.
