<p align="center">
  <h1 align="center">Mr.IF</h1>
  <p align="center"><em>Tell it anything. It tells you which US stocks to watch — and why.</em></p>
</p>

<p align="center">
  <a href="#what-is-mrif">What</a> •
  <a href="#see-it-in-action">Demo</a> •
  <a href="#how-it-works">How</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#coverage">Coverage</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Node.js_18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/protocol-MCP-7C3AED" />
  <img src="https://img.shields.io/badge/market-NYSE_|_NASDAQ-1E40AF" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white" />
</p>

---

## What is Mr.IF?

**Mr.IF** is an AI reasoning agent that connects **any everyday event** — weather, health, politics, a gut feeling — to **actionable US stock signals** through butterfly-effect causal analysis.

It doesn't just search the news. It **reasons** — building multi-disciplinary causal chains (physiology → epidemiology → pharma supply chain → ticker), validating them against 15 historical precedents, and delivering the output like a sharp financial advisor sitting across the table from you.

> "It's getting cold today" → Energy midstream plays, construction delays, indoor consumption shifts, specific tickers, time horizons, and what to watch for next.

> "I saw Elon Musk looking lonely at an event" → Social sentiment analysis, Tesla leadership risk, SpaceX defense positioning, contrarian plays on overreaction.

> "Trump might do something crazy" → Tariff risk chains, geopolitical safe-haven flows, volatility beneficiaries, historical trade-war parallels.

