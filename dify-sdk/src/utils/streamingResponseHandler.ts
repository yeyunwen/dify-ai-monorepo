// 各种事件的详细类型定义
export interface UsageMetadata {
  prompt_tokens: number;
  prompt_unit_price: string;
  prompt_price_unit: string;
  prompt_price: string;
  completion_tokens: number;
  completion_unit_price: string;
  completion_price_unit: string;
  completion_price: string;
  total_tokens: number;
  total_price: string;
  currency: string;
  latency: number;
}

export interface RetrieverResource {
  id: string;
  content: string;
  source?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}
// 定义基础事件类型
export interface BaseEvent<T extends string, D = unknown> {
  event: T;
  task_id?: string;
  workflow_run_id?: string;
  message_id?: string;
  conversation_id?: string;
  created_at?: number;
  data?: D;
}

export interface WorkflowStartedEvent
  extends BaseEvent<
    'workflow_started',
    {
      id: string;
      workflow_id: string;
      sequence_number: number;
      created_at: number;
    }
  > {}

export interface WorkflowFinishedEvent
  extends BaseEvent<
    'workflow_finished',
    {
      id: string;
      workflow_id: string;
      outputs: Record<string, unknown>;
      status: 'succeeded' | 'failed' | 'cancelled';
      elapsed_time: number;
      total_tokens: number;
      total_steps: string;
      created_at: number;
      finished_at: number;
    }
  > {}

export interface NodeStartedEvent
  extends BaseEvent<
    'node_started',
    {
      id: string;
      node_id: string;
      node_type: string;
      title: string;
      index: number;
      predecessor_node_id: string;
      inputs: Record<string, unknown>;
      created_at: number;
    }
  > {}

export interface NodeFinishedEvent
  extends BaseEvent<
    'node_finished',
    {
      id: string;
      node_id: string;
      node_type: string;
      title: string;
      index: number;
      predecessor_node_id: string;
      inputs: Record<string, unknown>;
      outputs: Record<string, unknown>;
      status: 'succeeded' | 'failed' | 'cancelled';
      elapsed_time: number;
      execution_metadata: {
        total_tokens: number;
        total_price: number;
        currency: string;
      };
      created_at: number;
    }
  > {}

export interface MessageEvent extends BaseEvent<'message', never> {
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface MessageEndEvent extends BaseEvent<'message_end', never> {
  id: string;
  conversation_id: string;
  metadata: {
    usage: UsageMetadata;
    retriever_resources?: RetrieverResource[];
  };
}

export interface TTSMessageEvent extends BaseEvent<'tts_message', never> {
  conversation_id: string;
  message_id: string;
  task_id: string;
  audio: string;
}

export interface TTSMessageEndEvent
  extends BaseEvent<'tts_message_end', never> {
  conversation_id: string;
  message_id: string;
  task_id: string;
  audio: string;
}

// 所有可能的事件类型
export type ChatStreamEvent =
  | WorkflowStartedEvent
  | WorkflowFinishedEvent
  | NodeStartedEvent
  | NodeFinishedEvent
  | MessageEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent;

// 更精确的事件处理器类型
export type GenericEventHandler<T> = (event: T) => void;
export type ErrorHandler = (error: Error) => void;
export type CompletionHandler = () => void;

export type EventType =
  | 'workflow_started'
  | 'workflow_finished'
  | 'node_started'
  | 'node_finished'
  | 'message'
  | 'message_end'
  | 'tts_message'
  | 'tts_message_end';

// 将事件类型与事件对象类型映射起来
export type EventTypeToEvent = {
  workflow_started: WorkflowStartedEvent;
  workflow_finished: WorkflowFinishedEvent;
  node_started: NodeStartedEvent;
  node_finished: NodeFinishedEvent;
  message: MessageEvent;
  message_end: MessageEndEvent;
  tts_message: TTSMessageEvent;
  tts_message_end: TTSMessageEndEvent;
};

/**
 * 处理流式响应的类
 * 提供基于事件的响应处理机制
 */
export class StreamingResponseHandler {
  private readonly eventHandlers: Map<EventType, GenericEventHandler<any>[]> =
    new Map();
  private readonly genericMessageHandlers: GenericEventHandler<ChatStreamEvent>[] =
    [];
  private readonly errorHandlers: ErrorHandler[] = [];
  private readonly completionHandlers: CompletionHandler[] = [];
  private readonly stream: NodeJS.ReadableStream;
  private readonly timeout?: NodeJS.Timeout;
  private isStopped = false;

  /**
   * 创建流式响应处理器
   * @param stream 响应流对象
   * @param timeoutMs 可选的超时时间（毫秒）
   */
  constructor(stream: NodeJS.ReadableStream, timeoutMs?: number) {
    this.stream = stream;

    if (timeoutMs) {
      this.timeout = setTimeout(() => {
        this.handleTimeout();
      }, timeoutMs);
    }

    this.processStream();
  }

  /**
   * 处理超时
   */
  private handleTimeout(): void {
    if (!this.isStopped) {
      this.emitError(new Error('Response stream timeout'));
      this.stop();
    }
  }

