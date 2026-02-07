<p align="center">
  <h1 align="center">Mr.IF</h1>
  <p align="center"><strong>From butterfly wings to market swings.</strong></p>
  <p align="center">
    A causal-reasoning AI agent that traces everyday events to US equity signals through multi-disciplinary butterfly-effect analysis.
  </p>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#mcp-tool">MCP Tool</a> •
  <a href="#skills">Skills</a> •
  <a href="#coverage">Coverage</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/runtime-Node.js_18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/protocol-MCP-7C3AED?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6TTIgMTJsMTAgNSAxMC01LTEwLTUtMTAgNXoiLz48L3N2Zz4=" />
  <img src="https://img.shields.io/badge/market-NYSE_|_NASDAQ-1E40AF" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white" />
</p>

---

## What is Mr.IF?

**Mr.IF** is an MCP-powered reasoning engine that answers one question:

> *"Something just happened in the world — what does it mean for US stocks?"*

Input anything — a weather change, a sneeze, a geopolitical headline, a viral trend — and Mr.IF builds rigorous **multi-disciplinary causal chains** (psychology → economics → supply chain → equity impact) to surface actionable US stock and ETF signals.

It doesn't guess. It **reasons** — through a proprietary 7-Gate reasoning protocol with built-in anti-hallucination checks, cross-validated against 15 historical butterfly-effect precedents.

### Example

```
You:    "It's getting cold today"

Mr.IF:  → Classifies as WEATHER event
        → Builds 4 causal chains (energy demand, consumer behavior, agriculture, construction)
        → Cross-validates against Texas Freeze 2021, US Drought 2012
        → Surfaces: ET, UNG, NFLX, DHI with direction, timeframe, conviction
        → Flags key catalysts: EIA inventory report, NOAA extended forecast
```

---

## How It Works

```
User Input ─── "my allergies are acting up"
     │
     ▼
 ┌─────────────────────────────────────────────────┐
 │  Step 1: mr_if_reason (MCP Tool)                │
 │  → Event classification (physiological)         │
 │  → Chain template matching (3-5 templates)      │
 │  → Historical precedent search (15 cases)       │
 │  → Domain knowledge injection (10 disciplines)  │
 │  → Validation framework + scoring rubric        │
 │  → 7-Gate reasoning protocol instructions       │
 └────────────────────┬────────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────────┐
 │  Step 2: 7-Gate Internal Reasoning (in LLM)     │
 │  Gate 1  Event Anchoring — financial interpret.  │
 │  Gate 2  Chain Building — 3+ chains, each with  │
 │          discipline tags + "because..." logic    │
 │  Gate 3  Validation — 6-dim scoring, drop weak  │
 │  Gate 4  Historical Comparison — match cases     │
 │  Gate 5  Confluence — convergence & conflict     │
 │  Gate 6  Second-Order — hidden winners/losers    │
 │  Gate 7  Exit Check — 10-point quality gate      │
 └────────────────────┬────────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────────┐
 │  Step 3: External Tool Orchestration            │
 │  Industry Mapper → Security Mapper → Data API   │
 │  + Conditional: news search, DCF, Monte Carlo,  │
 │    sentiment, technicals, volume scanner...      │
 └────────────────────┬────────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────────┐
 │  Step 4: RIA-Style Output                       │
 │  Conversational, multi-angle analysis with      │
 │  ticker table + catalysts + risk disclaimer     │
 └─────────────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Mr.IF Agent Layer                      │
│                 (System Prompt Orchestration)             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   MCP Toolkit (this repo)                                │
│                                                          │
│   ┌─ mr_if_reason ──────────────────────────────────┐    │
│   │  Unified reasoning engine — one call, full       │    │
│   │  framework output:                               │    │
│   │  • Event classifier (9 categories)               │    │
│   │  • Chain template matcher (12 patterns)          │    │
│   │  • Historical echo search (15 precedents)        │    │
│   │  • Discipline knowledge injector (10 fields)     │    │
│   │  • Validation framework (6-dimensional)          │    │
│   │  • 7-Gate protocol enforcer                      │    │
│   └──────────────────────────────────────────────────┘    │
│                                                          │
│   Skills (MCP Resources)                                 │
│   ├─ butterfly-effect-chain     Core methodology         │
│   ├─ cross-domain-reasoning     10-discipline handbook   │
│   ├─ second-order-thinking      Contrarian framework     │
│   └─ reasoning-discipline       7-Gate protocol          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│   External Tools (orchestrated via system prompt)        │
│   Industry Mapper │ Security Mapper │ Market Data API    │
│   News Search │ DCF │ Monte Carlo │ Sentiment │ ...      │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Install
npm install

# Build
npm run build

# Run MCP Server
npm start

# Development mode
npm run dev

# Debug with MCP Inspector
npm run inspect
```

### MCP Configuration

