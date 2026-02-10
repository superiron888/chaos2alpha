/**
 * Mr.IF Butterfly-Effect Reasoning Engine — Core Tool v4.3
 *
 * One call returns the complete reasoning scaffold:
 * 1. Event classification + reasoning directions (v4: LLM-classified event_type override)
 * 2. Chain template matching + PRE-SCORING (0-100) + sector/ticker seeds
 * 3. Event interaction effects (when 2+ event types co-occur)
 * 4. Historical precedent search (enhanced: recency + seasonal + magnitude)
 * 5. Structured quantitative anchors
 * 6. Discipline knowledge injection
 * 7. Inverted Pyramid output structure (v4.2: Bottom Line + Top Picks first, data layer second)
 * 8. Falsifiability guide: kill conditions, chain break points, timestamped checkpoints
 *
 * v3 → v4.2 changelog:
 * - v3: Chain confidence pre-score, sector hints, ticker seeds, interaction matrix,
 *        enhanced historical matching, structured quantitative anchors, magnitude + probability
 * - v3.1: Financial-to-financial transmission channels, output format bifurcation
 * - v3.2: Novel event detection + domain knowledge search (first-principles mode)
 * - v4.0: LLM-guided event classification (event_type parameter overrides keyword matching)
 * - v4.1: Logic block output structure, kill conditions, concept naming, deeper tickers
 * - v4.2: Inverted pyramid (Bottom Line + Top Picks first), two-layer structure (narrative/data), short focus explicit
 * - v4.3: Net-net closing sentence, 📊 Reference Data visual separator, factual verification (Step 0.5 in prompt), prompt slimming
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ======================================================================
// Section 1: Event Classification
// ======================================================================

const EVENT_TYPES = {
  physiological: {
    name: "Physiological / 生理现象",
    keywords: ["sneeze", "cough", "insomnia", "headache", "fever", "allergy", "catch cold", "common cold", "sick", "flu", "fatigue", "obesity", "stress",
               "打喷嚏", "咳嗽", "失眠", "头疼", "发烧", "过敏", "感冒", "疲劳", "肥胖", "压力", "焦虑", "生病"],
    reasoning_angles: ["Pharma supply chain", "Healthcare demand", "Public health", "Health insurance", "Wellness consumption"],
  },
  weather: {
    name: "Weather & Climate / 天气气候",
    keywords: ["cold", "hot", "rain", "snow", "hurricane", "drought", "flood", "heatwave", "freeze", "wildfire", "tornado", "blizzard", "typhoon", "smog",
               "冷", "热", "下雨", "下雪", "飓风", "干旱", "洪水", "高温", "降温", "山火", "寒潮", "暴风雪", "台风", "雾霾", "酷暑", "寒流", "暴雨"],
    reasoning_angles: ["Energy demand", "Agriculture impact", "Consumer behavior shift", "Infrastructure damage", "Logistics disruption", "Insurance claims"],
  },
  economic: {
    name: "Economic Signal / 经济信号",
    keywords: ["inflation", "deflation", "layoff", "hiring", "IPO", "bankruptcy", "interest rate", "Fed", "CPI", "GDP", "unemployment", "tariff",
               "housing", "mortgage", "rent", "home sales",
               "涨价", "降价", "裁员", "招聘", "上市", "通胀", "利率", "美联储", "关税", "房价", "房贷", "租金", "房地产"],
    reasoning_angles: ["Supply-demand shift", "Industry chain transmission", "Fed policy expectation", "Capital flow", "Sector rotation", "Housing cycle"],
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
               "地震", "火山", "洪水", "山火", "疫情", "海啸", "瘟疫", "传染病"],
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
               "trump", "特朗普", "战争", "冲突", "制裁", "北约", "中国", "俄罗斯", "台湾", "中东", "贸易战", "中美", "关税", "地缘"],
    reasoning_angles: ["Defense spending", "Energy security", "Supply chain reshoring", "Safe haven flow", "Commodity disruption"],
  },
  market_event: {
    name: "Market Structure Event / 市场结构事件",
    keywords: ["VIX", "yield curve", "inversion", "credit spread", "liquidity", "margin call", "short squeeze", "gamma squeeze",
               "put/call ratio", "fund flow", "risk-off", "risk-on", "sell-off", "melt-up", "volatility", "bear market", "bull market", "correction",
               "bubble", "crowded", "overvalued", "overweight",
               "Treasury", "10Y", "2Y", "bond yield", "rate cut", "rate hike",
               "收益率", "倒挂", "信用利差", "流动性", "爆仓", "逼空", "波动率", "熊市", "牛市", "崩盘", "恐慌指数", "大跌", "大涨", "回调",
               "泡沫", "拥挤", "过热", "高估", "国债", "美债", "利率", "降息", "加息"],
    reasoning_angles: ["Regime shift", "Sector rotation", "Defensive vs cyclical", "Volatility arbitrage", "Credit contagion", "Institutional positioning"],
  },
  corporate_event: {
    name: "Corporate Event / 企业事件",
    keywords: ["earnings", "revenue", "guidance", "beat", "miss", "EPS", "merger", "acquisition", "M&A", "IPO", "buyback", "dividend",
               "CEO", "spinoff", "restructuring", "downgrade", "upgrade", "analyst", "target price",
               "财报", "营收", "业绩", "超预期", "不及预期", "并购", "收购", "上市", "回购", "分红", "拆分", "重组", "评级"],
    reasoning_angles: ["Earnings transmission", "Supply chain re-rating", "Sector sentiment", "Multiple expansion/compression", "M&A arbitrage", "Capital return"],
  },
  fx_commodity: {
    name: "FX & Commodity Cycle / 汇率与商品周期",
    keywords: ["dollar", "DXY", "yuan", "yen", "euro", "forex", "currency", "gold price", "oil price", "copper", "lithium", "rare earth",
               "iron ore", "wheat price", "commodity", "OPEC", "crude", "natural gas", "gold",
               "美元", "汇率", "人民币", "日元", "欧元", "黄金价格", "油价", "铜价", "锂价", "稀土", "铁矿石", "大宗商品", "暴跌", "暴涨", "黄金", "原油", "天然气"],
    reasoning_angles: ["Export/import winners", "Commodity cycle positioning", "Currency hedging", "Inflation transmission", "Resource nationalism"],
  },
} as const;

const SEASONAL_CONTEXT: Record<number, string> = {
  1: "Winter deep, post-New Year slowdown, CES, flu season peak, Q4 earnings, Fed policy expectations",
  2: "Late winter, Super Bowl, flu season tail, Valentine retail, earnings season dense",
  3: "Early spring, FOMC, allergy season start, Spring Break travel, tech launches",
  4: "Spring, Tax Day, Q1 earnings, planting season, Easter",
  5: "Late spring, Memorial Day, summer travel ramp, Sell in May debate",
  6: "Summer start, WWDC, FOMC, peak electricity demand, Pride Month",
  7: "Midsummer, July 4th, summer travel peak, Q2 earnings, hurricane season start",
  8: "Late summer, Back-to-School, Jackson Hole, hurricane peak",
  9: "Early fall, Labor Day, iPhone launch, FOMC, fall retail prep",
  10: "Fall, Q3 earnings, Halloween, election uncertainty (even years)",
  11: "Fall-winter, Thanksgiving+Black Friday+Cyber Monday, heating season start",
  12: "Winter, Holiday shopping peak, Christmas+New Year retail, Tax-Loss Harvesting, low liquidity",
};

const SHORT_EN_KEYWORDS = new Set(["ai", "ev", "5g", "vr", "ban", "hot", "flu"]);

function keywordMatch(inputLower: string, kw: string): boolean {
  const kwLower = kw.toLowerCase();
  if (/[\u4e00-\u9fff]/.test(kw)) {
    return inputLower.includes(kwLower);
  }
  if (kwLower.length <= 3 || SHORT_EN_KEYWORDS.has(kwLower)) {
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return regex.test(inputLower);
  }
  return inputLower.includes(kwLower);
}

function classifyEvent(input: string) {
  const inputLower = input.toLowerCase();
  const matches: Array<{ type: string; name: string; count: number; keywords: string[] }> = [];

  for (const [typeKey, typeInfo] of Object.entries(EVENT_TYPES)) {
    const matched = typeInfo.keywords.filter((kw) => keywordMatch(inputLower, kw));
    if (matched.length > 0) {
      matches.push({ type: typeKey, name: typeInfo.name, count: matched.length, keywords: matched });
    }
  }
  matches.sort((a, b) => b.count - a.count);

  if (matches.length === 0) {
    return { primary_type: "daily", secondary_types: [] as string[], matched_keywords: [] as string[] };
  }
  return {
    primary_type: matches[0].type,
    secondary_types: matches.slice(1).map((m) => m.type),
    matched_keywords: matches.flatMap((m) => m.keywords),
  };
}

// ======================================================================
// Section 2: Chain Templates (Enhanced v3)
// ======================================================================

interface ChainTemplate {
  name: string;
  pattern: string;
  disciplines: string[];
  typical_steps: number;
  triggers: string[];
  // v3 fields
  sector_hints: string[];
  ticker_seeds: { bullish: string[]; bearish: string[] };
  magnitude_range: string;
  consensus_level: "high" | "medium" | "low";
  revenue_materiality: "high" | "medium" | "low";
  seasonal_peak_months: number[];
  // v3.1 financial-event fields (optional — only for financial templates)
  time_horizon?: string;
  priced_in_risk?: string;
  key_question?: string;
}

const CHAIN_TEMPLATES: Record<string, ChainTemplate> = {
  symptom_to_pharma: {
    name: "Symptom → Pharma Supply Chain",
    pattern: "Body symptom → Disease classification → Affected population scale → Drug/treatment demand → Pharma company earnings",
    disciplines: ["Physiology", "Epidemiology", "Economics"],
    typical_steps: 4,
    triggers: ["打喷嚏", "咳嗽", "失眠", "头疼", "发烧", "sneeze", "cough", "flu", "sick"],
    sector_hints: ["Healthcare", "Pharma", "Diagnostics"],
    ticker_seeds: { bullish: ["QDEL", "ABT", "HOLX", "DGX"], bearish: ["MRNA"] },
    magnitude_range: "Big pharma: <1% EPS impact (flu drugs <5% revenue). Diagnostics: +5-15% quarterly revenue uplift in severe seasons",
    consensus_level: "high",
    revenue_materiality: "low",
    seasonal_peak_months: [1, 2, 10, 11, 12],
  },
  weather_to_energy: {
    name: "Weather → Energy / Commodities",
    pattern: "Weather change → Energy demand shift → Commodity supply-demand → Energy/chemical company margins",
    disciplines: ["Physics", "Meteorology", "Economics"],
    typical_steps: 4,
    triggers: ["降温", "高温", "暴雨", "干旱", "cold", "hot", "freeze", "heatwave"],
    sector_hints: ["Energy", "Utilities", "Midstream"],
    ticker_seeds: { bullish: ["UNG", "XLE", "ET", "WMB", "LNG"], bearish: ["DAL", "UAL", "DHI", "LEN"] },
    magnitude_range: "Nat gas: ±5-15% on 2-week cold/warm deviation. Energy stocks: +3-8% sector move. Midstream: +2-5% with volume leverage",
    consensus_level: "high",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 6, 7, 8, 12],
  },
  consumption_to_industry: {
    name: "Consumer Observation → Industry Trend",
    pattern: "Consumption pattern → Underlying driver → Industry growth/decline → Sector leaders",
    disciplines: ["Sociology", "Psychology", "Economics"],
    typical_steps: 4,
    triggers: ["咖啡", "外卖", "排队", "商场", "coffee", "delivery", "traffic"],
    sector_hints: ["Consumer Discretionary", "Consumer Staples", "Retail"],
    ticker_seeds: { bullish: ["SBUX", "MCD", "DASH", "AMZN"], bearish: ["SPG", "M"] },
    magnitude_range: "Individual names: ±3-8% on trend confirmation. Sector: ±1-3%",
    consensus_level: "low",
    revenue_materiality: "medium",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  emotion_to_capital: {
    name: "Social Sentiment → Capital Flow",
    pattern: "Social mood → Group behavior change → Spending/investment preference shift → Capital reallocation",
    disciplines: ["Psychology", "Behavioral Economics", "Finance"],
    typical_steps: 4,
    triggers: ["焦虑", "恐慌", "乐观", "躺平", "fear", "panic", "FOMO", "anxiety"],
    sector_hints: ["Safe Haven", "Gold", "Treasuries", "Defensive"],
    ticker_seeds: { bullish: ["GLD", "TLT", "XLU", "XLP"], bearish: ["QQQ", "ARKK", "XLY"] },
    magnitude_range: "VIX +5-15 points in panic; sector rotation ±3-8% over 1-4 weeks",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  policy_to_industry: {
    name: "Policy Signal → Industry Restructuring",
    pattern: "Policy direction → Market access change → Industry restructuring → Winners/losers",
    disciplines: ["Political Science", "Law", "Economics"],
    typical_steps: 4,
    triggers: ["禁令", "补贴", "碳中和", "ban", "subsidy", "regulation", "tariff", "executive order"],
    sector_hints: ["Varies by policy target"],
    ticker_seeds: { bullish: ["LMT", "RTX", "ICLN"], bearish: ["Depends on target"] },
    magnitude_range: "Direct beneficiaries: +5-15%. Impacted sectors: -3-10%. Timeline: weeks to quarters",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  tech_to_revolution: {
    name: "Tech Breakthrough → Industry Revolution",
    pattern: "Technology advance → Cost/efficiency shift → Industry landscape reshuffle → Valuation re-rating",
    disciplines: ["Engineering", "Physics", "Economics"],
    typical_steps: 5,
    triggers: ["AI", "电池", "芯片", "量子", "ChatGPT", "chip", "quantum"],
    sector_hints: ["Technology", "Semiconductors", "Software"],
    ticker_seeds: { bullish: ["NVDA", "AMD", "MSFT", "GOOGL", "SMH"], bearish: ["Legacy incumbents"] },
    magnitude_range: "Paradigm shift: leaders +50-200% over 12 months. Disrupted: -20-50%. Near-term: ±10-30%",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  disaster_to_supply: {
    name: "Disaster → Supply Chain → Substitute Demand",
    pattern: "Black swan event → Supply chain disruption → Substitute demand surge → Alternative supplier benefits",
    disciplines: ["Geography", "Logistics", "Economics"],
    typical_steps: 4,
    triggers: ["地震", "台风", "疫情", "贸易战", "earthquake", "pandemic", "trade war"],
    sector_hints: ["Industrials", "Alternative Suppliers", "Insurance"],
    ticker_seeds: { bullish: ["HD", "LOW", "CAT"], bearish: ["ALL", "TRV"] },
    magnitude_range: "Disrupted companies: -5-20%. Alternative suppliers: +5-15%. Insurance: -5-15% short-term, recovery in 6 months",
    consensus_level: "low",
    revenue_materiality: "high",
    seasonal_peak_months: [6, 7, 8, 9, 10],
  },
  health_to_wellness: {
    name: "Health Signal → Wellness Economy",
    pattern: "Body signal → Health awareness → Wellness spending intent → Health & wellness industry",
    disciplines: ["Physiology", "Psychology", "Consumer Economics"],
    typical_steps: 4,
    triggers: ["打喷嚏", "体检", "亚健康", "熬夜", "sneeze", "health check", "fatigue"],
    sector_hints: ["Wellness", "Fitness", "Health Foods", "Hygiene"],
    ticker_seeds: { bullish: ["KMB", "CLX", "PG", "PLNT"], bearish: [] },
    magnitude_range: "Wellness/hygiene stocks: +2-5% seasonal tailwind. Individual names: +3-8% on demand confirmation",
    consensus_level: "medium",
    revenue_materiality: "medium",
    seasonal_peak_months: [1, 2, 3, 10, 11, 12],
  },
  geopolitical_to_safehaven: {
    name: "Geopolitical Conflict → Safe Haven Assets",
    pattern: "Geopolitical event → Market panic (VIX↑) → Flight to safety → Gold/Treasuries/USD↑",
    disciplines: ["Geopolitics", "Psychology", "Finance"],
    typical_steps: 3,
    triggers: ["war", "conflict", "sanction", "missile", "NATO", "trump", "特朗普", "战争", "冲突", "制裁"],
    sector_hints: ["Safe Haven", "Defense", "Gold"],
    ticker_seeds: { bullish: ["GLD", "TLT", "LMT", "RTX"], bearish: ["QQQ", "EEM", "EFA"] },
    magnitude_range: "VIX +5-15pts. Gold +2-8%. Defense +5-15%. Equities -3-10%. Most revert within 2-4 weeks unless real supply disruption",
    consensus_level: "high",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  geopolitical_to_supply: {
    name: "Geopolitical Conflict → Supply Chain Disruption → Alt Suppliers",
    pattern: "Sanctions/conflict → Country supply cutoff → Commodity spike → Alternative supplier benefits",
    disciplines: ["Geopolitics", "Supply Chain", "Economics"],
    typical_steps: 4,
    triggers: ["tariff", "sanction", "embargo", "trade war", "China", "Russia", "关税", "封锁"],
    sector_hints: ["Energy", "Commodities", "Reshoring Beneficiaries"],
    ticker_seeds: { bullish: ["XOM", "COP", "AMAT", "LRCX"], bearish: ["AAPL", "NKE"] },
    magnitude_range: "Sanctioned commodity: +10-30%. Alt suppliers: +5-20%. Dependent companies: -5-15%",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  supply_chain_bottleneck: {
    name: "Supply Chain Bottleneck → Pricing Power → Margin Explosion",
    pattern: "Capacity constraint at one node → No substitutes → Extreme pricing power → Gross margin surge",
    disciplines: ["Supply Chain", "Engineering", "Economics"],
    typical_steps: 4,
    triggers: ["shortage", "bottleneck", "GPU", "chip", "缺货", "产能"],
    sector_hints: ["Semiconductors", "Equipment", "Materials"],
    ticker_seeds: { bullish: ["NVDA", "ASML", "AVGO", "TSMC"], bearish: ["Downstream consumers"] },
    magnitude_range: "Bottleneck owner: +20-50% over cycle. Downstream: margin compression -5-15%",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  event_to_fed_rotation: {
    name: "Economic Data → Fed Policy Expectation → Sector Rotation",
    pattern: "Economic data/event → Shifts Fed hike/cut expectations → Rate-sensitive sector rotation",
    disciplines: ["Economics", "Monetary Policy", "Finance"],
    typical_steps: 4,
    triggers: ["CPI", "inflation", "jobs", "unemployment", "Fed", "rate", "通胀", "就业", "利率"],
    sector_hints: ["Rate-Sensitive Sectors", "Growth vs Value"],
    ticker_seeds: { bullish: ["TLT", "QQQ", "XLRE"], bearish: ["KBE", "XLF"] },
    magnitude_range: "Sector rotation: ±3-8%. Bond move: ±2-5%. Rate-sensitive growth: ±5-12% on surprises",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 3, 5, 6, 7, 9, 11, 12],
  },
  second_order_hidden: {
    name: "First-Order → Second-Order Expectation Gap → Hidden Winners",
    pattern: "Obvious event → Consensus winner (already priced in) → Find hidden winners/losers",
    disciplines: ["Psychology", "Market Mechanics", "Second-Order Thinking"],
    typical_steps: 5,
    triggers: ["obvious", "everyone knows", "consensus", "price in", "所有人都知道"],
    sector_hints: ["Non-obvious beneficiaries"],
    ticker_seeds: { bullish: [], bearish: [] },
    magnitude_range: "Hidden winners often outperform consensus plays by 2-3x. Typical alpha: +5-20% over 1-3 months",
    consensus_level: "low",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  tech_pickaxe: {
    name: "Tech Paradigm → Pick-and-Shovel Play",
    pattern: "Tech explosion → Application demand surge → Infra bottleneck → Infra supplier benefits most",
    disciplines: ["Engineering", "Supply Chain", "Economics"],
    typical_steps: 5,
    triggers: ["AI", "ChatGPT", "data center", "cloud", "GPU", "算力", "数据中心"],
    sector_hints: ["Data Center Infra", "Power", "Cooling", "Networking"],
    ticker_seeds: { bullish: ["VST", "CEG", "VRT", "EQIX", "MU"], bearish: [] },
    magnitude_range: "Infra picks: +15-40% on cycle. Power/cooling: +10-25%. Risk: cycle peaks and capex overshoot",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  demographic_to_sector: {
    name: "Demographics → Sector Transformation",
    pattern: "Population trend → Demand structure shift → Industry rise/decline → Long-term investment direction",
    disciplines: ["Sociology", "Demography", "Economics"],
    typical_steps: 5,
    triggers: ["aging", "老龄化", "Gen Z", "millennial", "retirement", "birth rate"],
    sector_hints: ["Healthcare", "Senior Living", "Digital Consumption"],
    ticker_seeds: { bullish: ["UNH", "WELL", "AMZN", "RBLX"], bearish: [] },
    magnitude_range: "Decade-level trend: compounding 8-15% annual sector outperformance. NOT a short-term trade",
    consensus_level: "low",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  environment_to_greentech: {
    name: "Environmental Issue → Green Tech",
    pattern: "Environmental degradation → Policy tightening → Green investment increase → Clean tech companies",
    disciplines: ["Chemistry", "Environmental Science", "Economics"],
    typical_steps: 4,
    triggers: ["雾霾", "碳排放", "塑料", "pollution", "carbon", "wildfire", "山火"],
    sector_hints: ["Clean Energy", "Solar", "EV", "Carbon Capture"],
    ticker_seeds: { bullish: ["FSLR", "ENPH", "ICLN", "OXY"], bearish: ["XLE", "Coal"] },
    magnitude_range: "Clean energy on policy catalyst: +10-25%. On policy reversal: -10-20%",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  // ---- Financial-to-Financial Templates (v3.1) ----
  earnings_to_sector: {
    name: "Earnings Surprise → Sector Re-rating",
    pattern: "Bellwether earnings beat/miss → Read-through to sector peers → Multiple expansion/compression → Position in sympathy names",
    disciplines: ["Accounting", "Market Mechanics", "Sector Analysis"],
    typical_steps: 4,
    triggers: ["earnings", "EPS", "beat", "miss", "guidance", "revenue", "财报", "超预期", "不及预期", "营收", "业绩"],
    sector_hints: ["Same sector as reporting company", "Supply chain adjacents"],
    ticker_seeds: { bullish: [], bearish: [] },
    magnitude_range: "Reporting company: ±5-15% on surprise. Sympathy names: ±2-8%. Supply chain: ±1-5%. Effect decays within 2-5 trading days",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 4, 5, 7, 8, 10, 11],
    time_horizon: "0-5 trading days for sympathy moves; 60+ days for post-earnings drift (PEAD)",
    priced_in_risk: "HIGH if bellwether was widely expected to beat — check whisper numbers vs actual. Priced-in beats often trigger 'sell the news.'",
    key_question: "Is this a genuine demand signal for the entire sector, or company-specific execution? What does guidance revision say about the INDUSTRY outlook?",
  },
  yield_curve_to_playbook: {
    name: "Yield Curve Signal → Macro Playbook",
    pattern: "Yield curve shape change → Recession/expansion probability shift → Historical sector rotation playbook → Position accordingly",
    disciplines: ["Fixed Income", "Macro Economics", "Market History"],
    typical_steps: 4,
    triggers: ["yield curve", "inversion", "steepening", "2s10s", "10Y", "Treasury", "收益率", "倒挂", "国债", "美债"],
    sector_hints: ["Financials", "Utilities", "Staples", "Tech", "Cyclicals"],
    ticker_seeds: { bullish: ["XLU", "XLP", "TLT", "GLD"], bearish: ["KBE", "KRE", "XLF", "XLI"] },
    magnitude_range: "Post-inversion 12mo: financials -10-20%, utilities +5-15%, staples +3-10%. Recession probability: 60-80% within 12-18 months historically",
    consensus_level: "high",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    time_horizon: "Immediate rotation (0-5 days); recession signal lead time 6-24 months (median ~14 months)",
    priced_in_risk: "MEDIUM — inversion is widely tracked, but timing is imprecise. The steepening AFTER inversion (Fed starts cutting) is less watched and more actionable.",
    key_question: "Is this the initial inversion, or re-steepening from inverted (the real recession alarm)? Does the Fed pivot soon (2019 playbook: SPY +29% despite inversion)?",
  },
  credit_to_contagion: {
    name: "Credit Event → Contagion Mapping",
    pattern: "Credit stress signal → Identify counterparty exposure → Map contagion channels → Find safe havens and shorts",
    disciplines: ["Credit Analysis", "Banking", "Systemic Risk"],
    typical_steps: 5,
    triggers: ["credit spread", "default", "CDS", "liquidity crisis", "bank run", "SVB", "margin call", "信用利差", "违约", "流动性", "爆仓", "暴雷"],
    sector_hints: ["Banks", "REITs", "High-Yield Issuers", "Safe Haven"],
    ticker_seeds: { bullish: ["GLD", "TLT", "BRK.B"], bearish: ["KRE", "IYR", "HYG", "JNK"] },
    magnitude_range: "Distressed entity: -30-80%. Sector contagion: -10-25%. Safe havens: +5-15%. Recovery names (post-panic): +20-50% over 3-6 months",
    consensus_level: "low",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    time_horizon: "Acute phase: 1-2 weeks. Contagion spread: 1-3 months. Recovery trades: 3-6 months post-panic",
    priced_in_risk: "LOW — credit events are surprises by nature. But first-order short targets (e.g., regional banks) may become crowded shorts quickly.",
    key_question: "Is this idiosyncratic (one company) or systemic (sector-wide)? How wide is counterparty exposure? Is the Fed likely to backstop?",
  },
  fx_to_trade: {
    name: "FX/Commodity Shift → Trade Winners & Losers",
    pattern: "Currency or commodity price move → Export/import margin impact → Identify winners (weak-currency exporters) and losers (commodity importers)",
    disciplines: ["International Trade", "FX Analysis", "Economics"],
    typical_steps: 4,
    triggers: ["dollar", "DXY", "yuan", "yen", "euro", "gold", "oil", "copper", "美元", "汇率", "人民币", "日元", "黄金", "油价", "铜"],
    sector_hints: ["Multinationals", "Exporters", "Commodity Producers", "Importers"],
    ticker_seeds: { bullish: ["XOM", "NEM", "FCX", "CAT"], bearish: ["WMT", "TGT", "NKE"] },
    magnitude_range: "Strong dollar +5%: S&P 500 EPS drag ~2-3%. EM exporters: ±5-15%. Gold miners: 2-3x gold % move. Oil majors: 0.6-0.8x oil % move",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    time_horizon: "FX moves take 1-2 quarters to flow through earnings (hedging lag). Commodity moves hit immediately for unhedged producers.",
    priced_in_risk: "MEDIUM — directional moves are tracked, but EPS impact magnitude usually surprises. FX hedging lags 1-2 quarters.",
    key_question: "Is the FX/commodity move driven by rates (temporary, mean-reverting) or structural shift (persistent)? Who is hedged and who is exposed?",
  },
  housing_to_cycle: {
    name: "Housing Signal → Economic Cycle Positioning",
    pattern: "Housing data inflection → Leading indicator for broader economy → Position in housing-sensitive and cycle-sensitive names",
    disciplines: ["Real Estate", "Macro Economics", "Consumer Finance"],
    typical_steps: 4,
    triggers: ["housing", "mortgage", "home sales", "NAHB", "housing starts", "rent", "房价", "房贷", "房地产", "租金"],
    sector_hints: ["Homebuilders", "Building Materials", "Mortgage Lenders", "Home Improvement"],
    ticker_seeds: { bullish: ["DHI", "LEN", "HD", "LOW", "SHW"], bearish: ["AGNC", "NLY"] },
    magnitude_range: "Homebuilders: ±10-25% on cycle turns. Building materials: ±5-15%. Mortgage REITs: ±10-20%. Cycle confirmation takes 2-3 months of data",
    consensus_level: "medium",
    revenue_materiality: "high",
    seasonal_peak_months: [3, 4, 5, 6, 9, 10],
    time_horizon: "Leading indicator: 2-3 months of consistent data needed for cycle confirmation. Homebuilder stocks often front-run data by 3-6 months.",
    priced_in_risk: "LOW to MEDIUM — housing data is released with lag. Market often under-reacts to inflection points initially.",
    key_question: "Is this a cyclical inflection (rates driving) or a one-month data anomaly? What does mortgage rate trajectory suggest for sustained demand?",
  },
  narrative_to_crowding: {
    name: "Crowded Narrative → Contrarian Opportunity",
    pattern: "Dominant market narrative → Position crowding indicator → Identify reversal risk → Contrarian plays",
    disciplines: ["Behavioral Finance", "Market Microstructure", "Sentiment Analysis"],
    typical_steps: 4,
    triggers: ["everyone", "crowded", "bubble", "FOMO", "overvalued", "overweight", "所有人都", "泡沫", "拥挤", "过热"],
    sector_hints: ["Contrarian to crowded sector", "Unloved value sectors"],
    ticker_seeds: { bullish: [], bearish: [] },
    magnitude_range: "Crowding unwind: consensus names -10-25% in 1-3 months. Contrarian rotation: +8-20%. Timing is key — need catalyst",
    consensus_level: "low",
    revenue_materiality: "high",
    seasonal_peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    time_horizon: "Crowding unwinds in 1-3 months when catalyst triggers. Timing is the hardest part — can be early for weeks.",
    priced_in_risk: "By definition HIGH — the crowded narrative IS the priced-in trade. The opportunity is the REVERSAL.",
    key_question: "What catalyst could trigger the unwind? How crowded is positioning (short interest, fund flows, options skew)?",
  },
};

function matchTemplates(eventType: string, keywords: string[]): string[] {
  const matched: string[] = [];
  const inputJoined = keywords.join(" ").toLowerCase();

  for (const [key, tpl] of Object.entries(CHAIN_TEMPLATES)) {
    if (key === "second_order_hidden") continue;
    const hit = tpl.triggers.some((t) => keywordMatch(inputJoined, t));
    if (hit) matched.push(key);
  }

  if (matched.length === 0) {
    const fallback: Record<string, string[]> = {
      physiological: ["symptom_to_pharma", "health_to_wellness"],
      weather: ["weather_to_energy", "consumption_to_industry", "event_to_fed_rotation"],
      economic: ["event_to_fed_rotation", "consumption_to_industry", "emotion_to_capital"],
      social: ["emotion_to_capital", "demographic_to_sector", "consumption_to_industry"],
      technology: ["tech_to_revolution", "tech_pickaxe", "supply_chain_bottleneck"],
      policy: ["policy_to_industry", "event_to_fed_rotation", "geopolitical_to_supply"],
      nature: ["disaster_to_supply", "weather_to_energy", "geopolitical_to_safehaven"],
      daily: ["consumption_to_industry", "emotion_to_capital"],
      geopolitical: ["geopolitical_to_safehaven", "geopolitical_to_supply", "supply_chain_bottleneck"],
      market_event: ["yield_curve_to_playbook", "credit_to_contagion", "emotion_to_capital", "event_to_fed_rotation"],
      corporate_event: ["earnings_to_sector", "narrative_to_crowding", "supply_chain_bottleneck"],
      fx_commodity: ["fx_to_trade", "event_to_fed_rotation", "geopolitical_to_supply"],
    };
    matched.push(...(fallback[eventType] || ["consumption_to_industry"]));
  }

  return [...new Set(matched)].slice(0, 5);
}

// ======================================================================
// Section 2.5: Complexity, Chain Scoring, Event Interaction
// ======================================================================

const CONSENSUS_EVENT_TYPES = new Set(["weather", "geopolitical", "economic", "technology", "policy", "market_event", "corporate_event", "fx_commodity"]);

function assessComplexity(
  secondaryCount: number,
  templateCount: number
): "light" | "medium" | "heavy" {
  const typeCount = 1 + secondaryCount;
  if (typeCount >= 3 || templateCount >= 4) return "heavy";
  if (typeCount >= 2 || templateCount >= 3) return "medium";
  return "light";
}

function shouldIncludeSecondOrder(
  primaryType: string,
  secondaryTypes: string[],
  complexity: "light" | "medium" | "heavy"
): boolean {
  if (complexity === "light") return false;
  return CONSENSUS_EVENT_TYPES.has(primaryType) || secondaryTypes.some(t => CONSENSUS_EVENT_TYPES.has(t));
}

// --- Chain Pre-Score ---

interface ScoreBreakdown {
  base: number;
  historical_match: number;
  seasonal_alignment: number;
  multi_discipline: number;
  keyword_density: number;
  chain_length_penalty: number;
  consensus_penalty: number;
  revenue_materiality_adj: number;
  interaction_bonus: number;
  total: number;
  rating: "STRONG" | "MODERATE" | "WEAK";
  flags: string[];
}

function computeChainScore(
  templateKey: string,
  template: ChainTemplate,
  histMatches: Array<{ case_data: HistCase; score: number }>,
  currentMonth: number,
  matchedKeywordCount: number,
  interactionMultiplier: number,
): ScoreBreakdown {
  const flags: string[] = [];
  let base = 50;

  // Historical match bonus
  let historical_match = 0;
  if (histMatches.length > 0) {
    const bestScore = histMatches[0].score;
    if (bestScore >= 10) { historical_match = 15; }
    else if (bestScore >= 5) { historical_match = 8; }
    else { historical_match = 3; }
  }

  // Seasonal alignment
  let seasonal_alignment = 0;
  if (template.seasonal_peak_months.includes(currentMonth)) {
    seasonal_alignment = 15;
  } else {
    // Check adjacent months
    const adjacent = template.seasonal_peak_months.some(
      m => Math.abs(m - currentMonth) === 1 || Math.abs(m - currentMonth) === 11
    );
    if (adjacent) seasonal_alignment = 5;
  }

  // Multi-discipline bonus
  const multi_discipline = Math.min((template.disciplines.length - 2) * 5, 10);

  // Keyword density
  const keyword_density = Math.min(matchedKeywordCount * 5, 15);

  // Chain length penalty
  const chain_length_penalty = template.typical_steps > 4 ? -(template.typical_steps - 4) * 8 : 0;

  // Consensus penalty
  let consensus_penalty = 0;
  if (template.consensus_level === "high") {
    consensus_penalty = -20;
    flags.push("HIGH CONSENSUS — this conclusion can be Googled in 10 seconds. Find a non-obvious angle or note it as consensus.");
  } else if (template.consensus_level === "medium") {
    consensus_penalty = -8;
  }

  // Revenue materiality
  let revenue_materiality_adj = 0;
  if (template.revenue_materiality === "low") {
    revenue_materiality_adj = -15;
    flags.push("LOW REVENUE MATERIALITY — the event barely moves the needle on target companies' earnings. Pivot to higher-elasticity targets.");
  } else if (template.revenue_materiality === "high") {
    revenue_materiality_adj = 5;
  }

  // Interaction bonus (from event interaction matrix)
  const interaction_bonus = Math.round((interactionMultiplier - 1.0) * 20);

  const rawTotal = base + historical_match + seasonal_alignment + multi_discipline
    + keyword_density + chain_length_penalty + consensus_penalty
    + revenue_materiality_adj + interaction_bonus;

  const total = Math.max(10, Math.min(95, rawTotal)); // clamp to 10-95

  let rating: "STRONG" | "MODERATE" | "WEAK";
  if (total >= 65) rating = "STRONG";
  else if (total >= 45) rating = "MODERATE";
  else rating = "WEAK";

  if (rating === "WEAK") {
    flags.push("Consider deprioritizing this chain or mentioning it only to debunk the obvious.");
  }

  return {
    base, historical_match, seasonal_alignment, multi_discipline,
    keyword_density, chain_length_penalty, consensus_penalty,
    revenue_materiality_adj, interaction_bonus, total, rating, flags,
  };
}

// --- Event Interaction Matrix ---

interface InteractionEffect {
  effect: "compounding" | "amplifying" | "dampening" | "pivotal" | "accelerating";
  description: string;
  multiplier: number;
}

const INTERACTION_MATRIX: Record<string, InteractionEffect> = {
  "weather+geopolitical":       { effect: "compounding",   description: "Energy double-hit: demand shock + supply risk simultaneously", multiplier: 1.5 },
  "weather+physiological":      { effect: "amplifying",    description: "Cold weather + health symptoms = flu season acceleration, public health narrative", multiplier: 1.3 },
  "weather+economic":           { effect: "compounding",   description: "Weather disruption + economic weakness = amplified consumer/business stress", multiplier: 1.3 },
  "physiological+social":       { effect: "amplifying",    description: "Individual health + widespread phenomenon = public health narrative, behavioral shift at scale", multiplier: 1.3 },
  "technology+policy":          { effect: "pivotal",       description: "Tech progress meets regulation = direction can flip. High uncertainty, high impact", multiplier: 1.2 },
  "technology+geopolitical":    { effect: "compounding",   description: "Tech competition + geopolitical tension = supply chain decoupling risk", multiplier: 1.4 },
  "economic+geopolitical":      { effect: "compounding",   description: "Economic weakness + geopolitical shock = stagflation risk, maximum uncertainty", multiplier: 1.4 },
  "economic+social":            { effect: "amplifying",    description: "Economic signal + social trend = consumer behavior structural shift", multiplier: 1.2 },
  "social+technology":          { effect: "accelerating",  description: "Social adoption accelerates tech cycle — viral adoption curves", multiplier: 1.2 },
  "geopolitical+policy":        { effect: "compounding",   description: "Geopolitical conflict + policy response = sanctions/tariffs cascade", multiplier: 1.3 },
  "weather+nature":             { effect: "amplifying",    description: "Weather extreme + natural disaster = insurance/rebuilding demand surge", multiplier: 1.4 },
  "physiological+economic":     { effect: "amplifying",    description: "Health crisis + economic impact = healthcare spending + macro concern", multiplier: 1.2 },
  // v3.1: Financial-to-financial interactions
  "market_event+corporate_event": { effect: "amplifying",  description: "Market regime shift + earnings catalyst = amplified stock reaction (e.g., earnings miss during risk-off = 2x downside)", multiplier: 1.4 },
  "market_event+economic":        { effect: "compounding", description: "Market structure signal + macro data = conviction multiplier for rate/sector bets", multiplier: 1.4 },
  "market_event+geopolitical":    { effect: "compounding", description: "Market stress + geopolitical shock = liquidity crisis risk, safe-haven surge", multiplier: 1.5 },
  "corporate_event+technology":   { effect: "amplifying",  description: "Tech bellwether earnings + sector momentum = read-through amplification", multiplier: 1.3 },
  "corporate_event+economic":     { effect: "amplifying",  description: "Corporate signal + macro backdrop = stronger sector rotation signal", multiplier: 1.3 },
  "fx_commodity+geopolitical":    { effect: "compounding", description: "Commodity supply risk + geopolitical escalation = price spike and volatility surge", multiplier: 1.5 },
  "fx_commodity+economic":        { effect: "compounding", description: "FX/commodity shift + macro cycle = trade balance and inflation transmission", multiplier: 1.3 },
  "fx_commodity+weather":         { effect: "amplifying",  description: "Weather disruption + commodity cycle = agricultural and energy price amplification", multiplier: 1.4 },
  "market_event+fx_commodity":    { effect: "compounding", description: "Market regime + commodity cycle = macro positioning signal (e.g., risk-off + gold rally)", multiplier: 1.3 },
  "corporate_event+policy":       { effect: "pivotal",     description: "Corporate action + regulatory response = outcome highly uncertain, binary risk", multiplier: 1.2 },
};

function getInteractionEffect(types: string[]): { effect: InteractionEffect | null; key: string } {
  if (types.length < 2) return { effect: null, key: "" };

  // Try all pairs
  for (let i = 0; i < types.length; i++) {
    for (let j = i + 1; j < types.length; j++) {
      const key1 = `${types[i]}+${types[j]}`;
      const key2 = `${types[j]}+${types[i]}`;
      if (INTERACTION_MATRIX[key1]) return { effect: INTERACTION_MATRIX[key1], key: key1 };
      if (INTERACTION_MATRIX[key2]) return { effect: INTERACTION_MATRIX[key2], key: key2 };
    }
  }
  return { effect: null, key: "" };
}

// ======================================================================
// Section 3: Historical Cases (Enhanced Matching v3)
// ======================================================================

interface HistCase {
  id: string; title: string; year: number; trigger: string;
  chain_summary: string; steps: string[]; disciplines: string[];
  outcome: string; tickers: string[]; sector: string;
  magnitude: string; time_to_impact: string; lesson: string; tags: string[];
}

const CASES: HistCase[] = [
  { id: "covid-2020", title: "COVID-19: A Pneumonia Outbreak Triggers a Global Market Tsunami", year: 2020, trigger: "Unknown pneumonia cases emerge in Wuhan",
    chain_summary: "Local outbreak → global pandemic → lockdowns → market crash → Fed easing → tech mega-rally", steps: ["Unknown pneumonia (Epidemiology)","Human-to-human transmission → global spread","Lockdowns → economic shutdown","S&P500 drops 34% (panic)","Fed zero rates + unlimited QE","WFH explosion → Zoom/AMZN surge","mRNA vaccines → MRNA/BNTX rally"],
    disciplines: ["Epidemiology","Psychology","Monetary Economics"], outcome: "SPY 339→218→373; MRNA 19→157", tickers: ["SPY","MRNA","ZM","AMZN","PFE"], sector: "pharma,tech", magnitude: "extreme", time_to_impact: "2-4 week crash, 6-12 month recovery", lesson: "In extreme events, find the crisis beneficiaries", tags: ["pandemic","flu","virus","sneeze","cough","health","lockdown","Fed","疫情","新冠","肺炎","封锁","感冒","咳嗽","打喷嚏","病毒","口罩","居家","生病"] },
  { id: "texas-freeze-2021", title: "Texas Deep Freeze: Ice Storm Triggers Energy Crisis", year: 2021, trigger: "Texas hit by rare polar vortex",
    chain_summary: "Extreme cold → heating demand surge → grid collapse → nat gas spike → energy stocks rally", steps: ["Polar vortex pushes to -18°C (Meteorology)","Heating demand surges 400%","Wind turbines freeze + pipeline blockage (Engineering)","ERCOT grid collapse, 4.3M without power","Nat gas spot hits $400/MMBtu","Energy stocks surge"],
    disciplines: ["Meteorology","Physics","Engineering","Economics"], outcome: "UNG +12% in one week; OXY +15%", tickers: ["UNG","OXY","XOM","LNG"], sector: "energy", magnitude: "large", time_to_impact: "Immediate to 2 weeks", lesson: "Extreme weather impacts energy immediately and violently", tags: ["cold","freeze","snow","weather","energy","gas","heating","power grid","寒潮","降温","极寒","暴雪","冰冻","天然气","能源","停电","冷","暴风雪","寒流"] },
  { id: "hurricane-katrina-2005", title: "Hurricane Katrina: From Storm to Oil Price Spike", year: 2005, trigger: "Category 5 hurricane makes landfall in Gulf Coast",
    chain_summary: "Hurricane → oil platform shutdown → gasoline shortage → oil price surge", steps: ["Cat 5 hurricane (Meteorology)","95% Gulf of Mexico production shut in","Refineries damaged","Gasoline $3+/gallon","Crude $70+/barrel","Massive insurance payouts"],
    disciplines: ["Meteorology","Engineering","Economics"], outcome: "WTI $60→$70+; HD/LOW benefit from rebuilding", tickers: ["USO","XLE","HD","LOW","ALL"], sector: "energy,industrials", magnitude: "large", time_to_impact: "Immediate to months", lesson: "Hurricane season: watch Gulf capacity + post-disaster rebuilding plays", tags: ["hurricane","storm","flood","oil","energy","insurance","rebuild","飓风","暴风","洪水","石油","能源","保险","重建","台风","暴雨"] },
  { id: "russia-ukraine-2022", title: "Russia-Ukraine War: Reshaping the Global Energy Map", year: 2022, trigger: "Russia invades Ukraine",
    chain_summary: "War → sanctions → energy crisis → inflation → rate hikes → growth stocks crash", steps: ["Full-scale Russian invasion (Geopolitics)","Western comprehensive sanctions","Russia cuts gas to Europe → energy crisis","Oil $120+","CPI 9.1%","Fed hikes to 5.25%+","NASDAQ down 33%"],
    disciplines: ["Geopolitics","Economics","Monetary Policy"], outcome: "XLE +65%; LMT +37%; QQQ -33%", tickers: ["XLE","LMT","RTX","GLD","QQQ"], sector: "energy,defense", magnitude: "extreme", time_to_impact: "Immediate to 1-2 years", lesson: "Geopolitical shock: Wave 1 safe-haven, Wave 2 supply chain, Wave 3 inflation→hikes", tags: ["war","conflict","Russia","oil","gas","inflation","Fed","defense","sanction","俄乌","战争","冲突","制裁","石油","天然气","通胀","加息","国防","地缘"] },
  { id: "trade-war-2018", title: "US-China Trade War: Tariff Shadows Over Tech Decoupling", year: 2018, trigger: "US imposes tariffs on Chinese goods",
    chain_summary: "Tariffs → supply chain uncertainty → tech under pressure → flight to safety", steps: ["25% tariffs on $250B goods","China retaliates","PMI declines","Semiconductor/Apple threatened","VIX surges","Safe-haven flows into Treasuries"],
    disciplines: ["International Trade","Supply Chain","Psychology"], outcome: "SPY Q4 -20%; AAPL -39%; SMH -25%", tickers: ["SPY","AAPL","SMH","TLT","GLD"], sector: "tech,macro", magnitude: "large", time_to_impact: "Immediate to months", lesson: "Tariffs punish globalization winners, accelerate supply chain diversification", tags: ["tariff","trade war","China","supply chain","semiconductor","trump","特朗普","贸易战","关税","中美","中国","供应链","半导体","芯片"] },
  { id: "fed-pivot-2023", title: "Fed Pivot: One Sentence Ignites a Bull Market", year: 2023, trigger: "Fed signals potential 2024 rate cuts",
    chain_summary: "Fed dovish → rates peak → growth stock re-rating → Mag7 rally", steps: ["Powell signals end of hikes","10Y drops from 5% to 3.8%","DCF discount rate↓ → growth stocks↑","AI narrative + Mag7 mega-rally"],
    disciplines: ["Monetary Policy","Finance","Psychology"], outcome: "QQQ +54%; NVDA +239%", tickers: ["QQQ","NVDA","META","TLT"], sector: "tech,macro", magnitude: "large", time_to_impact: "Days to ignite, months to play out", lesson: "Don't fight the Fed — rate direction determines growth vs value", tags: ["Fed","rate","pivot","dovish","growth","tech","bond","美联储","降息","利率","鸽派","科技股","成长股","债券"] },
  { id: "chatgpt-2022", title: "ChatGPT Launch: AI Goes From Paper to Mass Adoption", year: 2022, trigger: "OpenAI launches ChatGPT — 100M users in 2 months",
    chain_summary: "ChatGPT → AI arms race → GPU shortage → NVDA supercycle", steps: ["ChatGPT launch, mass adoption","Corporate AI compute arms race","NVIDIA GPUs sell out","NVDA revenue doubles","AI infrastructure sector follows"],
    disciplines: ["Computer Science","Economics","Supply Chain"], outcome: "NVDA +240%; MSFT +57%; META +194%", tickers: ["NVDA","MSFT","META","AMD","SMH"], sector: "tech", magnitude: "extreme", time_to_impact: "1-3 months narrative, 6-12 months earnings delivery", lesson: "Paradigm-level tech breakthroughs benefit pick-and-shovel (infra) players most", tags: ["AI","ChatGPT","GPU","semiconductor","NVIDIA","data center","人工智能","芯片","算力","数据中心","英伟达","半导体"] },
  { id: "gme-2021", title: "GameStop Short Squeeze: Retail vs Wall Street", year: 2021, trigger: "Reddit WallStreetBets collectively buys GME",
    chain_summary: "Social media → retail herd buying → short squeeze → GME 100x", steps: ["DFV posts analysis on Reddit","Melvin Capital 140% short","Retail piles in, short squeeze","GME $4→$483","Robinhood restricts buying","SEC intervenes"],
    disciplines: ["Behavioral Finance","Media Studies","Game Theory"], outcome: "GME $4→$483; AMC $2→$72", tickers: ["GME","AMC","HOOD"], sector: "consumer,financials", magnitude: "large", time_to_impact: "1-2 weeks of extreme volatility", lesson: "Social media era: retail collective action is now a market force", tags: ["meme","Reddit","short squeeze","retail","social media","GameStop","散户","逼空","社交媒体","投机"] },
  { id: "fed-hike-2022", title: "2022 Rate Hike Cycle: Fastest in 40 Years Kills Valuations", year: 2022, trigger: "CPI hits 9.1%, Fed hikes aggressively",
    chain_summary: "Inflation out of control → aggressive hikes → growth stocks crash → value/energy outperform", steps: ["Post-COVID demand + supply bottleneck → CPI 9.1%","Fed hikes from 0% to 5.25%","10Y surges from 1.5% to 4.2%","ARKK -67%","Value/energy outperform"],
    disciplines: ["Monetary Policy","Macroeconomics","Finance"], outcome: "ARKK -67%; QQQ -33%; XLE +65%", tickers: ["ARKK","QQQ","XLE","TLT"], sector: "tech,energy,macro", magnitude: "extreme", time_to_impact: "Full year", lesson: "Interest rates are the anchor for all asset pricing", tags: ["Fed","rate hike","inflation","CPI","growth","value","rotation","美联储","加息","通胀","通货膨胀","利率","涨价","物价"] },
  { id: "btc-etf-2024", title: "Bitcoin ETF Approval: Crypto Goes Mainstream", year: 2024, trigger: "SEC approves first spot Bitcoin ETFs",
    chain_summary: "ETF approval → institutional inflow → BTC breaks $70K → miners/exchanges rally", steps: ["SEC approves 11 spot BTC ETFs","IBIT attracts $4B+ in first month","BTC rallies from $42K to $73K","MARA/RIOT mining stocks surge","COIN trading volume spikes"],
    disciplines: ["Financial Regulation","Economics","Finance"], outcome: "BTC $42K→$73K; MARA +120%; COIN +60%", tickers: ["IBIT","COIN","MARA","MSTR"], sector: "financials,tech", magnitude: "large", time_to_impact: "Immediate to 3-6 months", lesson: "When regulation shifts from headwind to tailwind — strongest buy signal", tags: ["bitcoin","crypto","ETF","SEC","regulation","mining","比特币","加密货币","监管","数字货币"] },
  { id: "ozempic-2023", title: "GLP-1 Weight Loss Drugs: Supply Chain Earthquake", year: 2023, trigger: "Ozempic/Wegovy weight loss efficacy goes viral",
    chain_summary: "Weight loss drugs explode → LLY/NVO surge → snack/medtech expectations cut", steps: ["GLP-1 achieves 15-20% weight reduction (Pharmacology)","Social media + celebrity effect → mass demand","LLY/NVO market cap surges","Weight loss → snack demand↓","Gastric bypass/sleep apnea device demand↓","WMT confirms basket composition changes"],
    disciplines: ["Pharmacology","Psychology","Consumer Behavior"], outcome: "LLY $330→$800+; DXCM -40%", tickers: ["LLY","NVO","MDLZ","DXCM"], sector: "pharma,consumer", magnitude: "large", time_to_impact: "3-6 months narrative, 12-24 months transmission", lesson: "Disruptive therapy reshapes entire consumer chain — find second-order impacts", tags: ["drug","obesity","weight loss","GLP-1","health","food","pharma","减肥","减肥药","肥胖","健康","医药","零食"] },
  { id: "suez-2021", title: "Ever Given Stuck: One Ship Blocks Global Trade", year: 2021, trigger: "Container ship runs aground in Suez Canal",
    chain_summary: "Canal blocked → shipping halted → freight rates spike → inflation pressure", steps: ["400m vessel lodges sideways","$9.6B/day of trade blocked","Container freight rates surge","European imports delayed","Inflation expectations rise"],
    disciplines: ["Physics","Economics","Logistics"], outcome: "ZIM/MATX rally; oil prices short-term rise", tickers: ["ZIM","MATX","USO"], sector: "industrials,energy", magnitude: "medium", time_to_impact: "Immediate to months", lesson: "Trade chokepoint disruption → shipping stocks surge → inflation transmission", tags: ["supply chain","shipping","logistics","trade","inflation","供应链","航运","物流","运费","运河","通胀","堵塞"] },
  { id: "svb-2023", title: "SVB Collapse: 48-Hour Bank Run", year: 2023, trigger: "SVB announces $1.8B bond loss sale",
    chain_summary: "SVB losses → social media spreads → bank run → collapse → regional bank panic", steps: ["SVB underwater on long-dated Treasuries (Finance)","Social media goes viral (Media)","$42B withdrawn in single day","FDIC takeover","Panic spreads → First Republic falls","KRE drops 30%","Flight to safety → JPM gains"],
    disciplines: ["Finance","Psychology","Media Studies"], outcome: "KRE -30%; JPM gains; GLD +10%", tickers: ["KRE","JPM","GLD","TLT"], sector: "financials,safe_haven", magnitude: "large", time_to_impact: "Immediate to months", lesson: "Social media era bank runs are 100x faster — distinguish flyers from fortresses", tags: ["bank","crisis","panic","fear","deposit","regional bank","safe haven","银行","危机","挤兑","恐慌","存款","倒闭"] },
  { id: "drought-2012", title: "2012 US Mega-Drought: Corn Belt Turns to Dust Bowl", year: 2012, trigger: "Worst Midwest drought in 50 years",
    chain_summary: "Drought → corn/soy crop failure → ag commodities spike → feed costs↑ → meat price inflation", steps: ["Extreme drought (Meteorology)","USDA slashes production estimates","Corn rallies from $5 to $8.3","Feed costs surge","Meat prices rise → food CPI","Fertilizer/equipment demand rises next year"],
    disciplines: ["Meteorology","Agriculture","Economics"], outcome: "CORN +27%; SOYB +20%; ADM rallies", tickers: ["CORN","SOYB","WEAT","ADM","MOS","DE"], sector: "agriculture,materials", magnitude: "large", time_to_impact: "Immediate to 6+ months", lesson: "US is the world's breadbasket — Midwest weather directly impacts global grain prices", tags: ["drought","crop","corn","agriculture","food","weather","hot","heat","干旱","旱灾","农业","粮食","高温","天气","热","酷暑"] },
  { id: "oil-price-war-2020", title: "OPEC+ Price War: Crude Oil Goes Negative", year: 2020, trigger: "Saudi-Russia production cut talks collapse",
    chain_summary: "Output deal collapses → Saudi floods market → COVID demand crash → oil goes negative → energy sector restructuring", steps: ["OPEC+ talks break down (Geopolitics)","Saudi ramps to 12M bpd","COVID demand collapse compounds","WTI hits -$37/barrel (unprecedented)","Shale bankruptcies","Survivors consolidate capacity"],
    disciplines: ["Geopolitics","Economics","Supply Chain"], outcome: "WTI $60→-$37; XLE -50%; USO structural losses", tickers: ["USO","XLE","XOM","COP","OXY"], sector: "energy", magnitude: "extreme", time_to_impact: "Immediate to 1 year", lesson: "Supply war + demand crash = unprecedented; negative oil proves storage is a physical constraint", tags: ["oil","OPEC","Saudi","price war","energy","crude","负油价","石油","原油","能源","油价","暴跌","OPEC"] },
  // v3.1: Financial-event-to-financial-event cases
  { id: "yield-inversion-2019", title: "2019 Yield Curve Inversion: Recession Alarm Rings", year: 2019, trigger: "2Y-10Y Treasury yield curve inverts",
    chain_summary: "Yield curve inverts → recession fear → banks sell off → utilities/staples outperform → Fed cuts", steps: ["2Y-10Y spread goes negative (-5bp)","Media amplifies recession narrative","KBE/KRE drop 10-15%","Utilities XLU hits all-time highs","Fed cuts 3 times in H2 2019","Equities actually rally by year-end"],
    disciplines: ["Fixed Income","Macro Economics","Market History"], outcome: "XLU +25%; KBE -8%; SPY +29% (despite inversion)", tickers: ["XLU","XLP","KBE","KRE","TLT","GLD"], sector: "financials,utilities,macro", magnitude: "large", time_to_impact: "Immediate fear, 12-18 month recession lag", lesson: "Inversion signals recession eventually, but timing is imprecise — sector rotation starts immediately even if recession takes 18 months", tags: ["yield curve","inversion","recession","Treasury","bond","rates","Fed","bank","utilities","收益率","倒挂","衰退","国债","美债","利率","银行","美联储"] },
  { id: "nvda-earnings-q3-2024", title: "NVDA Q3 FY25 Earnings: AI Bellwether Beats Again", year: 2024, trigger: "NVIDIA reports Q3 revenue $35.1B, beating $33.2B consensus",
    chain_summary: "NVDA beats → data center capex thesis confirmed → AI supply chain re-rated → power/cooling plays surge", steps: ["NVDA revenue +94% YoY, guidance above consensus","Data center revenue $30.8B confirms AI spending wave","Sympathy: AMD +5%, AVGO +4%, MU +3%","Pick-and-shovel: VST +8%, VRT +6%","Memory: SK Hynix/Samsung HBM read-through","BUT: stock barely moves — beat was priced in"],
    disciplines: ["Accounting","Market Mechanics","Sector Analysis"], outcome: "NVDA flat post-earnings (priced in); AMD +5%; VST +8%", tickers: ["NVDA","AMD","AVGO","VST","VRT","MU","SMH"], sector: "tech,energy", magnitude: "medium", time_to_impact: "0-5 trading days for sympathy; ongoing for sector theme", lesson: "When a bellwether beats, sympathy names often move more than the reporting company (especially if beat was expected). Pick-and-shovel plays can be the real winners.", tags: ["earnings","beat","NVIDIA","AI","GPU","data center","revenue","guidance","财报","超预期","英伟达","业绩","营收","芯片","算力","半导体"] },
  { id: "dxy-surge-2022", title: "King Dollar 2022: DXY at 20-Year Highs Crushes Multinationals", year: 2022, trigger: "Fed aggressive hikes drive DXY above 114",
    chain_summary: "Fed hikes → dollar surges → multinational EPS drag → EM crisis → commodities pressured", steps: ["Fed hikes 425bp in 2022","DXY rises from 95 to 114 (+20%)","S&P 500 EPS drag est. ~6-8%","P&G/MSFT/GOOGL all cite FX headwinds","EM currencies crash (GBP flash crash, JPY 150)","Gold paradox: dollar up but gold only -3% (real yield offset)"],
    disciplines: ["FX Analysis","International Trade","Macro Economics"], outcome: "DXY 95→114; MSFT/GOOGL cite -5% revenue headwind; EM ETFs -20%", tickers: ["UUP","EEM","EFA","GLD","MSFT","PG"], sector: "macro,fx", magnitude: "large", time_to_impact: "Months, peaks with rate cycle", lesson: "Strong dollar = tax on US multinationals and EM. When dollar reverses, these same names get a tailwind. FX hedging lags 1-2 quarters.", tags: ["dollar","DXY","forex","currency","FX","yen","pound","Fed","美元","汇率","外汇","日元","英镑","美联储","升值"] },
];

// Enhanced case search with recency, seasonal alignment, magnitude weighting
function searchCases(
  keywords: string[],
  currentMonth: number,
  currentYear: number = 2026
): Array<{ case_data: HistCase; score: number; recency_weight: number; seasonal_match: boolean }> {
  const results: Array<{ case_data: HistCase; score: number; recency_weight: number; seasonal_match: boolean }> = [];

  for (const c of CASES) {
    let score = 0;

    // Base keyword matching (unchanged)
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (c.tags.some((t) => t.toLowerCase().includes(kwLower) || kwLower.includes(t.toLowerCase()))) score += 3;
      if (c.trigger.toLowerCase().includes(kwLower)) score += 2;
      if (c.chain_summary.toLowerCase().includes(kwLower)) score += 1;
    }

    if (score === 0) continue;

    // Recency bonus: newer cases are more relevant
    const yearDiff = currentYear - c.year;
    const recency_weight = 1 / (1 + yearDiff * 0.15);
    score += Math.max(0, Math.round(10 - yearDiff * 1.5));

    // Magnitude bonus: extreme/large cases are more instructive
    const magBonus: Record<string, number> = { extreme: 5, large: 3, medium: 1 };
    score += magBonus[c.magnitude] || 0;

    // Seasonal alignment (rough: winter = 11,12,1,2; summer = 5,6,7,8)
    const winterMonths = new Set([11, 12, 1, 2]);
    const summerMonths = new Set([5, 6, 7, 8]);
    const caseIsWinter = c.tags.some(t => ["cold", "freeze", "snow", "flu", "寒潮", "降温", "感冒", "冷"].includes(t.toLowerCase()));
    const caseIsSummer = c.tags.some(t => ["hot", "heat", "drought", "hurricane", "热", "高温", "干旱", "飓风"].includes(t.toLowerCase()));
    const seasonal_match =
      (caseIsWinter && winterMonths.has(currentMonth)) ||
      (caseIsSummer && summerMonths.has(currentMonth)) ||
      (!caseIsWinter && !caseIsSummer);
    if (seasonal_match) score += 3;

    results.push({ case_data: c, score, recency_weight, seasonal_match });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

// ======================================================================
// Section 3.5: Dynamic Historical Search Query Generator (NEW v3.1)
// ======================================================================

const SEARCH_QUERY_TEMPLATES: Record<string, string[]> = {
  physiological: [
    '"{keyword}" flu season US stock market impact historical',
    '"{keyword}" epidemic outbreak stock market winners losers',
    'CDC flu surge {year_range} stock market pharma reaction',
  ],
  weather: [
    '"{keyword}" weather event US stock market impact',
    '"{keyword}" energy prices natural gas oil {year_range}',
    'extreme weather {keyword} stock market historical precedent',
  ],
  economic: [
    '"{keyword}" US stock market historical reaction',
    '"{keyword}" Fed policy stock market sector rotation',
    '"{keyword}" economic indicator stock market impact {year_range}',
  ],
  geopolitical: [
    '"{keyword}" geopolitical event stock market impact',
    '"{keyword}" sanctions trade war stock market historical',
    '"{keyword}" safe haven assets gold treasury defense stocks',
  ],
  technology: [
    '"{keyword}" technology disruption stock market winners',
    '"{keyword}" tech paradigm shift stock market historical',
    '"{keyword}" semiconductor AI chip stock market impact',
  ],
  policy: [
    '"{keyword}" regulation policy US stock market impact',
    '"{keyword}" government policy sector winners losers historical',
  ],
  market_event: [
    '"{keyword}" stock market historical precedent outcome',
    '"{keyword}" market signal sector rotation playbook',
    '"{keyword}" historical frequency recession probability stocks',
  ],
  corporate_event: [
    '"{keyword}" earnings surprise stock market sector reaction',
    '"{keyword}" bellwether earnings read-through sympathy stocks',
    '"{keyword}" corporate event stock market precedent',
  ],
  fx_commodity: [
    '"{keyword}" commodity price stock market impact historical',
    '"{keyword}" dollar FX currency stock market reaction',
    '"{keyword}" commodity cycle stock market winners losers',
  ],
  nature: [
    '"{keyword}" natural disaster stock market impact',
    '"{keyword}" supply chain disruption stock market historical',
  ],
  social: [
    '"{keyword}" social trend consumer behavior stock market',
    '"{keyword}" demographic shift investment opportunity historical',
  ],
  daily: [
    '"{keyword}" consumer trend stock market signal',
  ],
};

function generateDynamicSearchQueries(
  primaryType: string,
  secondaryTypes: string[],
  matchedKeywords: string[],
  userInput: string,
  isFinancialEvent: boolean,
): string[] {
  const queries: string[] = [];
  const yearRange = "2020-2026";

  // Pick top 2 most distinctive keywords (prefer longer/more specific ones)
  const sortedKw = [...matchedKeywords]
    .sort((a, b) => b.length - a.length)
    .slice(0, 2);

  // If no matched keywords, extract key phrases from user input
  const keyPhrases = sortedKw.length > 0
    ? sortedKw
    : userInput.split(/[\s,，。！？]+/).filter(w => w.length > 1).slice(0, 2);

  // Get templates for primary type
  const templates = SEARCH_QUERY_TEMPLATES[primaryType] || SEARCH_QUERY_TEMPLATES["daily"]!;

  for (const tpl of templates) {
    for (const kw of keyPhrases) {
      const q = tpl
        .replace("{keyword}", kw)
        .replace("{year_range}", yearRange);
      queries.push(q);
    }
  }

  // Add one secondary-type query if exists
  if (secondaryTypes.length > 0) {
    const secTemplates = SEARCH_QUERY_TEMPLATES[secondaryTypes[0]];
    if (secTemplates && secTemplates[0] && keyPhrases[0]) {
      queries.push(
        secTemplates[0].replace("{keyword}", keyPhrases[0]).replace("{year_range}", yearRange)
      );
    }
  }

  // Add a direct user-input search for novelty
  if (isFinancialEvent) {
    queries.push(`"${userInput}" stock market historical precedent what happened next`);
  } else {
    queries.push(`"${userInput}" US stock market impact similar event history`);
  }

  // Deduplicate and limit to 4
  return [...new Set(queries)].slice(0, 4);
}

function buildDynamicSearchSection(
  needed: boolean,
  optional: boolean,
  queries: string[],
  bestStaticScore: number,
): string {
  if (!needed && !optional) {
    // Strong static match — dynamic search is low priority
    return `## 4.5 Dynamic Historical Search [OPTIONAL]
Static precedents above have strong relevance (score: ${bestStaticScore}). Dynamic search is optional but can supplement with more recent cases.
If you have time, pick ONE query from below and use 网络检索工具:
- ${queries[0] || "N/A"}`;
  }

  const urgency = needed
    ? `**[STRONGLY RECOMMENDED]** Static precedent match is weak (best score: ${bestStaticScore}). Use 网络检索工具 to search for historical precedents to strengthen your analysis.`
    : `**[RECOMMENDED]** Static match is moderate (best score: ${bestStaticScore}). Dynamic search will improve historical grounding.`;

  return `## 4.5 Dynamic Historical Search ${needed ? "[STRONGLY RECOMMENDED]" : "[RECOMMENDED]"}
${urgency}

**Search queries** (use 网络检索工具 with 1-2 of these):
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

**How to use search results** (ref: historical-precedent-search skill):
1. Look for: event trigger, market reaction, timeline, which sectors/tickers moved, and what lesson was learned
2. Evaluate relevance: Does the historical event match the current one in (a) mechanism, (b) magnitude, (c) macro context?
3. Extract: Ticker moves, percentage changes, time-to-impact, and whether the reaction was sustained or reverted
4. Discount: Old cases (>10yr) need a "world has changed" check. Cases from different macro regimes (e.g., ZIRP vs high-rate) may not apply.
5. Cite: When referencing in your response, say "In [year], when [similar event], [ticker] moved [X%] over [timeframe]"`;
}

// ======================================================================
// Section 3.6: Domain Knowledge Search (NEW v3.2 — Layer 2)
// ======================================================================

function generateDomainKnowledgeQueries(
  userInput: string,
  matchedKeywordCount: number,
): string[] {
  // Only generate when we have zero or very few keyword matches (novel event territory)
  if (matchedKeywordCount > 1) return [];

  // Clean: remove question patterns, dates, common command words
  const cleaned = userInput
    .replace(/[买卖]什么[^。？]*[好吗？?]?/g, "")
    .replace(/有什么[^。？]*[？?]?/g, "")
    .replace(/应该[买卖看什么]+[^，。]*$/g, "")
    .replace(/\d{4}年?/g, "")
    .replace(/\d+月\d*日?/g, "")
    .replace(/[，。！？、；：""''?!.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Extract a concise topic seed (first meaningful portion, capped)
  const topicSeed = cleaned.slice(0, 25).trim();
  if (topicSeed.length < 2) return [];

  const queries: string[] = [];

  // Bilingual queries for maximum web search coverage
  queries.push(`${topicSeed} US stock market impact companies to watch`);
  queries.push(`${topicSeed} 美股 受益 上市公司 投资机会`);
  queries.push(`${topicSeed} financial impact revenue industry analysis NYSE NASDAQ`);

  return queries;
}

function buildDomainKnowledgeSection(
  isNovelEvent: boolean,
  queries: string[],
): string {
  if (!isNovelEvent || queries.length === 0) return "";

  return `
## 4.6 Domain Knowledge Search [STRONGLY RECOMMENDED]
The tool has **limited built-in knowledge** for this event type. You MUST search for domain understanding BEFORE starting your reasoning.

**Domain queries** (use 网络检索工具 with 1-2 of these):
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

**What to extract from search results** (ref: novel-event-reasoning skill):
1. **Revenue flows**: Who earns money from this event? (broadcasting, sponsorship, tourism, betting, merchandise, streaming)
2. **Revenue materiality**: How much revenue? Is it >1% of any public company's annual revenue?
3. **Key companies**: Which US-listed companies are most directly involved?
4. **Historical**: Has a similar event moved stocks before? What magnitude?
5. **Priced-in status**: Is this a scheduled event everyone already knows about?

Use extracted data as your quantitative anchors. Then proceed with first-principles reasoning.`;
}

// ======================================================================
// Section 4: Discipline Knowledge (unchanged)
// ======================================================================

const DISCIPLINE_KNOWLEDGE: Record<string, string> = {
  weather: `### Key Discipline Knowledge (Weather → Finance)

**Physics / Energy:**
- HDD (Heating Degree Days) deviating 10% from historical mean → nat gas spot moves ~5-8%
- Nat gas inventory >15% below 5-year average = upside price risk elevated
- EIA weekly storage report (every Thursday) = strongest short-term nat gas catalyst
- ERCOT power reserve margin <6% = significant curtailment risk
- Hurricane Cat 3+ making landfall on Gulf Coast → historical avg 5-15% short-term oil spike

**Common Mistakes:**
- Weather forecast ≠ certainty — focus on probability deviation
- Major energy companies typically hedge 60-80% of production — short-term price spikes have limited EPS impact
- Spot price spike ≠ long-dated futures rise — check curve structure (contango/backwardation)

**Weather → Agriculture:**
- Corn Belt drought → CORN/SOYB↑ → feed costs↑ → meat prices rise → food CPI↑
- Beneficiaries: MOS (fertilizer), ADM (grain), DE (farm equipment)

**Weather → Consumer Behavior:**
- Warm winter: UNG↓, but outdoor retail↑ (NKE/LULU)
- Cold snap: UNG↑, indoor consumption↑ (NFLX/EA), e-commerce substitution (AMZN↑)
- Hurricane threat: disaster prep (HD/LOW↑), travel cancellations (DAL/UAL↓)`,

  physiological: `### Key Discipline Knowledge (Physiology → Finance)

**Epidemiology Anchors:**
- CDC ILI baseline ~2.5%, above 3.5% = flu season running hot
- US annual flu healthcare spending ~$11B, severe years $20B+
- GLP-1 market growing >50% YoY, penetration <5% (long runway)
- Pharma new drug: Phase 3 → FDA filing → approval = 6-18 months

**Seasonal Health Cycle:**
- Winter: Flu peak → PFE/GILD/ABT; indoor↑ → NFLX/gaming
- Spring: Allergy season → OTC antihistamines; outdoor↑ → NKE/LULU
- Summer: Sunscreen/beverages (KO, PEP); travel peak → BKNG/ABNB
- Fall: Flu vaccine rollout → MRNA/PFE

**Common Mistakes:**
- "I sneezed" ≠ "flu outbreak" — need CDC data to confirm population trend
- Flu drugs are <5% of PFE revenue — a strong flu season barely moves PFE
- Population aging is a decade-long trend — can't use it to justify "buy this week"`,

  economic: `### Key Discipline Knowledge (Economics → Finance)

**Fed Reaction Function (single most important variable):**
- Core PCE >3% = no rate cuts, >4% = possible hikes, <2.5% = cut window opens
- 10Y yield every 100bp rise → QQQ historical avg -8% to -12%
- Unemployment <4% = tight labor → wage inflation; >4.5% = recession warning
- ISM PMI <47 = historically high recession probability
- Yield Curve (2Y-10Y) inversion = recession warning (leads by 12-18 months)

**Sector Rotation:**
- CPI↑: XLE, GLD, TIP ↑ / TLT, QQQ ↓
- Strong NFP: XLY, XLF ↑ / TLT ↓ (cuts delayed)
- Fed cuts: QQQ, XLRE, GLD ↑ / KBE ↓

**Common Mistakes:**
- Single-month CPI jump ≠ runaway inflation — look at 3-month annualized rate
- What the Fed says ≠ what the Fed does — watch dot plot and actual rate path
- Headline NFP adds jobs but all part-time/government → completely different signal`,

  geopolitical: `### Key Discipline Knowledge (Geopolitics → Finance)

**Transmission Waves:**
- Wave 1 (0-48h): Panic → VIX↑, GLD↑, TLT↑, equities↓
- Wave 2 (1-4 weeks): Supply chain shock → affected commodities spike
- Wave 3 (1-6 months): Inflation transmission → CPI↑ → Fed policy shift
- Wave 4 (6+ months): Industry restructuring → reshoring/defense spending/energy security

**Resource Control Key Data:**
- Russia: oil exports ~12%, nat gas ~17%, palladium ~40%, wheat ~18%
- Taiwan (TSMC): advanced node chips >80% (7nm and below)
- Middle East (OPEC+): ~40% oil capacity, Saudi swing capacity ~2-3M bpd
- Strait of Hormuz: ~20% global oil trade
- China: ~60% rare earth processing, ~80% lithium battery capacity

**Common Mistakes:**
- 80% of geopolitical events have transient market impact (1-4 week reversion) — unless real supply disruption
- Taiwan Strait is an extreme tail risk (low prob, extreme impact) — don't use for daily reasoning
- Second round of tariff escalation typically has smaller market impact than first (supply chains already adjusting)`,

  technology: `### Key Discipline Knowledge (Technology → Finance)

**AI Compute Supply Chain (current hottest):**
- GPU: NVDA (>80%) → AMD → INTC
- HBM memory: SK Hynix, Samsung, MU
- CoWoS packaging: TSMC (capacity bottleneck)
- Optical modules: COHR → data center interconnect
- Power: data center electricity demand surging → VST, CEG
- Cooling: VRT (liquid cooling)
- Cloud: AMZN (AWS), MSFT (Azure), GOOGL (GCP)

**Supply Chain Analysis Framework:**
- Bottleneck analysis: tightest capacity node = greatest pricing power = greatest margin leverage
- TSMC utilization >95% = strong pricing power, <80% = industry downturn
- Semiconductor inventory cycle ~3-4 years, inventory/revenue ratio >1.5x = glut warning

**Common Mistakes:**
- "Bottleneck" isn't permanent — all bottlenecks eventually resolved by capex (2-3 year cycle)
- During shortage, downstream double-ordering → real demand overstated → phantom inventory bubble
- Revenue surging but upstream also raising prices → margins may actually compress`,

  policy: `### Key Discipline Knowledge (Policy → Finance)

**Sanctions Economics:**
- Sanctions → sanctioned country exports blocked → global supply↓ → commodity prices↑ → alternative suppliers benefit
- Example: Russia oil sanctions → Saudi/US shale benefits → XOM, COP
- Example: China chip sanctions → US equipment benefits short-term but long-term risk → ASML, LRCX

**US Political Cycle:**
- Election year: policy uncertainty↑ → VIX seasonal rise (Q3)
- Party differences: energy/healthcare/tech/crypto affected
- New president: FTC/SEC/EPA policy shifts → tech M&A/energy direction switch

**Common Mistakes:**
- Policy announced ≠ policy enacted — track legislative timeline
- Market prices in expectations before policy is final — "buy the rumor, sell the news"`,

  social: `### Key Discipline Knowledge (Social → Finance)

**US Generational Consumer Differences:**
- Boomers (60-78): Healthcare/travel/dividend stocks → UNH, BKNG, VYM
- Gen X (44-59): Mortgages/education/401k → banks, SPY/QQQ
- Millennials (29-43): Experiences > things / subscriptions / ESG → ABNB, NFLX, ICLN
- Gen Z (13-28): Short video / sustainability / mental health → SNAP, TDOC

**Key Trends → Tickers:**
- Remote Work: ZM, MSFT, EQIX ↑ / SPG ↓
- Ozempic Culture: LLY, NVO ↑ / MDLZ, DXCM ↓
- AI Anxiety: COUR ↑ (upskilling)
- Loneliness Epidemic: CHWY (pets), META (social), TDOC (mental health)

**Common Mistakes:**
- Distinguish viral moment vs secular trend — check penetration rate and adoption curve
- Social media buzz ≠ real consumer behavior change — need data verification`,

  nature: `### Key Discipline Knowledge (Natural Events → Finance)

**Disaster Transmission:**
- Supply chain disruption → substitute demand↑ → alternative suppliers benefit
- Insurance claims → ALL/TRV short-term pressure → but can reprice higher (medium-term)
- Post-disaster rebuilding → HD/LOW/building materials benefit

**Key Data:**
- Hurricane season: Jun-Nov, Gulf Coast impacts oil capacity
- Wildfire: primarily California, insurance withdrawal → RE↓, utility liability (PCG risk)
- Earthquake: US West Coast, watch for supply chain disruption

**Common Mistakes:**
- Natural disaster market impacts are usually transient — unless extreme scale
- Insurance stocks dip short-term but may rebound as they reprice premiums`,

  daily: `### Key Discipline Knowledge (Daily Observation → Finance)

**Consumer Observation → Trends:**
- Long lines / packed stores = strong demand → watch sector leader growth rates
- Empty / stores closing = weak demand → check where we are in the cycle
- New consumption pattern = possible trend inflection point

**Market Transmission Mechanisms:**
- EPS revision: event → impacts revenue/cost → analyst revision → stock price (1-4 weeks)
- Multiple change: narrative shift → PE expansion/compression (can be immediate)
- Fund flows: investor reallocation → sector rotation (immediate to weeks)
- Price-in detection: if Bloomberg/CNBC top results cover it → already priced in

**Common Mistakes:**
- Positive event ≠ stock goes up — "buy the rumor, sell the news"
- Everyone already long a ticker → even with good fundamentals, upside is limited (crowded trade)
- Use forward PE (expected earnings) not trailing PE (past earnings) for decisions`,

  market_event: `### Key Discipline Knowledge (Market Structure Events → Finance)

**Yield Curve Playbook:**
- 2Y-10Y inversion has preceded every recession since 1970 (lead time 6-24 months, median ~14 months)
- False positive rate: ~1 in 9 (one inversion without recession)
- Post-inversion sector rotation: Financials -15%, Utilities +10%, Staples +8%, Healthcare +7% (12mo avg)
- Steepening from inverted = recession imminent (this is the real alarm, not the inversion itself)
- Curve steepening on rate cuts = Fed acknowledges weakness

**VIX / Volatility Framework:**
- VIX 15-20 = normal, 20-30 = elevated concern, 30+ = panic, 40+ = crisis
- VIX term structure: backwardation (front > back) = acute fear; contango = normal/complacent
- VIX spike → mean-reverting within 2-4 weeks 80% of the time — sell vol on spikes is a historical edge
- VIX >35 + put/call >1.2 = historically strong contrarian buy signal (within 6-12 months)

**Credit Spread Signals:**
- IG spread >200bp = stress; >300bp = crisis-level (historically only reached in 2008, 2020)
- HY-IG spread widening = credit differentiation → contagion risk rising
- Tight spreads (<100bp IG) = complacency → watch for sharp reversal

**Common Mistakes:**
- Yield curve inversion is a reliable signal but terrible timer — recession can be 6-24 months away
- VIX spike alone is not a buy signal — need confirmation (put/call, breadth, credit)
- "Risk-off" doesn't mean everything falls — safe havens rally (GLD, TLT, XLU)
- Market regime shifts (bull→bear) take months to confirm — don't overreact to single signals`,

  corporate_event: `### Key Discipline Knowledge (Corporate Events → Finance)

**Earnings Transmission Rules:**
- Bellwether beat: sector peers rally +1.5-3% avg in sympathy (strongest in first 2 trading days)
- Bellwether miss: sector peers fall -2-4% (asymmetric — misses punish harder)
- Guidance revision matters MORE than beat/miss — full-year raise → +3-7%; cut → -8-15%
- Post-Earnings Announcement Drift (PEAD): stocks with big surprises drift for 60+ days
- In crowded sectors, a mega-cap beat can paradoxically hurt smaller peers (capital concentrates)

**M&A / Corporate Action:**
- Target premium: +20-40% (day of announcement)
- Acquirer typically trades -2-5% (overpayment concern)
- Sector "who's next" premium: +3-8% for logical next targets
- Buyback announcements: +2-4% short-term, +8-12% over 12 months vs peers
- Insider buying clusters (3+ insiders in 30 days) = strongest bullish signal

**Analyst Revisions:**
- Single analyst upgrade: +2-5% in 5 days; downgrade: -3-7%
- Multiple simultaneous revisions (consensus shift) have 2-3x the impact
- Estimate revisions are a stronger predictor than absolute estimates

**Common Mistakes:**
- "Beat and raise" doesn't always mean stock goes up — whisper numbers and positioning matter
- Priced-in beats (expected beats by >5%) often see "sell the news" reaction
- M&A rumors: only actionable when combined with unusual options activity or credible source
- Don't chase sympathy moves beyond day 2 — mean reversion typically starts day 3-5`,

  fx_commodity: `### Key Discipline Knowledge (FX & Commodity Cycles → Finance)

**Dollar (DXY) Framework:**
- DXY +10% → S&P 500 EPS drag ~4-5% (40%+ of S&P revenue is international)
- Strong dollar = headwind for multinationals (MSFT, PG, KO), tailwind for domestic-focused
- Dollar strength correlates with: Fed hawkishness, US relative growth, risk-off
- Dollar peak typically coincides with Fed rate peak — watch for pivot signal

**Gold Framework:**
- Gold vs real yields: strongest negative correlation (-0.8 to -0.9)
- Real yield (10Y TIPS) is the single best predictor of gold direction
- Real yield -100bp → gold +15-20%
- Gold also responds to: central bank buying (structural since 2022), geopolitical fear, dollar weakness
- Gold miners (GDX) = leveraged gold play (2-3x gold's % move)

**Oil Framework:**
- OPEC spare capacity <2M bpd = price spike risk; >4M bpd = effective ceiling
- Oil +80% in 12 months has historically preceded recession (demand destruction)
- Every $10/bbl move = ~$0.03/gallon gasoline = consumer spending impact
- Energy sector earnings: 0.6-0.8x leverage to oil price move
- Shale breakeven: ~$50-60 WTI — below this, US production declines

**Copper/Industrial Metals:**
- Copper/gold ratio: rising = risk-on/growth; falling = risk-off/recession fear
- "Dr. Copper" as economic indicator: divergence from equities = warning signal
- China's copper demand = ~50% of global — PBOC stimulus = copper bullish

**Common Mistakes:**
- Commodity price spike ≠ producers benefit equally — check hedging books
- FX moves take 1-2 quarters to flow through to earnings (hedging lag)
- Don't confuse dollar strength with US economic strength — can diverge during global crises
- CNY 7.0 line: USD/CNY >7.3 = PBOC likely to intervene; <6.8 = export headwind for Chinese ADRs`,
};

// ======================================================================
// Section 4.5: Structured Quantitative Anchors (NEW v3)
// ======================================================================

interface QuantAnchor {
  metric: string;
  value: string;
  source: string;
  usage: string;
}

const QUANTITATIVE_ANCHORS: Record<string, QuantAnchor[]> = {
  physiological: [
    { metric: "CDC ILI baseline", value: "~2.5%", source: "CDC ILINet weekly", usage: "Above 3.5% = flu season running hot. Current week's ILI vs baseline determines if health thesis is active." },
    { metric: "US annual flu healthcare spend", value: "$11B normal, $20B+ severe", source: "CMS", usage: "Calibrate magnitude: severe season adds ~$9B to healthcare spending." },
    { metric: "OTC cold medicine market", value: "~$10B/yr, seasonal swing ±15-20%", source: "Nielsen", usage: "KMB/PG/KVUE exposure calculation. A 20% swing = $2B, split across many companies." },
    { metric: "Flu drugs as % of big pharma revenue", value: "<5% for PFE, JNJ", source: "Company 10-K", usage: "This is why big pharma chains score LOW. Even doubling flu revenue barely moves EPS." },
    { metric: "Diagnostic test volume in severe season", value: "2-3x normal", source: "QDEL/ABT earnings", usage: "QDEL revenue elasticity is the highest in this chain. Historical: +8-15% quarterly beat." },
    { metric: "Sick-day delivery order uplift", value: "+8-12% vs baseline week", source: "DASH/UBER earnings commentary", usage: "Behavioral chain evidence for stay-at-home consumption thesis." },
  ],
  weather: [
    { metric: "HDD sensitivity", value: "10% deviation → nat gas ±5-8%", source: "EIA/NOAA", usage: "Convert weather forecast deviation into nat gas price estimate." },
    { metric: "Nat gas inventory vs 5yr avg", value: ">15% below = upside risk", source: "EIA weekly storage", usage: "If inventories low AND cold snap → compounding upside for UNG/XLE." },
    { metric: "EIA storage report", value: "Every Thursday", source: "EIA", usage: "Strongest short-term catalyst for nat gas. Draw >100 Bcf in winter = bullish signal." },
    { metric: "Hurricane oil impact", value: "Cat 3+ Gulf → oil +5-15%", source: "Historical average", usage: "Only applies Jun-Nov, Gulf Coast landfall." },
    { metric: "ERCOT reserve margin threshold", value: "<6% = curtailment risk", source: "ERCOT", usage: "Texas grid stress = electricity price spikes." },
  ],
  economic: [
    { metric: "Core PCE vs Fed action", value: ">3% no cuts, >4% possible hikes, <2.5% cut window", source: "BEA/Fed", usage: "Single most important variable for rate-sensitive sectors." },
    { metric: "10Y yield → QQQ sensitivity", value: "Every 100bp rise → QQQ -8% to -12%", source: "Historical regression", usage: "Quantify tech impact from rate moves." },
    { metric: "Unemployment recession threshold", value: ">4.5% = recession warning", source: "BLS", usage: "Below 4% = tight labor → wage inflation. Above 4.5% = recession probability rises sharply." },
    { metric: "ISM PMI recession signal", value: "<47 = high recession probability", source: "ISM", usage: "Manufacturing contraction at this level historically precedes recession 70%+ of the time." },
    { metric: "Yield curve inversion lead time", value: "12-18 months before recession", source: "Fed research", usage: "2Y-10Y inversion is warning, but timing is imprecise." },
  ],
  geopolitical: [
    { metric: "VIX reaction to geopolitical events", value: "+5 to +15 points", source: "Historical average", usage: "Most revert within 2-4 weeks. Only sustained if real supply disruption." },
    { metric: "Russia's global resource share", value: "Oil 12%, gas 17%, palladium 40%, wheat 18%", source: "IEA/USDA", usage: "Quantify supply disruption impact from Russia-related events." },
    { metric: "TSMC advanced chip share", value: ">80% of 7nm and below", source: "Industry data", usage: "Taiwan Strait risk = semiconductor extinction event. Tail risk only." },
    { metric: "Strait of Hormuz oil flow", value: "~20% of global trade", source: "EIA", usage: "Middle East escalation risk quantification." },
  ],
  technology: [
    { metric: "NVDA GPU market share", value: ">80% AI training", source: "Industry estimates", usage: "Bottleneck owner = pricing power. But share can erode with AMD/custom chips." },
    { metric: "TSMC utilization threshold", value: ">95% = strong pricing, <80% = downturn", source: "TSMC earnings", usage: "Leading indicator for semiconductor cycle." },
    { metric: "Semiconductor inventory cycle", value: "~3-4 year full cycle", source: "Industry data", usage: "Inventory/revenue >1.5x = glut warning, <0.8x = shortage signal." },
    { metric: "Data center power growth", value: "20-30% CAGR through 2030", source: "IEA/McKinsey", usage: "Structural demand for VST, CEG, nuclear power." },
  ],
  market_event: [
    { metric: "2Y-10Y spread inversion track record", value: "Preceded last 8 recessions; lead time 6-24 months, median ~14 months", source: "Fed/NBER", usage: "Confirm recession signal strength. False positive rate: ~1 in 9." },
    { metric: "VIX term structure backwardation", value: "VIX > VIX3M = acute fear; normal contango = complacency", source: "CBOE", usage: "Backwardation with VIX >25 = high conviction risk-off. Front-month VIX/VIX3M >1.05 = panic mode." },
    { metric: "IG credit spread recession threshold", value: ">200bp = stress; >300bp = crisis", source: "ICE BofA", usage: "Calibrate contagion risk. Current spread vs 10yr median tells you if market is pricing in trouble." },
    { metric: "Put/call ratio extreme", value: ">1.2 = excessive fear (contrarian bullish); <0.5 = excessive complacency (contrarian bearish)", source: "CBOE", usage: "Sentiment extreme indicator. Combine with VIX for conviction." },
    { metric: "Sector rotation after inversion", value: "Financials -15% avg, Utilities +10%, Staples +8%, Health +7% in 12mo post-inversion", source: "Historical study", usage: "Playbook for positioning after yield curve signal." },
    { metric: "Short interest as % of float", value: ">20% = squeeze candidate; >40% = extreme", source: "FINRA", usage: "Identify short squeeze potential in risk-on reversal." },
  ],
  corporate_event: [
    { metric: "Earnings surprise propagation", value: "Bellwether beat → sector peers +1.5-3% avg; miss → -2-4%", source: "Academic studies (Bernard & Thomas)", usage: "Sympathy move magnitude estimation. Effect strongest in first 2 trading days." },
    { metric: "Guidance revision impact", value: "Full-year raise → +3-7% for stock; cut → -8-15%", source: "FactSet", usage: "Guidance matters more than beat/miss. Magnitude of revision drives reaction asymmetry." },
    { metric: "Buyback announcement premium", value: "+2-4% in 30 days, +8-12% in 12 months vs peers", source: "Academic research", usage: "Positive signal especially when combined with insider buying." },
    { metric: "M&A premium for target", value: "+20-40% for target; acquirer typically -2-5%", source: "Historical average", usage: "Also look for next logical target in same sector (sympathy bid premium +3-8%)." },
    { metric: "Post-earnings drift", value: "Stocks with big beats continue drifting +2-5% over 60 days", source: "Academic PEAD research", usage: "Market underreacts to earnings surprises. This is tradeable alpha." },
    { metric: "Analyst upgrade/downgrade impact", value: "Upgrade: +2-5% in 5 days; downgrade: -3-7%", source: "Market data", usage: "Effect amplified when multiple analysts revise simultaneously." },
  ],
  fx_commodity: [
    { metric: "DXY vs S&P 500 EPS", value: "DXY +10% → S&P 500 EPS drag ~4-5% (40%+ of S&P revenue is international)", source: "Goldman Sachs", usage: "Quantify FX headwind/tailwind for US multinationals." },
    { metric: "Gold vs real yields", value: "Strong negative correlation: real yield -100bp → gold +15-20%", source: "Historical regression", usage: "Real yield (TIPS) is the single best predictor of gold direction." },
    { metric: "Oil price recession signal", value: "Oil +80% in 12mo historically preceded recession (but not always)", source: "Hamilton research", usage: "Oil spike is a growth tax. Every $10/bbl = ~$0.03/gal gasoline = consumer squeeze." },
    { metric: "Copper-to-gold ratio", value: "Rising = risk-on/growth; falling = risk-off/recession fear", source: "Market data", usage: "Leading indicator for global growth expectations. Divergence from equities = warning." },
    { metric: "OPEC spare capacity", value: "<2M bpd = price spike risk; >4M bpd = price cap", source: "IEA/OPEC", usage: "Determines upside volatility in oil. Low spare capacity amplifies geopolitical risk." },
    { metric: "CNY 7.0 line", value: "USD/CNY >7.3 = PBOC likely to intervene; <6.8 = export headwind", source: "PBOC patterns", usage: "Key level for China trade-sensitive plays (BABA, PDD, NKE)." },
  ],
};

function getQuantAnchors(eventTypes: string[]): QuantAnchor[] {
  const anchors: QuantAnchor[] = [];
  const seen = new Set<string>();
  for (const t of eventTypes) {
    const typeAnchors = QUANTITATIVE_ANCHORS[t];
    if (typeAnchors) {
      for (const a of typeAnchors) {
        if (!seen.has(a.metric)) {
          seen.add(a.metric);
          anchors.push(a);
        }
      }
    }
  }
  return anchors;
}

// ======================================================================
// Section 5: Register Tool (Enhanced v3 output)
// ======================================================================

export function registerMrIfReason(server: McpServer): void {
  server.tool(
    "mr_if_reason",
    `Mr.IF financial reasoning engine v4.2. Handles TWO types of input:
1) Daily-life events ("everyone's sick", "it's getting cold") → butterfly-effect cross-domain reasoning
2) Financial events ("yield curve inverted", "NVDA earnings beat", "oil price crashed") → financial-transmission channel mapping (sector rotation, earnings read-through, macro repricing, contagion, FX pass-through)
Returns: event classification, chain templates WITH pre-scores (0-100) and ticker seeds, event interaction effects, enhanced historical precedents, structured quantitative anchors, discipline knowledge, and complexity-based reasoning depth recommendation.
NEW in v4: accepts optional 'event_type' parameter for LLM-driven classification (use the event-classification skill to determine this). When provided, overrides internal keyword matching for superior coverage of novel/ambiguous events.
This is Mr.IF's core reasoning tool — MUST be called FIRST before all other tools. ALWAYS interpret user input from a financial perspective.`,
    {
      user_input: z.string().describe("User's raw input, e.g. 'everyone's been sick lately', 'Trump is at it again'"),
      event_type: z.string().optional().describe(
        "LLM-classified event type. When provided, overrides internal keyword classification. " +
        "Valid values: physiological, weather, economic, social, technology, policy, nature, daily, " +
        "geopolitical, market_event, corporate_event, fx_commodity. " +
        "Use the event-classification skill to determine this. Omit if unsure — the tool will fall back to keyword matching."
      ),
      current_date: z.string().optional().describe("Current date YYYY-MM-DD"),
    },
    async ({ user_input, event_type, current_date }) => {
      const date = current_date ? new Date(current_date) : new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const seasonContext = SEASONAL_CONTEXT[month] || "";

      // 1. Event classification
      const cls = classifyEvent(user_input);

      // v4: LLM-classified event_type override
      const VALID_EVENT_TYPES = new Set(Object.keys(EVENT_TYPES));
      const llmOverride = event_type && VALID_EVENT_TYPES.has(event_type);
      if (llmOverride) {
        cls.primary_type = event_type;
      }

      // Compute isFinancialEvent early (needed by chainSection and dynamicSearch)
      const FINANCIAL_EVENT_TYPES = new Set(["market_event", "corporate_event", "fx_commodity"]);
      const isFinancialEvent = FINANCIAL_EVENT_TYPES.has(cls.primary_type);

      const primaryInfo = EVENT_TYPES[cls.primary_type as keyof typeof EVENT_TYPES];
      const allDirections: string[] = primaryInfo ? [...primaryInfo.reasoning_angles] : ["Consumer trend"];
      for (const sec of cls.secondary_types) {
        const info = EVENT_TYPES[sec as keyof typeof EVENT_TYPES];
        if (info) info.reasoning_angles.forEach((d) => { if (!allDirections.includes(d)) allDirections.push(d); });
      }

      // 2. Chain templates
      let templateKeys = matchTemplates(cls.primary_type, cls.matched_keywords);

      // 2.5 Complexity assessment & conditional second-order
      const complexity = assessComplexity(cls.secondary_types.length, templateKeys.length);
      const secondOrder = shouldIncludeSecondOrder(cls.primary_type, cls.secondary_types, complexity);
      if (secondOrder && !templateKeys.includes("second_order_hidden")) {
        templateKeys.push("second_order_hidden");
        templateKeys = templateKeys.slice(0, 5);
      }

      // 2.6 Event interaction
      const allTypes = [cls.primary_type, ...cls.secondary_types];
      const interaction = getInteractionEffect(allTypes);

      // 3. Historical cases (enhanced)
      const allKw = [...cls.matched_keywords, ...user_input.split(/[\s,，。！？]+/).filter((w) => w.length > 1)];
      const histMatches = searchCases(allKw, month, year);

      // 4. Compute chain pre-scores
      const interactionMultiplier = interaction.effect?.multiplier || 1.0;
      const scoredChains = templateKeys.map((key, i) => {
        const tpl = CHAIN_TEMPLATES[key];
        const scoreResult = computeChainScore(
          key, tpl, histMatches, month, cls.matched_keywords.length, interactionMultiplier
        );
        return {
          chain_id: i + 1,
          template_key: key,
          name: tpl.name,
          pattern: tpl.pattern,
          disciplines: tpl.disciplines,
          typical_steps: tpl.typical_steps,
          sector_hints: tpl.sector_hints,
          ticker_seeds: tpl.ticker_seeds,
          magnitude_range: tpl.magnitude_range,
          score: scoreResult,
          // v3.1 financial fields (may be undefined for daily-event templates)
          time_horizon: tpl.time_horizon,
          priced_in_risk: tpl.priced_in_risk,
          key_question: tpl.key_question,
        };
      });

      // Sort by score (highest first) for recommendation
      const sortedChains = [...scoredChains].sort((a, b) => b.score.total - a.score.total);

      // 5. Discipline knowledge injection
      const primaryKnowledge = DISCIPLINE_KNOWLEDGE[cls.primary_type] || DISCIPLINE_KNOWLEDGE["daily"] || "";
      const secondaryKnowledge = cls.secondary_types
        .slice(0, 2)
        .map((t) => DISCIPLINE_KNOWLEDGE[t])
        .filter(Boolean)
        .join("\n\n");

      // 6. Quantitative anchors
      const anchors = getQuantAnchors([cls.primary_type, ...cls.secondary_types.slice(0, 2)]);

      // 7. Build output
      const interactionSection = interaction.effect
        ? `## 1.5 Event Interaction [COMPUTED]
- Detected: **${interaction.key}** = **${interaction.effect.effect}** (${interaction.effect.multiplier}x confidence multiplier)
- Meaning: ${interaction.effect.description}
- Impact: Chain scores have been adjusted by +${Math.round((interaction.effect.multiplier - 1) * 20)} points for interaction effect.\n`
        : "";

      const chainSection = sortedChains.map((c) => {
        const bd = c.score;
        const scoreBar = "■".repeat(Math.round(bd.total / 10));
        const hasFinancialFields = !!(c.time_horizon && c.priced_in_risk && c.key_question);
        const label = isFinancialEvent && hasFinancialFields ? "Transmission Channel" : "Chain";

        if (isFinancialEvent && hasFinancialFields) {
          // === FINANCIAL EVENT FORMAT: Transmission Channel ===
          return `**${label} ${c.chain_id}: ${c.name}** — Score: **${bd.total}/100 [${bd.rating}]** ${scoreBar}
- Mechanism: ${c.pattern}
- Time horizon: ${c.time_horizon}
- Winners: [${c.ticker_seeds.bullish.join(", ") || "—"}] / Losers: [${c.ticker_seeds.bearish.join(", ") || "—"}]
- Sectors: ${c.sector_hints.join(", ")}
- Priced-in risk: ${c.priced_in_risk}
- Key question: ${c.key_question}
- Expected magnitude: ${c.magnitude_range}
- Score breakdown: base(${bd.base}) + hist(${bd.historical_match}) + season(${bd.seasonal_alignment}) + discipline(${bd.multi_discipline}) + keywords(${bd.keyword_density}) + length(${bd.chain_length_penalty}) + consensus(${bd.consensus_penalty}) + materiality(${bd.revenue_materiality_adj}) + interaction(${bd.interaction_bonus})${bd.flags.length > 0 ? "\n- FLAGS: " + bd.flags.join(" | ") : ""}`;
        } else {
          // === DAILY EVENT FORMAT: Chain Template ===
          return `**${label} ${c.chain_id}: ${c.name}** — Score: **${bd.total}/100 [${bd.rating}]** ${scoreBar}
- Pattern: ${c.pattern}
- Disciplines: ${c.disciplines.join(" → ")}
- Typical steps: ${c.typical_steps}
- Score breakdown: base(${bd.base}) + hist(${bd.historical_match}) + season(${bd.seasonal_alignment}) + discipline(${bd.multi_discipline}) + keywords(${bd.keyword_density}) + length(${bd.chain_length_penalty}) + consensus(${bd.consensus_penalty}) + materiality(${bd.revenue_materiality_adj}) + interaction(${bd.interaction_bonus})
- Sector hints: ${c.sector_hints.join(", ")}
- Ticker seeds: Bullish [${c.ticker_seeds.bullish.join(", ") || "—"}] / Bearish [${c.ticker_seeds.bearish.join(", ") || "—"}]
- Expected magnitude: ${c.magnitude_range}${bd.flags.length > 0 ? "\n- FLAGS: " + bd.flags.join(" | ") : ""}`;
        }
      }).join("\n\n");

      const histSection = histMatches.length > 0
        ? histMatches.map(({ case_data: c, score, recency_weight, seasonal_match }) =>
            `**${c.title}** (${c.year}, relevance: ${score}, recency: ${recency_weight.toFixed(2)}, seasonal: ${seasonal_match ? "aligned" : "misaligned"})
- Trigger: ${c.trigger}
- Chain: ${c.chain_summary}
- Outcome: ${c.outcome}
- Tickers: ${c.tickers.join(", ")}
- Lesson: ${c.lesson}`
          ).join("\n\n")
        : "No direct historical match. This is novel territory — build chains carefully and note the absence of precedent.";

      // --- Novel Event Detection ---
      // Novel = keywords didn't match AND LLM didn't provide a classification
      const isNovelEvent = cls.matched_keywords.length === 0 && !llmOverride;

      // --- Dynamic Historical Search ---
      const bestHistScore = histMatches.length > 0 ? histMatches[0].score : 0;
      const dynamicSearchNeeded = bestHistScore < 8; // weak or no match
      const dynamicSearchOptional = bestHistScore >= 8 && bestHistScore < 15; // decent but not great
      const dynamicSearchQueries = generateDynamicSearchQueries(
        cls.primary_type, cls.secondary_types, cls.matched_keywords, user_input, isFinancialEvent
      );
      const dynamicSearchSection = buildDynamicSearchSection(
        dynamicSearchNeeded, dynamicSearchOptional, dynamicSearchQueries, bestHistScore
      );

      // --- Domain Knowledge Search (Layer 2: for novel events) ---
      const domainKnowledgeQueries = generateDomainKnowledgeQueries(user_input, cls.matched_keywords.length);
      const domainKnowledgeSection = buildDomainKnowledgeSection(isNovelEvent, domainKnowledgeQueries);

      const anchorSection = anchors.length > 0
        ? anchors.map(a => `| ${a.metric} | ${a.value} | ${a.source} | ${a.usage} |`).join("\n")
        : "No structured anchors for this event type.";

      // Recommendation summary
      const strongChains = sortedChains.filter(c => c.score.rating === "STRONG");
      const weakChains = sortedChains.filter(c => c.score.rating === "WEAK");
      const recommendationSummary = `## 7. Recommendation Summary [COMPUTED]
- **Lead with**: ${strongChains.length > 0 ? strongChains.map(c => `${c.name} (${c.score.total}pts)`).join(", ") : sortedChains[0] ? `${sortedChains[0].name} (${sortedChains[0].score.total}pts, best available)` : "No strong chain"}
- **Support with**: ${sortedChains.filter(c => c.score.rating === "MODERATE").map(c => `${c.name} (${c.score.total}pts)`).join(", ") || "None"}
- **Debunk/deprioritize**: ${weakChains.length > 0 ? weakChains.map(c => `${c.name} (${c.score.total}pts — ${c.score.flags[0] || "low score"})`).join(", ") : "None"}
- **Narrative arc**: ${weakChains.length > 0 && strongChains.length > 0
  ? `"Most people think ${weakChains[0].name.split("→")[0].trim()} — but the real play is ${strongChains[0].name.split("→")[0].trim()}"`
  : "Follow chain score ranking for narrative priority."}`;
      const reasoningModeNote = isNovelEvent
        ? `- **REASONING MODE: FIRST-PRINCIPLES** — **NOVEL EVENT DETECTED**: No pre-defined keywords matched this input. The chain templates below are generic fallbacks. You MUST: (1) Execute domain knowledge search queries below BEFORE reasoning, (2) Use the novel-event-reasoning skill: trace money flows (who pays, who earns), size revenue impact, check "priced in" status, (3) Your domain research is MORE important than the generic templates.`
        : isFinancialEvent
        ? `- **REASONING MODE: FINANCIAL TRANSMISSION** — This is a direct financial event. The Transmission Channels below map how this event propagates through markets. For each channel, evaluate: (1) Already priced in? (2) What's the second derivative? (3) Where is consensus wrong? Reference the financial-transmission skill for methodology.`
        : `- **REASONING MODE: BUTTERFLY EFFECT** — This is a daily-life/non-financial event. Build cross-domain causal chains from the event to financial implications. Reference butterfly-effect-chain skill for methodology.`;

      const output = `# Mr.IF Reasoning Engine Output v4.3

## 1. Event Classification
- User input: "${user_input}"
- Event type: ${cls.primary_type} (${primaryInfo?.name || "Daily Observation"})${llmOverride ? ` [LLM-CLASSIFIED — overriding keyword match]` : ""}
- Secondary types: ${cls.secondary_types.join(", ") || "None"}
- Matched keywords: ${cls.matched_keywords.join(", ") || "No exact match — using default templates"}
- Date: ${date.toISOString().split("T")[0]}
- Seasonal context: ${seasonContext}
- Complexity: **${complexity}**
- Second-order recommended: **${secondOrder ? "yes — your conclusion likely has a consensus first-order reaction, look for what the market is missing" : "no — focus on building solid chains rather than forcing contrarian angles"}**
${reasoningModeNote}

${interactionSection}## 2. Reasoning Directions
${allDirections.map((d, i) => `${i + 1}. ${d}`).join("\n")}

## 3. ${isFinancialEvent ? "Transmission Channels" : "Chain Templates"} (Pre-Scored, sorted by score)
${chainSection}

${isFinancialEvent
  ? "These are transmission channel mappings — use them as your framework for how this financial event propagates. Apply the 3-Question Test (priced in? second derivative? consensus wrong?) on each channel. STRONG channels lead your narrative."
  : "You may supplement or adjust these templates. Use scores to prioritize: STRONG chains lead your narrative, WEAK chains are mentioned only to debunk or note as consensus traps."}

## 4. Historical Precedents (Enhanced)
${histSection}

${dynamicSearchSection}
${domainKnowledgeSection}

## 5. Quantitative Anchors
| Metric | Value | Source | How to Use |
|--------|-------|--------|-----------|
${anchorSection}

Use these numbers in your reasoning. When you cite a number, reference the source. If uncertain about current values, flag for verification with data tools.

## 6. Discipline Knowledge
${primaryKnowledge}
${secondaryKnowledge ? `\n${secondaryKnowledge}` : ""}

${recommendationSummary}

## 8. Output Structure — Inverted Pyramid + Logic Blocks (v4.3) [ACTION REQUIRED]

Your output MUST follow a TWO-LAYER structure — **narrative first, data second** — so three types of users each get value:

### LAYER 1: THE RIA SPEAKS (top of output — the first thing the user reads)

**A. Bottom Line (1-2 sentences, FIRST LINE of your response)**
Open with your verdict. Answer: "Is this event tradeable? What's the highest-conviction play? If not tradeable, say so."
- Strong event: "Japan's super-majority election is a structural shift — defense procurement (LMT) and semiconductor equipment (LRCX) are the two clearest plays, with GD as the non-consensus deeper pick."
- Weak event: "Honestly, Sudan's conflict has near-zero transmission to US equities. If you must have exposure, GLD as a broad uncertainty hedge is the only marginally defensible play."

**B. Top Picks + Short Focus (immediately after Bottom Line)**
One line: "**Top picks:** LMT > LRCX > GD **| Short focus:** AAPL (yen weakness + Japan-China friction)"
- Rank by conviction (Probability × Magnitude). Max 3 bullish + 1-2 bearish.
- If no meaningful bearish thesis, omit Short Focus — don't force it.

**C. Logic Block Narratives (the "why" — told conversationally)**
- **Chain/Channel N: [mechanism heading]** — each block tells the story of ONE reasoning chain
- Use your RIA voice: confident, specific, honest about weak links
- Each block names the tickers that flow from THAT chain — but does NOT include the full quantitative table (that's Layer 2)
- Weave in at least one dated historical case per key block (e.g., "In Feb 2021, UNG surged ~120%…") — this anchors credibility
- Lead with the STRONGEST chain. End with the contrarian/bearish block.

**--- 📊 Reference Data** (visual separator — signals "narrative ends, data begins")

### LAYER 2: THE DATA SPEAKS (bottom of output — the reference section)

After all narrative blocks, present the structured data:
- **Names to watch** — consolidated ticker summary table (Ticker | Why | Direction | Magnitude | Probability | Time | Key Variable). Source numbers: cite anchors. If uncertain, flag "needs confirmation via data tool".
- **Key Catalysts** — with specific dates (not "EIA report" but "EIA nat gas storage (Thu Feb 13, 10:30 ET)")
- **Key Sensitivity** — the single variable this thesis hinges on
- **Kill Condition** — specific, falsifiable thresholds, mapped to logic blocks
- **Base Rate** — concrete historical precedent with year, numbers, and tickers (e.g., "Post-inversion 12mo avg: Financials -15%, Utilities +10%"). Include 1-3 specific dated cases.
- **Net-net** — ONE closing sentence: highest conviction + non-consensus play + key trigger + walk-away condition. Closes the loop opened by the Bottom Line.
- **Disclaimer** — 1-2 sentences

### WHY THIS STRUCTURE:
- **3-second reader** (casual): reads Bottom Line + Top Picks → knows if it matters and what to look at
- **1-minute reader** (engaged): reads Layer 1 narrative → understands the reasoning
- **3-minute reader** (professional): reads full output including Layer 2 → can execute and track

### HEADING STYLE (unchanged):
- Daily events: "**Chain N: [label] — [trigger] → [mechanism] → [market impact]**"
- Financial events: "**Channel N: [label] — [financial trigger] → [transmission] → [asset impact]**"

### DO NOT:
- Bury the conclusion at the bottom — Bottom Line comes FIRST
- Put quantitative tables inside narrative blocks — tables go in Layer 2
- Use generic headings like "Energy stocks" — show the mechanism
- Have more than 4 blocks. If a genuinely important dimension didn't reach main-chain conviction, add a one-line "**Also on radar:**" before 📊 — focus on WHY it matters. Omit if nothing is worth it; never pad with weak angles.
- Force Short Focus when there's no meaningful bearish thesis

## 9. Falsifiability Guide [ACTION REQUIRED]
For each chain you build, you MUST define:

**A. Kill Condition** — What specific, measurable threshold would INVALIDATE each chain/block?
- Be precise: not "if data is bad" but "if EIA draw < 80 Bcf" or "if CPI MoM > 0.4%"
- Every recommended ticker needs a kill condition in your output
- Map kill conditions to the specific logic block: "If [kill condition], exit Chain 1 tickers (ET, UNG) but Chain 2 (NFLX) may still hold"

**B. Chain Break Point** — Which single step in the chain is MOST LIKELY to fail?
- Identify the weakest link in each logic block (the step with least empirical support)
- Mention it naturally in your narrative: "The riskiest assumption here is..."

**C. Timestamped Checkpoints** — When can the user VERIFY this thesis?
- Key Catalysts must include specific dates and times when possible
- Format: "EIA storage report (Thu Feb 13, 10:30 ET)" not just "EIA report"
- If the date is uncertain, give a range: "expected week of Mar 10"

**D. Ticker Depth** — Dig one layer deeper than the obvious names
- For each logic block, include at least ONE non-obvious / mid-cap / niche play
- The consensus large-cap is the starting point, not the ending point
- Think: "If LMT is the obvious defense name, who is the BWXT/KTOS of this thesis?"

Now follow the **reasoning-discipline** protocol in your thinking. Depth = **${complexity}**. Use chain scores to allocate reasoning effort. Then proceed to external tools.`;

      return {
        content: [{ type: "text" as const, text: output }],
      };
    }
  );
}
