# adtCompatibiliyGraph - 获取 ADT 兼容性图

## 功能说明

`adtCompatibiliyGraph` 工具获取 ADT 兼容性图，描述 ADT 系统中各个组件、服务和 API 之间的兼容性关系。这对于确保应用程序与特定 ABAP 系统版本的兼容性非常重要。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("adtCompatibiliyGraph", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的兼容性图：

```json
{
  "status": "success",
  "graph": {
    "version": "7.40-7.50",
    "nodes": [
      {
        "id": "adt_core",
        "type": "service",
        "version": "1.0",
        "status": "stable"
      },
      {
        "id": "syntax_check",
        "type": "feature",
        "version": "2.1",
        "status": "stable"
      }
      // ... 更多节点
    ],
    "edges": [
      {
        "from": "adt_core",
        "to": "syntax_check",
        "type": "depends_on",
        "required": true
      }
      // ... 更多边
    ],
    "compatibilityMatrix": {
      "7.40": ["syntax_check:1.0", "code_completion:1.0"],
      "7.50": ["syntax_check:2.1", "code_completion:2.0", "unit_test:1.5"]
    }
  }
}
```

## 注意事项

1. 兼容性图提供了版本间的依赖关系
2. 某些功能只在特定版本中可用
3. 向后兼容性通常得到保证，但向前兼容性可能不支持
4. 使用此信息可以避免调用不支持的功能

## 参数限制

无。

## 与其他工具的关联性

- 帮助确定哪些工具可在当前系统版本中使用
- 兼容性矩阵可用于版本检查
- 图结构用于理解组件间的关系

## 使用场景说明

1. **版本检查**: 检查应用程序是否与系统版本兼容
2. **功能规划**: 根据可用功能规划开发
3. **迁移支持**: 支持从一个版本迁移到另一个版本
4. **错误预防**: 避免调用不兼容的功能

## 最佳实践

1. 在首次连接时获取兼容性图并缓存
2. 使用 `compatibilityMatrix` 验证功能可用性
3. 根据兼容性信息动态调整功能集
4. 定期检查兼容性图以获取更新

## 错误处理

可能的错误：
- **无法获取兼容性**: 系统不支持兼容性图查询
- **版本未知**: 当前系统版本不在兼容性图中
- **权限不足**: 无权访问兼容性信息
- **数据损坏**: 兼容性图数据格式错误

## 高级用法

```typescript
// 检查功能是否与系统版本兼容
function isFeatureCompatible(featureName, systemVersion) {
  const compatibleFeatures = graph.compatibilityMatrix[systemVersion];
  return compatibleFeatures?.some(f => f.startsWith(featureName)) || false;
}

// 查找功能的依赖项
function getDependencies(featureId) {
  return graph.edges
    .filter(e => e.to === featureId && e.required)
    .map(e => e.from);
}

// 验证整个功能集的兼容性
function validateFeatureSet(features, systemVersion) {
  return features.every(f => isFeatureCompatible(f, systemVersion));
}
```

## 示例

```typescript
// 获取兼容性图
const result = await mcp.callTool("adtCompatibiliyGraph", {});

// 显示版本兼容性信息
console.log('版本兼容性矩阵:');
for (const [version, features] of Object.entries(result.graph.compatibilityMatrix)) {
  console.log(`  ${version}: ${features.length} 个功能`);
}

// 检查特定功能兼容性
const featuresToCheck = ['syntax_check', 'code_completion'];
const systemVersion = '7.50';

console.log(`\n检查功能在 ${systemVersion} 版本的兼容性:`);
featuresToCheck.forEach(feature => {
  const compatible = result.graph.compatibilityMatrix[systemVersion]?.includes(feature);
  console.log(`  ${feature}: ${compatible ? '✓' : '✗'}`);
});
```
