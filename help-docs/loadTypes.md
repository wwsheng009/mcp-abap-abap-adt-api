# loadTypes - 加载对象类型

## 功能说明

`loadTypes` 工具用于从 ABAP 系统加载所有可用的对象类型定义。对象类型定义了系统中各种对象（如类、程序、函数等）的结构和属性。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("loadTypes", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的对象类型列表：

```json
{
  "status": "success",
  "types": [
    {
      "name": "PROG",
      "description": "Program",
      "category": "executable",
      "features": ["source_code", "syntax_check"],
      "properties": { /* 类型属性 */ }
    },
    {
      "name": "CLAS",
      "description": "Class",
      "category": "class",
      "features": ["source_code", "inheritance", "methods"],
      "properties": { /* 类型属性 */ }
    }
    // ... 更多类型
  ]
}
```

## 注意事项

1. 返回的类型列表可能很大，包含所有系统对象类型
2. 类型定义可能因 ABAP 系统版本而异
3. 某些自定义类型可能需要特定权限才能访问

## 参数限制

无。

## 与其他工具的关联性

- 对象类型信息用于 `searchObject` 的类型过滤
- 类型定义关联到 `objectStructure` 工具
- 类型的 `features` 属性指示可用的工具

## 使用场景说明

1. **类型发现**: 了解系统中可用的所有对象类型
2. **动态构建**: 根据可用类型动态构建用户界面
3. **类型验证**: 验证对象类型名称的有效性
4. **功能映射**: 根据类型确定支持的功能和操作

## 最佳实践

1. 缓存类型列表以避免重复加载
2. 使用类型信息优化搜索查询
3. 定期更新类型缓存以反映系统变化

## 错误处理

可能的错误：
- **权限不足**: 无权访问对象类型信息
- **系统错误**: ABAP 系统内部错误
- **网络错误**: 与 ABAP 系统通信失败

## 高级用法

```typescript
// 按类别过滤类型
function filterTypesByCategory(types, category) {
  return types.filter(t => t.category === category);
}

// 查找支持特定功能的类型
function findTypesWithFeature(types, feature) {
  return types.filter(t => t.features.includes(feature));
}

// 构建类型查找表
const typeMap = result.types.reduce((map, type) => {
  map[type.name] = type;
  return map;
}, {});
```

## 示例

```typescript
// 加载所有对象类型
const result = await mcp.callTool("loadTypes", {});

// 显示类型数量
console.log(`可用对象类型数量: ${result.types.length}`);

// 过滤出可执行类型
const executableTypes = result.types.filter(t => t.category === 'executable');
console.log(`可执行类型:`, executableTypes.map(t => t.name));
```
