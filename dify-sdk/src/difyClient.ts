import { AxiosInstance } from 'axios';

import { createAxiosInstance } from './utils';

export type FeedbackRating = 'like' | 'dislike';

export interface User {}

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
