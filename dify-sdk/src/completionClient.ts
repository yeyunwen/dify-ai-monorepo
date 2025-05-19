import { DifyClient } from './difyClient';
import {
  CompletionResponse,
  CreateCompletionMessageParams,
  ResponseModeType,
  User,
} from './type';
import { CompletionStreamHandler } from './utils/streamResponse';

export class CompletionClient extends DifyClient {
  async createCompletionMessage<T extends ResponseModeType = 'blocking'>(
    data: CreateCompletionMessageParams<T>,
  ): Promise<CompletionResponse<T>> {
    const response = await this.request({
      method: 'POST',
      url: '/completion-messages',
      data,
      responseType: data.response_mode === 'streaming' ? 'stream' : 'json',
    });

    if (data.response_mode === 'streaming') {
      return new CompletionStreamHandler(response.data) as any;
    }

    return response.data;
  }

  stop(taskId: string, user: User) {
    return this.request<{
      result: 'success';
    }>({
      method: 'POST',
      url: `/completion-messages/${taskId}/stop`,
      data: {
        user,
      },
    });
  }
}
