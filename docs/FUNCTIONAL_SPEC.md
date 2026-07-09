# Influencer Dashboard 功能说明

本文档描述 Influencer Dashboard 项目的**当前业务逻辑与页面行为**。  
最后更新：2026-07-09（一致性整理版）

---

## 1. 项目概览

Shopify 嵌入式 CRM，管理创作者（Influencer / Creator）合作关系。

| 页面 | 路由 |
|------|------|
| Dashboard | `/` |
| Add Creator | `/creators/new` |
| Creator Detail | `/creators/:id` |

本地开发：`LOCAL_DEV=true`，前端 `http://localhost:5173`，后端 `http://localhost:3000`。

---

## 2. 单一数据源：`lib/ambassadorLevel.js`

**Ambassador Level 全应用统一由 `total_followers` 计算。**

前端通过 `@lib/ambassadorLevel.js`（Vite alias）引用同一份逻辑；后端在 `lib/creatorProfile.js` 保存时写入 DB，并在 API 响应中用 `enrichInfluencerRecord()` 覆盖展示值。

### 2.1 级别阈值

| 总粉丝数 (`total_followers`) | Ambassador Level |
|------------------------------|------------------|
| 0 – 99,999 | Creator Sponsorship |
| 100,000 – 499,999 | Ambassador 1 |
| 500,000 – 999,999 | Ambassador 2 |
| 1,000,000+ | Ambassador 3 |

### 2.2 使用位置（均已统一）

| 位置 | 行为 |
|------|------|
| Dashboard 表格 | `record.ambassador_level`（API 已 enrich） |
| Dashboard 筛选 / 排序 | 服务端 SQL 按 `total_followers` 区间 |
| Dashboard 导出 Excel | 同筛选参数 + 导出列用计算值 |
| Dashboard Stats `elevated_levels` | `total_followers >= 100,000` |
| Creator Detail 徽章 | `previewAmbassadorLevel(form)` 由 follower 计算 |
| Create / Update | `applyCreatorAutomation()` 自动写入 DB |
| Excel 列 Ambassador Level | `computeAmbassadorLevelFromFollowers(total_followers)` |

> DB 中 `ambassador_level` 列仍保留，但在每次保存与读取时与 follower 规则同步，**不再作为独立手动字段**。

---

## 3. Primary Channel（主渠道）

**方案 B：始终动态计算，不持久化到数据库。**

实现：`lib/primaryChannel.js` → 客户端 `derivePrimaryChannel(form)`

规则：取 **follower 数最高** 的平台名称；若全部为 0 → `Not selected`。

| 页面 | 展示 |
|------|------|
| Add Creator 预览 | Platform Summary 旁 Creator Preview |
| Creator Detail | Profile 卡片「Primary Channel」行 |

Add Creator 与 Creator Detail 使用同一函数，结果一致。

---

## 4. Dashboard

### 4.1 指标卡片（Stats）

`GET /api/influencers/stats/summary`

| 指标 | 规则 |
|------|------|
| Total creators | 全店 COUNT |
| Active influencers | status IN ('Active Ambassador', 'Partnered') |
| In discussion | status IN ('Applied', 'Contacted', 'Call Scheduled', 'Under Review') |
| Contract signed | status IN ('Active Ambassador', 'Partnered', 'Approved') |
| Total followers | SUM(total_followers) |
| **Elevated levels** | **total_followers >= 100,000**（Ambassador 1/2/3） |
| **Overdue follow-ups** | **next_followup_at < NOW()** |
| **Due in 7 days** | **next_followup_at >= NOW() AND <= NOW() + 7 days**（不含 overdue） |

KPI 区域下方说明：**Store-wide totals — not affected by table filters below.**

Stats 不受表格筛选影响，但 Ambassador 级别逻辑与表格一致。

### 4.2 筛选器

全部使用 `ToolbarPopoverSelect`（Popover + OptionList），Chevron 固定于右侧 12px。

| 筛选器 | 执行位置 | API 参数 |
|--------|----------|----------|
| Status | 服务端 | `status` |
| Ambassador Level | 服务端 | `ambassador_level`（SQL 按 follower 区间） |
| Platform | 服务端 | `platform`（youtube_url / instagram_url 等） |
| Next Follow-up | 服务端 | `due` = 未来 7 天内；`overdue` = 已过期（不含在 7 天筛选中） |
| Commission | 服务端 | `commission` |
| Search | 服务端（350ms 防抖） | `search` |

**Clear filters** 重置全部筛选。

### 4.3 导出

`Export Excel` 调用 `GET /api/influencers/export/xlsx`，传递**与表格相同的 `appliedFilters`**（含 platform、ambassador_level、search、status、commission、due_followup、sort）。

**所见即所导。**

### 4.4 表格列

Creator · Status · Ambassador Level · Platforms · Followers · Last Verified（仅时间）· Last Contact · Next Follow-up

- 无行内操作列；点击行进入详情。
- 分页：客户端 10/20/50，服务端返回全量筛选结果后切片。

---

## 5. 粉丝数与 Last Verified

- `total_followers` = 四平台 follower 之和（保存时自动计算）。
- `followers_last_verified_at`：创建/更新时若 follower 数变化则自动写入；否则保留原值。

---

## 6. Status（合作状态）

可选：Applied, Contacted, Call Scheduled, Under Review, Approved, Rejected, Active Ambassador, Past Partner, Partnered (legacy)

| 场景 | 默认值 |
|------|--------|
| Add Creator 表单 | **Applied** |
| `buildSavePayload` | **Applied**（与表单一致） |
| 服务端 `normalizeProfilePayload` 缺省 | **Applied** |

表单显示值 = 数据库存储值。

---

## 7. Create / Edit / Delete

### Create
1. 校验 `name` 必填
2. `POST /api/influencers`，status 来自表单（默认 Applied）
3. 服务端计算 `total_followers`、`ambassador_level`
4. 跳转 Detail + success Banner（3 秒）

### Edit
1. `PUT /api/influencers/:id`
2. 保存后重新 enrich ambassador_level
3. Primary Channel / Level 随 follower 更新

### Delete
Footer Delete → 确认 → 回 Dashboard

---

## 8. Monthly Progress / Recent Activity

- **Monthly Progress**：5 个 Period，字段 monthly_check_in / content_delivered / link
- **Recent Activity**：客户端合成时间线（Followers updated、Status、Notes、Creator added）

---

## 9. 关键文件

| 功能 | 文件 |
|------|------|
| Ambassador Level 规则 | `lib/ambassadorLevel.js` |
| Primary Channel 规则 | `lib/primaryChannel.js` |
| 保存时自动化 | `lib/creatorProfile.js` |
| API 路由 / 筛选 / Stats | `routes/influencers.js` |
| 导出 | `lib/influencersExport.js` |
| 前端常量 / 表单 | `client/src/constants.js` |
| Dashboard | `client/src/pages/DashboardPage.jsx` |
| 筛选 UI | `client/src/components/DashboardFilterBar.jsx` |
| 下拉组件 | `client/src/components/dashboard/ToolbarPopoverSelect.jsx` |

---

## 10. 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-09 | 全站 Ambassador Level 统一为 follower 计算；Export 与筛选一致；Primary Channel 动态计算；Status 默认值修复；Stats elevated_levels 修复；下拉 Chevron 固定 |