  /**
   * 处理流内容
   */
  private processStream(): void {
    let buffer = '';

    this.stream.on('data', (chunk: Buffer) => {
      if (this.isStopped) return;

      const str = chunk.toString();
      buffer += str;

      // 处理 SSE 格式的数据
      if (buffer.includes('\n\n')) {
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const data = part.slice(6);
            this.processData(data);
          }
        }
      }
    });

    this.stream.on('error', (err: Error) => {
      this.emitError(err);
    });

    this.stream.on('end', () => {
      // 处理缓冲区中可能剩余的数据
      if (buffer && buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        this.processData(data);
      }

      if (!this.isStopped) {
        this.emitCompletion();
        this.cleanUp();
      }
    });
  }

  /**
   * 处理单条数据
   */
  private processData(data: string): void {
    // if (data === '[DONE]') {
    //   this.emitCompletion();
    //   return;
    // }

    try {
      const parsed = JSON.parse(data) as ChatStreamEvent;
      this.dispatchEvent(parsed);
    } catch {
      // 对于无法解析的数据，作为原始消息处理
      if (data === 'data: ping') {
        return;
      }
      this.emitGenericMessage({
        event: 'message',
        data: data,
        created_at: Date.now(),
      } as unknown as ChatStreamEvent);
    }
  }

  /**
   * 分发事件到相应的处理器
   */
  private dispatchEvent(event: ChatStreamEvent): void {
    // 先调用通用消息处理器
    this.emitGenericMessage(event);

    // 根据事件类型调用特定处理器
    const eventType = event.event as EventType;
    if (eventType) {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers && handlers.length > 0) {
        handlers.forEach((handler) => handler(event));
      }
    }
  }

  private emitGenericMessage(message: ChatStreamEvent): void {
    this.genericMessageHandlers.forEach((handler) => handler(message));
  }

  private emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => handler(error));
  }

  private emitCompletion(): void {
    this.completionHandlers.forEach((handler) => handler());
  }

  private cleanUp(): void {
    this.isStopped = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * 注册原始消息类型的处理器
   */
  onOriginalMessage(handler: GenericEventHandler<ChatStreamEvent>): this {
    this.genericMessageHandlers.push(handler);
    return this;
  }

  /**
   * 注册工作流开始事件处理器
   */
  onWorkflowStarted(handler: GenericEventHandler<WorkflowStartedEvent>): this {
    this.registerEventHandler('workflow_started', handler);
    return this;
  }

  /**
   * 注册工作流完成事件处理器
   */
  onWorkflowFinished(
    handler: GenericEventHandler<WorkflowFinishedEvent>,
  ): this {
    this.registerEventHandler('workflow_finished', handler);
    return this;
  }

  /**
   * 注册节点开始事件处理器
   */
  onNodeStarted(handler: GenericEventHandler<NodeStartedEvent>): this {
    this.registerEventHandler('node_started', handler);
    return this;
  }

  /**
   * 注册节点完成事件处理器
   */
  onNodeFinished(handler: GenericEventHandler<NodeFinishedEvent>): this {
    this.registerEventHandler('node_finished', handler);
    return this;
  }

  /**
   * 注册消息事件处理器
   */
  onMessage(handler: GenericEventHandler<MessageEvent>): this {
    this.registerEventHandler('message', handler);
    return this;
  }

  /**
   * 注册消息结束事件处理器
   */
  onMessageEnd(handler: GenericEventHandler<MessageEndEvent>): this {
    this.registerEventHandler('message_end', handler);
    return this;
  }

  /**
   * 注册文本转语音消息事件处理器
   */
  onTtsMessage(handler: GenericEventHandler<TTSMessageEvent>): this {
    this.registerEventHandler('tts_message', handler);
    return this;
  }

  /**
   * 注册文本转语音结束事件处理器
   */
  onTtsMessageEnd(handler: GenericEventHandler<TTSMessageEndEvent>): this {
    this.registerEventHandler('tts_message_end', handler);
    return this;
  }

  /**
   * 注册错误处理器
   */
  onError(handler: ErrorHandler): this {
    this.errorHandlers.push(handler);
    return this;
  }

  /**
   * 注册完成处理器
   */
  onFinished(handler: CompletionHandler): this {
    this.completionHandlers.push(handler);
    return this;
  }

  /**
   * 注册事件处理器
   */
  private registerEventHandler<T extends EventType>(
    eventType: T,
    handler: GenericEventHandler<EventTypeToEvent[T]>,
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers
      .get(eventType)!
      .push(handler as GenericEventHandler<any>);
  }

  /**
   * 停止流并清理资源
   */
  stop(): void {
    if (!this.isStopped) {
      this.isStopped = true;

      // 清理定时器
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // 销毁流
      if (this.stream && typeof (this.stream as any).destroy === 'function') {
        (this.stream as any).destroy();
      }
    }
  }

  /**
   * 等待流完成
   * @returns Promise 当流完成时解析
   */
  async waitForCompletion(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.onFinished(() => resolve());
      this.onError((error) => reject(error));
    });
  }
}
