import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChatClient } from '../../../src/client/chat';
import { server } from '../../mocks/server';

// 开始模拟服务器
beforeAll(() => server.listen());
// 每次测试后重置处理器
afterEach(() => server.resetHandlers());
// 测试完成后关闭服务器
afterAll(() => server.close());

describe('ChatClient', () => {
  const client = new ChatClient('test-api-key', 'http://localhost/v1');

  it('创建实例时应正确设置属性', () => {
    expect(client).toBeInstanceOf(ChatClient);
  });

  it('can create chat message', async () => {
    const response = await client.createChatMessage({
      inputs: {},
      query: '测试问题',
      user: 'test-user',
      response_mode: 'blocking',
    });

    expect(response).toHaveProperty('answer');
    expect(response.message_id).toBe('test-message-id');
  });

  it('can create chat message with stream', async () => {
    const response = await client.createChatMessage({
      inputs: {},
      query: '测试问题',
      user: 'test-user',
      response_mode: 'streaming',
    });

    // 验证它包含预期的方法
    expect(typeof response.onMessage).toBe('function');
    expect(typeof response.onMessageEnd).toBe('function');
    expect(typeof response.onMessageFile).toBe('function');
    expect(typeof response.onTtsMessage).toBe('function');
    expect(typeof response.onTtsMessageEnd).toBe('function');
    expect(typeof response.onMessageReplace).toBe('function');
    expect(typeof response.onErrorEvent).toBe('function');
    expect(typeof response.waitForCompletion).toBe('function');

    // 可以进一步测试链式调用
    const chainedResponse = response.onMessage(() => {}).onMessageEnd(() => {});

    // 确认链式调用返回相同的实例
    expect(chainedResponse).toBe(response);
  });

  it('应能获取建议问题', async () => {
    const response = await client.getSuggested(
      'test-conversation-id',
      'test-user',
    );
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('应能获取会话列表', async () => {
    const response = await client.getConversations({
      user: 'test-user',
    });

    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
