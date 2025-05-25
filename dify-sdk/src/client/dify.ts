import { AxiosInstance } from 'axios';

import { createAxiosInstance } from '../utils';
import {
  AppMeta,
  AppParameters,
  FeedbackRating,
  FileUploadResponse,
  User,
} from './type';

/**
 * Dify API Base Class
 */
export class DifyClient {
  protected apiKey: string;
  protected baseUrl: string;
  protected request: AxiosInstance;

  /**
   * Create Dify Client Instance
   * @param apiKey API Key
   * @param baseUrl API Base URL, default to official API address
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

  getApplicationParameters() {
    return this.request<AppParameters>({
      method: 'GET',
      url: '/parameters',
    });
  }

  getMeta() {
    return this.request<AppMeta>({
      method: 'GET',
      url: '/meta',
    });
  }

  fileUpload(file: File, user: string) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('user', user);

    return this.request<FileUploadResponse>({
      method: 'POST',
      url: '/files/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  /**
   * @deprecated dify 源码中还接受了voice参数，同时源码中貌似并未对streaming参数进行处理
   */
  textToVideo(data: {
    message_id?: string;
    text?: string;
    user: User;
    streaming?: boolean;
  }) {
    // TODO: 处理返回类型
    return this.request<ArrayBuffer>({
      method: 'POST',
      url: '/text-to-audio',
      data,
      responseType: data.streaming ? 'stream' : 'json',
    });
  }
}
