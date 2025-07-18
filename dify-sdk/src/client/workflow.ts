import { WorkflowStreamHandler } from '../utils/streamResponse';
import { DifyClient } from './dify';
import {
  GetLogsParams,
  ResponseModeType,
  RunWorkflowParams,
  User,
  WorkflowLogResponse,
  WorkflowResponse,
} from './type';

export class WorkflowClient extends DifyClient {
  async run<T extends ResponseModeType = 'blocking'>(
    data: RunWorkflowParams<T>,
  ): Promise<WorkflowResponse<T>> {
    const defaultParams: Pick<
      RunWorkflowParams<'blocking'>,
      'response_mode' | 'inputs'
    > = {
      response_mode: 'blocking',
      inputs: {},
    };
    const mergeParams = { ...defaultParams, ...data };

    const response = await this.request({
      method: 'POST',
      url: '/workflows/run',
      data: mergeParams,
      responseType:
        mergeParams.response_mode === 'streaming' ? 'stream' : 'json',
    });

    if (mergeParams.response_mode === 'streaming') {
      return new WorkflowStreamHandler(response.data) as any;
    }

    return response.data;
  }

  getRunDetail(workflowRunId: string) {
    return this.request({
      method: 'GET',
      url: `/workflows/runs/${workflowRunId}`,
    });
  }

  stop(taskId: string, user: User) {
    return this.request<{
      result: 'success';
    }>({
      method: 'POST',
      url: `/workflows/tasks/${taskId}/stop`,
      data: {
        user,
      },
    });
  }

  getLogs(params: GetLogsParams) {
    return this.request<WorkflowLogResponse>({
      method: 'GET',
      url: `/workflows/logs`,
      params,
    });
  }
}
