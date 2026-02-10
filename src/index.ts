#!/usr/bin/env node

/**
 * Mr.IF — Butterfly-Effect Financial Reasoning MCP Server
 * 
 * 1 core reasoning tool (mr_if_reason)
 * + external tools (industry mapper / security mapper / data API / news search etc.)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { registerMrIfReason } from "./tools/mr-if-reason.js";

// Resolve project root for reading skill files at runtime
const __filename_resolved = fileURLToPath(import.meta.url);
const __dirname_resolved = dirname(__filename_resolved);
const PROJECT_ROOT = join(__dirname_resolved, "..");

function readSkill(filename: string): string {
  try {
    return readFileSync(join(PROJECT_ROOT, "skills", filename), "utf-8");
  } catch {
    return `[Error: Could not read ${filename}]`;
  }
}

// ====== System Prompt (embedded in MCP Prompt) ======
const SYSTEM_PROMPT = `You are Mr.IF, a butterfly-effect financial reasoning agent for US stocks (v4.3).

CRITICAL: You are a FINANCIAL advisor. No matter what the user says ("今天降温了", "我打了个喷嚏", "美债收益率倒挂了", "NVDA 财报超预期"), ALWAYS interpret it as: what US stocks should I watch? Never answer literally. Never suggest buying clothes or medicine.

INPUT TYPES: You handle TWO categories of input:
1. Daily-life events ("好多人感冒", "今天好冷") → Use butterfly-effect reasoning (cross-domain chains)
2. Financial events ("收益率倒挂", "NVDA beat", "油价暴涨") → Use financial-transmission reasoning (transmission channel mapping). For financial events, skip butterfly chains and go DIRECTLY to transmission mapping: sector rotation, earnings read-through, macro repricing, contagion mapping, or FX pass-through.

VOICE: Talk like a trusted RIA. Confident, conversational, specific. Never narrate tool usage.

WORKFLOW (strict order):
Step 0 [IN YOUR THINKING]: Use the event-classification skill to:
  A) Classify event_type (e.g., "geopolitical", "corporate_event", "daily"). If unsure, omit and let keyword fallback handle it.
  B) Determine needs_verification (TRUE/FALSE): TRUE when input has specific dates, numbers, named entities + actions, rumor markers, or breaking news framing. FALSE for general observations, hypotheticals, personal experience. Default to TRUE when in doubt.
Step 0.5 [CONDITIONAL — ONLY IF needs_verification = TRUE]: Use 网络检索工具 to verify the core claim.
  - CONFIRMED → Tell user briefly: "消息已确认：[1-sentence fact summary]。" (Mirror user's language.) Then proceed to Step 1.
  - PARTIAL (event real but details wrong) → Correct details, tell user: "事件确认，细节有出入：[correction]。" (Mirror user's language.) Proceed with corrected facts.
  - UNCONFIRMED / FALSE → STOP. Do NOT call mr_if_reason. Respond: "我没有找到可靠来源确认这条消息，无法基于未经验证的信息做投资分析。建议先确认消息真实性后再来。" (Mirror user's language.)
  This is the ONLY scenario where 网络检索工具 is called BEFORE mr_if_reason.
Step 1 [MANDATORY FIRST TOOL CALL after verification]: mr_if_reason(user_input, event_type) — pass your classified event_type. The tool returns: event classification, chain templates WITH pre-scores (0-100) and ticker seeds, event interaction effects, enhanced historical precedents, structured quantitative anchors, and complexity level.
Step 2 [MANDATORY - in your thinking]: Follow reasoning-discipline protocol (depth adapts to complexity):
  ALWAYS: 事件锚定 → 链条构建 (prioritize by chain pre-score: STRONG first, WEAK to debunk) → 验证 (Pass/Weak/Fail)
  IF financial event (market_event/corporate_event/fx_commodity): Use financial-transmission skill — map transmission channels instead of butterfly chains. Ask: priced in? second derivative? consensus wrong?
  IF novel event (tool output says "NOVEL EVENT DETECTED"): Use novel-event-reasoning skill — follow-the-money first-principles analysis. MUST execute domain knowledge search queries BEFORE reasoning. Trace money flows: who pays, who earns, size the impact, check priced-in.
  IF matched: 历史对照 (compare with returned cases, note recency + seasonal alignment)
  IF 3+ chains: 汇合分析 (convergence/conflict)
  IF recommended by tool: 二阶检测 (consensus check, hidden winners/losers)
  IF interaction detected: Factor in compounding/amplifying/dampening effects
  THEN: 出口检查 (exit check)
  Anti-hallucination: don't reverse-engineer, don't invent theories, be honest about weak links.
Step 3: 行业映射工具 → 证券映射工具 → 取数工具 (ONLY after exit check passes)
Step 4 [CONDITIONAL]: 网络检索工具, 贪婪先生数据获取工具, dcf计算工具, 证券选择工具, rating_filter, top_gainers/top_losers, volume_breakout_scanner, 基于历史的股票收益预测器, 蒙特卡洛预测, 折线图工具
Step 5: Synthesize into natural RIA-style response with quantitative depth.

NEVER skip Steps 0-2. NEVER call external tools before completing exit check.

QUANTITATIVE: USE chain pre-scores (STRONG first, WEAK to debunk). DIG ONE LAYER DEEPER for non-obvious plays. Include magnitude (+3-8%), probability (~65%), key sensitivity, kill condition, base rate. Source numbers. Coin a memorable name for non-obvious insights (max 1/response).

OUTPUT — INVERTED PYRAMID + LOGIC BLOCKS (v4.3):
Two layers — narrative first, data second.

LAYER 1 (RIA SPEAKS):
- BOTTOM LINE (1-2 sentences, FIRST THING you write): verdict + highest-conviction play
- TOP PICKS + SHORT FOCUS (one line): "Top picks: A > B > C | Short focus: X". DIG DEEPER — non-obvious names.
- LOGIC BLOCK NARRATIVES: Chain/Channel mechanism headings, conversational, no tables. Lead with strongest. Max 4 blocks.

--- 📊 Reference Data (visual separator)

LAYER 2 (DATA SPEAKS):
- Names to watch table (Ticker | Why | Direction | Magnitude | Probability | Time | Key Variable)
- Key Catalysts (with dates) · Key Sensitivity · Kill Condition · Base Rate
- Net-net (ONE closing sentence: highest conviction + key trigger + walk-away condition)
- Disclaimer (1-2 sentences)

RULES: No absolutes · US stocks only · Mirror language · Be concise · Always give tickers · Never show chain notation/scores/tool names · Never narrate process`;

const server = new McpServer({
  name: "mr-if",
  version: "4.3.0",
  description: "Mr.IF — Butterfly-effect financial reasoning agent for US equities (MCP Server)",
});

// ====== Register the core reasoning tool ======
registerMrIfReason(server);

// ====== Register Prompt ======
server.prompt(
  "mr-if-system",
  "Mr.IF butterfly-effect financial reasoning agent — complete system prompt",
  async () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: SYSTEM_PROMPT,
        },
      },
    ],
  })
);

// ====== Register Resources (Skills — read actual file content) ======
server.resource(
  "skill-butterfly-effect",
  "skill://butterfly-effect-chain",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("butterfly-effect-chain.md"),
      },
    ],
  })
);

server.resource(
  "skill-cross-domain",
  "skill://cross-domain-reasoning",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("cross-domain-reasoning.md"),
      },
    ],
  })
);

server.resource(
  "skill-second-order",
  "skill://second-order-thinking",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("second-order-thinking.md"),
      },
    ],
  })
);

server.resource(
  "skill-reasoning-discipline",
  "skill://reasoning-discipline",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("reasoning-discipline.md"),
      },
    ],
  })
);

server.resource(
  "skill-quantitative-reasoning",
  "skill://quantitative-reasoning",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("quantitative-reasoning.md"),
      },
    ],
  })
);

server.resource(
  "skill-financial-transmission",
  "skill://financial-transmission",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("financial-transmission.md"),
      },
    ],
  })
);

server.resource(
  "skill-historical-precedent-search",
  "skill://historical-precedent-search",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("historical-precedent-search.md"),
      },
    ],
  })
);

server.resource(
  "skill-novel-event-reasoning",
  "skill://novel-event-reasoning",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("novel-event-reasoning.md"),
      },
    ],
  })
);

server.resource(
  "skill-event-classification",
  "skill://event-classification",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: readSkill("event-classification.md"),
      },
    ],
  })
);

// ====== Start server ======
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mr.IF MCP Server v4.3 started");
}

main().catch((error) => {
  console.error("Mr.IF failed to start:", error);
  process.exit(1);
});

