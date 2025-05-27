## [0.0.7](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.6...v0.0.7) (2025-05-27)


### 🐛 Bug Fixes | Bug 修复

* 导出client相关的全部类型 ([90a74d1](https://github.com/yeyunwen/dify-ai-monorepo/commit/90a74d148dd85910444d24fec1b5854fdeefb115))



## [0.0.6](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.5...v0.0.6) (2025-05-27)


### 🐛 Bug Fixes | Bug 修复

* 修复流处理器可能出现数据丢失问题并要求手动启动 ([f948dd8](https://github.com/yeyunwen/dify-ai-monorepo/commit/f948dd85c47d9176d11f8b1a386badd42ac8580f))


### BREAKING CHANGES

* 现在必须手动调用.start()方法来开始处理流数据



## [0.0.5](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.4...v0.0.5) (2025-05-26)


### 🐛 Bug Fixes | Bug 修复

* 导出streamResponse handler中的类型 ([9d08ed4](https://github.com/yeyunwen/dify-ai-monorepo/commit/9d08ed45d3237bf886d69d6eb0d335222d5e5b3a))



## [0.0.4](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.3...v0.0.4) (2025-05-26)


### 🐛 Bug Fixes | Bug 修复

* 修复chatClient createMessage返回的类型问题，优化消息参数处理，合并默认参数 ([50038b5](https://github.com/yeyunwen/dify-ai-monorepo/commit/50038b54c6479c4be77e2b0dcdf626872ca69485))



## [0.0.3](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.2...v0.0.3) (2025-05-25)


### 🐛 Bug Fixes | Bug 修复

* fix format,lint script、and README.md ([47f1035](https://github.com/yeyunwen/dify-ai-monorepo/commit/47f10359dc2e9a7e0b33af3314f4aed62b15e14c))



## [0.0.2](https://github.com/yeyunwen/dify-ai-monorepo/compare/v0.0.1...v0.0.2) (2025-05-25)


### 🐛 Bug Fixes | Bug 修复

* 修复workflow和completion文件的导出 ([925e345](https://github.com/yeyunwen/dify-ai-monorepo/commit/925e3450660d24d2699eada0510eb9cb53ff632f))



## 0.0.1 (2025-05-24)

### ✨ Features | 新功能

- 添加wrokflowClient并完善streamResponseHandler ([6e4e286](https://github.com/yeyunwen/dify-ai-monorepo/commit/6e4e28646dec6a7d7ba23220c91aac566f97774d))
- 完成 difyClient 基础类 ([3260a66](https://github.com/yeyunwen/dify-ai-monorepo/commit/3260a66028946aef146500759871ce4c55ed3655))
- add crateChatMessage、messageFeedback ([55b6b80](https://github.com/yeyunwen/dify-ai-monorepo/commit/55b6b8062077eaed3e38839157c3863bc4e90767))
- add vitest ([dd3fea5](https://github.com/yeyunwen/dify-ai-monorepo/commit/dd3fea52281cc2aed69ab78feaabc93fd2b3e26b))
- complete chatClient ([b103dad](https://github.com/yeyunwen/dify-ai-monorepo/commit/b103dad13a6d5df3727d8b603ae81cdc8c03666b))