```json
{
  "mcpServers": {
    "mr-if": {
      "command": "node",
      "args": ["/path/to/mr.if/dist/index.js"]
    }
  }
}
```

---

## MCP Tool

| Tool | Input | Output |
|------|-------|--------|
| `mr_if_reason` | Raw user input + optional date context | Structured markdown: event classification, chain templates, historical cases, discipline knowledge, validation framework, 7-Gate instructions |

### Why one tool?

Traditional multi-tool architectures create coordination overhead and allow the LLM to skip steps. Mr.IF consolidates all reasoning scaffolding into a **single atomic call** — the LLM gets everything it needs to reason correctly, with no escape hatch.

---

## Skills

| Skill | Purpose | Highlights |
|-------|---------|------------|
| `butterfly-effect-chain` | Core reasoning methodology | 3 laws, 12 chain patterns, quality checklist |
| `cross-domain-reasoning` | Multi-disciplinary knowledge base | 10 disciplines × quantitative anchors × common pitfalls × bridge rules |
| `second-order-thinking` | Contrarian & expectation analysis | 5 detection tools, consensus inversion, hidden winner/loser framework |
| `reasoning-discipline` | Reasoning quality enforcement | 7-Gate protocol, anti-hallucination rules, exit checklist |

---

## Coverage

### Event Types (9)

`Physiological` · `Weather` · `Economic` · `Social` · `Technology` · `Policy` · `Natural Disaster` · `Daily Observation` · `Geopolitical`

### Disciplines (10)

`Psychology` · `Physiology` · `Physics` · `Chemistry` · `Economics` · `Meteorology` · `Sociology` · `Geopolitics` · `Supply Chain` · `Market Mechanics`

### Historical Precedents (15)

| Case | Year | Butterfly Effect |
|------|------|-----------------|
| COVID-19 Pandemic | 2020 | Virus → global lockdown → remote work revolution → tech mega-rally |
| Texas Deep Freeze | 2021 | Polar vortex → grid collapse → nat gas 400% spike → energy infra repricing |
| Hurricane Katrina | 2005 | Category 5 → refinery shutdown → gasoline crisis → insurance repricing |
| Russia-Ukraine War | 2022 | Invasion → energy embargo → European energy crisis → US LNG boom |
| US-China Trade War | 2018 | Tariffs → supply chain rewiring → Vietnam/India manufacturing boom |
| Fed Pivot Signal | 2023 | Dovish language → rate cut expectation → 60/40 portfolio rotation |
| ChatGPT Launch | 2022 | AI chatbot → compute demand explosion → NVIDIA supercycle |
| GameStop Squeeze | 2021 | Reddit → short squeeze → market structure reform discussion |
| Fed Rate Hike Cycle | 2022 | 0→5.25% → growth-to-value rotation → bank stress |
| Bitcoin ETF Approval | 2024 | SEC approval → institutional inflow → crypto mainstreaming |
| GLP-1 / Ozempic | 2023 | Weight loss drug → obesity disruption → food/medtech repricing |
| Suez Canal Block | 2021 | Ship stuck → shipping rate spike → supply chain bottleneck |
| SVB Collapse | 2023 | Bank run → regional bank contagion → TBTF premium |
| US Drought | 2012 | Drought → crop failure → grain price surge → food inflation |
| Oil Price War | 2020 | OPEC+ collapse → negative oil prices → energy sector restructuring |

---

## Project Structure

```
mr.if/
├── src/
│   ├── index.ts                    # MCP Server entry point
│   └── tools/
│       └── mr-if-reason.ts         # Unified reasoning engine
├── skills/
│   ├── butterfly-effect-chain.md   # Butterfly effect methodology
│   ├── cross-domain-reasoning.md   # 10-discipline reasoning handbook
│   ├── second-order-thinking.md    # Second-order thinking framework
│   └── reasoning-discipline.md     # 7-Gate reasoning discipline
├── prompts/
│   └── system-prompt.md            # Complete system prompt
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design Philosophy

1. **One tool, zero coordination tax.** Instead of N tools the LLM must orchestrate (and can skip), one call returns the full reasoning scaffold.

2. **Knowledge at inference time.** Discipline-specific quantitative anchors and common pitfalls are injected dynamically based on event type — not baked into the model's weights.

3. **7-Gate anti-hallucination.** Every reasoning chain passes through 7 mandatory quality gates before any external tool call is made. Weak chains are dropped, not decorated.

4. **Second-order by default.** The system always asks: *"What does the market already expect? Who are the hidden winners and losers?"* — preventing first-order-only analysis.

5. **RIA voice, not robot voice.** Output reads like a trusted financial advisor — conversational, specific, commercially aware — not a structured data dump.

---

## License

MIT

---

<p align="center">
  <strong>Mr.IF</strong> — Every event has a market signal. Find it.
</p>
