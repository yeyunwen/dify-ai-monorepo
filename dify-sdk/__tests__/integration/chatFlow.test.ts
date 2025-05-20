import { beforeAll, describe, expect, it } from 'vitest';

import { ChatClient } from '../../src/chatClient';
import { DifyClient } from '../../src/difyClient';
import { Conversations } from '../../src/type';

// 使用环境变量或默认值
const API_KEY = process.env.DIFY_API_KEY || 'your-api-key';
const API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';

// 跳过集成测试，除非设置了环境变量
const runTest = process.env.RUN_INTEGRATION_TESTS === 'true';
(runTest ? describe : describe.skip)('聊天流程集成测试', () => {
  let chatClient: ChatClient;
  let difyClient: DifyClient;
  let conversationId: string;
  let messageId: string;

  beforeAll(() => {
    chatClient = new ChatClient(API_KEY, API_URL);
    difyClient = new DifyClient(API_KEY, API_URL);
  });

  it('获取应用参数和元数据', async () => {
    const parametersResponse = await difyClient.getApplicationParameters();
    expect(parametersResponse.data).toHaveProperty('opening_statement');

    const metaResponse = await difyClient.getMeta();
    expect(metaResponse.data).toHaveProperty('tool_icons');
  });

  it('创建聊天消息', async () => {
    const response = await chatClient.createChatMessage({
      inputs: {},
      query: '你好，请介绍一下自己',
      user: 'test-user',
      response_mode: 'blocking',
    });

    expect(response).toHaveProperty('answer');
    expect(response).toHaveProperty('conversation_id');
    expect(response).toHaveProperty('message_id');

    // 保存会话ID和消息ID用于后续测试
    conversationId = response.conversation_id;
    messageId = response.message_id;
  });

  it('获取会话列表', async () => {
    const response = await chatClient.getConversations({
      user: 'test-user',
    });

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.data)).toBe(true);

    // 验证刚才创建的会话是否在列表中
    if (response.data.data.length > 0) {
      const found = response.data.data.some(
        (conversation: Conversations) => conversation.id === conversationId,
      );
      expect(found).toBe(true);
    }
  });

  it('给消息添加反馈', async () => {
    if (!messageId) {
      throw new Error('没有可用的消息ID');
    }

    const response = await difyClient.messageFeedback(
      messageId,
      'like',
      'test-user',
    );
    expect(response.data.result).toBe('success');
  });
});
