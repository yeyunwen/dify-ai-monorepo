import { BaseStreamHandler, EventHandler } from './base';
import {
  ErrorEvent,
  MessageEndEvent,
  MessageEvent,
  MessageReplaceEvent,
  TTSMessageEndEvent,
  TTSMessageEvent,
} from './type';

/**
 * 完成流处理器类型
 */
export type CompletionEvent =
  | MessageEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent
  | MessageReplaceEvent
  | ErrorEvent;

/**
 * 完成流处理器
 */
export class CompletionStreamHandler extends BaseStreamHandler<CompletionEvent> {
  /**
   * 注册消息事件处理器
   */
  onMessage(handler: EventHandler<MessageEvent>): this {
    this.registerEventHandler('message', handler);
    return this;
  }

  /**
   * 注册消息结束事件处理器
   */
  onMessageEnd(handler: EventHandler<MessageEndEvent>): this {
    this.registerEventHandler('message_end', handler);
    return this;
  }

  /**
   * 注册文本转语音消息事件处理器
   */
  onTtsMessage(handler: EventHandler<TTSMessageEvent>): this {
    this.registerEventHandler('tts_message', handler);
    return this;
  }

  /**
   * 注册文本转语音结束事件处理器
   */
  onTtsMessageEnd(handler: EventHandler<TTSMessageEndEvent>): this {
    this.registerEventHandler('tts_message_end', handler);
    return this;
  }

  /**
   * 注册消息替换事件处理器
   */
  onMessageReplace(handler: EventHandler<MessageReplaceEvent>): this {
    this.registerEventHandler('message_replace', handler);
    return this;
  }

  /**
   * 注册错误事件处理器
   */
  onErrorEvent(handler: EventHandler<ErrorEvent>): this {
    this.registerEventHandler('error', handler);
    return this;
  }
}
