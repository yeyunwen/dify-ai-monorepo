import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// 设置模拟服务器
export const server = setupServer(...handlers);
