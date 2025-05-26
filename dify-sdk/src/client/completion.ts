import { CompletionStreamHandler } from '../utils/streamResponse';
import { DifyClient } from './dify';
import {
  CompletionResponse,
  CreateCompletionMessageParams,
  ResponseModeType,
  User,
} from './type';

export class CompletionClient extends DifyClient {
  async createCompletionMessage<T extends ResponseModeType = 'blocking'>(
    data: CreateCompletionMessageParams<T>,
  ): Promise<CompletionResponse<T>> {
    const defaultParams: Pick<
      CreateCompletionMessageParams<'blocking'>,
      'response_mode'
    > = {
      response_mode: 'blocking',
    };
    const mergeParams = { ...defaultParams, ...data };

    const response = await this.request({
      method: 'POST',
      url: '/completion-messages',
      data: mergeParams,
      responseType:
        mergeParams.response_mode === 'streaming' ? 'stream' : 'json',
    });

    if (mergeParams.response_mode === 'streaming') {
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
