# adtDiscovery - ADT 发现

## 功能说明

`adtDiscovery` 工具执行 ADT (ABAP Development Tools) 发现操作，返回 ABAP 系统的服务端点和可用功能概览。这是连接和与 ABAP 系统交互的第一步。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("adtDiscovery", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的 ADT 发现信息：

```json
{
  "status": "success",
  "discovery": {
    "version": "7.50",
    "services": [
      {
        "name": "repository",
        "url": "/sap/bc/adt/repository",
        "description": "Repository services"
      },
      {
        "name": "source_code",
        "url": "/sap/bc/adt/source_code",
        "description": "Source code services"
      }
      // ... 更多服务
    ],
    "features": [
      "syntax_check",
      "code_completion",
      "unit_test"
      // ... 更多功能
    ],
    "endpoints": { /* 服务端点映射 */ }
  }
}
```

## 注意事项

1. 此工具通常在建立连接后首先调用
2. 返回的信息用于构建后续工具调用的 URL
3. 发现结果可能因系统版本和配置而异
4. 某些高级功能可能需要额外授权

## 参数限制

无。

## 与其他工具的关联性

- 是大多数其他工具的前置步骤
- 服务 URL 用于 `featureDetails` 和 `collectionFeatureDetails`
- 功能列表指示可用的高级功能

## 使用场景说明

1. **连接初始化**: 验证与 ABAP 系统的连接
2. **能力检测**: 检测系统支持哪些功能和服务
3. **URL 构建**: 获取各服务的基 URL 用于后续调用
4. **版本检查**: 确定 ABAP 系统版本

## 最佳实践

1. 在会话开始时调用一次并缓存结果
2. 使用服务端点信息构建稳定的 URL
3. 根据功能列表动态调整 UI 或功能可用性
4. 定期重新发现以检测系统更新

## 错误处理

可能的错误：
- **连接失败**: 无法连接到 ABAP 系统
- **权限不足**: 无权执行发现操作
- **系统错误**: ABAP 系统内部错误
- **版本不兼容**: ABAP 系统版本不支持 ADT

## 高级用法

```typescript
// 构建服务 URL 工具函数
function buildServiceUrl(base, service, path = '') {
  const serviceUrl = discovery.services.find(s => s.name === service)?.url;
  return `${serviceUrl}${path}`;
}

// 检查功能是否可用
function hasFeature(feature) {
  return discovery.features.includes(feature);
}

// 获取系统版本信息
const systemVersion = result.discovery.version;
```

## 示例

```typescript
// 执行 ADT 发现
const result = await mcp.callTool("adtDiscovery", {});

// 显示系统信息
console.log(`ABAP 系统版本: ${result.discovery.version}`);
console.log(`可用服务数量: ${result.discovery.services.length}`);
console.log(`可用功能: ${result.discovery.features.join(', ')}`);

// 查找特定服务
const repoService = result.discovery.services.find(s => s.name === 'repository');
console.log(`仓库服务 URL: ${repoService.url}`);
```
