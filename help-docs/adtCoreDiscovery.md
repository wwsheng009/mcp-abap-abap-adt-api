# adtCoreDiscovery - ADT 核心发现

## 功能说明

`adtCoreDiscovery` 工具执行 ADT 核心服务的发现操作，返回 ADT 核心功能和服务的详细信息。与 `adtDiscovery` 相比，此工具专注于核心功能，提供更精炼的信息。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("adtCoreDiscovery", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的 ADT 核心发现信息：

```json
{
  "status": "success",
  "discovery": {
    "coreServices": [
      {
        "name": "object_types",
        "url": "/sap/bc/adt/core/object_types",
        "operations": ["list", "get", "search"]
      },
      {
        "name": "syntax_check",
        "url": "/sap/bc/adt/core/syntax",
        "operations": ["check", "quick_check"]
      }
      // ... 更多核心服务
    ],
    "capabilities": {
      "sourceCode": true,
      "debugging": true,
      "unitTesting": true
    },
    "limits": {
      "maxObjects": 10000,
      "timeout": 300
    }
  }
}
```

## 注意事项

1. 核心发现专注于最常用的 ADT 功能
2. 返回的信息比完整发现更精炼
3. 某些高级功能可能不在核心发现中
4. 适合需要快速了解系统能力的场景

## 参数限制

无。

## 与其他工具的关联性

- 核心服务 URL 用于快速访问常用功能
- 能力信息可用于调整工具行为
- 限制信息用于优化批量操作

## 使用场景说明

1. **快速连接**: 快速验证连接并获取核心信息
2. **能力评估**: 评估系统是否支持所需的核心功能
3. **限制规划**: 根据系统限制规划批量操作
4. **简化集成**: 为简化集成提供最小必要信息

## 最佳实践

1. 对于只需要核心功能的应用使用此工具而非 `adtDiscovery`
2. 根据 `capabilities` 动态启用/禁用功能
3. 遵守 `limits` 中指定的限制条件
4. 与 `adtDiscovery` 配合使用获取完整信息

## 错误处理

可能的错误：
- **核心服务不可用**: 核心服务未启用或配置错误
- **权限不足**: 无权访问核心服务
- **系统错误**: ABAP 系统内部错误
- **版本不支持**: ABAP 版本不支持核心发现

## 高级用法

```typescript
// 构建核心服务客户端
const coreServices = {};
discovery.coreServices.forEach(service => {
  coreServices[service.name] = {
    url: service.url,
    operations: service.operations
  };
});

// 检查并遵守限制
function checkLimit(count, type) {
  const limit = discovery.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}`];
  if (limit && count > limit) {
    throw new Error(`Exceeds maximum limit: ${limit}`);
  }
}
```

## 示例

```typescript
// 执行核心发现
const result = await mcp.callTool("adtCoreDiscovery", {});

// 显示核心服务
console.log('可用核心服务:');
result.discovery.coreServices.forEach(service => {
  console.log(`  - ${service.name}: ${service.operations.join(', ')}`);
});

// 检查系统能力
if (result.discovery.capabilities.unitTesting) {
  console.log('系统支持单元测试');
}
```
