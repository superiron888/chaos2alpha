/**
 * Mr.IF Butterfly-Effect Reasoning Engine — Unified Tool
 *
 * One call returns the complete reasoning scaffold:
 * 1. Event classification + reasoning directions
 * 2. Chain template matching + building guidance
 * 3. Validation framework + scoring rubric
 * 4. Historical precedent search (15 cases)
 * 5. Confluence analysis rules
 *
 * After receiving this tool's output, the LLM completes in its thinking:
 * - Fill in chain steps using templates
 * - Self-score and validate
 * - Confluence analysis
 * Then calls external tools (industry mapper, security mapper, data API, etc.)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ======================================================================
// Section 1: 事件分类 (from butterfly-analyze.ts)
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
               "冷", "热", "下雨", "下雪", "飓风", "干旱", "洪水", "高温", "降温", "山火", "寒潮", "暴风雪", "台风", "雾霾", "酷暑", "升温", "寒流", "暴雨"],
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

// 短英文关键词需要词边界匹配，避免 "rain" 匹配 "AI"
const SHORT_EN_KEYWORDS = new Set(["ai", "ev", "5g", "vr", "ban", "hot", "flu"]);

function keywordMatch(inputLower: string, kw: string): boolean {
  const kwLower = kw.toLowerCase();
  // 中文关键词：直接 includes
  if (/[\u4e00-\u9fff]/.test(kw)) {
    return inputLower.includes(kwLower);
  }
  // 短英文关键词（<=3字符）：用词边界正则避免误命中
  if (kwLower.length <= 3 || SHORT_EN_KEYWORDS.has(kwLower)) {
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return regex.test(inputLower);
  }
  // 长英文关键词：includes 即可
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
// Section 2: 链条模板 (from causal-chain-builder.ts)
// ======================================================================

const CHAIN_TEMPLATES: Record<string, {
  name: string;
  pattern: string;
  disciplines: string[];
  typical_steps: number;
  triggers: string[];
}> = {
  symptom_to_pharma: {
    name: "Symptom → Pharma Supply Chain",
    pattern: "Body symptom → Disease classification → Affected population scale → Drug/treatment demand → Pharma company earnings",
    disciplines: ["Physiology", "Epidemiology", "Economics"],
    typical_steps: 4,
    triggers: ["打喷嚏", "咳嗽", "失眠", "头疼", "发烧", "sneeze", "cough", "flu", "sick"],
  },
  weather_to_energy: {
    name: "Weather → Energy / Commodities",
    pattern: "Weather change → Energy demand shift → Commodity supply-demand → Energy/chemical company margins",
    disciplines: ["Physics", "Meteorology", "Economics"],
    typical_steps: 4,
    triggers: ["降温", "高温", "暴雨", "干旱", "cold", "hot", "freeze", "heatwave"],
  },
  consumption_to_industry: {
    name: "Consumer Observation → Industry Trend",
    pattern: "Consumption pattern → Underlying driver → Industry growth/decline → Sector leaders",
    disciplines: ["Sociology", "Psychology", "Economics"],
    typical_steps: 4,
    triggers: ["咖啡", "外卖", "排队", "商场", "coffee", "delivery", "traffic"],
  },
  emotion_to_capital: {
    name: "Social Sentiment → Capital Flow",
    pattern: "Social mood → Group behavior change → Spending/investment preference shift → Capital reallocation",
    disciplines: ["Psychology", "Behavioral Economics", "Finance"],
    typical_steps: 4,
    triggers: ["焦虑", "恐慌", "乐观", "躺平", "fear", "panic", "FOMO", "anxiety"],
  },
  policy_to_industry: {
    name: "Policy Signal → Industry Restructuring",
    pattern: "Policy direction → Market access change → Industry restructuring → Winners/losers",
    disciplines: ["Political Science", "Law", "Economics"],
    typical_steps: 4,
    triggers: ["禁令", "补贴", "碳中和", "ban", "subsidy", "regulation", "tariff", "executive order"],
  },
  tech_to_revolution: {
    name: "Tech Breakthrough → Industry Revolution",
    pattern: "Technology advance → Cost/efficiency shift → Industry landscape reshuffle → Valuation re-rating",
    disciplines: ["Engineering", "Physics", "Economics"],
    typical_steps: 5,
    triggers: ["AI", "电池", "芯片", "量子", "ChatGPT", "chip", "quantum"],
  },
  disaster_to_supply: {
    name: "Disaster → Supply Chain → Substitute Demand",
    pattern: "Black swan event → Supply chain disruption → Substitute demand surge → Alternative supplier benefits",
    disciplines: ["Geography", "Logistics", "Economics"],
    typical_steps: 4,
    triggers: ["地震", "台风", "疫情", "贸易战", "earthquake", "pandemic", "trade war"],
  },
  health_to_wellness: {
    name: "Health Signal → Wellness Economy",
    pattern: "Body signal → Health awareness → Wellness spending intent → Health & wellness industry",
    disciplines: ["Physiology", "Psychology", "Consumer Economics"],
    typical_steps: 4,
    triggers: ["打喷嚏", "体检", "亚健康", "熬夜", "sneeze", "health check", "fatigue"],
  },
  geopolitical_to_safehaven: {
    name: "Geopolitical Conflict → Safe Haven Assets",
    pattern: "Geopolitical event → Market panic (VIX↑) → Flight to safety → Gold/Treasuries/USD↑",
    disciplines: ["Geopolitics", "Psychology", "Finance"],
    typical_steps: 3,
    triggers: ["war", "conflict", "sanction", "missile", "NATO", "trump", "特朗普", "战争", "冲突", "制裁"],
  },
  geopolitical_to_supply: {
    name: "Geopolitical Conflict → Supply Chain Disruption → Alt Suppliers",
    pattern: "Sanctions/conflict → Country supply cutoff → Commodity spike → Alternative supplier benefits",
    disciplines: ["Geopolitics", "Supply Chain", "Economics"],
    typical_steps: 4,
    triggers: ["tariff", "sanction", "embargo", "trade war", "China", "Russia", "关税", "封锁"],
  },
  supply_chain_bottleneck: {
    name: "Supply Chain Bottleneck → Pricing Power → Margin Explosion",
    pattern: "Capacity constraint at one node → No substitutes → Extreme pricing power → Gross margin surge",
    disciplines: ["Supply Chain", "Engineering", "Economics"],
    typical_steps: 4,
    triggers: ["shortage", "bottleneck", "GPU", "chip", "缺货", "产能"],
  },
  event_to_fed_rotation: {
    name: "Economic Data → Fed Policy Expectation → Sector Rotation",
    pattern: "Economic data/event → Shifts Fed hike/cut expectations → Rate-sensitive sector rotation",
    disciplines: ["Economics", "Monetary Policy", "Finance"],
    typical_steps: 4,
    triggers: ["CPI", "inflation", "jobs", "unemployment", "Fed", "rate", "通胀", "就业", "利率"],
  },
  second_order_hidden: {
    name: "First-Order → Second-Order Expectation Gap → Hidden Winners",
    pattern: "Obvious event → Consensus winner (already priced in) → Find hidden winners/losers",
    disciplines: ["Psychology", "Market Mechanics", "Second-Order Thinking"],
    typical_steps: 5,
    triggers: ["obvious", "everyone knows", "consensus", "price in", "所有人都知道"],
  },
  tech_pickaxe: {
    name: "Tech Paradigm → Pick-and-Shovel Play",
    pattern: "Tech explosion → Application demand surge → Infra bottleneck → Infra supplier benefits most",
    disciplines: ["Engineering", "Supply Chain", "Economics"],
    typical_steps: 5,
    triggers: ["AI", "ChatGPT", "data center", "cloud", "GPU", "算力", "数据中心"],
  },
  demographic_to_sector: {
    name: "Demographics → Sector Transformation",
    pattern: "Population trend → Demand structure shift → Industry rise/decline → Long-term investment direction",
    disciplines: ["Sociology", "Demography", "Economics"],
    typical_steps: 5,
    triggers: ["aging", "老龄化", "Gen Z", "millennial", "retirement", "birth rate"],
  },
  environment_to_greentech: {
    name: "Environmental Issue → Green Tech",
    pattern: "Environmental degradation → Policy tightening → Green investment increase → Clean tech companies",
    disciplines: ["Chemistry", "Environmental Science", "Economics"],
    typical_steps: 4,
    triggers: ["雾霾", "碳排放", "塑料", "pollution", "carbon", "wildfire", "山火"],
  },
};

function matchTemplates(eventType: string, keywords: string[]): string[] {
  const matched: string[] = [];
  const inputJoined = keywords.join(" ").toLowerCase();

  for (const [key, tpl] of Object.entries(CHAIN_TEMPLATES)) {
    if (key === "second_order_hidden") continue; // handled conditionally by caller
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
    };
    matched.push(...(fallback[eventType] || ["consumption_to_industry"]));
  }

  return [...new Set(matched)].slice(0, 5);
}

// ======================================================================
// Section 2.5: Complexity Assessment & Second-Order Routing
// ======================================================================

const CONSENSUS_EVENT_TYPES = new Set(["weather", "geopolitical", "economic", "technology", "policy"]);

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

// ======================================================================
// Section 3: 历史案例库 (from historical-echo.ts)
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
];

function searchCases(keywords: string[]): Array<{ case_data: HistCase; score: number }> {
  const results: Array<{ case_data: HistCase; score: number }> = [];
  for (const c of CASES) {
    let score = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (c.tags.some((t) => t.toLowerCase().includes(kwLower) || kwLower.includes(t.toLowerCase()))) score += 3;
      if (c.trigger.toLowerCase().includes(kwLower)) score += 2;
      if (c.chain_summary.toLowerCase().includes(kwLower)) score += 1;
    }
    if (score > 0) results.push({ case_data: c, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

// ======================================================================
// Section 4: 事件类型→学科知识速查（注入到工具输出，让LLM有知识可用）
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
};

// ======================================================================
// Section 5: 注册合一工具
// ======================================================================

export function registerMrIfReason(server: McpServer): void {
  server.tool(
    "mr_if_reason",
    `Mr.IF butterfly-effect reasoning engine. Input any everyday event, returns: event classification, chain templates, historical precedents, discipline knowledge, and a complexity-based reasoning depth recommendation.
This is Mr.IF's core reasoning tool — MUST be called BEFORE all other tools.
User says "it's getting cold" → not asking to buy a jacket, asking which US stocks to watch. ALWAYS interpret user input from a financial perspective.`,
    {
      user_input: z.string().describe("User's raw input, e.g. 'it's getting cold', 'Trump is at it again'"),
      current_date: z.string().optional().describe("Current date YYYY-MM-DD"),
    },
    async ({ user_input, current_date }) => {
      const date = current_date ? new Date(current_date) : new Date();
      const month = date.getMonth() + 1;
      const seasonContext = SEASONAL_CONTEXT[month] || "";

      // 1. 事件分类
      const cls = classifyEvent(user_input);
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

      const chains = templateKeys.map((key, i) => {
        const tpl = CHAIN_TEMPLATES[key];
        return {
          chain_id: i + 1,
          name: tpl?.name || key,
          pattern: tpl?.pattern || "General reasoning",
          disciplines: tpl?.disciplines || ["Economics"],
          typical_steps: tpl?.typical_steps || 4,
        };
      });

      // 3. 历史案例
      const allKw = [...cls.matched_keywords, ...user_input.split(/[\s,，。！？]+/).filter((w) => w.length > 1)];
      const histMatches = searchCases(allKw);

      // 4. Discipline knowledge injection (by event type — now up to 3 types)
      const primaryKnowledge = DISCIPLINE_KNOWLEDGE[cls.primary_type] || DISCIPLINE_KNOWLEDGE["daily"] || "";
      const secondaryKnowledge = cls.secondary_types
        .slice(0, 2)
        .map((t) => DISCIPLINE_KNOWLEDGE[t])
        .filter(Boolean)
        .join("\n\n");

      // 5. Build output sections
      const histSection = histMatches.length > 0
        ? histMatches.map(({ case_data: c, score }) =>
            `**${c.title}** (${c.year}, relevance: ${score})\n` +
            `- Trigger: ${c.trigger}\n` +
            `- Chain: ${c.chain_summary}\n` +
            `- Outcome: ${c.outcome}\n` +
            `- Tickers: ${c.tickers.join(", ")}\n` +
            `- Lesson: ${c.lesson}`
          ).join("\n\n")
        : "No direct historical match. This is novel territory — build chains carefully and note the absence of precedent. Consider News Search for analogous events.";

      const chainSection = chains.map((c) =>
        `**Chain ${c.chain_id}: ${c.name}**\n` +
        `- Pattern: ${c.pattern}\n` +
        `- Disciplines: ${c.disciplines.join(" → ")}\n` +
        `- Typical steps: ${c.typical_steps}`
      ).join("\n\n");

      const output = `# Mr.IF Reasoning Engine Output

## 1. Event Classification
- User input: "${user_input}"
- Event type: ${cls.primary_type} (${primaryInfo?.name || "Daily Observation"})
- Secondary types: ${cls.secondary_types.join(", ") || "None"}
- Matched keywords: ${cls.matched_keywords.join(", ") || "No exact match — using default templates"}
- Date: ${date.toISOString().split("T")[0]}
- Seasonal context: ${seasonContext}
- Complexity: **${complexity}**
- Second-order recommended: **${secondOrder ? "yes — your conclusion likely has a consensus first-order reaction, look for what the market is missing" : "no — focus on building solid chains rather than forcing contrarian angles"}**

## 2. Reasoning Directions
${allDirections.map((d, i) => `${i + 1}. ${d}`).join("\n")}

## 3. Chain Templates
${chainSection}

You may supplement or adjust these templates based on your own reasoning. Each chain step: content + discipline + "because..."

## 4. Historical Precedents
${histSection}

## 5. Discipline Knowledge
${primaryKnowledge}
${secondaryKnowledge ? `\n${secondaryKnowledge}` : ""}

Now follow the **reasoning-discipline** protocol in your thinking. Depth = **${complexity}**. Then proceed to external tools.`;

      return {
        content: [{ type: "text" as const, text: output }],
      };
    }
  );
}
