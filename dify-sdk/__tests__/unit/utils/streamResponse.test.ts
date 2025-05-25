import { Readable } from 'stream';
import { describe, expect, it, vi } from 'vitest';

import {
  ChatStreamHandler,
  type MessageEndEvent,
  type MessageEvent,
} from '../../../src/utils';

// 模拟流式响应的事件数据
const mockEvent: MessageEvent = {
  event: 'message',
  task_id: 'test-task-id',
  message_id: 'test-message-id',
  conversation_id: 'test-conversation-id',
  answer: '这是一段测试内容',
  created_at: Date.now(),
};

const mockEndEvent: MessageEndEvent = {
  event: 'message_end',
  task_id: 'test-task-id',
  id: 'test-id',
  message_id: 'test-message-id',
  conversation_id: 'test-conversation-id',
  metadata: {
    usage: {
      prompt_tokens: 10,
      prompt_unit_price: '0.001',
      prompt_price_unit: 'USD',
      prompt_price: '0.00001',
      completion_tokens: 20,
      completion_unit_price: '0.002',
      completion_price_unit: 'USD',
      completion_price: '0.00004',
      total_tokens: 30,
      total_price: '0.00005',
      currency: 'USD',
      latency: 1000,
    },
  },
};

// 创建模拟的可读流
class MockStream extends Readable {
  constructor(options = {}) {
    super(options);
  }

  // 实现 _read 方法（必须）
  _read() {}

  // 添加便捷方法来发送事件
  sendEvent(event: any) {
    this.push(`data: ${JSON.stringify(event)}\n\n`);
    return this;
  }

  // 结束流
  endStream() {
    this.push(null);
    return this;
  }
}

describe('StreamResponse', () => {
  describe('ChatStreamHandler', () => {
    it('应正确处理消息事件', async () => {
      // 创建模拟流
      const mockStream = new MockStream();

      // 创建处理器
      const handler = new ChatStreamHandler(mockStream);

      // 模拟回调函数
      const onMessageMock = vi.fn();
      const onMessageEndMock = vi.fn();

      // 注册事件处理器
      handler.onMessage(onMessageMock);
      handler.onMessageEnd(onMessageEndMock);

      // 模拟消息事件和消息结束事件
      mockStream.sendEvent(mockEvent).sendEvent(mockEndEvent).endStream();

      // 等待流处理完成
      await handler.waitForCompletion();

      // 验证回调是否被调用
      expect(onMessageMock).toHaveBeenCalledTimes(1);
      expect(onMessageEndMock).toHaveBeenCalledTimes(1);
    });
  });
});