**Built as an [MCP](https://modelcontextprotocol.io/) server** — plug it into any LLM that supports the Model Context Protocol (Claude, Cursor, etc.).

---

## See It In Action

**You:** *"It's getting cold today"*

**Mr.IF:**

> Temperature dropping — on the surface it's just weather, but there are a few threads worth pulling.
>
> **Energy is the most direct play.** Late February, tail end of heating season. If this cold snap extends into March, natural gas inventory draws will overshoot expectations. Thursday's EIA storage report is the key catalyst — if the draw exceeds 100 Bcf, gas prices pop. The interesting angle isn't upstream producers — it's midstream. ET and WMB earn on transport volume, so a volume spike hits their margin leverage harder, and you've got 7%+ dividend yields as a floor.
>
> **Consumer behavior shifts too.** Cold keeps people indoors — NFLX gets an engagement boost if it coincides with a strong content cycle. More interesting than the obvious AMZN "e-commerce in bad weather" play that gets trotted out every winter.
>
> **On the flip side,** if this cold is just a day or two, gas prices could pull back on "not as cold as feared." And homebuilders like DHI see Q1 starts data come in soft if weather delays pile up.
>
> | Ticker | Why | Direction | Time | Conviction |
> |--------|-----|-----------|------|------------|
> | ET | Midstream volume beneficiary, 7%+ yield floor | Bullish | 2-4 weeks | High |
> | UNG | Nat gas ETF, direct gas price exposure | Bullish | 1-2 weeks | Medium |
> | NFLX | Indoor entertainment substitute | Bullish | 1-2 months | Medium |
> | DHI | Construction delays pressure Q1 starts | Bearish | 1 month | Medium |
>
> **Key Catalysts:** EIA nat gas storage (Thursday), NOAA extended forecast, CDC flu data
>
> *Causal reasoning exercise — not investment advice. Do your own due diligence.*

That's what the user sees. Behind the scenes, Mr.IF built 3 causal chains across 5 disciplines, validated each one, compared against the Texas Deep Freeze 2021 precedent, and scored them before ever touching external data tools.

---

## How It Works

```
User Input ─── "it's getting cold"
     │
     ▼
┌───────────────────────────────────────────────┐
│  Step 1: mr_if_reason (MCP Tool)              │
│  One call returns everything:                 │
│  • Event classification + complexity level    │
│  • Chain templates (matched to input)         │
│  • Historical precedent search (15 cases)     │
│  • Discipline knowledge injection             │
│  • Adaptive depth recommendation              │
└───────────────────┬───────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│  Step 2: Adaptive Reasoning (in LLM thinking) │
│                                               │
│  Depth scales to input complexity:            │
│  Light  → 2 chains, basic validation          │
│  Medium → 2-3 chains + historical + 2nd-order │
│  Heavy  → 3-4 chains, full analysis           │
│                                               │
│  Anti-hallucination: no reverse-engineering,  │
│  every step needs "because...", honest about  │
│  weak links, numbers need sources             │
└───────────────────┬───────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│  Step 3: External Tool Orchestration          │
│  Industry Mapper → Security Mapper → Data API │
│  + Conditional: news, DCF, sentiment, etc.    │
└───────────────────┬───────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│  Step 4: RIA-Style Output                     │
│  Conversational analysis + ticker table       │
│  + key catalysts + risk disclaimer            │
└───────────────────────────────────────────────┘
```

### Why adaptive depth?

Not every input deserves the same analysis. "I sneezed" needs 2 solid chains. "Trade war + Fed meeting + cold snap" needs full-depth multi-factor analysis. The tool assesses complexity automatically and tells the LLM how deep to go — preventing both over-engineering simple inputs and under-analyzing complex ones.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Mr.IF Agent Layer                     │
│               (System Prompt Orchestration)            │
├──────────────────────────────────────────────────────┤
│                                                       │
│   MCP Toolkit (this repo)                             │
│                                                       │
│   ┌─ mr_if_reason ─────────────────────────────────┐  │
│   │  Unified reasoning engine — one call returns:  │  │
│   │  • Event classifier (9 categories)             │  │
│   │  • Chain template matcher (16 patterns)        │  │
│   │  • Historical echo search (15 precedents)      │  │
│   │  • Discipline knowledge injector (10 fields)   │  │
│   │  • Complexity assessor (light/medium/heavy)    │  │
│   │  • Conditional second-order routing            │  │
│   └────────────────────────────────────────────────┘  │
│                                                       │
│   Skills (MCP Resources — knowledge base)             │
│   ├─ butterfly-effect-chain    Core reasoning method  │
│   ├─ cross-domain-reasoning    10-discipline handbook │
│   ├─ second-order-thinking     Contrarian framework   │
│   └─ reasoning-discipline      Adaptive protocol      │
│                                                       │
├──────────────────────────────────────────────────────┤
│   External Tools (orchestrated via system prompt)     │
│   Industry Mapper │ Security Mapper │ Market Data     │
│   News Search │ DCF │ Monte Carlo │ Sentiment │ ...   │
└──────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/superiron888/predictionfromdailyevent.git
cd predictionfromdailyevent

# Install & Build
npm install && npm run build

# Run
npm start
```

### Connect to your LLM

Add to your MCP client config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "mr-if": {
      "command": "node",
      "args": ["/path/to/predictionfromdailyevent/dist/index.js"]
    }
  }
}
```

Then just talk to it naturally: *"It's freezing outside"*, *"Trump is tweeting again"*, *"I just sneezed"* — Mr.IF handles the rest.

---

## What Makes This Different

| | Traditional Finance Bots | Mr.IF |
|---|---|---|
| Input | "What's happening with AAPL?" | "I sneezed today" |
| Method | News summary + sentiment | Multi-disciplinary causal reasoning |
| Depth | Surface-level | 3-6 step causal chains across 10 disciplines |
| Validation | None | Historical precedent matching + anti-hallucination checks |
| Output | Generic summary | Specific tickers + direction + timeframe + conviction + catalysts |
| Voice | Robot | Trusted financial advisor |

---

## Coverage

### 9 Event Types

`Physiological` · `Weather & Climate` · `Economic Signal` · `Social Trend` · `Technology` · `Policy & Regulation` · `Natural Disaster` · `Daily Observation` · `Geopolitical`

### 10 Disciplines

`Psychology` · `Physiology` · `Physics & Energy` · `Chemistry` · `Economics` · `Meteorology` · `Sociology` · `Geopolitics` · `Supply Chain` · `Market Mechanics`

### 16 Chain Templates

From *Symptom → Pharma Supply Chain* to *Tech Paradigm → Pick-and-Shovel Play* to *Geopolitical Conflict → Safe Haven Assets* — covering the most common butterfly-effect transmission paths in financial markets.

### 15 Historical Precedents

| Case | Year | The Butterfly Effect |
|------|------|---------------------|
| COVID-19 | 2020 | Virus → lockdown → remote work revolution → tech mega-rally |
| Texas Deep Freeze | 2021 | Polar vortex → grid collapse → nat gas 400% spike |
| Hurricane Katrina | 2005 | Cat 5 → refinery shutdown → gasoline crisis |
| Russia-Ukraine War | 2022 | Invasion → energy embargo → US LNG boom |
| US-China Trade War | 2018 | Tariffs → supply chain rewiring → reshoring wave |
| Fed Pivot | 2023 | Dovish signal → rate cut expectation → growth stock rally |
| ChatGPT Launch | 2022 | AI chatbot → compute demand → NVIDIA supercycle |
| GameStop Squeeze | 2021 | Reddit → short squeeze → market structure debate |
| Fed Hike Cycle | 2022 | 0% → 5.25% → growth-to-value rotation |
| Bitcoin ETF | 2024 | SEC approval → institutional inflow → crypto mainstreaming |
| GLP-1 / Ozempic | 2023 | Weight loss drug → food/medtech repricing |
| Suez Canal Block | 2021 | Ship stuck → shipping spike → inflation pressure |
| SVB Collapse | 2023 | Bank run → regional contagion → TBTF premium |
| US Drought | 2012 | Drought → crop failure → grain price surge |
| Oil Price War | 2020 | OPEC+ collapse → negative oil → energy restructuring |

---

## Project Structure

```
predictionfromdailyevent/
├── src/
│   ├── index.ts                    # MCP Server entry point
│   └── tools/
│       └── mr-if-reason.ts         # Unified reasoning engine
├── skills/
│   ├── butterfly-effect-chain.md   # Butterfly effect methodology
│   ├── cross-domain-reasoning.md   # 10-discipline reasoning handbook
│   ├── second-order-thinking.md    # Second-order thinking framework
│   └── reasoning-discipline.md     # Adaptive reasoning protocol
├── prompts/
│   └── system-prompt.md            # Complete system prompt
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design Philosophy

1. **One tool, zero coordination tax.** One atomic call returns the full reasoning scaffold. The LLM can't skip steps because everything arrives at once.

2. **Adaptive depth, not rigid checklists.** Simple inputs get lightweight analysis. Complex multi-factor inputs get full-depth treatment. The tool decides, not a fixed protocol.

3. **Knowledge at inference time.** Discipline-specific quantitative anchors and common pitfalls are injected dynamically based on event type — the model gets expert-level domain knowledge exactly when it needs it.

4. **Anti-hallucination by design.** Every causal chain step needs a "because..." with discipline backing. Reverse-engineering (deciding the conclusion first, then building chains) is explicitly blocked. Weak chains get dropped, not decorated.

5. **Second-order when it matters.** When the conclusion is market consensus ("cold → energy up"), the system challenges it. When the conclusion is already non-obvious, it doesn't waste time forcing contrarian angles.

6. **RIA voice, not robot voice.** Output reads like a trusted financial advisor — conversational, specific, commercially aware — not a structured data dump.

---

## Contributing

Issues and PRs welcome. If you have ideas for new chain templates, historical cases, or discipline knowledge — open an issue.

---

## License

MIT

---

<p align="center">
  <strong>Mr.IF</strong> — Every event has a market signal. Find it.
</p>
