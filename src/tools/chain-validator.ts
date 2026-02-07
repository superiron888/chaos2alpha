/**
 * 链条验证器 — Step 4+5: 应用方法论 + 决策与拍板
 * 
 * 对构建好的因果推理链进行多维度验证，
 * 包括逻辑连贯性、学科准确性、历史先例、反面论证等。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// 验证维度
const VALIDATION_DIMENSIONS = {
  logic_coherence: {
    name: "逻辑连贯性",
    description: "每一步是否从上一步逻辑可推导",
    weight: 0.25,
    checks: [
      "前后步骤之间是否存在逻辑断裂",
      "是否有'量子跳跃'式的不可解释推理",
      "因果方向是否正确（不是倒因为果）",
    ],
  },
  discipline_accuracy: {
    name: "学科准确性",
    description: "引用的学科原理是否正确",
    weight: 0.20,
    checks: [
      "学科原理是否被正确引用",
      "是否存在对学科概念的曲解",
      "跨学科桥接是否合理",
    ],
  },
  assumption_explicit: {
    name: "假设显性化",
    description: "隐含假设是否被明确标注",
    weight: 0.15,
    checks: [
      "链条中隐含了哪些未明说的假设",
      "这些假设在当前环境下是否成立",
      "假设失效时结论如何变化",
    ],
  },
  counter_argument: {
    name: "反面论证",
    description: "什么条件下链条会失效",
    weight: 0.15,
    checks: [
      "什么条件下这条链完全失效",
      "是否存在反向因果链",
      "有无遗漏的干扰因素",
    ],
  },
  time_consistency: {
    name: "时间一致性",
    description: "链条中各步骤时间尺度是否匹配",
    weight: 0.10,
    checks: [
      "各步骤时间尺度是否一致",
      "即时效应和长期趋势是否混合",
      "传导时间是否合理",
    ],
  },
  scale_reasonability: {
    name: "规模合理性",
    description: "推理链暗示的市场影响规模是否合理",
    weight: 0.15,
    checks: [
      "事件影响面与标的市值是否匹配",
      "推理链暗示的影响是否被夸大",
      "量级估算是否在合理范围",
    ],
  },
};

// 置信度加减分规则
const SCORING_RULES = {
  bonuses: [
    { condition: "链条少于4步", points: 1.0, id: "short_chain" },
    { condition: "有历史先例验证", points: 1.0, id: "historical" },
    { condition: "多条链指向同一结论", points: 1.0, id: "cross_validated" },
    { condition: "有实时数据支撑", points: 1.0, id: "data_backed" },
    { condition: "基于公认的学科原理", points: 1.0, id: "established_theory" },
  ],
  penalties: [
    { condition: "链条超过5步", points: -1.0, id: "long_chain" },
    { condition: "包含弱关联跳跃（第1个-0.5，后续每个-1.0）", points: -0.5, id: "weak_link" },
    { condition: "依赖未经验证的假设", points: -1.0, id: "unverified_assumption" },
    { condition: "仅单一学科支撑", points: -0.5, id: "single_discipline" },
    { condition: "时间窗口不确定", points: -0.5, id: "uncertain_timeline" },
  ],
};

export function registerChainValidator(server: McpServer): void {
  server.tool(
    "chain_validate",
    "对因果推理链进行多维度验证，包括逻辑连贯性、学科准确性、历史先例等，输出结构化的验证报告和置信度评分。",
    {
      chain_id: z.number().describe("因果链编号"),
      chain_name: z.string().describe("因果链名称"),
      chain_steps: z.array(
        z.object({
          step_number: z.number(),
          content: z.string().describe("推理步骤内容"),
          discipline: z.string().describe("学科依据"),
          link_strength: z.enum(["strong", "weak"]).describe("关联强度"),
        })
      ).describe("因果链的各个推理步骤"),
      financial_conclusion: z.object({
        sector: z.string().describe("目标行业/板块"),
        stocks: z.array(z.string()).optional().describe("具体股票代码或名称"),
        summary: z.string().describe("一句话逻辑浓缩"),
      }).describe("金融结论"),
      initial_confidence: z.number().min(1).max(5).describe("初始置信度(1-5)"),
    },
    async ({ chain_id, chain_name, chain_steps, financial_conclusion, initial_confidence }) => {
      // 自动检测的评分调整
      const auto_adjustments: Array<{ rule_id: string; condition: string; points: number; applied: boolean; reason: string }> = [];

      // 检查链条长度
      const chainLength = chain_steps.length;
      if (chainLength < 4) {
        auto_adjustments.push({
          rule_id: "short_chain",
          condition: "链条少于4步",
          points: 1.0,
          applied: true,
          reason: `链条仅${chainLength}步，推理路径短，不确定性低`,
        });
      }
      if (chainLength > 5) {
        auto_adjustments.push({
          rule_id: "long_chain",
          condition: "链条超过5步",
          points: -1.0,
          applied: true,
          reason: `链条${chainLength}步，推理路径长，不确定性累积`,
        });
      }

      // 检查弱关联（第1个weak扣0.5，第2个起每个扣1.0——允许一次合理推测）
      const weakLinks = chain_steps.filter((s) => s.link_strength === "weak");
      if (weakLinks.length === 1) {
        auto_adjustments.push({
          rule_id: "weak_link",
          condition: "包含1个弱关联跳跃",
          points: -0.5,
          applied: true,
          reason: `第${weakLinks[0].step_number}步为弱关联（单次可接受，轻微扣分）`,
        });
      } else if (weakLinks.length >= 2) {
        const penalty = -0.5 + -1.0 * (weakLinks.length - 1); // 第1个-0.5，后续每个-1.0
        auto_adjustments.push({
          rule_id: "weak_link",
          condition: `包含${weakLinks.length}个弱关联跳跃`,
          points: penalty,
          applied: true,
          reason: `第${weakLinks.map((w) => w.step_number).join(",")}步为弱关联，超过1个弱关联显著降低置信度`,
        });
      }

      // 检查学科多样性
      const disciplines = [...new Set(chain_steps.map((s) => s.discipline))];
      if (disciplines.length <= 1) {
        auto_adjustments.push({
          rule_id: "single_discipline",
          condition: "仅单一学科支撑",
          points: -0.5,
          applied: true,
          reason: `仅涉及${disciplines[0]}一个学科`,
        });
      }

      // 计算调整后置信度
      const totalAdjustment = auto_adjustments.reduce((sum, adj) => sum + adj.points, 0);
      const adjustedConfidence = Math.max(1, Math.min(5, initial_confidence + totalAdjustment));

      // 确定风险等级
      let riskLevel: string;
      if (adjustedConfidence >= 4) riskLevel = "🟢 低风险";
      else if (adjustedConfidence >= 3) riskLevel = "🟡 中风险";
      else riskLevel = "🔴 高风险";

      const result = {
        validation_report: {
          chain_id,
          chain_name,
          chain_length: chainLength,
          disciplines_involved: disciplines,
          financial_conclusion,
        },
        validation_dimensions: Object.entries(VALIDATION_DIMENSIONS).map(([key, dim]) => ({
          dimension: dim.name,
          weight: dim.weight,
          checks_to_perform: dim.checks,
          instruction: `请对此链条的【${dim.name}】进行评估，回答上述检查问题。`,
        })),
        auto_scoring: {
          initial_confidence,
          adjustments: auto_adjustments,
          total_adjustment: totalAdjustment,
          adjusted_confidence: adjustedConfidence,
          risk_level: riskLevel,
        },
        manual_scoring: {
          instruction: "以下规则需要LLM判断后手动应用：",
          available_bonuses: SCORING_RULES.bonuses.filter(
            (b) => !auto_adjustments.some((a) => a.rule_id === b.id)
          ),
          available_penalties: SCORING_RULES.penalties.filter(
            (p) => !auto_adjustments.some((a) => a.rule_id === p.id)
          ),
        },
        next_step: "验证完成后，结合 historical_echo 结果，进入 chain_confluence 汇合分析。",
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
