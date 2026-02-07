---
name: reasoning-discipline
description: "Reasoning discipline protocol. The 'gate inspector' for the 5-in-1 tool—forces LLM to complete each reasoning stage sequentially in thinking, with entry conditions and anti-hallucination thresholds for each stage. Prevents skipping steps, laziness, and fabricating causal chains out of thin air. Must be used in conjunction with the mr_if_reason tool."
version: 1.0.0
---

# Reasoning Discipline Protocol

## Why This Protocol Is Needed

The mr_if_reason tool returns all at once: event classification, chain templates, historical cases, validation framework, and convergence rules.

If you jump directly to conclusions, or casually construct a few chains and then call external tools—your output will be garbage.

**This protocol is a mandatory roadmap for your thinking phase. Each stage (Gate) must be completed before proceeding to the next.**

---

## Stage Overview

```
Gate 1: Event Anchoring (no digression)
  ↓
Gate 2: Chain Construction (no laziness)
  ↓
Gate 3: Chain Validation (no self-deception)
  ↓
Gate 4: Historical Comparison (no ignoring)
  ↓
Gate 5: Convergence Analysis (no single-track thinking)
  ↓
Gate 6: Second-Order Detection (no selling consensus)
  ↓
Gate 7: Exit Check (no launching with flaws)
  ↓
→ Only after passing can external tools be called (industry mapping/securities mapping/data retrieval, etc.)
```

---

## Gate 1: Event Anchoring

**Purpose:** Confirm that you understand what the user is saying and what you need to analyze from a financial perspective.

**Required Output:**
```
[Gate 1] Event Anchoring
- User's original text: "..."
- Financial interpretation: The user means... (always interpret from a financial perspective)
- mr_if_reason classification: {type} (Is this reasonable? If classification is inaccurate, manually correct)
- Seasonal context: {season} (Seasonal factors for the current month, do they intersect with the event?)
- Reasoning direction: From mr_if_reason's returned directions, select 2-4 most relevant ones
```

**Anti-Hallucination Checks:**
- Are you interpreting from a financial perspective? If your "financial interpretation" reads like life advice → stop, restart
- Is the event classification accurate? If mr_if_reason classifies "Trump tweets" as daily instead of geopolitical → manually correct
- Don't add things the user didn't say. "It's cold today" is just a weather event, don't fabricate it into "flu outbreak"

---

## Gate 2: Chain Construction

**Purpose:** Based on templates returned by mr_if_reason, construct at least 3 complete causal chains.

**Rules:**
1. Use chain_templates returned by mr_if_reason, don't ignore them and make up your own
2. Each chain has 3-7 steps, each step must be labeled with:
   - Content (what this step says)
   - Disciplinary basis (which discipline from cross-domain-reasoning is referenced)
   - Connection strength (strong / moderate / weak)
   - Connection rationale (why the previous step leads to this step, one sentence)
3. The final step must land on a specific industry or direction
4. At least 2 chains must come from different disciplinary dimensions

**Required Output:**
```
[Gate 2] Chain Construction
Chain A: {template name}
  Step 1: {content} [discipline] [strong] — because...
  Step 2: {content} [discipline] [strong] — because...
  ...
  → Conclusion: {industry/direction}

Chain B: {template name}
  ...

Chain C: {template name}
  ...
```

**Anti-Hallucination Checks:**
- Can each step's "because..." withstand questioning? If you yourself feel it's forced → mark as weak
- Are there "quantum leaps"? That is, missing a key intermediate step between the previous and next step → add it or mark it
- Is the chain length reasonable? More than 5 steps → ask yourself "can any intermediate steps be merged?"
- Are disciplinary references real? "Psychology says..."—does this theory actually exist? If you're unsure → don't reference it, use common sense phrasing
- **Most important:** Are you really building chains, or reasoning backwards? If you already have the conclusion "should recommend energy stocks" in mind, then reverse-engineer a chain → this is hallucination. The correct way: start from the event, go wherever it leads.

---

## Gate 3: Chain Validation

**Purpose:** Score each chain using the validation framework returned by mr_if_reason.

**Rules:**
1. For each chain, check all 6 validation dimensions one by one (logical coherence, disciplinary accuracy, explicit assumptions, counter-argument, temporal consistency, scale reasonableness)
2. Apply bonus/deduction rules
3. Chain <4 steps +1, has historical precedent +1, multiple chains same direction +0.5~1.0
4. Chain >5 steps -1, weak link -0.5(first), -1.0(subsequent), no alpha -1

