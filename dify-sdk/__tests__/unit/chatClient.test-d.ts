import { expectTypeOf } from 'vitest';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

import { ChatClient } from '../../src/chatClient';
import { ChatCompletionResponse } from '../../src/type';
import {
  ChatStreamHandler,
  ErrorEvent,
  MessageEndEvent,
  MessageEvent,
  MessageFileEvent,
  MessageReplaceEvent,
  TTSMessageEndEvent,
  TTSMessageEvent,
} from '../../src/utils';
import { server } from '../mocks/server';

// 开始模拟服务器
beforeAll(() => server.listen());
// 每次测试后重置处理器
afterEach(() => server.resetHandlers());
// 测试完成后关闭服务器
afterAll(() => server.close());

describe('ChatClient', () => {
  const client = new ChatClient('test-api-key', 'http://localhost/v1');

  it('can create chat message', async () => {
    const response = await client.createChatMessage({
      inputs: {},
      query: '测试问题',
      user: 'test-user',
      response_mode: 'blocking',
    });

    expectTypeOf(response).toEqualTypeOf<ChatCompletionResponse>();
  });

  it('test ChatStreamHandler event type', async () => {
    const response = await client.createChatMessage({
      inputs: {},
      query: '测试问题',
      user: 'test-user',
      response_mode: 'streaming',
    });

    expectTypeOf(response).toEqualTypeOf<ChatStreamHandler>();

    response.onMessage((event) => {
      expectTypeOf(event).toEqualTypeOf<MessageEvent>();
    });
    response.onMessageEnd((event) => {
      expectTypeOf(event).toEqualTypeOf<MessageEndEvent>();
    });
    response.onMessageFile((event) => {
      expectTypeOf(event).toEqualTypeOf<MessageFileEvent>();
    });
    response.onTtsMessage((event) => {
      expectTypeOf(event).toEqualTypeOf<TTSMessageEvent>();
    });
    response.onTtsMessageEnd((event) => {
      expectTypeOf(event).toEqualTypeOf<TTSMessageEndEvent>();
    });
    response.onMessageReplace((event) => {
      expectTypeOf(event).toEqualTypeOf<MessageReplaceEvent>();
    });
    response.onErrorEvent((event) => {
      expectTypeOf(event).toEqualTypeOf<ErrorEvent>();
    });
  });
});
