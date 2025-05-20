import {
  ChatStreamHandler,
  CompletionStreamHandler,
  WorkflowStreamHandler,
} from './utils/streamResponse';

//#region common
export interface Usage {
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

/** inputs var */
export type AnyObject = Record<string, any>;

export type Status = 'running' | 'succeeded' | 'failed' | 'stopped';

export type ResponseModeType = 'streaming' | 'blocking';

export type FeedbackRating = 'like' | 'dislike' | null;

export interface User {}
//#endregion

//#region difyClient

export type AppParameters = {
  opening_statement: string;
  suggested_questions: string[];
  suggested_questions_after_answer: {
    enable: boolean;
  };
  speech_to_text: {
    enable: boolean;
  };
  text_to_speech: {
    enable: boolean;
    voice: string;
    language: string;
    autoPlay: 'disabled' | 'enabled';
  };
  retriever_resource: {
    enable: boolean;
  };
  annotation_reply: {
    enable: boolean;
  };
  user_input_form: [
    {
      'text-input': {
        label: string;
        variable: string;
        required: boolean;
        max_length: number;
        default: '';
      };
    },
    {
      paragraph: {
        label: string;
        variable: string;
        required: boolean;
        default: '';
      };
    },
    {
      select: {
        label: string;
        variable: string;
        required: boolean;
        default: string;
        options: string[];
      };
    },
  ];
  file_upload: {
    image: {
      enabled: boolean;
      number_limits: number;
      transfer_methods: string[];
    };
    allowed_file_types: string[]; // docs not found
    allowed_file_extensions: string[]; // docs not found
    allowed_file_upload_methods: string[]; // docs not found
    number_limits: number; // docs not found
    fileUploadConfig: {
      file_size_limit: number;
      batch_count_limit: number;
      image_file_size_limit: number;
      video_file_size_limit: number;
      audio_file_size_limit: number;
      workflow_file_upload_limit: number;
    }; // docs not found
  };
  system_parameters: {
    image_file_size_limit: number;
    video_file_size_limit: number;
    audio_file_size_limit: number;
    file_size_limit: number;
    workflow_file_upload_limit: number; // docs not found
  };
};

export interface AppMeta {
  tool_icons: {
    [key: string]:
      | string
      | {
          background: string;
          content: string;
        };
  };
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
  preview_url: string | null; // docs not found
}
//#endregion

//#region chatClient

export interface VisionFile {
  type: 'document' | 'image' | 'audio' | 'video' | 'custom';
  name: string;
  transfer_method: 'remote_url' | 'local_file';
  /** 当transfer_method为remote_url时，url为必填 */
  url?: string;
  /** 当transfer_method为local_file时，upload_file_id为必填 */
  upload_file_id?: string;
}

export interface ChatMessageParams<T extends ResponseModeType = 'blocking'> {
  inputs: AnyObject;
  query: string;
  user: string;
  conversation_id?: string;
  files?: VisionFile[];
  response_mode?: T;
  auto_generate_name?: boolean;
}

// 条件类型，根据ResponseMode选择返回类型
export type ChatResponseType<T extends ResponseModeType> = T extends 'streaming'
  ? ChatStreamHandler
  : ChatCompletionResponse;

export interface ChatCompletionResponse {
  event: 'message';
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: 'chat';
  answer: string;
  metadata: {
    usage: Usage;
    retriever_resources: RetrieverResource[];
  };
  created_at: number;
}

export type ChatCompletionChunkResponse = string;

export type SuggestedResponse = {
  result: 'success';
  data: string[];
};

export type RenameConversationParams = {
  conversation_id: string;
  name?: string;
  user: User;
  /** default false */
  auto_generate?: boolean;
};

export type RenameConversationResponse = {
  id: string;
  name: string;
  inputs: AnyObject;
  status: 'normal' | string; // don't know what other statuses are there
  introduction: string;
  created_at: number;
  updated_at: number;
};

export type DeleteConversationParams = {
  conversation_id: string;
  user: User;
};

export type DeleteConversationResponse = {
  result: 'success';
};

export type ConversationParams = {
  user: User;
  last_id?: string;
  /** int_range(1, 100), default 20 */
  limit?: number;
  /** default -updated_at */
  sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at';
};

export type Conversations = {
  id: string;
  inputs: AnyObject;
  introduction: string;
  name: string;
  status: 'normal' | string; // don't know what other statuses are there
  created_at: number;
  updated_at: number;
};

export type ConversationResponse = {
  limit: number;
  has_more: boolean;
  data: Conversations[];
};

export type ConversationMessageParams = {
  conversation_id: string;
  last_id?: string;
  /** int_range(1, 100), default 20 */
  limit?: number;
};

export type Message = {
  agent_thoughts: [];
  answer: string;
  conversation_id: string;
  created_at: number;
  error: null;
  feedback: FeedbackRating | null;
  id: string;
  inputs: AnyObject;
  message_files: {
    id: string;
    type: 'image' | string; // don't know what other type are there
    url: string;
    belongs_to: 'assistant' | 'user';
  }[];
  metadata: Record<string, any>;
  parent_message_id: string | null;
  query: string;
  retriever_resources: RetrieverResource[];
  status: 'normal' | string; // don't know what other statuses are there
};

export type MessageResponse = {
  limit: number;
  has_more: boolean;
  data: Message[];
};
//#endregion

//#region workflowClient
export type RunWorkflowParams<T extends ResponseModeType = 'blocking'> = {
  inputs: Record<string, any | VisionFile[]>;
  user: User;
  response_mode: T;
};

export interface WorkflowCompletionResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: Status;
    outputs?: AnyObject;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

export type WorkflowResponse<T extends ResponseModeType> = T extends 'streaming'
  ? WorkflowStreamHandler
  : WorkflowCompletionResponse;

export type WorkflowRunStatus = 'succeeded' | 'failed' | 'stopped';

export type GetLogsParams = {
  keyword?: string;
  status?: WorkflowRunStatus;
  page?: number;
  limit?: number;
};

export type WorkflowLog = {
  id: string;
  workflow_run: {
    id: string;
    version: string;
    status: WorkflowRunStatus;
    error: string | null;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
  created_from: string;
  created_by_role: string;
  created_by_account: string | null;
  created_by_end_user: {
    id: string;
    type: string;
    is_anonymous: boolean;
    session_id: string;
  };
  created_at: number;
};

export type WorkflowLogResponse = {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  data: WorkflowLog[];
};

//#endregion

//#region completionClient

export type CreateCompletionMessageParams<
  T extends ResponseModeType = 'blocking',
> = {
  inputs: {
    query: string;
    [key: string]: any;
  };
  user: User;
  files?: VisionFile[];
  response_mode?: T;
};

export type CompletionResponse<T extends ResponseModeType> =
  T extends 'streaming'
    ? CompletionStreamHandler
    : CompletionCompletionResponse;

export interface CompletionCompletionResponse {
  event: 'message';
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
}
//#endregion