**Required Output:**
```
[Gate 3] Chain Validation
Chain A:
  - Logical coherence: [pass/has weakness] — specific explanation
  - Disciplinary accuracy: [pass/questionable] — specific explanation
  - Explicit assumptions: Implicit assumption is [X], in current environment [holds/uncertain/doesn't hold]
  - Counter-argument: If [Y] happens, this chain completely fails
  - Temporal consistency: [matches/doesn't match] — time window approximately [Z]
  - Scale reasonableness: [reasonable/exaggerated/insufficient]
  - Score: Base 3 + [bonus] - [deduction] = Final X points
  - Judgment: [usable / needs strengthening / discard]

(Chain B, C same format)
```

**Anti-Hallucination Checks:**
- "Counter-argument" cannot be perfunctory. You must really think of a scenario that would make this chain fail
- If you gave all your chains high scores → you're deceiving yourself. At least one chain should have obvious weaknesses
- If you wrote "none" for "implicit assumptions" → impossible, any reasoning has implicit assumptions. Rethink
- Scoring must be honest. If a chain scores < 2 → discard directly, don't force it

---

## Gate 4: Historical Comparison

**Purpose:** Compare historical cases returned by mr_if_reason with your chains.

**Rules:**
1. If there are matching historical cases → compare: what are the similarities? What are the differences?
2. If conclusions are consistent → cite this case to strengthen persuasiveness
3. If conclusions are inconsistent → must explain "why this time is different" (and significantly reduce confidence)
4. If there are no matching cases → mark as "first-time reasoning," consider whether network search tools are needed

**Required Output:**
```
[Gate 4] Historical Comparison
Matching case 1: {case name}
  - Similarities: ...
  - Differences: ...
  - Significance for my reasoning: [strengthens/weakens/neutral]
  - Specific impact: Confidence in Chain [X] [+1 / -1 / unchanged]

(If no match: "No directly matching cases. Chain [X] marked as first-time reasoning. Consider supplementing with network search.")
```

**Anti-Hallucination Checks:**
- Don't fabricate historical cases. Only use cases returned by mr_if_reason + publicly known historical events you're certain are real
- "This time is different" cannot be said casually. If you say it → must point out which specific structural factor changed
- Don't selectively use history: if a case both supports one of your chains and opposes another → mention both

---

## Gate 5: Convergence Analysis

**Purpose:** Check whether multiple chains point in the same direction, discover contradictions and reinforcement points.

**Rules:**
1. Put all validated chains (score >= 2.5) together
2. Check: which chains point to the same industry/direction? (convergence = high confidence)
3. Check: which chains give contradictory directions for the same target? (conflict = needs resolution)
4. Convergence rules: 2 chains same direction +0.5, 3 chains same direction +1.0

**Required Output:**
```
[Gate 5] Convergence Analysis
Convergence points:
  - {industry/direction} ← Chain A + Chain C both bullish → confidence +0.5
Conflict points:
  - {industry/direction} ← Chain A bullish vs Chain B bearish → mark mixed, resolution basis: ...
Discarded:
  - Chain X score too low, discarded

Net direction:
  - Bullish: {industry list} (confidence: H/M/L)
  - Bearish: {industry list} (confidence: H/M/L)
  - Neutral/mixed: {industry list} (reason)
```

**Anti-Hallucination Checks:**
- If all your chains point in the same direction → you may have confirmation bias. Go back to Gate 2 to check if you missed reverse chains
- Conflicts are not bad, conflicts are real. Don't ignore conflicts for the sake of simplicity
- "Net direction" must only include directions supported by chains. Cannot arbitrarily add "I think we can also look at XX"

---

## Gate 6: Second-Order Detection

**Purpose:** Confirm that your reasoning is not selling market consensus.

**Rules (from second-order-thinking skill):**
1. For each "net direction," ask: is this conclusion market consensus?
2. If it's consensus → where is your alpha? Find hidden winners/losers
3. If it's not consensus → why are you smarter than the market? What's the reason?
4. Look for temporal mismatches: what is the market overreacting to short-term? What is it underestimating long-term?

**Required Output:**
```
[Gate 6] Second-Order Detection
Conclusion 1: {bullish on XX}
  - Market consensus? [yes/no/partial]
  - If consensus: My edge lies in [...]
  - Hidden winners: [less obvious beneficiaries]
  - Hidden losers: [less obvious victims]
  - Temporal mismatch: [short-term overreaction? / long-term underestimated?]

(Repeat for each net direction)
```

