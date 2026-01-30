# transportConfigurations

获取所有传输配置。

## 功能说明

此工具用于获取系统中的传输配置列表。传输配置用于定义和过滤传输请求的搜索条件。

## 调用方法

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "configurations": [
    {
      "createdBy": "DEVELOPER",
      "changedBy": "ADMIN",
      "client": "800",
      "link": "/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations/123",
      "etag": "\"12345\"",
      "createdAt": 1705600000000,
      "changedAt": 1705603600000
    }
  ]
}
```

**示例**:
```json
{
  "tool": "transportConfigurations",
  "arguments": {}
}
```

## 注意事项

1. **配置缓存**: 传输配置可能被缓存，修改后可能需要刷新

2. **ETag**: ETag 用于并发修改的版本控制

3. **创建时间**: 时间戳为 Unix 毫秒时间戳

4. **客户端**: client 字段表示 SAP 客户端编号

5. **权限要求**: 用户需要有查看传输配置的权限

## 参数限制

- 无参数

## 与其他工具的关联性

1. **配置管理**:
   ```
   transportConfigurations → getTransportConfiguration → setTransportsConfig
   ```

2. **传输查询**:
   ```
   transportConfigurations → transportsByConfig
   ```

## 使用场景说明

### 场景 1: 查看所有配置
```json
{
  "tool": "transportConfigurations",
  "arguments": {}
}
```

### 场景 2: 选择配置使用
```json
// 步骤 1: 获取配置列表
{
  "tool": "transportConfigurations",
  "arguments": {}
}

// 步骤 2: 选择配置
const config = configurations[0]

// 步骤 3: 使用配置查询传输
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": config.link
  }
}
```

## 配置信息结构

| 字段 | 说明 | 示例 |
|------|------|------|
| createdBy | 创建者 | DEVELOPER |
| changedBy | 最后修改者 | ADMIN |
| client | SAP 客户端编号 | 800 |
| link | 配置的 URI | /sap/bc/adt/cts/... |
| etag | 版本标识 | "12345" |
| createdAt | 创建时间戳 | 1705600000000 |
| changedAt | 修改时间戳 | 1705603600000 |

