import { BaseEvent, EventType } from './type';

/**
 * 通用错误处理器
 */
export type ErrorHandler = (error: Error) => void;

/**
 * 完成处理器
 */
export type CompletionHandler = () => void;

/**
 * 事件处理器类型
 */
export type EventHandler<T extends BaseEvent<EventType>> = (event: T) => void;

/**
 * 基础流处理器 - 提供通用的流处理机制
 */
export abstract class BaseStreamHandler<T extends BaseEvent<EventType>> {
  protected readonly eventHandlers: Map<EventType, EventHandler<T>[]> =
    new Map();
  protected readonly errorHandlers: ErrorHandler[] = [];
  protected readonly completionHandlers: CompletionHandler[] = [];
  protected readonly stream: NodeJS.ReadableStream;
  protected readonly timeout?: NodeJS.Timeout;
  protected isStopped = false;

  /**
   * 创建流处理器
   * @param stream 响应流对象
   * @param timeoutMs 可选的超时时间（毫秒）
   */
  constructor(stream: NodeJS.ReadableStream, timeoutMs?: number) {
    this.stream = stream;

    if (timeoutMs) {
      this.timeout = setTimeout(() => this.handleTimeout(), timeoutMs);
    }

    this.processStream();
  }

  /**
   * 处理超时
   */
  protected handleTimeout(): void {
    if (!this.isStopped) {
      this.emitError(new Error('Response stream timeout'));
    }
  }

  /**
   * 处理流内容
   */
  protected processStream(): void {
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
   * @param data 数据字符串
   */
  /**
   * 处理接收到的数据
   */
  protected processData(data: string): void {
    if (data === 'ping' || data === 'data: ping') {
      return;
    }

    try {
      const parsed = JSON.parse(data);
      this.dispatchEvent(parsed);
    } catch (e) {
      console.warn('解析数据失败:', e);
    }
  }

  /**
   * 分发事件
   * @param event 事件对象
   */
  protected dispatchEvent(event: T): void {
    const eventType = event.event;
    if (eventType) {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers && handlers.length > 0) {
        handlers.forEach((handler) => handler(event));
      }
    }
  }

  /**
   * 触发错误
   * @param error 错误对象
   */
  protected emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => handler(error));
  }

  /**
   * 触发完成
   */
  protected emitCompletion(): void {
    this.completionHandlers.forEach((handler) => handler());
  }

  /**
   * 清理资源
   */
  protected cleanUp(): void {
    this.isStopped = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * 注册事件处理器
   * @param eventType 事件类型
   * @param handler 处理函数
   */
  protected registerEventHandler<E extends EventType>(
    eventType: E,
    handler: EventHandler<any>,
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * 注册错误处理器
   * @param handler 错误处理函数
   */
  onError(handler: ErrorHandler): this {
    this.errorHandlers.push(handler);
    return this;
  }

  /**
   * 注册完成处理器
   * @param handler 完成处理函数
   */
  onFinished(handler: CompletionHandler): this {
    this.completionHandlers.push(handler);
    return this;
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
