# transportsByConfig

根据配置获取传输请求。

## 功能说明

此工具获取特定传输配置下的所有传输请求。

## 调用方法

**参数**:
- `configUri` (string, 必需): 配置 URI
- `targets` (boolean, 可选): 是否包含目标系统,默认: false

**返回值**:
```json
{
  "status": "success",
  "transports": [
    {
      "trkorr": "DEVK900001",
      "as4text": "Feature X development",
      "trfunction": "K",
      "as4user": "DEVELOPER",
      "trstatus": "D",
      "tarsystem": "Q01"
    },
    {
      "trkorr": "DEVK900002",
      "as4text": "Bug fixes",
      "trfunction": "S",
      "as4user": "DEVELOPER",
      "trstatus": "D",
      "tarsystem": "P01"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": "/sap/bc/adt/cts/transportconfigurations/default",
    "targets": true
  }
}
```

## 注意事项

1. **配置 URI**: 必须提供有效的配置 URI

2. **目标系统**: 设置 targets 为 true 获取目标系统信息

3. **传输状态**: 包括已释放和未释放的传输

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| configUri | string | 是 | 有效的配置 URI |
| targets | boolean | 否 | 默认 false |

## 与其他工具的关联性

1. **与 transportConfigurations 的关系**:
   ```
   transportConfigurations (列出配置) → transportsByConfig (获取传输)
   ```

2. **与 userTransports 的关系**:
   ```
   userTransports (用户的传输) vs transportsByConfig (配置的传输)
   ```

## 使用场景说明

### 场景 1: 获取默认配置下的传输
```json
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": "/sap/bc/adt/cts/transportconfigurations/default"
  }
}
```

### 场景 2: 获取包含目标系统的传输
```json
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": "/sap/bc/adt/cts/transportconfigurations/default",
    "targets": true
  }
}
```

## 传输状态

| 状态代码 | 说明 |
|---------|------|
| D | 可修改 (Modifiable) |
| L | 可修改,锁定 |
| R | 已释放 (Released) |

## 传输功能

| 功能代码 | 说明 |
|---------|------|
| K | 任务 (Task) |
| S | 请求 (Request) |

## 最佳实践

1. **状态过滤**: 根据传输状态进行过滤

2. **目标系统**: 使用 targets 参数了解传输目标

3. **批量操作**: 对多个传输执行批量操作

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 配置不存在 | 配置 URI 无效 | 检查配置 URI |
| 权限不足 | 没有查看传输的权限 | 联系管理员 |

## 高级用法

### 传输分析
```json
// 分析传输状态
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": "/sap/bc/adt/cts/transportconfigurations/default"
  }
}
// 统计:
// - 未释放的传输数量
// - 各功能类型的传输数量
// - 各目标系统的传输数量
```
