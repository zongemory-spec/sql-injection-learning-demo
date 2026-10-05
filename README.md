# SQL Injection Learning Demo

A local React/TypeScript visualization of unsafe SQL string construction and authentication bypass patterns.

数据库课程演示：展示用户名/密码拼接进 SQL 后的查询形态与模拟结果。数据均为虚构档案；`database.ts` 使用 JavaScript 规则模拟查询，**没有连接真实 SQL 数据库**。

## Run

Node.js 22+:

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run build
```

Use the on-screen sample inputs to compare a normal login with deliberately unsafe query construction. The public demo uses static fictional archive content and does not require an LLM key. Styling currently loads Tailwind/fonts from CDNs, so a full visual preview needs internet access.

## Scope and limitations

This is a teaching simulator, not a SQL engine, penetration-testing utility or secure login implementation. Pattern matching does not reproduce all database behavior and is not a recommended SQL-injection defense. Real applications should use parameterized queries and independently enforce authentication and authorization.

The original source folders omitted the build manifest and had an import-path mismatch. Publication preparation adds a reproducible Vite entry point and offline fixtures. Original versions remain in snapshot/history records.

## Development and provenance

This is an educational project developed with AI assistance. See [source history](docs/SOURCE_HISTORY.md) for the original records and local version snapshots. Imported commits are not backdated. Follow [CONTRIBUTING](CONTRIBUTING.md) for future changes.

本项目用于课程学习与求职作品展示，开发和本次仓库整理使用了 AI 辅助。可运行代码与验证记录不等于所有代码均由本人独立手写，也不代表生产系统经验。历史说明中的本机路径与旧验收记录仅供追溯。
