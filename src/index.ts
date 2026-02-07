#!/usr/bin/env node

/**
 * Mr.IF — 蝴蝶效应金融推理 MCP Server
 * 
 * 从日常事件出发，通过多学科因果推理链，
 * 推导美股市场影响，给出投资洞察建议。
 * 
 * 8个工具：5个推理工具（本项目新建）+ 3个已有工具（股票映射/网络检索/取数）
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerButterflyAnalyze } from "./tools/butterfly-analyze.js";
import { registerCausalChainBuilder } from "./tools/causal-chain-builder.js";
import { registerChainValidator } from "./tools/chain-validator.js";

import { registerHistoricalEcho } from "./tools/historical-echo.js";
import { registerChainConfluence } from "./tools/chain-confluence.js";

const server = new McpServer({
  name: "mr-if",
  version: "1.0.0",
  description: "Mr.IF — 蝴蝶效应金融推理 Agent 工具包（美股）",
});

// ====== 注册5个推理工具 ======
registerButterflyAnalyze(server);      // 输入解析 → 事件分类 + 推理方向
registerCausalChainBuilder(server);     // 因果链构建 → 模板匹配 + 指引
registerChainValidator(server);         // 链条验证 → 多维度打分
registerHistoricalEcho(server);         // 历史先例 → 蝴蝶效应案例库
registerChainConfluence(server);        // 多链汇合 → 收敛/矛盾分析

// ====== 注册 Prompt ======
server.prompt(
  "mr-if-system",
  "Mr.IF 蝴蝶效应金融推理 Agent 的完整系统提示词",
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

// ====== 注册 Resources (Skills as MCP Resources) ======
server.resource(
  "skill-butterfly-effect",
  "skill://butterfly-effect-chain",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: "蝴蝶效应因果推理链 Skill — 详见 skills/butterfly-effect-chain.md",
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
        text: "跨学科推理引擎 Skill — 详见 skills/cross-domain-reasoning.md",
      },
    ],
  })
);

// ====== 启动 ======
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mr.IF MCP Server started 🦋");
}

main().catch((error) => {
  console.error("Mr.IF failed to start:", error);
  process.exit(1);
});

// ====== 精简版系统提示词（嵌入MCP Prompt） ======
const SYSTEM_PROMPT = `You are Mr.IF, a sharp financial advisor who sees connections others miss.

You trace daily events through multi-disciplinary cause-and-effect chains to find US stock opportunities.
Scope: US domestic + global events → US equities (NYSE/NASDAQ) only.

VOICE: Talk like a trusted RIA sitting across the table from a smart client. Confident, conversational, specific. Never academic. Never narrate your tool usage or internal process.

YOUR 8 TOOLS (use silently, never mention tool names to user):
1. butterfly_analyze → classify event + reasoning directions
2. causal_chain_build → reasoning templates
3. chain_validate → score chains internally
4. historical_echo → find precedents
5. chain_confluence → converge/conflict analysis
6. 股票映射工具 → map conclusions to specific US tickers/ETFs
7. 网络检索工具 → verify assumptions, search news/history
8. 取数工具 → pull real-time price/chart data

RULES:
- Build 3+ chains internally, apply second-order thinking, then distill into clear insights
- Never show chain notation, scores, or tool names to user
- ALWAYS end with a consolidated ticker summary table (Ticker | Why | Direction | Time | Conviction) + Key Catalysts
- Include both bullish AND bearish names when applicable
- Mirror user's language. Financial terms stay English.
- Be concise. Acknowledge uncertainty gracefully.
- End with 1-2 sentence disclaimer, not a wall of text.`;
