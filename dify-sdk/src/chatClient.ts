import { DifyClient, FeedbackRating, User } from './difyClient';
import { StreamingResponseHandler } from './utils';

export type UserInputs = Record<string, any>;
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
  position: number;
  dataset_id: string;
  dataset_name: string;
  document_id: string;
  document_name: string;
  segment_id: string;
  score: number;
  content: string;
}

export type ResponseModeType = 'streaming' | 'blocking';

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
  inputs: UserInputs;
  query: string;
  user: string;
  conversation_id?: string;
  files?: VisionFile[];
  response_mode?: T;
  auto_generate_name?: boolean;
}

// 条件类型，根据ResponseMode选择返回类型
type ChatResponseType<T extends ResponseModeType> = T extends 'streaming'
  ? StreamingResponseHandler
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
  inputs: UserInputs;
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

export type ConversationResponse = {
  limit: number;
  has_more: boolean;
  data: {
    id: string;
    inputs: UserInputs;
    introduction: string;
    name: string;
    status: 'normal' | string; // don't know what other statuses are there
    created_at: number;
    updated_at: number;
  }[];
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
  inputs: UserInputs;
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

export class ChatClient extends DifyClient {
  async createChatMessage<T extends ResponseModeType = 'blocking'>(
    params: ChatMessageParams<T>,
  ): Promise<ChatResponseType<T>> {
    const response = await this.request({
      method: 'POST',
      url: '/chat-messages',
      data: params,
      responseType: params.response_mode === 'streaming' ? 'stream' : 'json',
    });

    if (params.response_mode === 'streaming') {
      return new StreamingResponseHandler(response.data) as any;
    }

    return response.data as ChatResponseType<T>;
  }
  getSuggested(messageId: string, user: User) {
    return this.request<SuggestedResponse>({
      method: 'GET',
      url: `/messages/${messageId}/suggested`,
      params: {
        user,
      },
    });
  }

  /**
   * @param taskId get it from chunk response
   * @param user
   */
  stopMessage(taskId: string, user: User) {
    return this.request<{
      result: 'success';
    }>({
      method: 'POST',
      url: `/chat-messages/${taskId}/stop`,
      data: {
        user,
      },
    });
  }

  getConversations(params: ConversationParams) {
    return this.request<ConversationResponse>({
      method: 'GET',
      url: '/conversations',
      params,
    });
  }

  getConversationMessages(params: ConversationMessageParams) {
    return this.request<MessageResponse>({
      method: 'GET',
      url: `/messages`,
      params,
    });
  }

  renameConversation(data: RenameConversationParams) {
    const { conversation_id, ...rest } = data;
    return this.request<RenameConversationResponse>({
      method: 'POST',
      url: `/conversations/${conversation_id}/name`,
      data: rest,
    });
  }

  deleteConversation(data: DeleteConversationParams) {
    const { conversation_id, ...rest } = data;
    return this.request<{
      result: 'success';
    }>({
      method: 'DELETE',
      url: `/conversations/${conversation_id}`,
      data: rest,
    });
  }
  // docs is ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
  /**
   * @param file file support ["mp3", "m4a", "wav", "webm", "amr"], limit 15MB
   * @param user 用户
   */
  audioToText(file: File, user: User) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('user', user);

    return this.request<{
      text: string;
    }>({
      method: 'POST',
      url: '/audio-to-text',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
