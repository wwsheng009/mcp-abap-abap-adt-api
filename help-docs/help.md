# help - 获取工具帮助文档

## 功能说明

`help` 工具用于获取特定工具的详细帮助文档和使用示例。该工具会从 `help-docs` 目录中读取 Markdown 格式的帮助文档，帮助用户了解工具的用法、参数和前提条件。

## 调用方法

通过 MCP 工具调用：

```typescript
// 不带参数调用 - 列出所有可用的帮助主题
const allTopics = await mcp.callTool("help", {});

// 带参数调用 - 获取特定工具的帮助
const toolHelp = await mcp.callTool("help", {
  toolName: "login"
});
```

## 参数说明

- **toolName** (string, 可选): 要获取帮助的工具名称。如果省略，则列出所有可用的帮助主题。

## 返回结果

### 无参数调用

返回所有可用帮助主题的列表：

```json
{
  "content": [
    {
      "type": "text",
      "text": "Available help topics:\n\nlogin, logout, dropSession, transportInfo, ...\n\nRun 'help <toolName>' for details on a specific tool."
    }
  ]
}
```

### 带参数调用

返回指定工具的帮助文档内容（Markdown 格式）：

```json
{
  "content": [
    {
      "type": "text",
      "text": "# login - 登录到 ABAP 系统\n\n## 功能说明\n\n`login` 工具用于建立与 ABAP 系统的认证连接。\n\n..."
    }
  ]
}
```

### 找不到精确匹配

如果找不到精确匹配，会返回相似的工具名称建议：

```json
{
  "content": [
    {
      "type": "text",
      "text": "Help documentation for 'loginn' not found, but similar tools were found:\n\nlogin\nlogout\n\nPlease run the help tool again with one of these exact names."
    }
  ]
}
```

## 注意事项

1. 工具名称区分大小写（但支持模糊匹配）
2. 帮助文档存储在 Markdown 文件中（`.md` 扩展名）
3. 帮助文档的位置由 `MCP_HELP_DIR` 环境变量或自动搜索确定
4. 工具名称包含路径字符会被拒绝（安全措施）

## 参数限制

- `toolName` 不能包含 `/`、`\` 或 `..`（防止目录遍历）
- 如果提供，必须是有效的工具名称

## 帮助文档位置

帮助工具按以下顺序搜索 `help-docs` 目录：

1. `MCP_HELP_DIR` 环境变量指定的路径
2. 当前工作目录下的 `help-docs/`
3. 相对于此文件（处理器）的 `../../help-docs/`
4. 相对于入口脚本位置的 `help-docs/`
5. 入口脚本上一级的 `../help-docs/`

## 与其他工具的关联性

- 帮助文档应与 `toolGroups.ts` 中定义的工具列表保持一致
- 建议在调用任何工具前先使用 `help` 了解其用法

## 使用场景说明

1. **工具探索**: 列出所有可用的工具
2. **学习工具**: 了解特定工具的参数和用法
3. **查找工具**: 通过模糊匹配找到相似的工具
4. **文档参考**: 在开发过程中快速查阅工具文档

## 最佳实践

1. 在使用新工具前先查看帮助文档
2. 使用精确的工具名称以获得准确结果
3. 查看帮助文档中的"注意事项"和"最佳实践"
4. 参考帮助文档中的示例代码

## 错误处理

可能的错误：
- **无效的工具名称**: 工具名称包含非法字符
- **找不到文档**: 指定的工具没有帮助文档
- **读取错误**: 无法读取帮助文档文件

## 模糊匹配规则

1. **大小写不敏感的精确匹配**: 如果 `login` 不存在，会查找 `Login`、`LOGIN` 等
2. **部分匹配**: 查找包含查询字符串的工具名称
3. **返回建议**: 如果找不到精确匹配，返回相似的工具列表

## 高级用法

```typescript
// 批量获取多个工具的帮助
async function getMultipleHelp(toolNames) {
  const results = await Promise.all(
    toolNames.map(name => mcp.callTool("help", { toolName: name }))
  );
  return results;
}

// 搜索相关工具
async function searchRelatedTools(keyword) {
  const allTopics = await mcp.callTool("help", {});
  const topics = allTopics.content[0].text
    .split('Available help topics:\n\n')[1]
    .split('\n\nRun')[0]
    .split(', ');
  
  return topics.filter(t => t.toLowerCase().includes(keyword.toLowerCase()));
}

// 生成工具参考手册
async function generateReferenceManual() {
  const allTopics = await mcp.callTool("help", {});
  const topics = allTopics.content[0].text
    .split('Available help topics:\n\n')[1]
    .split('\n\nRun')[0]
    .split(', ');
  
  let manual = "# ABAP ADT MCP Server 工具参考手册\n\n";
  
  for (const topic of topics) {
    const help = await mcp.callTool("help", { toolName: topic });
    manual += help.content[0].text + "\n\n---\n\n";
  }
  
  return manual;
}
```

## 示例

```typescript
// 列出所有可用工具
const allTopics = await mcp.callTool("help", {});
console.log(allTopics.content[0].text);

// 获取登录工具的帮助
const loginHelp = await mcp.callTool("help", {
  toolName: "login"
});
console.log(loginHelp.content[0].text);

// 尝试拼写错误的工具名称（会获得建议）
const help = await mcp.callTool("help", {
  toolName: "loginn"
});
console.log(help.content[0].text);
// 输出: "Help documentation for 'loginn' not found, but similar tools were found:\n\nlogin\nlogout\n..."
```

## 帮助文档结构

每个工具的帮助文档应包含以下部分：

1. **功能说明**: 工具的用途和描述
2. **调用方法**: 如何调用工具
3. **参数说明**: 输入参数的详细说明
4. **返回结果**: 返回值的格式和说明
5. **注意事项**: 使用时需要注意的事项
6. **参数限制**: 参数的约束条件
7. **与其他工具的关联性**: 与其他工具的关系
8. **使用场景说明**: 典型的使用场景
9. **最佳实践**: 推荐的使用方法
10. **错误处理**: 可能遇到的错误和解决方案
11. **高级用法**: 高级使用技巧
12. **示例**: 实际使用示例