**Anti-Hallucination Checks:**
- If you wrote "market consensus: no" but your reasoning could easily be thought of by any analyst → you're deceiving yourself
- "Hidden winners" must have logical chain support (even if only 2 steps), cannot be arbitrary associations
- If for every direction you wrote "no, my reasoning is unique" → you're overconfident. At least acknowledge that some has been priced in

---

## Gate 7: Exit Check (Quality Gate)

**Before calling any external tools, you must pass the following checks:**

```
[Gate 7] Exit Check
□ 1. Did I construct at least 3 chains? (Fewer than 3 → return to Gate 2)
□ 2. Does each chain have disciplinary basis? (Steps without basis → mark weak)
□ 3. Do at least 2 chains come from different disciplinary dimensions? (All same discipline → return to Gate 2 to supplement)
□ 4. Did I honestly perform counter-arguments? (Perfunctory → return to Gate 3)
□ 5. Did I check historical case consistency/contradictions? (Skipped → return to Gate 4)
□ 6. Does convergence analysis have conclusions? (No net direction → return to Gate 5)
□ 7. Was second-order detection performed? (All skipped → return to Gate 6)
□ 8. Do I have specific industry directions to give to the industry mapping tool? (No → reasoning insufficient)
□ 9. Are there no fabricated disciplinary theories/historical events in my reasoning? (Uncertain → delete or mark uncertain)
□ 10. Do at least 1 of the final retained chains score >= 3? (All low scores → reduce overall confidence, be honest with user)
```

**All passed → proceed to external tool calling phase**
**Any item not passed → return to corresponding Gate to complete**

---

## Anti-Hallucination General Principles

### Principle 1: If uncertain, say uncertain
Better to say "there's one step in this chain I'm not quite sure about" than to fabricate a theory that sounds plausible. Your user is smart, they can accept uncertainty, but they cannot accept you making things up.

### Principle 2: No reverse reasoning
Correct: Event → reasoning → go wherever it leads
Wrong: Already decided what to recommend in mind → reverse-engineer a chain to rationalize
Detection method: If you find yourself thinking "how do I connect this chain to NVDA" → you're reverse reasoning

### Principle 3: Disciplinary references must be real
OK: "According to supply and demand theory (basic economic principle), supply decrease + rigid demand → price increase"
Not OK: "According to Krupp's third extended law of thermodynamics..." (non-existent theory)
Uncertain handling: Use plain language instead "common sense suggests..." "generally speaking..."

### Principle 4: Numbers must have sources
OK: "US natural gas inventories are currently about 15% below the 5-year average (EIA data)"
OK: "Natural gas inventories typically deplete in winter, 15% below average is a bullish signal (citing cross-domain-reasoning)"
Not OK: "Natural gas inventories are 43.7% below average" (if you're not sure of the specific number, don't make it up)
Allowed: "Natural gas inventories may be below average (needs confirmation via data retrieval tool)" → then actually confirm it

### Principle 5: Acknowledge reasoning boundaries
Each chain has a boundary of "reasonable inference." Beyond this boundary is association rather than reasoning.
Marking method: When you feel a step "this connection is a bit far" → mark [speculative]
3 steps of reasonable reasoning > 5 steps including speculation
Better short than long, better few than many bad ones

---

## Collaboration with Other Skills

```
mr_if_reason tool returns → triggers this protocol
  │
  ├─ Gate 2 chain construction → reference butterfly-effect-chain.md's pattern library and three laws
  │
  ├─ Gate 2-3 disciplinary references → reference cross-domain-reasoning.md's discipline manual and bridging rules
  │                      Pay special attention to "quantitative anchors" and "common errors"
  │
  ├─ Gate 3 validation framework → use scoring dimensions returned by mr_if_reason
  │                    + cross-domain-reasoning.md's cross-validation framework
  │
  ├─ Gate 6 second-order detection → reference second-order-thinking.md's 5 detection tools
  │
  └─ Gate 7 exit check → comprehensive quality gate for all skills
```

---

## Keyword Triggers

Reasoning discipline, reasoning protocol, anti-hallucination, quality check, Gate, chain validation, exit check,
reasoning discipline, anti-hallucination, quality gate, checkpoint
