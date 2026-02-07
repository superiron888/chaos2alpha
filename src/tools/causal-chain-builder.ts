/**
 * 因果链构建器 — Step 3: 分析拆解
 * 
 * 基于事件分析结果，构建多条跨学科因果推理链。
 * 每条链3-7步，标注学科依据和推理类型。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// 推理模式模板库
const CHAIN_TEMPLATES: Record<string, {
  name: string;
  pattern: string;
  disciplines: string[];
  typical_steps: number;
  example_triggers: string[];
}> = {
  symptom_to_pharma: {
    name: "症状→医药产业链",
    pattern: "身体症状 → 疾病分类 → 患病人群规模 → 药物/治疗需求 → 医药公司业绩",
    disciplines: ["生理学", "流行病学", "经济学"],
    typical_steps: 4,
    example_triggers: ["打喷嚏", "咳嗽", "失眠", "头疼", "发烧"],
  },
  weather_to_energy: {
    name: "天气→能源/大宗商品",
    pattern: "天气变化 → 能源需求变化 → 大宗商品供需 → 能源/化工企业利润",
    disciplines: ["物理学", "气象学", "经济学"],
    typical_steps: 4,
    example_triggers: ["降温", "高温", "暴雨", "干旱"],
  },
  consumption_to_industry: {
    name: "消费观察→行业趋势",
    pattern: "消费现象 → 背后驱动力 → 行业增长/衰退 → 行业龙头股",
    disciplines: ["社会学", "心理学", "经济学"],
    typical_steps: 4,
    example_triggers: ["咖啡涨价", "外卖多了", "排队", "商场冷清"],
  },
  emotion_to_capital: {
    name: "社会情绪→资金流向",
    pattern: "社会情绪 → 群体行为变化 → 消费/投资偏好 → 资金流向",
    disciplines: ["心理学", "行为经济学", "金融学"],
    typical_steps: 4,
    example_triggers: ["焦虑", "恐慌", "乐观", "躺平", "内卷"],
  },
  policy_to_industry: {
    name: "政策信号→产业调整",
    pattern: "政策动向 → 行业准入变化 → 产业结构调整 → 受益/受损企业",
    disciplines: ["政治学", "法学", "经济学"],
    typical_steps: 4,
    example_triggers: ["限电", "补贴", "禁令", "开放", "碳中和"],
  },
  tech_to_revolution: {
    name: "技术突破→产业革命",
    pattern: "技术进展 → 成本/效率变化 → 产业格局重构 → 价值重估",
    disciplines: ["工程学", "化学/物理学", "经济学"],
    typical_steps: 5,
    example_triggers: ["AI", "电池突破", "芯片", "量子计算"],
  },
  disaster_to_supply: {
    name: "灾害→供应链→替代需求",
    pattern: "突发事件 → 供应链中断 → 替代品需求 → 替代供应商受益",
    disciplines: ["地理学", "物流学", "经济学"],
    typical_steps: 4,
    example_triggers: ["地震", "台风", "疫情", "贸易战"],
  },
  health_psychology_to_wellness: {
    name: "健康心理→大健康消费",
    pattern: "身体信号 → 健康意识觉醒 → 保健消费意愿 → 大健康产业",
    disciplines: ["生理学", "心理学", "消费经济学"],
    typical_steps: 4,
    example_triggers: ["打喷嚏", "体检", "亚健康", "熬夜"],
  },
  environment_to_greentech: {
    name: "环境问题→绿色科技",
    pattern: "环境恶化 → 政策收紧 → 环保投入增加 → 绿色科技企业",
    disciplines: ["化学", "环境科学", "经济学"],
    typical_steps: 4,
    example_triggers: ["雾霾", "水污染", "碳排放", "塑料污染"],
  },
  demographic_to_sector: {
    name: "人口结构→行业变迁",
    pattern: "人口趋势 → 需求结构变化 → 行业兴衰 → 长期投资方向",
    disciplines: ["社会学", "人口学", "经济学"],
    typical_steps: 5,
    example_triggers: ["aging", "老龄化", "Gen Z", "millennial", "demographic", "birth rate", "retirement"],
  },
  geopolitical_to_safehaven: {
    name: "地缘冲突→避险资产",
    pattern: "地缘事件 → 市场恐慌(VIX↑) → 资金避险 → 黄金/国债/美元↑",
    disciplines: ["地缘政治", "心理学", "金融学"],
    typical_steps: 3,
    example_triggers: ["war", "conflict", "sanction", "missile", "NATO", "invasion", "战争", "冲突", "制裁"],
  },
  geopolitical_to_supply: {
    name: "地缘冲突→供应链断裂→替代供应商",
    pattern: "制裁/冲突 → 某国供给中断 → 大宗商品暴涨 → 替代供应商受益",
    disciplines: ["地缘政治", "供应链", "经济学"],
    typical_steps: 4,
    example_triggers: ["tariff", "sanction", "embargo", "trade war", "China", "Russia", "关税", "封锁"],
  },
  supply_chain_bottleneck: {
    name: "供应链瓶颈→定价权→利润暴增",
    pattern: "某环节产能紧张 → 无替代 → 极端定价权 → 毛利率飙升",
    disciplines: ["供应链", "工程学", "经济学"],
    typical_steps: 4,
    example_triggers: ["shortage", "bottleneck", "monopoly", "capacity", "GPU", "chip", "缺货", "产能"],
  },
  event_to_fed_rotation: {
    name: "经济数据→Fed政策预期→板块轮动",
    pattern: "经济数据/事件 → 改变Fed加息/降息预期 → 利率敏感行业轮动",
    disciplines: ["经济学", "货币政策", "金融学"],
    typical_steps: 4,
    example_triggers: ["CPI", "inflation", "jobs", "NFP", "unemployment", "Fed", "rate", "通胀", "就业", "利率"],
  },
  second_order_hidden_winner: {
    name: "一阶推理→二阶预期差→隐藏赢家",
    pattern: "明显事件 → 直觉赢家(已price in) → 寻找不明显的隐藏赢家/输家",
    disciplines: ["心理学", "市场传导", "二阶思维"],
    typical_steps: 5,
    example_triggers: ["obvious", "everyone knows", "consensus", "price in", "hidden", "所有人都知道"],
  },
  tech_paradigm_pickaxe: {
    name: "科技范式→卖铲人链",
    pattern: "技术爆发 → 应用需求暴增 → 基础设施瓶颈 → 基础设施供应商(卖铲人)受益最大",
    disciplines: ["工程学", "供应链", "经济学"],
    typical_steps: 5,
    example_triggers: ["AI", "ChatGPT", "data center", "cloud", "GPU", "infrastructure", "算力", "数据中心"],
  },
};

function matchTemplates(eventType: string, keywords: string[]): string[] {
  const matched: string[] = [];
  
  for (const [templateKey, template] of Object.entries(CHAIN_TEMPLATES)) {
    const hasOverlap = template.example_triggers.some(
      (trigger) => keywords.some((kw) => kw.includes(trigger) || trigger.includes(kw))
    );
    if (hasOverlap) {
      matched.push(templateKey);
    }
  }

  // 如果没有精确匹配，根据事件类型给出默认模板
  if (matched.length === 0) {
    const typeTemplateMap: Record<string, string[]> = {
      physiological: ["symptom_to_pharma", "health_psychology_to_wellness", "second_order_hidden_winner"],
      weather: ["weather_to_energy", "consumption_to_industry", "event_to_fed_rotation"],
      economic: ["event_to_fed_rotation", "consumption_to_industry", "emotion_to_capital"],
      social: ["emotion_to_capital", "demographic_to_sector", "consumption_to_industry"],
      technology: ["tech_to_revolution", "tech_paradigm_pickaxe", "supply_chain_bottleneck"],
      policy: ["policy_to_industry", "event_to_fed_rotation", "geopolitical_to_supply"],
      nature: ["disaster_to_supply", "weather_to_energy", "geopolitical_to_safehaven"],
      daily: ["consumption_to_industry", "second_order_hidden_winner", "emotion_to_capital"],
      geopolitical: ["geopolitical_to_safehaven", "geopolitical_to_supply", "supply_chain_bottleneck"],
    };
    matched.push(...(typeTemplateMap[eventType] || ["consumption_to_industry"]));
  }

  return matched;
}

export function registerCausalChainBuilder(server: McpServer): void {
  server.tool(
    "causal_chain_build",
    "基于事件分析结果，构建多条跨学科因果推理链。每条链包含推理步骤、学科依据、推理模式等结构化信息，供后续验证和评分使用。",
    {
      event_type: z.string().describe("事件类型代码，如 physiological, weather, economic 等"),
      keywords: z.array(z.string()).describe("匹配到的关键词列表"),
      reasoning_directions: z.array(z.string()).describe("推理方向列表"),
      season_context: z.string().optional().describe("季节语境描述"),
      user_input: z.string().describe("用户原始输入"),
    },
    async ({ event_type, keywords, reasoning_directions, season_context, user_input }) => {
      // 匹配推理模板
      const templateKeys = matchTemplates(event_type, keywords);

      // 去重，确保至少3个方向
      const uniqueTemplates = [...new Set(templateKeys)];
      
      // 如果不够3个，从通用模板补充
      const generalTemplates = ["consumption_to_industry", "emotion_to_capital", "health_psychology_to_wellness"];
      for (const gt of generalTemplates) {
        if (uniqueTemplates.length >= 3) break;
        if (!uniqueTemplates.includes(gt)) {
          uniqueTemplates.push(gt);
        }
      }

      const chains = uniqueTemplates.slice(0, 5).map((templateKey, index) => {
        const template = CHAIN_TEMPLATES[templateKey];
        return {
          chain_id: index + 1,
          chain_name: template?.name || templateKey,
          template_key: templateKey,
          pattern: template?.pattern || "通用推理模式",
          disciplines: template?.disciplines || ["经济学"],
          typical_steps: template?.typical_steps || 4,
          reasoning_prompt: buildReasoningPrompt(templateKey, user_input, season_context),
        };
      });

      const result = {
        input_summary: {
          user_input,
          event_type,
          keywords,
          season_context: season_context || "未指定",
        },
        chain_templates: chains,
        instructions: {
          for_llm: `Based on the ${chains.length} chain templates above, fill in concrete reasoning steps for each chain.

Requirements:
1. Each chain 3-7 steps
2. Each step must note: discipline + principle + link strength (strong/weak)
3. Final step must be a financial conclusion (specific sector + direction)
4. Assign initial confidence (1-5) and time horizon (immediate/1-2 weeks/1 month/1 quarter)
5. Maximum 1 weak link per chain; more than 1 weak link means auto-downgrade

Output each chain as structured data for chain_validate input:
- chain_id, chain_name
- chain_steps: [{step_number, content, discipline, link_strength}]
- financial_conclusion: {sector, stocks, summary}
- initial_confidence (1-5)

IMPORTANT: This is internal reasoning data. Never show chain steps, confidence scores, or discipline labels directly to the user.`,
        },
        next_step: "LLM填充推理步骤后，使用 chain_validate 工具验证各链条。",
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

function buildReasoningPrompt(templateKey: string, userInput: string, seasonContext?: string): string {
  const template = CHAIN_TEMPLATES[templateKey];
  if (!template) return `从"${userInput}"出发进行因果推理`;

  return `从"${userInput}"出发，按照【${template.name}】模式进行推理。
模式: ${template.pattern}
涉及学科: ${template.disciplines.join("、")}
${seasonContext ? `季节语境: ${seasonContext}` : ""}
请构建 ${template.typical_steps} 步左右的因果链，每步标注学科依据。`;
}
