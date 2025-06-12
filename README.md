# Dify AI Monorepo

这是 Dify AI 项目的单一代码仓库，包含了多个相互关联的应用程序和库。

## 项目结构

```
dify-ai-monorepo/
├── dify-sdk/           # TypeScript SDK，用于与 Dify API 交互
├── server/             # 后端服务器
├── miniprogram/        # 小程序客户端
├── scripts/            # 辅助脚本和工具
├── .husky/             # Git hooks 配置
└── node_modules/       # 共享依赖
```

## 主要组件

### Dify SDK 🚧

TypeScript 编写的官方 SDK，提供了与 Dify API 交互的简洁接口。支持所有 Dify API 端点，包括聊天、完成、工作流等功能，以及流式响应处理。

**状态：建设中**

特性:

- 完整的 TypeScript 类型定义
- 支持所有 Dify API 端点
- 简化的流式数据处理
- 分离的客户端类 (DifyClient, ChatClient, CompletionClient, WorkflowClient)

### 服务器 🔮

后端服务器提供 API 服务， AI 模型的交互。

**状态：建设中**

### 小程序 📱

微信小程序客户端，提供小程序用户界面，允许用户与 Dify AI 服务交互。

**状态：建设中**

## 开始使用

### 环境要求

- Node.js 18.x 或更高版本
- pnpm 8.x 或更高版本

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/dify-ai-monorepo.git
cd dify-ai-monorepo

# 安装依赖
pnpm install
```

### 开发各个组件

```bash
# 开发 SDK
cd dify-sdk
pnpm build

# 运行服务器
cd server
pnpm dev

# 开发小程序
cd miniprogram
# 使用微信开发者工具打开
```

## 测试

每个组件都有自己的测试套件：

```bash
# 测试 SDK
cd dify-sdk
pnpm test

# 测试覆盖率
pnpm coverage
```

## 技术栈

- **前端**: Taro, 微信小程序
- **SDK**: TypeScript, Axios
- **后端**: Node.js, Express/Nest.js
- **工具链**: pnpm, ESLint, Prettier, Husky, Vitest

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

请确保在提交前运行测试并遵循代码规范。

## 许可证

MIT 许可证
