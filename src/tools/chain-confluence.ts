/**
 * 多链汇合分析器 — Step 5→7: 决策汇总
 *
 * 当多条因果链产出后，这个工具负责：
 * 1. 发现"汇合"：多条链指向同一行业/标的 → 增强信号
 * 2. 发现"矛盾"：不同链对同一标的得出相反结论 → 需要裁决
 * 3. 输出净结论：综合所有链的加权推荐
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// 单条链的输入结构
const ChainResultSchema = z.object({
  chain_id: z.number().describe("推理链编号"),
  chain_name: z.string().describe("推理链名称"),
  confidence: z.number().min(1).max(5).describe("置信度 1-5"),
  direction: z.enum(["bullish", "bearish", "neutral"]).describe("方向：看多/看空/中性"),
  target_sectors: z.array(z.string()).describe("指向的行业，如 ['pharma', 'healthcare_services']"),
  target_tickers: z.array(z.string()).optional().describe("指向的具体标的，如 ['LLY', 'PFE']"),
  time_horizon: z.string().describe("时间窗口，如 'immediate', '1-2 weeks', '1 month', '1 quarter'"),
  risk_level: z.enum(["low", "medium", "high"]).describe("风险等级"),
  summary: z.string().describe("一句话逻辑浓缩"),
});

interface Confluence {
  type: "convergence" | "conflict";
  target: string;
  chains_involved: number[];
  details: string;
}

interface NetRecommendation {
  rank: number;
  target: string;
  target_type: "sector" | "ticker";
  direction: "bullish" | "bearish" | "neutral" | "mixed";
  net_confidence: number;
  supporting_chains: number[];
  opposing_chains: number[];
  time_horizon: string;
  risk: string;
  rationale: string;
}

function analyzeConfluences(
  chains: Array<z.infer<typeof ChainResultSchema>>
): { confluences: Confluence[]; recommendations: NetRecommendation[] } {
  const confluences: Confluence[] = [];

  // 按sector聚合
  const sectorMap = new Map<string, Array<{ chain_id: number; direction: string; confidence: number; time_horizon: string; risk_level: string }>>();
  
  for (const chain of chains) {
    for (const sector of chain.target_sectors) {
      if (!sectorMap.has(sector)) sectorMap.set(sector, []);
      sectorMap.get(sector)!.push({
        chain_id: chain.chain_id,
        direction: chain.direction,
        confidence: chain.confidence,
        time_horizon: chain.time_horizon,
        risk_level: chain.risk_level,
      });
    }
  }

  // 按ticker聚合
  const tickerMap = new Map<string, Array<{ chain_id: number; direction: string; confidence: number }>>();
  
  for (const chain of chains) {
    if (chain.target_tickers) {
      for (const ticker of chain.target_tickers) {
        if (!tickerMap.has(ticker)) tickerMap.set(ticker, []);
        tickerMap.get(ticker)!.push({
          chain_id: chain.chain_id,
          direction: chain.direction,
          confidence: chain.confidence,
        });
      }
    }
  }

  // 检测sector级别的汇合/矛盾
  for (const [sector, entries] of sectorMap) {
    if (entries.length < 2) continue;

    const directions = new Set(entries.map((e) => e.direction));
    const chainIds = entries.map((e) => e.chain_id);

    if (directions.size === 1) {
      // 汇合：多条链同方向
      confluences.push({
        type: "convergence",
        target: sector,
        chains_involved: chainIds,
        details: `${chainIds.length}条链同时看${entries[0].direction === "bullish" ? "多" : entries[0].direction === "bearish" ? "空" : "平"} ${sector}，信号增强`,
      });
    } else {
      // 矛盾：不同链方向不一致
      confluences.push({
        type: "conflict",
        target: sector,
        chains_involved: chainIds,
        details: `对 ${sector} 存在矛盾信号：${entries.map((e) => `链#${e.chain_id}=${e.direction}`).join(", ")}`,
      });
    }
  }

  // 生成净推荐
  const recommendations: NetRecommendation[] = [];
  let rank = 0;

  // Sector级推荐
  for (const [sector, entries] of sectorMap) {
    const bullish = entries.filter((e) => e.direction === "bullish");
    const bearish = entries.filter((e) => e.direction === "bearish");

    const bullScore = bullish.reduce((sum, e) => sum + e.confidence, 0);
    const bearScore = bearish.reduce((sum, e) => sum + e.confidence, 0);
    const netScore = bullScore - bearScore;

    // 加权置信度（多链汇合加成）
    const chainCount = entries.length;
    const avgConf = entries.reduce((sum, e) => sum + e.confidence, 0) / chainCount;
    const confluenceBonus = chainCount >= 2 ? Math.min(1, (chainCount - 1) * 0.5) : 0;
    const netConfidence = Math.min(5, Math.max(1, avgConf + confluenceBonus));

    let direction: "bullish" | "bearish" | "neutral" | "mixed";
    const neutral = entries.filter((e) => e.direction === "neutral");
    if (bullish.length === 0 && bearish.length === 0) {
      // 全是 neutral
      direction = "neutral";
    } else if (netScore > 0 && bearish.length === 0) {
      direction = "bullish";
    } else if (netScore < 0 && bullish.length === 0) {
      direction = "bearish";
    } else {
      direction = "mixed"; // 真正存在 bullish vs bearish 冲突
    }

    // 取最短（最保守）的时间窗口
    const TIME_HORIZON_ORDER = ["immediate", "1-2 weeks", "1 week", "2-4 weeks", "1 month", "1-2 months", "1 quarter", "6 months", "1 year"];
    const timeHorizons = entries.map((e) => e.time_horizon);
    timeHorizons.sort((a, b) => {
      const ai = TIME_HORIZON_ORDER.findIndex((t) => a.toLowerCase().includes(t));
      const bi = TIME_HORIZON_ORDER.findIndex((t) => b.toLowerCase().includes(t));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    const risks = entries.map((e) => e.risk_level);
    const maxRisk = risks.includes("high") ? "high" : risks.includes("medium") ? "medium" : "low";

    rank++;
    recommendations.push({
      rank,
      target: sector,
      target_type: "sector",
      direction,
      net_confidence: Math.round(netConfidence * 10) / 10,
      supporting_chains: bullish.map((e) => e.chain_id),
      opposing_chains: bearish.map((e) => e.chain_id),
      time_horizon: timeHorizons[0],
      risk: maxRisk,
      rationale: direction === "mixed"
        ? `存在矛盾信号，bullish score ${bullScore} vs bearish score ${bearScore}`
        : `${chainCount}条链${confluenceBonus > 0 ? "(汇合加成)" : ""}指向${direction === "bullish" ? "看多" : "看空"}`,
    });
  }

  // 按净置信度排序：明确方向 > neutral > mixed
  const directionPriority = (d: string) => d === "mixed" ? 2 : d === "neutral" ? 1 : 0;
  recommendations.sort((a, b) => {
    const pDiff = directionPriority(a.direction) - directionPriority(b.direction);
    if (pDiff !== 0) return pDiff;
    return b.net_confidence - a.net_confidence;
  });
  recommendations.forEach((r, i) => (r.rank = i + 1));

  return { confluences, recommendations };
}

export function registerChainConfluence(server: McpServer): void {
  server.tool(
    "chain_confluence",
    "分析多条因果推理链的汇合与矛盾。当多条链指向同一行业时增强信号，当链条互相矛盾时标注冲突，最终输出加权后的净推荐清单。",
    {
      chain_results: z.array(ChainResultSchema).min(2).describe("至少2条因果链的分析结果"),
    },
    async ({ chain_results }) => {
      const { confluences, recommendations } = analyzeConfluences(chain_results);

      const result = {
        input_summary: {
          total_chains: chain_results.length,
          chains: chain_results.map((c) => ({
            id: c.chain_id,
            name: c.chain_name,
            direction: c.direction,
            confidence: c.confidence,
            sectors: c.target_sectors,
          })),
        },
        confluences: {
          convergences: confluences.filter((c) => c.type === "convergence"),
          conflicts: confluences.filter((c) => c.type === "conflict"),
          summary: confluences.length === 0
            ? "各推理链指向不同方向，无明显汇合或矛盾"
            : `发现 ${confluences.filter((c) => c.type === "convergence").length} 个汇合信号，${confluences.filter((c) => c.type === "conflict").length} 个矛盾信号`,
        },
        net_recommendations: recommendations,
        action_guide: {
          strong_signals: recommendations.filter((r) => r.net_confidence >= 4 && r.direction !== "mixed" && r.direction !== "neutral"),
          moderate_signals: recommendations.filter((r) => r.net_confidence >= 3 && r.net_confidence < 4 && r.direction !== "mixed" && r.direction !== "neutral"),
          neutral_signals: recommendations.filter((r) => r.direction === "neutral"),
          conflicted: recommendations.filter((r) => r.direction === "mixed"),
          note: "汇合加成规则：2条链同方向+0.5，3条链+1.0。mixed=存在bullish vs bearish矛盾，neutral=无明确方向。",
        },
        next_step: "将净推荐的 sector 传入股票映射工具获取具体 ticker/ETF，再调用取数工具拉实时行情，最后整合生成用户报告。",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
