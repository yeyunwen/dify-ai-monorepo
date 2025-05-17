import { DifyClient } from './difyClient';
import { StreamingResponseHandler } from './utils';

interface Usage {
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

interface RetrieverResource {
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
  inputs: Record<string, any>;
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
}

// const chatClient = new ChatClient(
//   'app-O2ySGdUIayvrdzeadhOYO9Ya',
//   'http://localhost/v1',
// );

// const resp = await chatClient.createChatMessage({
//   user: 'test-token',
//   query: '你好呀5.17',
//   inputs: {},
//   response_mode: 'streaming',
// });

// resp.onMessage((message) => {
//   console.log('message', message);
// });

// resp.onFinished(() => {
//   console.log('finished');
// });
