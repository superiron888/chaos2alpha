# Mr.IF — Technical Design Document

## Vision

**Mr.IF** turns any real-world observation into actionable US equity intelligence through rigorous multi-disciplinary causal reasoning.

The core insight: markets are complex adaptive systems where a weather event, a health trend, or a policy shift propagates through multiple disciplinary lenses (psychology, physiology, economics, supply chain, geopolitics) before manifesting as stock price movement. Mr.IF makes this reasoning explicit, validated, and actionable.

---

## Design Decisions

### Why one tool instead of many?

Early prototypes used 5 separate MCP tools (`butterfly_analyze`, `causal_chain_build`, `chain_validate`, `historical_echo`, `chain_confluence`). In production, we found:

1. **LLMs skip steps** when given optional sequential tools
2. **Coordination overhead** — the model spent tokens deciding which tool to call next
3. **No quality gate** — nothing prevented the model from jumping to conclusions after tool #1

**Solution:** Consolidate into `mr_if_reason` — one atomic call that returns the complete reasoning scaffold. The LLM cannot skip steps because all steps are in the output.

### Why adaptive reasoning protocol?

Even with good tool output, LLMs hallucinate causal connections. The adaptive reasoning protocol forces structured self-verification that **scales to input complexity**:

- **Light** (simple input): 2 chains, basic validation, exit check
- **Medium** (2 event types): 2-3 chains, historical comparison, conditional second-order
- **Heavy** (multi-factor): 3-4 chains, full validation, convergence analysis, second-order detection

The original design used a rigid 7-Gate protocol where every input went through the same 10-point checklist. This produced templated, repetitive output. The adaptive approach lets simple inputs stay simple while giving complex inputs the depth they deserve.

External tools are **blocked** until the exit check passes. This prevents the common failure mode of "search first, reason later."

### Why inject discipline knowledge dynamically?

Static system prompts can't cover all 10 disciplines × 9 event types = 90 combinations deeply. Instead, `mr_if_reason` injects **event-specific** quantitative anchors and common pitfalls based on the classified event type. A weather event gets HDD/CDD thresholds and gas storage benchmarks; a health event gets FDA timeline anchors and clinical trial probability ranges.

---

## Scope

| Dimension | Scope |
|-----------|-------|
| **Events** | US domestic + global (no single-country analysis except US) |
| **Markets** | NYSE / NASDAQ — individual stocks + ETFs |
| **Reasoning** | 10 disciplines, 12 chain patterns, 15 historical precedents |
| **Output** | RIA-style conversational analysis with ticker table |

---

## Deliverables

- [x] System prompt (`prompts/system-prompt.md`)
- [x] Unified reasoning tool (`src/tools/mr-if-reason.ts`)
- [x] MCP Server entry point (`src/index.ts`)
- [x] Butterfly effect methodology skill (`skills/butterfly-effect-chain.md`)
- [x] Cross-domain reasoning skill (`skills/cross-domain-reasoning.md`)
- [x] Second-order thinking skill (`skills/second-order-thinking.md`)
- [x] Reasoning discipline skill (`skills/reasoning-discipline.md`)
- [x] README with architecture docs
