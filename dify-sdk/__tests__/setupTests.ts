import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './mocks/server';

// 设置全局超时时间（对于集成测试很有用）
vi.setConfig({ testTimeout: 20000 });

// 执行单元测试前，启动模拟服务器
beforeAll(() => {
  // 只在单元测试中启动模拟服务器，集成测试使用真实 API
  if (!process.env.RUN_INTEGRATION_TESTS) {
    server.listen();
  }
});

// 每次测试后重置请求处理器
afterEach(() => {
  if (!process.env.RUN_INTEGRATION_TESTS) {
    server.resetHandlers();
  }
});

// 测试结束后关闭模拟服务器
afterAll(() => {
  if (!process.env.RUN_INTEGRATION_TESTS) {
    server.close();
  }
});

// 设置全局变量模拟（如果需要）
if (typeof global.FormData === 'undefined') {
  class MockFormData {
    private data: Map<string, any> = new Map();

    append(key: string, value: any) {
      this.data.set(key, value);
    }

    get(key: string) {
      return this.data.get(key);
    }

    has(key: string) {
      return this.data.has(key);
    }
  }

  // @ts-expect-error: 在 Node.js 环境中模拟 FormData
  global.FormData = MockFormData;
}

// 如果在 Node.js 环境下，模拟浏览器的 File 对象
if (typeof global.File === 'undefined') {
  class MockFile {
    name: string;
    type: string;
    size: number;
    lastModified: number;

    constructor(
      _: any[],
      name: string,
      options: { type: string; lastModified?: number },
    ) {
      this.name = name;
      this.type = options.type || '';
      this.size = 0;
      this.lastModified = options.lastModified || Date.now();
    }
  }

  // @ts-expect-error: 在 Node.js 环境中模拟 File
  global.File = MockFile;
}
