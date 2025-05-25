import { http, HttpResponse } from 'msw';

import {
  ChatCompletionResponse,
  ResponseModeType,
} from '../../src/client/type';
import { MessageEndEvent, MessageEvent } from '../../src/utils/streamResponse';

// 模拟的 Dify API 响应
export const handlers = [
  // 获取元数据
  http.get('*/meta', () => {
    return HttpResponse.json({
      tool_icons: {
        test_icon: 'test_icon_url',
      },
    });
  }),

  // 获取应用参数
  http.get('*/parameters', () => {
    return HttpResponse.json({
      opening_statement: '你好，我是一个测试助手',
      suggested_questions: ['问题1', '问题2'],
      suggested_questions_after_answer: {
        enable: true,
      },
      // 其他参数...
    });
  }),

  // 聊天消息
  http.post('*/chat-messages', async ({ request }) => {
    // 解析请求体以获取response_mode
    const body = (await request.json()) as { response_mode?: ResponseModeType };
    const responseMode = body.response_mode;

    if (responseMode === 'streaming') {
      // 对于流式响应，返回一个可读流
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // 发送消息事件
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                event: 'message',
                task_id: 'test-task-id',
                message_id: 'test-message-id',
                conversation_id: 'test-conversation-id',
                answer: '这是一段',
                created_at: Date.now(),
              } as MessageEvent)}\n\n`,
            ),
          );

          // 发送更多内容
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  event: 'message',
                  task_id: 'test-task-id',
                  message_id: 'test-message-id',
                  conversation_id: 'test-conversation-id',
                  answer: '测试回答',
                  created_at: Date.now(),
                } as MessageEvent)}\n\n`,
              ),
            );
          }, 50);

          // 发送消息结束事件
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
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
                    retriever_resources: [],
                  },
                } as MessageEndEvent)}\n\n`,
              ),
            );

            controller.close();
          }, 100);
        },
      });

      return new HttpResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // 对于阻塞式响应，返回JSON
      return HttpResponse.json({
        event: 'message',
        task_id: 'test-task-id',
        id: 'test-id',
        message_id: 'test-message-id',
        conversation_id: 'test-conversation-id',
        mode: 'chat',
        answer: '这是一个测试回答',
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
          retriever_resources: [],
        },
        created_at: Date.now(),
      } as ChatCompletionResponse);
    }
  }),

  // 工作流运行
  http.post('*/workflow/runs', () => {
    return HttpResponse.json({
      workflow_run_id: 'test-workflow-run-id',
      task_id: 'test-task-id',
      data: {
        id: 'test-id',
        workflow_id: 'test-workflow-id',
        status: 'succeeded',
        outputs: { result: '工作流运行成功' },
        total_steps: 2,
        created_at: Date.now(),
        finished_at: Date.now() + 1000,
      },
    });
  }),

  // 文件上传
  http.post('*/files/upload', () => {
    return HttpResponse.json({
      id: 'test-file-id',
      name: 'test-file.txt',
      size: 1024,
      extension: 'txt',
      mime_type: 'text/plain',
      created_by: 'test-user',
      created_at: Date.now(),
      preview_url: null,
    });
  }),

  // 添加到 handlers.ts 中的数组
  http.get('*/messages/*/suggested*', () => {
    return HttpResponse.json({
      result: 'success',
      data: ['建议问题1', '建议问题2'],
    });
  }),

  http.get('*/conversations*', () => {
    return HttpResponse.json({
      limit: 20,
      has_more: false,
      data: [
        {
          id: 'test-conversation-id',
          inputs: {},
          introduction: '测试会话',
          name: '测试会话',
          status: 'normal',
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ],
    });
  }),

  // 处理其他 API 端点...
];
