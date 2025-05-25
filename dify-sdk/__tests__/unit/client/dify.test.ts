import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { DifyClient } from '../../../src/client/dify';
import { server } from '../../mocks/server';

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
