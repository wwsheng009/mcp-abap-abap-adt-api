# setTransportsConfig

设置传输配置。

## 功能说明

此工具用于修改传输配置。需要提供配置的 ETag 以确保并发安全。

## 调用方法

**参数**:
- `uri` (string, 必需): 传输配置的 URI
- `etag` (string, 必需): 配置的 ETag (从 getTransportConfiguration 获取)
- `config` (string, 必需): 传输配置 (JSON 字符串)

**返回值**:
```json
{
  "status": "success",
  "updated": true,
  "newEtag": "def456"
}
```

**示例**:
```json
{
  "tool": "setTransportsConfig",
  "arguments": {
    "uri": "/sap/bc/adt/cts/transportconfigurations/default",
    "etag": "abc123",
    "config": "{\"allowCustomizing\":true,\"requireTransport\":true}"
  }
}
```

## 注意事项

1. **ETag**: 必须使用最新的 ETag

2. **JSON 格式**: config 必须是有效的 JSON 字符串

3. **并发安全**: ETag 机制防止并发修改冲突

4. **修改影响**: 配置修改会影响传输系统行为

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| uri | string | 是 | 有效的配置 URI |
| etag | string | 是 | 有效的 ETag |
| config | string | 是 | 有效的 JSON 字符串 |

## 与其他工具的关联性

1. **与 getTransportConfiguration 的关系**:
   ```
   getTransportConfiguration (获取配置和 ETag) → 修改 → setTransportsConfig
   ```

2. **与 transportConfigurations 的关系**:
   ```
   transportConfigurations (列出配置) → getTransportConfiguration → setTransportsConfig
   ```

## 使用场景说明

### 场景 1: 修改传输配置
```json
// 步骤 1: 获取当前配置
{
  "tool": "getTransportConfiguration",
  "arguments": {
    "url": "/sap/bc/adt/cts/transportconfigurations/default"
  }
}
// 返回: { "config": {...}, "etag": "abc123" }

// 步骤 2: 修改配置
{
  "tool": "setTransportsConfig",
  "arguments": {
    "uri": "/sap/bc/adt/cts/transportconfigurations/default",
    "etag": "abc123",
    "config": "{\"allowCustomizing\":true,\"requireTransport\":false}"
  }
}
```

## 配置设置

| 设置 | 说明 | 示例 |
|------|------|------|
| allowCustomizing | 允许自定义 | true/false |
| requireTransport | 需要传输 | true/false |

## 最佳实践

1. **先读取**: 修改前先读取当前配置

2. **使用 ETag**: 始终使用最新的 ETag

3. **测试影响**: 在测试环境测试配置修改

4. **备份**: 修改前备份当前配置

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| ETag 不匹配 | 配置已被他人修改 | 重新获取 ETag |
| JSON 解析错误 | config 不是有效的 JSON | 检查 JSON 格式 |
| 权限不足 | 没有修改配置的权限 | 联系管理员 |

## 高级用法

### 批量更新配置
```json
// 更新多个配置
for each config in configs:
  {
    "tool": "getTransportConfiguration",
    "arguments": { "url": config.url }
  }
  {
    "tool": "setTransportsConfig",
    "arguments": {
      "uri": config.url,
      "etag": currentEtag,
      "config": config.newValue
    }
  }
```
