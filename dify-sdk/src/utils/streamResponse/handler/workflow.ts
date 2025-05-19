import { BaseStreamHandler, EventHandler } from './base';
import {
  NodeFinishedEvent,
  NodeStartedEvent,
  TextChunkEvent,
  TTSMessageEndEvent,
  TTSMessageEvent,
  WorkflowFinishedEvent,
  WorkflowStartedEvent,
  WorkflowStreamEvent,
} from './type';

/**
 * 工作流流处理器
 */
export class WorkflowStreamHandler extends BaseStreamHandler<WorkflowStreamEvent> {
  /**
   * 注册工作流开始事件处理器
   */
  onWorkflowStarted(handler: EventHandler<WorkflowStartedEvent>): this {
    this.registerEventHandler('workflow_started', handler);
    return this;
  }

  /**
   * 注册工作流完成事件处理器
   */
  onWorkflowFinished(handler: EventHandler<WorkflowFinishedEvent>): this {
    this.registerEventHandler('workflow_finished', handler);
    return this;
  }

  /**
   * 注册节点开始事件处理器
   */
  onNodeStarted(handler: EventHandler<NodeStartedEvent>): this {
    this.registerEventHandler('node_started', handler);
    return this;
  }

  /**
   * 注册节点完成事件处理器
   */
  onNodeFinished(handler: EventHandler<NodeFinishedEvent>): this {
    this.registerEventHandler('node_finished', handler);
    return this;
  }

  /**
   * 注册文本块事件处理器
   */
  onTextChunk(handler: EventHandler<TextChunkEvent>): this {
    this.registerEventHandler('text_chunk', handler);
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
}
