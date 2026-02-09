# Novel Event Reasoning — First-Principles Financial Analysis

## Purpose

This skill guides analysis when `mr_if_reason` returns **zero keyword matches** — meaning the user's input falls outside all pre-defined event categories. This happens with major media/entertainment events, cultural phenomena, niche industry news, emerging trends, and other novel inputs.

## When to Apply

When the tool output includes `**NOVEL EVENT DETECTED**` or `matched keywords: No exact match`.

## Core Framework: Follow the Money

When no template exists, reason from first principles by tracing money flows.

### Step 1: Identify the Money Flow

Ask: "Who PAYS for this event/trend? Who EARNS from it?"

| Flow Type | Question | Example (Olympics) |
|-----------|----------|-------------------|
| Broadcasting | Who has the rights? How much ad revenue? | NBC/CMCSA: ~$1B per Olympics |
| Sponsorship | Who pays to associate their brand? | KO, PG, V, ABNB — but sponsorship is a COST, not revenue |
| Tourism/Travel | Where do people go? How do they get there? | BKNG, ABNB, DAL — for host city |
| Betting/Gaming | Can people bet on it? Who facilitates? | DKNG, FLUT — growing but small for non-NFL events |
| Merchandise/Retail | What do people buy because of it? | NKE — athlete sponsorships, branded gear |
| Infrastructure | What was built? Who benefits from capex? | Usually non-US for foreign events |
| Content/Streaming | Where do people watch? Does it drive subscribers? | Peacock (CMCSA) — subscriber catalyst |
| Attention/Ad-tech | Who sells ads around this event? | GOOGL, TTD — programmatic ad spend |

### Step 2: Size the Revenue Impact

Critical question: **Is this event material to any public company's quarterly earnings?**

Rules of thumb:
- Event contributes <0.5% of company annual revenue → negligible stock catalyst
- 0.5%-2% → minor catalyst, narrative-driven, short-lived (1-2 weeks)
- >2% → material catalyst, can drive earnings revision, longer duration (weeks-months)
- For mega-caps ($500B+ market cap), even $1B events are often <0.5% of revenue

### Step 3: Check "Priced In" Status

**Scheduled events are almost ALWAYS priced in.** The Olympics, Super Bowl, elections, product launches — the market knows they're coming years in advance.

The trade is in the **DEVIATION from expectations**:
- Viewership beats expectations → ad revenue upside → stock re-rates
- Sponsors pull out → negative signal → related stocks dip
- Event cancelled/disrupted → insurance, substitute beneficiaries
- New product announced at event → only if it's a genuine surprise

Key test: "If I can find this event on a calendar, the first-order impact is already priced in."

### Step 4: Find the Non-Obvious Angle

The obvious play is usually priced in. Look for:
- **Supply chain adjacents**: Who supplies the broadcasters, sponsors, venues?
- **Behavioral shifts**: Does this event change how people spend time or money for weeks after?
- **Contrarian**: If everyone says "buy X because of this event," X is probably already up. Who benefits from the attention shift that nobody is talking about?
- **Duration**: A one-day event (Super Bowl) has less impact than a two-week event (Olympics) which has less than a permanent shift (new regulation)

### Step 5: Search for Domain Knowledge

If you're unfamiliar with the industry economics, USE the domain knowledge search queries provided by the tool output. Specifically search for:
- Revenue models of key players in this space
- Historical stock performance around similar past events
- Industry-specific metrics and benchmarks (e.g., "NBC Olympics ad revenue historical")
- Size of the market opportunity in dollar terms

## Revenue Materiality Quick Reference

| Event Type | Typical US Stock Impact | Best Play |
|-----------|------------------------|-----------|
| Summer Olympics | NBC ad revenue ~$1.2B; CMCSA total $120B = ~1% | Peacock subscriber data as surprise catalyst |
| Winter Olympics | NBC ad revenue ~$0.9B; lower viewership than summer | Same but weaker |
| Super Bowl | CBS/FOX single-event ad revenue ~$500M | Ad-tech names, streaming metrics |
| FIFA World Cup | Fox Sports US; lower US audience interest | Limited direct US stock impact |
| Apple Event | Product launch → AAPL supply chain cycle | AAPL options, supply chain reads (QCOM, AVGO, TSM) |
| Oscars/Grammys | ABC (DIS) or CBS (PARA) ad revenue; small | Streaming content plays, winner momentum |
| US Elections | Policy uncertainty → VIX; sector rotation playbook | Sector ETFs based on expected policy |
| Tech Conferences (CES/MWC) | Individual product announcements → narrative shifts | Wait for specific announcements, not the event itself |
| Celebrity/Viral Moment | Social media amplification → brand association | Usually noise, not signal. Verify with data. |

## Anti-Patterns

- [WRONG] "Olympics → buy Nike because athletes wear Nike" — Sponsorship is a cost. NKE stock doesn't meaningfully move on Olympics.
- [WRONG] Treating a $500M revenue event as material for a $100B revenue company — do the math first.
- [WRONG] Ignoring "priced in" — scheduled events are the definition of "priced in." The surprise is what matters.
- [WRONG] Building 5-step butterfly chains from novel events that don't need them — use first-principles money-flow analysis instead.
- [WRONG] Skipping domain research — if you don't know the industry economics, search FIRST, reason SECOND.
- [WRONG] Treating all events as equally important — a Super Bowl and a minor awards show have 100x different impact.

## Integration with Other Skills

- Use **quantitative-reasoning** to size the revenue impact and estimate probability
- Use **second-order-thinking** to find the non-obvious angle beyond consensus
- Use **financial-transmission** if the event has clear financial transmission channels (e.g., an event that shifts Fed expectations)
- The tool's **domain knowledge search queries** are your starting point for research — use them before reasoning
- The **butterfly-effect-chain** skill is less relevant here — first-principles money-flow analysis is more appropriate for novel events
