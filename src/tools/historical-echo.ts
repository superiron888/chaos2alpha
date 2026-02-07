/**
 * 历史蝴蝶效应案例库 — Step 4: 应用方法论（历史先例验证）
 *
 * 内置经典的"蝴蝶效应→金融市场"历史案例，
 * 为当前推理链提供先例佐证或反面教训。
 * 
 * 这不是一个取数工具，而是一个"推理增强"工具——
 * 用历史模式匹配来加持或削弱当前因果链的置信度。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

interface HistoricalCase {
  id: string;
  title: string;
  year: number;
  trigger: string;                 // 触发事件
  chain_summary: string;           // 因果链概要
  chain_steps: string[];           // 因果链步骤
  disciplines: string[];           // 涉及学科
  financial_outcome: string;       // 金融市场结果
  affected_tickers: string[];      // 受影响的标的
  sector: string;                  // 行业
  magnitude: "small" | "medium" | "large" | "extreme"; // 影响量级
  time_to_impact: string;          // 从触发到市场反应的时间
  lesson: string;                  // 启示/教训
  tags: string[];                  // 搜索标签
}

const HISTORICAL_CASES: HistoricalCase[] = [
  // ===== 疫情/健康 =====
  {
    id: "covid-2020",
    title: "COVID-19: 一场肺炎引发的全球市场海啸",
    year: 2020,
    trigger: "2019年底武汉出现不明原因肺炎病例",
    chain_summary: "地方疫情 → 全球大流行 → 封锁经济 → 市场暴跌 → 史诗级放水 → 科技股暴涨",
    chain_steps: [
      "不明肺炎病例 (生理学/流行病学)",
      "人传人确认 → 全球扩散 (流行病学)",
      "各国封锁 → 经济停摆 (政治/公共卫生)",
      "S&P500一个月跌34% (金融恐慌/心理学)",
      "美联储零利率+无限QE (货币经济学)",
      "WFH需求爆发 → Zoom/AMZN/NFLX暴涨 (社会学/消费行为)",
      "mRNA疫苗研发 → MRNA/BNTX股价飙升 (生物科技)",
    ],
    disciplines: ["流行病学", "心理学", "货币经济学", "社会学"],
    financial_outcome: "SPY从339跌至218再反弹至年底373; MRNA从19涨至157; ZM从68涨至559",
    affected_tickers: ["SPY", "MRNA", "ZM", "AMZN", "NFLX", "PFE", "BNTX"],
    sector: "pharma,tech_ai,communication",
    magnitude: "extreme",
    time_to_impact: "2-4周（暴跌），6-12月（反弹到新高）",
    lesson: "极端事件中，第一反应是恐慌抛售，但要看谁是危机的受益者。疫苗/远程/电商成为最大赢家。",
    tags: ["pandemic", "flu", "virus", "disease", "sneeze", "cough", "health", "lockdown", "Fed", "QE"],
  },
  {
    id: "sars-2003",
    title: "SARS: 亚洲疫情对全球市场的短暂冲击",
    year: 2003,
    trigger: "2002年底广东出现非典型肺炎",
    chain_summary: "SARS爆发 → 亚洲旅游/航空重创 → 全球恐慌有限 → 快速恢复 → 医药股短期受益",
    chain_steps: [
      "不明呼吸道疾病出现 (生理学)",
      "跨境传播至香港/加拿大 (流行病学)",
      "航空/旅游业重创 (消费经济学)",
      "WHO发布全球警报 (公共卫生)",
      "疫情4个月内受控 → 市场V型反弹 (公共卫生/金融)",
    ],
    disciplines: ["流行病学", "消费经济学", "心理学"],
    financial_outcome: "S&P500短期跌幅约5%，随后快速收复。Roche、GSK等药企短期上涨。",
    affected_tickers: ["SPY", "UAL", "DAL", "MAR"],
    sector: "pharma,consumer_discretionary",
    magnitude: "medium",
    time_to_impact: "1-2周恐慌，3-4月恢复",
    lesson: "非全球性大流行的局部疫情，市场冲击通常短暂。但旅游/航空是第一个被砸的板块。",
    tags: ["pandemic", "flu", "virus", "respiratory", "sneeze", "cough", "travel", "airline"],
  },

  // ===== 天气/能源 =====
  {
    id: "texas-freeze-2021",
    title: "德州暴风雪: 冰冻三尺引发能源危机",
    year: 2021,
    trigger: "2021年2月德州遭遇罕见极寒天气",
    chain_summary: "极寒 → 供暖需求暴增 → 电网崩溃 → 天然气价格飙升 → 能源股暴涨",
    chain_steps: [
      "极地涡旋南下 → 德州-18°C (气象学/物理学)",
      "供暖需求暴增400% (物理学/能源)",
      "风力发电机冻结 + 天然气管道冻堵 (工程学)",
      "ERCOT电网崩溃 → 430万户停电 (基础设施)",
      "天然气现货价飙至$400/MMBtu (经济学/供需)",
      "能源企业利润暴增 → 股价飙升 (金融)",
    ],
    disciplines: ["气象学", "物理学", "工程学", "经济学"],
    financial_outcome: "UNG天然气ETF一周涨12%; OXY涨15%; 电网基建股如STEM涨20%+",
    affected_tickers: ["UNG", "OXY", "XOM", "CVX", "COP", "LNG"],
    sector: "energy,utilities",
    magnitude: "large",
    time_to_impact: "即时（天然气现货），1-2周（股票）",
    lesson: "极端天气对能源的冲击是即时且剧烈的。关注点：传统能源应急受益，但长期利好电网升级和储能。",
    tags: ["cold", "freeze", "snow", "weather", "energy", "gas", "heating", "power grid", "blackout"],
  },
  {
    id: "hurricane-katrina-2005",
    title: "卡特里娜飓风: 从风暴到油价飙升",
    year: 2005,
    trigger: "5级飓风卡特里娜登陆墨西哥湾",
    chain_summary: "飓风 → 墨西哥湾石油平台关停 → 炼油厂受损 → 汽油短缺 → 油价飙升",
    chain_steps: [
      "5级飓风登陆 (气象学)",
      "墨西哥湾95%石油产能关停 (工程/地理学)",
      "多座炼油厂严重受损 (工业)",
      "汽油供应短缺 → 价格飙升至$3+/加仑 (经济学)",
      "原油价格突破$70/桶 (期货市场)",
      "保险公司巨额赔付 (金融)",
    ],
    disciplines: ["气象学", "工程学", "经济学", "地理学"],
    financial_outcome: "WTI原油从$60涨至$70+; 保险公司ALL/TRV大跌; 建材HD/LOW灾后重建受益",
    affected_tickers: ["USO", "XLE", "HD", "LOW", "ALL", "TRV"],
    sector: "energy,industrials,materials",
    magnitude: "large",
    time_to_impact: "即时（油价），2-4周（股票），数月（重建）",
    lesson: "飓风季每年7-11月，墨西哥湾石油产能是关键变量。灾后看两个方向：能源涨价受益者 + 灾后重建受益者。",
    tags: ["hurricane", "storm", "wind", "flood", "oil", "gas", "energy", "insurance", "rebuild"],
  },

  // ===== 地缘政治 =====
  {
    id: "russia-ukraine-2022",
    title: "俄乌冲突: 地缘危机重塑全球能源版图",
    year: 2022,
    trigger: "俄罗斯入侵乌克兰",
    chain_summary: "战争 → 制裁 → 能源危机 → 通胀飙升 → 美联储激进加息 → 成长股暴跌",
    chain_steps: [
      "俄罗斯全面入侵乌克兰 (地缘政治)",
      "西方对俄实施全面制裁 (政治/法律)",
      "俄罗斯断供天然气 → 欧洲能源危机 (经济学/能源)",
      "全球油价突破$120/桶 (供需/期货)",
      "全球通胀飙至40年高位 CPI 9.1% (宏观经济)",
      "美联储激进加息至5%+ (货币政策)",
      "成长股/科技股暴跌 NASDAQ跌33% (金融)",
      "国防股/能源股暴涨 (资金流向)",
    ],
    disciplines: ["地缘政治", "经济学", "货币政策", "心理学"],
    financial_outcome: "XLE能源ETF涨65%; LMT国防股涨37%; QQQ科技ETF跌33%; GLD黄金先涨后跌",
    affected_tickers: ["XLE", "XOM", "CVX", "LMT", "RTX", "GLD", "QQQ", "UNG"],
    sector: "energy,industrials,safe_haven,macro_market",
    magnitude: "extreme",
    time_to_impact: "即时（避险），数月（通胀传导），1-2年（加息周期）",
    lesson: "地缘冲突第一波是避险(黄金/国债)，第二波是供应链冲击(能源/粮食)，第三波是通胀→加息→杀估值。",
    tags: ["war", "conflict", "geopolitical", "Russia", "oil", "gas", "inflation", "Fed", "defense", "sanction"],
  },
  {
    id: "us-china-trade-war-2018",
    title: "中美贸易战: 关税阴影下的科技脱钩",
    year: 2018,
    trigger: "美国对中国商品加征关税",
    chain_summary: "关税 → 供应链不确定性 → 科技股承压 → 避险情绪 → 国债/黄金受益",
    chain_steps: [
      "美国对$250B中国商品加征25%关税 (贸易政策)",
      "中国反制 → 贸易战升级 (地缘政治)",
      "企业利润预期下调 → 制造业PMI下滑 (经济学)",
      "半导体/苹果供应链受威胁 (产业链)",
      "市场波动加剧 VIX飙升 (金融/心理学)",
      "避险资金流入国债/黄金 (资金流向)",
    ],
    disciplines: ["国际贸易", "政治经济学", "产业链分析", "心理学"],
    financial_outcome: "SPY Q4 2018跌20%; AAPL跌39%; SMH半导体跌25%; TLT国债涨",
    affected_tickers: ["SPY", "AAPL", "SMH", "AVGO", "TLT", "GLD"],
    sector: "tech_ai,macro_market,safe_haven",
    magnitude: "large",
    time_to_impact: "关税公告即时冲击，贸易谈判拉锯数月",
    lesson: "关税直接打击全球化受益者（科技硬件/半导体），同时推动供应链多元化长期主题。",
    tags: ["tariff", "trade war", "China", "sanction", "supply chain", "semiconductor", "geopolitical"],
  },

  // ===== 金融/货币政策 =====
  {
    id: "fed-pivot-2023",
    title: "美联储转向预期: 一句话点燃牛市",
    year: 2023,
    trigger: "2023年底美联储暗示2024年可能降息",
    chain_summary: "Fed鸽派信号 → 利率见顶预期 → 成长股估值修复 → Magnificent 7暴涨",
    chain_steps: [
      "Powell暗示加息周期结束 (货币政策)",
      "国债收益率急跌 → 10年期从5%降至3.8% (债券市场)",
      "折现率下降 → 成长股估值提升 (金融学/DCF)",
      "AI叙事叠加 → Magnificent 7集体暴涨 (科技/心理学)",
      "SPY全年涨24%, QQQ涨54% (股市)",
    ],
    disciplines: ["货币政策", "金融学", "心理学"],
    financial_outcome: "QQQ从270涨至415; NVDA涨239%; META涨194%; TLT国债ETF涨",
    affected_tickers: ["QQQ", "NVDA", "META", "MSFT", "AAPL", "TLT", "SPY"],
    sector: "tech_ai,macro_market",
    magnitude: "large",
    time_to_impact: "信号发出后数天启动，持续数月",
    lesson: "Fed政策转向是最强的市场催化剂。'Don't fight the Fed'是永恒法则。利率方向决定了成长vs价值的风格切换。",
    tags: ["Fed", "interest rate", "pivot", "dovish", "rate cut", "growth", "tech", "bond", "treasury"],
  },
  {
    id: "svb-collapse-2023",
    title: "硅谷银行倒闭: 一夜之间的银行挤兑",
    year: 2023,
    trigger: "硅谷银行(SVB)宣布出售债券亏损18亿美元",
    chain_summary: "SVB亏损公告 → 储户恐慌挤兑 → 48小时倒闭 → 区域银行股暴跌 → 系统性风险恐慌",
    chain_steps: [
      "SVB持有大量长期国债 → 加息导致浮亏 (金融学)",
      "宣布亏损消息 → 社交媒体疯传 (传播学/心理学)",
      "科技圈VC集体提款 → 单日挤兑$42B (心理学/羊群效应)",
      "48小时内被FDIC接管 → 史上第二大银行倒闭 (金融监管)",
      "恐慌蔓延 → Signature Bank/First Republic相继倒下 (系统性风险)",
      "区域银行ETF KRE暴跌30% (金融市场)",
      "资金涌入大银行避险 → JPM/BAC受益 (资金流向)",
    ],
    disciplines: ["金融学", "心理学", "传播学", "监管"],
    financial_outcome: "KRE区域银行ETF跌30%; JPM逆势涨; GLD涨10%; TLT涨(避险+降息预期)",
    affected_tickers: ["KRE", "KBE", "JPM", "BAC", "GLD", "TLT"],
    sector: "financials,safe_haven",
    magnitude: "large",
    time_to_impact: "即时（挤兑48小时），2-4周（蔓延），数月（政策应对）",
    lesson: "社交媒体时代银行挤兑速度是传统的100倍。危机中区分'跑道上的飞机'和'安全的堡垒'——大银行是避风港。",
    tags: ["bank", "crisis", "panic", "fear", "run", "deposit", "FDIC", "regional bank", "safe haven", "gold"],
  },

  // ===== 供应链/通胀 =====
  {
    id: "suez-canal-2021",
    title: "长赐号搁浅: 一艘船堵住全球贸易",
    year: 2021,
    trigger: "集装箱船'长赐号'在苏伊士运河搁浅",
    chain_summary: "运河堵塞 → 全球航运中断 → 运费飙升 → 供应链瓶颈 → 通胀压力",
    chain_steps: [
      "400米巨轮侧向搁浅堵塞运河 (物理学/航海)",
      "每天约$9.6B贸易量被阻断 (经济学)",
      "全球集装箱运费指数飙升 (供需)",
      "欧洲进口延迟 → 制造业供应中断 (产业链)",
      "通胀预期上升 (宏观经济)",
    ],
    disciplines: ["物理学", "经济学", "物流学"],
    financial_outcome: "航运股ZIM/MATX涨; 油价短期涨; 集装箱运费指数翻倍",
    affected_tickers: ["ZIM", "MATX", "DAC", "USO"],
    sector: "industrials,energy",
    magnitude: "medium",
    time_to_impact: "即时（运费），1-2周（供应链），数月（通胀传导）",
    lesson: "全球贸易的咽喉要道出问题时，第一反应是航运股暴涨，第二波是供应链受阻的通胀传导。",
    tags: ["supply chain", "shipping", "logistics", "trade", "inflation", "oil", "transport"],
  },

  // ===== 科技/AI =====
  {
    id: "chatgpt-launch-2022",
    title: "ChatGPT发布: AI从论文走向大众",
    year: 2022,
    trigger: "OpenAI发布ChatGPT，两个月用户破亿",
    chain_summary: "ChatGPT爆火 → AI应用场景爆发 → GPU算力需求暴增 → NVDA成为最大赢家",
    chain_steps: [
      "ChatGPT发布 → 全民体验AI (科技/传播学)",
      "企业纷纷布局AI → 算力军备竞赛 (产业经济学)",
      "NVIDIA GPU供不应求 → 数据中心订单暴增 (供需)",
      "NVDA营收季度翻倍 → 股价一年涨240% (金融)",
      "AI基础设施(电力/冷却/光模块)需求跟涨 (产业链)",
      "MSFT(OpenAI投资者)/META(Llama)/GOOGL(Gemini)全面受益 (竞争格局)",
    ],
    disciplines: ["计算机科学", "经济学", "产业链分析"],
    financial_outcome: "NVDA从$14(拆股后)涨至$50+; MSFT涨57%; META涨194%; SMH涨65%",
    affected_tickers: ["NVDA", "MSFT", "META", "GOOGL", "AMD", "AVGO", "SMH"],
    sector: "tech_ai",
    magnitude: "extreme",
    time_to_impact: "1-3月(概念炒作)，6-12月(业绩兑现)",
    lesson: "范式级技术突破最大受益者是'卖铲人'(基础设施)，而非应用层。GPU/数据中心/电力是AI时代的石油。",
    tags: ["AI", "ChatGPT", "GPU", "semiconductor", "NVIDIA", "tech", "data center", "cloud"],
  },

  // ===== 消费/社会 =====
  {
    id: "ozempic-mania-2023",
    title: "GLP-1减肥药: 一针瘦下来引发的产业链地震",
    year: 2023,
    trigger: "Ozempic/Wegovy减肥效果走红社交媒体",
    chain_summary: "减肥药爆火 → 需求远超供给 → LLY/NVO暴涨 → 零食/快餐/医疗器械预期下调",
    chain_steps: [
      "GLP-1药物减重效果惊人(15-20%) (药理学/生理学)",
      "社交媒体/名人效应 → 全民求药 (传播学/心理学)",
      "Eli Lilly/Novo Nordisk市值飙升 (金融)",
      "减肥成功 → 零食/含糖饮料需求下降预期 (消费行为学)",
      "胃旁路手术/睡眠呼吸机需求下降预期 (医疗器械)",
      "WMT证实GLP-1用户购物篮变化 → 食品行业被重新定价 (零售数据)",
    ],
    disciplines: ["药理学", "心理学", "消费行为学", "金融学"],
    financial_outcome: "LLY从$330涨至$800+; NVO涨120%; MDLZ零食股跌; DXCM跌40%",
    affected_tickers: ["LLY", "NVO", "MDLZ", "PEP", "KO", "DXCM", "ISRG"],
    sector: "pharma,consumer_staples,healthcare_services",
    magnitude: "large",
    time_to_impact: "3-6月（概念），12-24月（产业链传导）",
    lesson: "颠覆性疗法不仅影响药企，还会重塑整个消费链。'第二层思维'：如果大家都瘦了，谁受益谁受损？",
    tags: ["drug", "obesity", "weight loss", "GLP-1", "health", "food", "snack", "pharma", "diet"],
  },

  // ===== 散户运动/社交媒体 =====
  {
    id: "gme-meme-2021",
    title: "GameStop逼空: 散户vs华尔街的史诗对决",
    year: 2021,
    trigger: "Reddit r/WallStreetBets 社区集体买入 GME 逼空对冲基金",
    chain_summary: "社交媒体发酵 → 散户集体买入 → 空头爆仓 → 股价暴涨100倍 → 经纪商限制交易 → 监管介入",
    chain_steps: [
      "DFV在Reddit发布GME深度价值分析 (社交媒体/信息传播)",
      "Melvin Capital等机构超140%做空GME (金融/风险管理)",
      "散户集体买入 → short squeeze启动 (行为金融/博弈论)",
      "GME从$4涨至$483 → Melvin亏损53% (市场微观结构)",
      "Robinhood限制买入 → 引发公众愤怒 (监管/政治)",
      "SEC介入调查 → PFOF模式被审视 (金融监管)",
    ],
    disciplines: ["行为金融学", "传播学", "博弈论", "金融监管"],
    financial_outcome: "GME从$4涨至$483; AMC从$2涨至$72; Melvin Capital最终清盘; 券商股短期波动",
    affected_tickers: ["GME", "AMC", "BB", "HOOD", "SCHW"],
    sector: "consumer_discretionary,financials",
    magnitude: "large",
    time_to_impact: "即时（社交媒体发酵1-2周），高波动期约1个月",
    lesson: "社交媒体时代，散户集体行动可以成为市场力量。高空仓标的在情绪共振下极其脆险。但基本面终会回归。",
    tags: ["meme", "Reddit", "short squeeze", "retail", "social media", "GameStop", "AMC", "squeeze", "WSB"],
  },

  // ===== 加息周期 =====
  {
    id: "fed-hike-cycle-2022",
    title: "2022暴力加息: 40年最快加息杀估值",
    year: 2022,
    trigger: "CPI同比飙至9.1%，美联储启动40年来最激进加息周期",
    chain_summary: "通胀失控 → Fed暴力加息 → 折现率飙升 → 高估值成长股暴跌 → 价值股/能源股相对跑赢",
    chain_steps: [
      "后疫情需求爆发 + 供应链瓶颈 → CPI飙至9.1% (经济学)",
      "Fed从0%加息至5.25%，全年加息425bp (货币政策)",
      "10年期国债收益率从1.5%飙至4.2% (债券市场)",
      "成长股DCF估值大幅下调 → ARKK跌67% (金融学/估值)",
      "加密市场崩盘 → FTX倒闭 (风险资产连锁反应)",
      "价值/能源股相对跑赢 → 风格大切换 (资金流向)",
    ],
    disciplines: ["货币政策", "宏观经济学", "金融学"],
    financial_outcome: "ARKK跌67%; QQQ跌33%; XLE涨65%; 美元指数DXY创20年新高",
    affected_tickers: ["ARKK", "QQQ", "XLE", "TLT", "UUP", "SPY"],
    sector: "tech_ai,energy,macro_market",
    magnitude: "extreme",
    time_to_impact: "全年持续，每次FOMC会议都是催化剂",
    lesson: "利率是所有资产定价的锚。加息周期中，久期最长的资产（成长股/长期国债）跌最多，短久期价值股和实物资产相对安全。",
    tags: ["Fed", "rate hike", "inflation", "CPI", "interest rate", "growth", "value", "rotation", "bond", "hawkish"],
  },

  // ===== 加密/新资产 =====
  {
    id: "bitcoin-etf-2024",
    title: "比特币ETF获批: 加密资产进入主流",
    year: 2024,
    trigger: "SEC批准首批比特币现货ETF（含BlackRock IBIT）",
    chain_summary: "ETF获批 → 机构资金涌入 → BTC突破$70K → 加密矿业/交易所股票暴涨 → 传统金融加速布局",
    chain_steps: [
      "SEC批准11只比特币现货ETF (金融监管)",
      "IBIT首月吸金超$4B → 史上最快ETF (资金流向)",
      "BTC从$42K涨至$73K (供需/市场结构)",
      "MARA/RIOT等矿业股暴涨 (产业链受益)",
      "COIN交易量飙升 → 营收预期上调 (金融服务)",
      "传统资管加速Tokenization布局 (金融创新)",
    ],
    disciplines: ["金融监管", "经济学", "金融学"],
    financial_outcome: "BTC从$42K涨至$73K; MARA涨120%; COIN涨60%; IBIT成为史上增长最快ETF",
    affected_tickers: ["IBIT", "COIN", "MARA", "RIOT", "MSTR", "GBTC"],
    sector: "financials,tech_ai",
    magnitude: "large",
    time_to_impact: "即时（ETF首日），3-6月（资金流入+价格发现）",
    lesson: "监管从阻力变为催化剂的时刻是最强的买入信号。ETF是传统资金进入新资产类别的桥梁——看资金流向比看价格更重要。",
    tags: ["bitcoin", "crypto", "ETF", "SEC", "regulation", "digital asset", "blockchain", "mining"],
  },

  // ===== 农业/气候 =====
  {
    id: "us-drought-2012",
    title: "2012美国大旱: 玉米带变火焰带",
    year: 2012,
    trigger: "美国中西部遭遇50年来最严重干旱",
    chain_summary: "干旱 → 玉米/大豆减产 → 农产品期货暴涨 → 饲料成本↑ → 肉类涨价",
    chain_steps: [
      "美国玉米带遭遇极端干旱 (气象学)",
      "玉米/大豆产量预估大幅下调 (农业学)",
      "玉米期货从$5涨至$8.3/蒲式耳 (期货市场)",
      "饲料成本暴涨 → 养殖户亏损 (产业链传导)",
      "肉类供给减少 → 超市价格上涨 (CPI)",
      "化肥/农机需求次年增加 → 相关企业受益 (产业链)",
    ],
    disciplines: ["气象学", "农业学", "经济学"],
    financial_outcome: "CORN玉米ETF涨27%; SOYB大豆ETF涨20%; ADM涨; 饲料相关成本股承压",
    affected_tickers: ["CORN", "SOYB", "WEAT", "ADM", "BG", "MOS", "DE"],
    sector: "agriculture,materials",
    magnitude: "large",
    time_to_impact: "即时(期货)，1-3月(股票)，6月+(CPI传导)",
    lesson: "美国是全球粮仓，中西部天气直接影响全球粮价。旱灾看多农产品期货和化肥股，看空下游食品加工。",
    tags: ["drought", "crop", "corn", "soybean", "wheat", "agriculture", "food", "weather", "hot", "heat"],
  },
];

/**
 * 搜索匹配的历史案例
 */
