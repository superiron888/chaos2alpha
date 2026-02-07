/**
 * 蝴蝶效应分析器 — Step 2: 认领目标
 * 
 * 解析用户输入，识别事件类型、关键实体、时间语境，
 * 确定推理方向，为后续因果链构建提供基础。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// 事件类型分类
const EVENT_TYPES = {
  physiological: {
    name: "Physiological / 生理现象",
    keywords: ["sneeze", "cough", "insomnia", "headache", "fever", "allergy", "catch cold", "common cold", "sick", "flu", "fatigue", "obesity", "stress",
               "打喷嚏", "咳嗽", "失眠", "头疼", "发烧", "过敏", "感冒", "疲劳", "肥胖", "压力", "焦虑", "生病"],
    reasoning_angles: ["Pharma supply chain", "Healthcare demand", "Public health", "Health insurance", "Wellness consumption"],
  },
  weather: {
    name: "Weather & Climate / 天气气候",
    keywords: ["cold", "hot", "rain", "snow", "hurricane", "drought", "flood", "heatwave", "freeze", "wildfire", "tornado",
               "冷", "热", "下雨", "下雪", "飓风", "干旱", "洪水", "高温", "降温", "山火"],
    reasoning_angles: ["Energy demand", "Agriculture impact", "Consumer behavior shift", "Infrastructure damage", "Logistics disruption", "Insurance claims"],
  },
  economic: {
    name: "Economic Signal / 经济信号",
    keywords: ["inflation", "deflation", "layoff", "hiring", "IPO", "bankruptcy", "interest rate", "Fed", "CPI", "GDP", "unemployment", "tariff",
               "涨价", "降价", "裁员", "招聘", "上市", "通胀", "利率", "美联储", "关税"],
    reasoning_angles: ["Supply-demand shift", "Industry chain transmission", "Fed policy expectation", "Capital flow", "Sector rotation"],
  },
  social: {
    name: "Social Trend / 社会现象",
    keywords: ["aging", "remote work", "gig economy", "mental health", "loneliness", "migration", "inequality", "TikTok", "influencer",
               "老龄化", "远程办公", "零工经济", "心理健康", "孤独", "移民", "网红", "短视频"],
    reasoning_angles: ["Consumer trend", "Generational shift", "Policy implication", "Cultural change", "Labor market"],
  },
  technology: {
    name: "Technology / 科技",
    keywords: ["AI", "robot", "EV", "chip", "semiconductor", "5G", "quantum", "blockchain", "VR", "autonomous", "SpaceX", "ChatGPT",
               "人工智能", "机器人", "电动车", "芯片", "半导体", "区块链", "自动驾驶"],
    reasoning_angles: ["Tech substitution", "Industry upgrade", "Cost revolution", "New market creation", "Capex cycle"],
  },
  policy: {
    name: "Policy & Regulation / 政策法规",
    keywords: ["ban", "subsidy", "regulation", "antitrust", "tariff", "sanction", "carbon", "data privacy", "FDA", "SEC", "executive order",
               "禁令", "补贴", "监管", "反垄断", "关税", "制裁", "碳中和", "数据安全"],
    reasoning_angles: ["Market access change", "Compliance cost", "Policy tailwind", "Industry reshoring", "Geopolitical risk"],
  },
  nature: {
    name: "Natural Event / 自然事件",
    keywords: ["earthquake", "volcano", "flood", "wildfire", "pandemic", "epidemic", "tsunami", "solar storm",
               "地震", "火山", "洪水", "山火", "疫情", "海啸"],
    reasoning_angles: ["Supply chain shock", "Post-disaster rebuild", "Insurance claims", "Substitute demand", "Defense spending"],
  },
  daily: {
    name: "Daily Observation / 日常观察",
    keywords: ["line", "traffic", "delivery", "coffee", "gym", "pet", "movie", "Uber", "Costco", "Amazon",
               "排队", "堵车", "快递", "咖啡", "健身", "宠物", "电影", "外卖"],
    reasoning_angles: ["Consumer trend", "Industry sentiment", "Lifestyle shift", "New business model"],
  },
  geopolitical: {
    name: "Geopolitical / 地缘政治",
    keywords: ["war", "conflict", "sanction", "NATO", "China", "Russia", "Taiwan", "Middle East", "oil embargo", "trade war", "BRICS",
               "战争", "冲突", "制裁", "北约", "中国", "俄罗斯", "台湾", "中东", "贸易战"],
    reasoning_angles: ["Defense spending", "Energy security", "Supply chain reshoring", "Safe haven flow", "Commodity disruption"],
  },
} as const;

// 月份对应的季节和事件语境（美国/全球视角）
const SEASONAL_CONTEXT: Record<number, string> = {
  1: "冬季深处, New Year后消费放缓, CES科技展, 流感高发季, Q4财报季开始, Fed政策预期",
  2: "冬末, Super Bowl消费旺季, 流感季尾声, 情人节零售, 财报季密集期",
  3: "早春, FOMC会议, 过敏季开始, Spring Break旅游消费, 科技公司年度发布",
  4: "春季, Tax Day(报税截止), Q1财报季, 农业播种季, Easter消费",
  5: "晚春初夏, Memorial Day长周末, 夏季出行旺季启动, Sell in May效应讨论",
  6: "夏季开始, WWDC/E3科技发布, FOMC会议, 夏季用电高峰, Pride Month消费",
  7: "盛夏, Independence Day, 暑期旅游高峰, Q2财报季, 飓风季开始(大西洋)",
  8: "盛夏末, Back-to-School消费, Jackson Hole央行年会, 飓风季高峰",
  9: "初秋, Labor Day, iPhone发布季, FOMC会议, 秋季零售备货",
  10: "深秋, Q3财报季, Halloween消费, 大选年政治不确定性(偶数年)",
  11: "秋冬交替, Thanksgiving+Black Friday+Cyber Monday消费旺季, 供暖季开始",
  12: "冬季, Holiday Season消费高峰, 圣诞+新年零售, 年末税务操作(Tax-Loss Harvesting), 低流动性",
};

function classifyEvent(input: string): {
  primary_type: string;
  secondary_types: string[];
  matched_keywords: string[];
} {
  const matches: Array<{ type: string; name: string; count: number; keywords: string[] }> = [];

  const inputLower = input.toLowerCase();
  for (const [typeKey, typeInfo] of Object.entries(EVENT_TYPES)) {
    const matched = typeInfo.keywords.filter((kw) => inputLower.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      matches.push({
        type: typeKey,
        name: typeInfo.name,
        count: matched.length,
        keywords: matched,
      });
    }
  }

  // 按匹配数排序
  matches.sort((a, b) => b.count - a.count);

  if (matches.length === 0) {
    return {
      primary_type: "daily",
      secondary_types: [],
      matched_keywords: [],
    };
  }

  return {
    primary_type: matches[0].type,
    secondary_types: matches.slice(1).map((m) => m.type),
    matched_keywords: matches.flatMap((m) => m.keywords),
  };
}

function getReasoningDirections(eventType: string): string[] {
  const typeInfo = EVENT_TYPES[eventType as keyof typeof EVENT_TYPES];
  return typeInfo ? [...typeInfo.reasoning_angles] : ["消费趋势", "行业景气度", "供需变化"];
}

export function registerButterflyAnalyze(server: McpServer): void {
  server.tool(
    "butterfly_analyze",
    "解析用户输入的日常事件，识别事件类型、关键实体、时间语境，确定蝴蝶效应推理方向。这是Mr.IF工作流的第一步。",
    {
      user_input: z.string().describe("用户的原始输入，例如'我今天打了个喷嚏'"),
      current_date: z.string().optional().describe("当前日期，格式 YYYY-MM-DD，用于判断季节语境"),
    },
    async ({ user_input, current_date }) => {
      // 解析日期
      const date = current_date ? new Date(current_date) : new Date();
      const month = date.getMonth() + 1;
      const seasonContext = SEASONAL_CONTEXT[month] || "无特殊季节语境";

      // 分类事件
      const classification = classifyEvent(user_input);
      const primaryType = EVENT_TYPES[classification.primary_type as keyof typeof EVENT_TYPES];

      // 获取推理方向
      const directions = getReasoningDirections(classification.primary_type);

      // 如果有二级分类，合并推理方向
      for (const secType of classification.secondary_types) {
        const secDirections = getReasoningDirections(secType);
        for (const d of secDirections) {
          if (!directions.includes(d)) {
            directions.push(d);
          }
        }
      }

      const result = {
        event_analysis: {
          original_input: user_input,
          primary_type: {
            code: classification.primary_type,
            name: primaryType?.name || "日常观察",
          },
          secondary_types: classification.secondary_types.map((t) => ({
            code: t,
            name: EVENT_TYPES[t as keyof typeof EVENT_TYPES]?.name || t,
          })),
          matched_keywords: classification.matched_keywords,
        },
        context: {
          date: date.toISOString().split("T")[0],
          month,
          season_context: seasonContext,
        },
        reasoning_directions: directions.map((d, i) => ({
          index: i + 1,
          direction: d,
          priority: i < 3 ? "high" : "medium",
        })),
        next_step: "请使用 causal_chain_build 工具，传入事件分析结果，构建因果推理链。",
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
