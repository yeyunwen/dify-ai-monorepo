import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { DifyClient } from '../../src/difyClient';
import { server } from '../mocks/server';

// 开始模拟服务器
beforeAll(() => server.listen());
// 每次测试后重置处理器
afterEach(() => {
  server.resetHandlers();
  // 清理模拟
  vi.restoreAllMocks();
});
// 测试完成后关闭服务器
afterAll(() => server.close());

describe('文件上传功能', () => {
  const client = new DifyClient('test-api-key', 'http://localhost/v1');

  it('在浏览器环境中应正确上传文件', async () => {
    // 模拟浏览器的 File 对象
    global.File = class MockFile {
      name: string;
      type: string;
      size: number;

      constructor(bits: any[], name: string, options: { type: string }) {
        this.name = name;
        this.type = options.type;
        this.size = bits.join('').length;
      }
    } as any;

    // 创建模拟文件
    const file = new File(['测试文件内容'], 'test.txt', { type: 'text/plain' });

    // 上传文件
    const response = await client.fileUpload(file, 'test-user');

    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe('test-file.txt');
  });

  // 第二个测试简化为只测试请求格式
  it('在 Node.js 环境中应正确格式化请求数据', () => {
    // 模拟 axios 请求方法而不是真正发送请求
    vi.spyOn(client, 'request' as any).mockResolvedValue({
      data: {
        id: 'mock-file-id',
        name: 'mock-file.txt',
      },
    });

    const mockFile = {
      name: 'node-test-file.txt',
      type: 'text/plain',
    };

    // 模拟 FormData
    const appendSpy = vi.fn();
    global.FormData = vi.fn().mockImplementation(() => ({
      append: appendSpy,
    }));

    // 调用上传方法
    client.fileUpload(mockFile as any, 'test-user');

    // 验证 FormData.append 调用
    expect(appendSpy).toHaveBeenCalledTimes(2);
    expect(appendSpy).toHaveBeenCalledWith('file', mockFile);
    expect(appendSpy).toHaveBeenCalledWith('user', 'test-user');
  });
});
