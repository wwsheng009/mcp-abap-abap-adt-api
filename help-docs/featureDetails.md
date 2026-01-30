# featureDetails - 获取功能详细信息

## 功能说明

`featureDetails` 工具用于获取指定功能的详细信息，包括功能描述、配置选项、可用操作等元数据信息。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("featureDetails", {
  title: "feature_title"
});
```

## 参数说明

- **title** (string, 必需): 功能的标题或名称

## 返回结果

返回 JSON 格式的功能详细信息：

```json
{
  "status": "success",
  "details": {
    "title": "功能标题",
    "description": "功能描述",
    "configuration": { /* 配置选项 */ },
    "operations": [ /* 可用操作列表 */ ]
  }
}
```

## 注意事项

1. 功能标题区分大小写
2. 某些高级功能可能需要特定权限
3. 返回的详细信息可能因 ABAP 系统版本而异

## 参数限制

- `title` 必须是系统中存在的有效功能名称
- 不能为空字符串

## 与其他工具的关联性

- 与 `adtDiscovery` 配合使用，先发现可用功能列表，再获取详细信息
- 某些功能详情可能与 `objectTypes` 相关

## 使用场景说明

1. **功能探索**: 了解系统中可用功能的详细信息
2. **配置验证**: 检查功能是否支持特定配置
3. **开发规划**: 基于功能能力设计应用程序
4. **权限检查**: 验证用户是否有权访问特定功能

## 最佳实践

1. 先调用 `adtDiscovery` 获取可用功能列表
2. 缓存功能详情以避免重复查询
3. 处理功能不存在或无权限访问的情况

## 错误处理

可能的错误：
- **功能不存在**: 提供的标题在系统中未找到
- **权限不足**: 当前用户无权访问该功能
- **网络错误**: 与 ABAP 系统通信失败

## 高级用法

```typescript
// 批量获取多个功能的详情
const features = ["source_code", "debug", "unit_test"];
const results = await Promise.all(
  features.map(f => mcp.callTool("featureDetails", { title: f }))
);
```

## 示例

```typescript
// 获取源代码功能详情
const result = await mcp.callTool("featureDetails", {
  title: "source_code"
});

console.log(result.details);
```