function searchCases(query: {
  keywords?: string[];
  sector?: string;
  disciplines?: string[];
  event_type?: string;
}): Array<{ case_data: HistoricalCase; relevance_score: number; match_reasons: string[] }> {
  const results: Array<{ case_data: HistoricalCase; relevance_score: number; match_reasons: string[] }> = [];

  for (const c of HISTORICAL_CASES) {
    let score = 0;
    const reasons: string[] = [];

    // 关键词匹配
    if (query.keywords) {
      for (const kw of query.keywords) {
        const kwLower = kw.toLowerCase();
        if (c.tags.some((t) => t.toLowerCase().includes(kwLower) || kwLower.includes(t.toLowerCase()))) {
          score += 3;
          reasons.push(`keyword match: "${kw}"`);
        }
        if (c.chain_summary.toLowerCase().includes(kwLower)) {
          score += 1;
        }
        if (c.trigger.toLowerCase().includes(kwLower)) {
          score += 2;
        }
      }
    }

    // 行业匹配
    if (query.sector) {
      const sectors = c.sector.split(",");
      if (sectors.some((s) => s.includes(query.sector!) || query.sector!.includes(s))) {
        score += 4;
        reasons.push(`sector match: "${query.sector}"`);
      }
    }

    // 学科匹配
    if (query.disciplines) {
      const matched = query.disciplines.filter((d) =>
        c.disciplines.some((cd) => cd.includes(d) || d.includes(cd))
      );
      if (matched.length > 0) {
        score += matched.length * 2;
        reasons.push(`discipline match: ${matched.join(", ")}`);
      }
    }

    if (score > 0) {
      results.push({ case_data: c, relevance_score: score, match_reasons: reasons });
    }
  }

  results.sort((a, b) => b.relevance_score - a.relevance_score);
  return results;
}

