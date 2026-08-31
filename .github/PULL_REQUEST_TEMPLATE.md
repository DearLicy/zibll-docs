## 变更说明

<!-- 说明修复了什么问题，必要时关联 Issue。 -->

## 核对依据

- [ ] 已核对主题、子主题或插件源码路径
- [ ] 已注明版本差异和适用边界
- [ ] 示例中没有 API Key、Cookie、密码或个人数据

## 检查项

- [ ] 页面属于正确的分类和侧栏
- [ ] 中文、英文、日文链接没有指向 localhost 或临时端口
- [ ] `npm run prebuild` 通过
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run mcp:check` 通过
- [ ] `npm run community:check` 通过
- [ ] `npm run build` 通过

## 运行边界

- [ ] Pages 页面仍然可以导出为静态文件，不依赖登录、数据库、Redis 或常驻 Node 进程
- [ ] 如涉及动态写入（例如 GitHub Issue Bot），实现放在独立服务目录，并说明所需密钥和来源校验
- [ ] 如涉及 MCP 或 Codex 插件，默认行为保持只读并按需启动
