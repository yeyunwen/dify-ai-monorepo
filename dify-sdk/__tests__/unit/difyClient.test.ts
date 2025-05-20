import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { DifyClient } from '../../src/difyClient';
import { server } from '../mocks/server';

// 开始模拟服务器
beforeAll(() => server.listen());
// 每次测试后重置处理器
afterEach(() => server.resetHandlers());
// 测试完成后关闭服务器
afterAll(() => server.close());

describe('DifyClient', () => {
  const client = new DifyClient('test-api-key', 'http://localhost/v1');

  it('创建实例时应正确设置属性', () => {
    expect(client).toBeInstanceOf(DifyClient);
  });

  it('应能获取应用元数据', async () => {
    const response = await client.getMeta();
    expect(response.data).toHaveProperty('tool_icons');
  });

  it('应能获取应用参数', async () => {
    const response = await client.getApplicationParameters();
    expect(response.data).toHaveProperty('opening_statement');
    expect(response.data).toHaveProperty('suggested_questions');
  });

  // 测试文件上传需要模拟 FormData 和文件
  it('应能处理文件上传', async () => {
    // 在浏览器环境中
    // const file = new File(['测试文件内容'], 'test.txt', { type: 'text/plain' });

    // 在 Node.js 环境中模拟文件
    const mockFile = {
      name: 'test.txt',
      type: 'text/plain',
      size: 16,
      lastModified: Date.now(),
    } as unknown as File;

    const response = await client.fileUpload(mockFile, 'test-user');
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe('test-file.txt');
  });

  // 可以添加更多测试...
});
