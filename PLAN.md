# Mr.IF — 蝴蝶效应金融推理 Agent

## 一、项目定位

**Mr.IF** 是一个基于"蝴蝶效应"思维的金融推理 Agent。

用户输入一个日常观察（如"打喷嚏"、"天气冷了"、"油价涨了"），Agent 通过多学科因果推理链，推导出可能的金融市场影响，最终给出值得关注的**美股**标的建议。

**事件范围**：美国本土 + 全球性事件（不单独看其他国家）
**标的范围**：美股（NYSE / NASDAQ），包括个股和ETF

---

## 二、工具分工总览

```
┌─────────────────────────────────────────────────────────┐
│                     Mr.IF Agent                         │
│                   (系统提示词编排)                        │
├─────────────────────┬───────────────────────────────────┤
│  Mr.IF MCP (本项目)  │     外部已有工具（2个）             │
│  6个推理工具         │     提示词调度，不用重新做            │
├─────────────────────┼───────────────────────────────────┤
│                     │                                   │
│ 🦋 butterfly_analyze│  🔍 网络检索工具                    │
│    输入解析/分类     │     搜新闻/搜事实/搜历史案例         │
│                     │                                   │
│ 🔗 causal_chain_build│ 📊 取数工具                       │
│    因果链模板构建     │     股价/K线/成交量/基本面          │
│                     │                                   │
│ ✅ chain_validate    │                                   │
│    链条验证/评分     │                                   │
│                     │                                   │
│ 📚 historical_echo  │                                   │
│    历史蝴蝶效应案例库│                                   │
│                     │                                   │
│ 🔄 chain_confluence │                                   │
│    多链汇合分析      │                                   │
│                     │                                   │
│ 🎯 stock_map        │                                   │
│    结论→美股映射     │                                   │
│                     │                                   │
└─────────────────────┴───────────────────────────────────┘
```

### Mr.IF MCP 自有工具（6个）

| # | 工具名 | 类型 | 职责 | 对应Step |
|---|--------|------|------|----------|
| 1 | `butterfly_analyze` | 解析器 | 解析用户输入→分类事件类型→识别推理方向 | Step 2 |
| 2 | `causal_chain_build` | 推理器 | 匹配推理模板→给LLM结构化的链条构建指引 | Step 3 |
| 3 | `chain_validate` | 验证器 | 对因果链做多维度打分→置信度/风险评级 | Step 4-5 |
| 4 | `stock_map` | 映射器 | 行业关键词→美股龙头股/ETF清单 | Step 5→6 |
| 5 | `historical_echo` | 案例库 | 查找历史上类似蝴蝶效应案例→为推理链提供先例佐证 | Step 4 |
| 6 | `chain_confluence` | 聚合器 | 多条链指向同一/矛盾结论时→汇合分析+净结论 | Step 5→7 |

### 外部已有工具（2个，提示词约束调用）

| 工具 | 何时调用 |
|------|----------|
| **网络检索工具** | ① chain_validate 之后搜新闻/事实验证假设；② historical_echo 无匹配时搜历史案例；③ 用户输入涉及近期事件时搜最新进展 |
| **取数工具** | stock_map 返回 ticker 后，拉实时行情/走势/基本面 |

- **报告生成**：完全由提示词控制格式，不需要单独工具

---

## 三、7步工作流（修订版）

```
Step 1: 用户输入 "I sneezed today"
        │
        ▼
Step 2: [MCP] butterfly_analyze → 事件分类 + 推理方向
        │
        ▼
Step 3: [MCP] causal_chain_build → 推理链模板 → LLM填充具体步骤
        │
        ▼
Step 4: [MCP] chain_validate → 每条链打分
        │  同时
        │  [MCP] historical_echo → 查历史先例加持/削弱
        │
        ▼
Step 5: [MCP] chain_confluence → 汇合多条链，得出净结论
        │  Agent决策：哪些链可信？哪些该丢弃？
        │
        ▼
Step 6: [MCP] stock_map → 结论映射到美股标的
        │  [外部] 网络检索 → 搜索相关新闻验证推理链
        │  [外部] 取数工具 → 获取标的实时行情
        │
        ▼
Step 7: [提示词] Agent生成最终洞察报告
```

---

## 四、Skills 设计

### 新建 Skills（嵌入提示词/作为MCP Resource）

| Skill | 用途 |
|-------|------|
| `butterfly-effect-chain.md` | 蝴蝶效应推理方法论：链条构建规则、质量检查、反模式 |
| `cross-domain-reasoning.md` | 跨学科推理手册：7大学科的推理模式+桥接规则+案例 |

### 复用现有 Skills（提示词引用）

| 现有Skill | 在Mr.IF中的角色 |
|-----------|----------------|
| `tom-murphy-thinking` | 评估推理链结论的投资价值时参考Murphy框架 |
| `gpt-researcher` | 需要深度研究某个因果环节时调用 |
| `mgrep` | 快速验证推理链假设时做网络搜索 |

---

## 五、交付清单

- [x] 系统提示词 (`prompts/system-prompt.md`)
- [x] 蝴蝶效应推理链 Skill (`skills/butterfly-effect-chain.md`)
- [x] 跨学科推理器 Skill (`skills/cross-domain-reasoning.md`)
- [x] `butterfly_analyze` — 输入解析器
- [x] `causal_chain_build` — 因果链模板构建器
- [x] `chain_validate` — 链条验证评分器
- [x] `stock_map` — 美股标的映射器
- [ ] `historical_echo` — 历史蝴蝶效应案例库
- [ ] `chain_confluence` — 多链汇合分析器
- [ ] 更新 `index.ts` 入口
- [ ] 更新 `system-prompt.md` 加入内部工具调度规则
- [ ] README 使用文档
