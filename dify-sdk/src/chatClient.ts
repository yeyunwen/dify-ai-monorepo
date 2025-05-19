import { DifyClient } from './difyClient';
import {
  ChatCompletionResponse,
  ChatMessageParams,
  ChatResponseType,
  ConversationMessageParams,
  ConversationParams,
  ConversationResponse,
  DeleteConversationParams,
  MessageResponse,
  RenameConversationParams,
  RenameConversationResponse,
  ResponseModeType,
  SuggestedResponse,
  User,
} from './type';
import { ChatStreamHandler } from './utils/streamResponse';

export class ChatClient extends DifyClient {
  async createChatMessage(
    params: ChatMessageParams<'streaming'>,
  ): Promise<ChatStreamHandler>;
  async createChatMessage(
    params: ChatMessageParams<'blocking'>,
  ): Promise<ChatCompletionResponse>;
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
      return new ChatStreamHandler(response.data) as any;
    }

    return response.data;
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
