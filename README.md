# 🦋 Mr.IF — Butterfly Effect Financial Reasoning Agent

> **如果你打了个喷嚏，美股哪个板块会动？**

Mr.IF 是一个蝴蝶效应金融推理 Agent 工具包，打包为 MCP Server。
从日常事件出发，通过多学科因果推理链，推导美股市场影响。

## Quick Start

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 运行
npm start

# MCP Inspector 调试
npm run inspect
```

## 工具架构

```
┌──────────────────────────────────┐
│          Mr.IF Agent             │
│        (系统提示词编排)            │
├──────────────────────────────────┤
│  Mr.IF MCP 工具包 (本项目)        │
│                                  │
│  🦋 butterfly_analyze  输入解析   │
│  🔗 causal_chain_build 链条构建   │
│  ✅ chain_validate     链条验证   │
│  📚 historical_echo    历史先例   │
│  🔄 chain_confluence   多链汇合   │
│  🎯 stock_map          美股映射   │
│                                  │
├──────────────────────────────────┤
│  外部已有工具 (2个，提示词调度)     │
│  🔍 网络检索工具   📊 取数工具     │
└──────────────────────────────────┘
```

## 6 个 MCP 工具

| 工具 | 对应Step | 职责 |
|------|----------|------|
| `butterfly_analyze` | Step 2 | 解析用户输入→事件分类→推理方向 |
| `causal_chain_build` | Step 3 | 匹配推理模板→结构化链条构建指引 |
| `chain_validate` | Step 4-5 | 多维度验证→置信度评分→风险评级 |
| `historical_echo` | Step 4 | 搜索12个经典历史蝴蝶效应案例 |
| `chain_confluence` | Step 5→7 | 多链汇合/矛盾分析→净推荐 |
| `stock_map` | Step 6 | 行业结论→美股ticker/ETF映射(16个行业) |

## 2 个 Skill（提示词增强）

| Skill | 用途 |
|-------|------|
| `butterfly-effect-chain.md` | 因果链构建方法论、质量检查、推理模式库 |
| `cross-domain-reasoning.md` | 7大学科推理手册 + 学科桥接矩阵 + 交叉验证框架 |

## 工作流

```
用户: "I sneezed today"
  │
  ├─ butterfly_analyze → 事件=生理现象, 方向=[Pharma, Healthcare, Wellness]
  ├─ causal_chain_build → 3-5个推理链模板
  ├─ LLM填充链条步骤（多学科推理）
  ├─ chain_validate × N + historical_echo（并行）
  ├─ chain_confluence → 净推荐
  ├─ stock_map → LLY, PFE, UNH, XLV...
  ├─ [外部] 取行情 + 搜新闻
  └─ 生成洞察报告
```

## 在 Cursor/Claude 中使用

### MCP 配置

在 `~/.cursor/mcp.json` 或项目的 `.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "mr-if": {
      "command": "node",
      "args": ["/path/to/mr.if/dist/index.js"]
    }
  }
}
```

开发模式用 tsx：

```json
{
  "mcpServers": {
    "mr-if": {
      "command": "npx",
      "args": ["tsx", "/path/to/mr.if/src/index.ts"]
    }
  }
}
```

## 覆盖范围

### 事件类型（9类）
Physiological, Weather, Economic, Social, Technology, Policy, Nature, Daily Observation, Geopolitical

### 美股行业（16个板块）
Pharma, Healthcare Services, Energy, Clean Energy, Tech/AI, Consumer Staples, Consumer Discretionary, Financials, Industrials, Materials, Safe Haven/Gold, Agriculture, Real Estate, Utilities, Communication, Cybersecurity, Crypto, Macro/Market

### 历史案例库（12个经典案例）
COVID-2020, SARS-2003, Texas Freeze 2021, Hurricane Katrina 2005, Russia-Ukraine 2022, US-China Trade War 2018, Fed Pivot 2023, SVB Collapse 2023, Suez Canal 2021, ChatGPT Launch 2022, GLP-1 Mania 2023, US Drought 2012

## 项目结构

```
mr.if/
├── src/
│   ├── index.ts                     # MCP Server 入口
│   └── tools/
│       ├── butterfly-analyze.ts      # 输入解析器
│       ├── causal-chain-builder.ts   # 因果链构建器
│       ├── chain-validator.ts        # 链条验证器
│       ├── historical-echo.ts        # 历史案例库
│       ├── chain-confluence.ts       # 多链汇合器
│       └── stock-mapper.ts           # 美股映射器
├── skills/
│   ├── butterfly-effect-chain.md     # 蝴蝶效应推理方法论
│   └── cross-domain-reasoning.md     # 跨学科推理手册
├── prompts/
│   └── system-prompt.md              # 完整系统提示词
├── package.json
├── tsconfig.json
├── PLAN.md                           # 架构规划文档
└── README.md
```

## License

MIT
