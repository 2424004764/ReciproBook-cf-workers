# ReciproBook API

人情账本微信小程序的 Cloudflare Workers 后端 API 服务。

## 技术栈

- 运行时: Cloudflare Workers
- 框架: Hono v4 + @hono/zod-openapi
- 语言: TypeScript
- 数据库: Cloudflare D1 (SQLite)
- 工具链: Wrangler

## 项目结构

```
src/
├── index.ts              # 入口：创建 Hono app，挂载路由
├── types.ts              # 类型定义 (AppEnv)
├── routes/
│   ├── index.ts          # 路由层：注册所有 API 路径
│   ├── user.route.ts     # 用户登录路由
│   └── record.route.ts   # 人情记录路由
├── controllers/
│   ├── user.controller.ts  # 用户控制器
│   └── record.controller.ts # 记录控制器
├── services/
│   ├── user.service.ts   # 用户业务逻辑（微信登录、D1 读写）
│   └── record.service.ts # 记录业务逻辑
├── models/
│   ├── user.model.ts     # User 类型
│   └── record.model.ts   # Record 类型 + DB↔API 格式转换
├── middleware/
│   └── auth.ts           # JWT 认证中间件
├── utils/
│   ├── jwt.ts            # JWT 签名/验证（HS256）
│   └── response.ts       # 响应格式工具
└── sql/
    ├── users.sql         # 用户表 DDL
    └── rq_records.sql    # 记录表 DDL
```

## 分层职责

| 层 | 职责 |
|----|------|
| 路由层 (routes) | 定义路径、HTTP 方法、OpenAPI schema |
| 控制器层 (controllers) | 解析请求参数、校验输入、返回响应 |
| Service 层 (services) | 业务逻辑、D1 数据库访问 |
| Model 层 (models) | TypeScript 接口和格式转换 |

## API 接口

### 公开接口
- `POST /api/user/login` — 微信小程序登录，返回 JWT token

### 受保护接口 (需 Bearer token)
- `GET /api/records/summary` — 统计 (totalIn, totalOut, balance, count)
- `GET /api/records` — 分页列表，支持 direction/type 筛选
- `GET /api/records/contacts` — 按联系人聚合
- `GET /api/records/contact/{contactName}` — 某联系人记录
- `GET /api/records/search?keyword=` — 关键词搜索
- `POST /api/records` — 添加记录
- `GET /api/records/{id}` — 获取单条
- `PUT /api/records/{id}` — 更新记录
- `DELETE /api/records/{id}` — 删除记录

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地开发 (wrangler dev) |
| `pnpm deploy` | 部署到 Cloudflare |
| `pnpm cf-typegen` | 根据 wrangler.jsonc 生成 TS 类型 |

修改 `wrangler.jsonc` 中的 bindings 后，运行 `pnpm cf-typegen` 更新类型。

## 环境变量

通过 `wrangler secret put` 设置：
- `JWT_SECRET` — JWT 签名密钥
- `WX_APPID` — 微信小程序 AppID
- `WX_SECRET` — 微信小程序 AppSecret

## 数据库

D1 数据库 `recipro-book`，包含两张表：

### users
| 列 | 类型 | 说明 |
|----|------|------|
| id | INTEGER PK | 用户ID |
| openid | TEXT UNIQUE | 微信 openid |
| last_login_at | TEXT | 最后登录时间 |
| created_at | TEXT | 创建时间 |

### rq_records
| 列 | 类型 | 说明 |
|----|------|------|
| id | INTEGER PK | 记录ID |
| user_id | INTEGER FK | 所属用户 |
| contact_name | TEXT | 联系人姓名 |
| amount | REAL | 金额 |
| direction | TEXT | in=收到 out=送出 |
| type | TEXT | 红包/礼物/随礼/请客/借款/还款/其他 |
| event_time | INTEGER | 事件时间戳 |
| occasion | TEXT | 场合 |
| remark | TEXT | 备注 |
| create_time | INTEGER | 创建时间 |
| update_time | INTEGER | 更新时间 |
