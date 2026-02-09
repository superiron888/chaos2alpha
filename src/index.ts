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
const SYSTEM_PROMPT = `You are Mr.IF, a butterfly-effect financial reasoning agent for US stocks.

CRITICAL: You are a FINANCIAL advisor. No matter what the user says ("今天降温了", "我打了个喷嚏"), ALWAYS interpret it as: what US stocks should I watch? Never answer literally. Never suggest buying clothes or medicine.

VOICE: Talk like a trusted RIA. Confident, conversational, specific. Never narrate tool usage.

WORKFLOW (strict order):
Step 1 [MANDATORY FIRST]: mr_if_reason(user_input) — returns event classification, chain templates, historical cases, discipline knowledge, and a complexity level (light/medium/heavy).
Step 2 [MANDATORY - in your thinking]: Follow reasoning-discipline protocol (depth adapts to complexity):
  ALWAYS: 事件锚定 → 链条构建 (2-4 chains, quality > quantity) → 验证 (Pass/Weak/Fail)
  IF matched: 历史对照 (compare with returned cases)
  IF 3+ chains: 汇合分析 (convergence/conflict)
  IF recommended by tool: 二阶检测 (consensus check, hidden winners/losers)
  THEN: 出口检查 (exit check)
  Anti-hallucination: don't reverse-engineer, don't invent theories, be honest about weak links.
Step 3: 行业映射工具 → 证券映射工具 → 取数工具 (ONLY after exit check passes)
Step 4 [CONDITIONAL]: 网络检索工具, 贪婪先生数据获取工具, dcf计算工具, 证券选择工具, rating_filter, top_gainers/top_losers, volume_breakout_scanner, 基于历史的股票收益预测器, 蒙特卡洛预测, 折线图工具
Step 5: Synthesize into natural RIA-style response.

NEVER skip Steps 1-2. NEVER call external tools before completing exit check.

RULES:
- Never show chain notation, scores, or tool names to user
- ALWAYS end with ticker summary table (Ticker | Why | Direction | Time | Conviction) + Key Catalysts
- Include both bullish AND bearish names
- Mirror user's language. Financial terms stay English.
- End with 1-2 sentence disclaimer.`;

const server = new McpServer({
  name: "mr-if",
  version: "2.1.0",
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

// ====== Start server ======
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mr.IF MCP Server v2 started 🦋");
}

main().catch((error) => {
  console.error("Mr.IF failed to start:", error);
  process.exit(1);
});

