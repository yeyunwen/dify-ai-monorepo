import { AxiosInstance } from 'axios';
import { createAxiosInstance } from './utils';

export type FeedbackRating = 'like' | 'dislike';

export type User = {
  id: string;
  name: string;
};

/**
 * Dify API 客户端基类
 * 提供与 Dify API 交互的基础功能
 */
export class DifyClient {
  protected apiKey: string;
  protected baseUrl: string;
  protected request: AxiosInstance;

  /**
   * 创建 Dify 客户端实例
   * @param apiKey API密钥
   * @param baseUrl API基础URL，默认为官方API地址
   */
  constructor(apiKey: string, baseUrl: string = 'https://api.dify.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.request = createAxiosInstance(apiKey, baseUrl);
  }

  messageFeedback(messageId: string, rating: FeedbackRating, user: User) {
    return this.request<{
      result: 'success';
    }>({
      method: 'POST',
      url: `/messages/${messageId}/feedbacks`,
      data: {
        rating,
        user,
      },
    });
  }
}