export function registerHistoricalEcho(server: McpServer): void {
  server.tool(
    "historical_echo",
    "搜索历史上类似的蝴蝶效应案例，为当前推理链提供先例佐证。内置12个经典案例，覆盖疫情、天气、地缘、货币政策、科技突破、消费变迁等维度。返回匹配案例的完整因果链、金融结果和教训。",
    {
      keywords: z.array(z.string()).optional().describe("搜索关键词，如 ['flu', 'sneeze', 'virus'] 或 ['cold', 'energy', 'heating']"),
      sector: z.string().optional().describe("目标行业，如 'pharma', 'energy', 'tech_ai'"),
      disciplines: z.array(z.string()).optional().describe("涉及学科，如 ['生理学', '经济学']"),
      max_results: z.number().default(3).describe("最多返回几个案例"),
    },
    async ({ keywords, sector, disciplines, max_results }) => {
      const matches = searchCases({ keywords, sector, disciplines });
      const topMatches = matches.slice(0, max_results);

      if (topMatches.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                found: false,
                message: "未找到匹配的历史案例。可尝试更宽泛的关键词。",
                available_tags: [...new Set(HISTORICAL_CASES.flatMap((c) => c.tags))].sort(),
                total_cases: HISTORICAL_CASES.length,
              }, null, 2),
            },
          ],
        };
      }

      const result = {
        found: true,
        query: { keywords, sector, disciplines },
        matches: topMatches.map(({ case_data, relevance_score, match_reasons }) => ({
          id: case_data.id,
          title: case_data.title,
          year: case_data.year,
          relevance_score,
          match_reasons,
          trigger: case_data.trigger,
          chain_summary: case_data.chain_summary,
          chain_steps: case_data.chain_steps,
          disciplines: case_data.disciplines,
          financial_outcome: case_data.financial_outcome,
          affected_tickers: case_data.affected_tickers,
          magnitude: case_data.magnitude,
          time_to_impact: case_data.time_to_impact,
          lesson: case_data.lesson,
        })),
        usage_hint: "将匹配案例作为当前推理链的佐证。如果历史先例支持当前链，置信度+1⭐；如果历史教训暗示当前链可能失效，需要标注风险。",
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
