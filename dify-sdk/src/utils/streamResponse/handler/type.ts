import {
  AnyObject,
  RetrieverResource,
  Status,
  Usage,
} from '../../../client/type';

export type EventType =
  | 'workflow_started'
  | 'workflow_finished'
  | 'node_started'
  | 'node_finished'
  | 'message'
  | 'message_file'
  | 'message_end'
  | 'tts_message'
  | 'tts_message_end'
  | 'text_chunk'
  | 'message_replace'
  | 'error';

// 定义基础事件类型
export interface BaseEvent<T extends EventType> {
  event: T;
  task_id: string;
}

export interface WorkflowStartedEvent extends BaseEvent<'workflow_started'> {
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    sequence_number: number;
    created_at: number;
  };
}
export interface WorkflowFinishedEvent extends BaseEvent<'workflow_finished'> {
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    outputs: Record<string, unknown>;
    status: Status;
    error: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: string;
    created_at: number;
    finished_at: number;
  };
}

export interface NodeStartedEvent extends BaseEvent<'node_started'> {
  workflow_run_id: string;
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    predecessor_node_id: string;
    inputs: AnyObject;
    created_at: number;
  };
}

export interface NodeFinishedEvent extends BaseEvent<'node_finished'> {
  workflow_run_id: string;
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    predecessor_node_id: string;
    process_data?: AnyObject; // TODO: 需要更精确的类型
    inputs: AnyObject;
    outputs?: AnyObject;
    status: Status;
    error: string;
    elapsed_time?: number;
    execution_metadata: {
      total_tokens?: number;
      total_price?: number;
      currency?: string;
    };
    created_at: number;
  };
}

export interface MessageEvent extends BaseEvent<'message'> {
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface MessageFileEvent extends BaseEvent<'message_file'> {
  conversation_id: string;
  type: string;
  belongs_to: 'assistant';
  url: string;
}

export interface MessageEndEvent extends BaseEvent<'message_end'> {
  id: string;
  message_id: string;
  conversation_id: string;
  metadata: {
    usage: Usage;
    retriever_resources?: RetrieverResource[];
  };
}

export interface TTSMessageEvent extends BaseEvent<'tts_message'> {
  message_id: string;
  audio: string;
  created_at: number;
}

export interface TTSMessageEndEvent extends BaseEvent<'tts_message_end'> {
  message_id: string;
  audio: '';
  created_at: number;
}

export interface TextChunkEvent extends BaseEvent<'text_chunk'> {
  workflow_run_id: string;
  data: {
    text: string;
    from_variable_selector: string[];
  };
}

export interface MessageReplaceEvent extends BaseEvent<'message_replace'> {
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface ErrorEvent extends BaseEvent<'error'> {
  error: string;
  message_id: string;
  status: number;
  code: string;
  message: string;
}

// 所有可能的事件类型
export type ChatStreamEvent =
  | WorkflowStartedEvent
  | WorkflowFinishedEvent
  | NodeStartedEvent
  | NodeFinishedEvent
  | MessageEvent
  | MessageFileEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent
  | ErrorEvent;

export type WorkflowStreamEvent =
  | WorkflowStartedEvent
  | NodeStartedEvent
  | TextChunkEvent
  | NodeFinishedEvent
  | WorkflowFinishedEvent
  | TTSMessageEvent
  | TTSMessageEndEvent;

export type CompletionStreamEvent =
  | MessageEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent
  | MessageReplaceEvent
  | ErrorEvent;
