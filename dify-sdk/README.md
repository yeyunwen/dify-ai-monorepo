# Dify TypeScript SDK

✨ 基于 TypeScript 的 Dify API SDK，提供完善的类型定义和便捷的流式处理支持。

📝 版本变更日志请看：[CHANGELOG.md](https://github.com/yeyunwen/dify-ai-monorepo/blob/main/dify-sdk/CHANGELOG.md)。

👀 关于dify API 详细内容，可以查看官方文档：[访问 API](https://docs.dify.ai/api-reference/)。

## 特性

- 完整的 TypeScript 类型定义
- 支持所有 Dify API 端点
- 简化的流式数据处理
- 分离的客户端类 (DifyClient, ChatClient, CompletionClient, WorkflowClient)
- 支持 ESM 和 CommonJS

## 安装

```bash
npm install dify-node-sdk
# 或
yarn add dify-node-sdk
# 或
pnpm add dify-node-sdk
```

## 使用方法

### 基本使用

```typescript
import { ChatClient } from 'dify-node-sdk';

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
import { ChatClient } from 'dify-node-sdk';

const client = new ChatClient('YOU_API_KEY', 'YOU_BASE_URL');

// 使用流式响应
const resp =  await client.createChatMessage(
  {
    inputs: {},
    query: '你好，请介绍一下你自己',
    user: 'user_123',
    response_mode: 'streaming',
  },
);
// 源码内的类型
export type EventType =
  | 'workflow_started'
  | 'workflow_finished'
  | 'node_started'
  | 'node_finished'
  | 'message'
  | 'message_end'
  | 'tts_message'
  | 'tts_message_end';
  // ...

resp.onMessage = (message) => {
  console.log('message', message)
}
resp.onNodeStarted = (message) => {
  console.log('message', message)
}
// 注意：v0.0.6开始必须要调用start方法启动数据读取，防止在注册事件前的数据丢失
resp.start()

// or chain
resp
  .onMessageEnd = (message) => {
    console.log('message', message)
  }
  .onWorkflowStarted = (message) => {
    console.log('message', message)
  }.start()
```

### 文件上传

```typescript
import { DifyClient } from 'dify-node-sdk';

const client = new DifyClient('你的_API_KEY');

// 创建 FormData 对象
const formData = new FormData();
formData.append('file', fileBlob);

// 上传文件
const response = await client.fileUpload(formData);
const fileId = response.data.id;

// 在聊天消息中使用文件
const chatClient = new ChatClient('YOU_API_KEY', 'YOU_BASE_URL');
await chatClient.createChatMessage({
  inputs: {},
  query: '请分析这个文件的内容',
  user: 'user_123',
  files: [fileId],
});
```

## 许可证

MIT
