# Dify TypeScript SDK

基于 TypeScript 的 Dify API 客户端，提供完善的类型定义和流式处理支持。

## 特性

- 完整的 TypeScript 类型定义
- 支持所有 Dify API 端点
- 简化的流式数据处理
- 分离的客户端类 (DifyClient, ChatClient, CompletionClient, WorkflowClient)
- 支持 ESM 和 CommonJS

## 安装

```bash
npm install dify-sdk
# 或
yarn add dify-sdk
# 或
pnpm add dify-sdk
```

## 使用方法

### 基本使用

```typescript
import { ChatClient } from 'dify-sdk';

// 创建客户端实例
const client = new ChatClient('你的_API_KEY');

// 发送聊天消息
const response = await client.createChatMessage({
  inputs: {},
  query: '你好，请介绍一下你自己',
  user: 'user_123',
});

console.log(response.data);
```

### 流式响应处理

```typescript
import { ChatClient } from 'dify-sdk';

const client = new ChatClient('你的_API_KEY');

// 使用流式响应
await client.createChatMessage(
  {
    inputs: {},
    query: '你好，请介绍一下你自己',
    user: 'user_123',
    response_mode: 'streaming',
  },
  {
    onMessage: (message) => {
      console.log('收到消息:', message);
    },
    onError: (error) => {
      console.error('发生错误:', error);
    },
    onComplete: () => {
      console.log('流式响应完成');
    },
  },
);
```

### 文件上传

```typescript
import { DifyClient } from 'dify-sdk';

const client = new DifyClient('你的_API_KEY');

// 创建 FormData 对象
const formData = new FormData();
formData.append('file', fileBlob);

// 上传文件
const response = await client.fileUpload(formData);
const fileId = response.data.id;

// 在聊天消息中使用文件
const chatClient = new ChatClient('你的_API_KEY');
await chatClient.createChatMessage({
  inputs: {},
  query: '请分析这个文件的内容',
  user: 'user_123',
  files: [fileId],
});
```

## 可用客户端

- `DifyClient`: 基础客户端，提供通用方法
- `ChatClient`: 聊天型应用客户端
- `CompletionClient`: 完成型应用客户端
- `WorkflowClient`: 工作流客户端

## 许可证

MIT
