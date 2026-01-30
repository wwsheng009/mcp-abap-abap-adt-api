# findCollectionByUrl - 通过 URL 查找集合

## 功能说明

`findCollectionByUrl` 工具用于通过 URL 查找并返回指定集合的信息，包括集合的基本属性和元数据。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("findCollectionByUrl", {
  url: "/sap/bc/adt/collections/..."
});
```

## 参数说明

- **url** (string, 必需): 要查找的集合的 URL 地址

## 返回结果

返回 JSON 格式的集合信息：

```json
{
  "status": "success",
  "collection": {
    "name": "集合名称",
    "type": "collection",
    "url": "集合 URL",
    "parent": "父集合 URL",
    "properties": { /* 集合属性 */ }
  }
}
```

## 注意事项

1. URL 必须指向有效的集合资源
2. 返回的信息可能不包含集合成员，需要使用 `collectionFeatureDetails` 获取完整详情
3. 集合可能有不同的类型和层级结构

## 参数限制

- `url` 必须是完整的 ADT URL
- URL 必须指向集合类型资源

## 与其他工具的关联性

- 查找到集合后，使用 `collectionFeatureDetails` 获取详细信息
- 集合 URL 可用于 `nodeContents` 获取内容
- 集合成员可通过 `searchObject` 查询

## 使用场景说明

1. **集合验证**: 验证 URL 指向的集合是否存在
2. **导航定位**: 在集合层级结构中定位特定集合
3. **URL 解析**: 解析集合 URL 获取元数据
4. **前置检查**: 在获取集合详情前验证集合存在性

## 最佳实践

1. 在调用 `collectionFeatureDetails` 前使用此工具验证 URL
2. 处理集合不存在的情况
3. 使用返回的 URL 进行后续操作

## 错误处理

可能的错误：
- **URL 无效**: 提供的 URL 格式不正确
- **集合不存在**: URL 指向的资源不存在
- **非集合资源**: URL 指向的不是集合类型
- **权限不足**: 无权访问该集合

## 高级用法

```typescript
// 构建集合导航链
async function buildCollectionChain(url) {
  const chain = [];
  let currentUrl = url;
  while (currentUrl) {
    const result = await mcp.callTool("findCollectionByUrl", { url: currentUrl });
    chain.unshift(result.collection);
    currentUrl = result.collection.parent;
  }
  return chain;
}
```

## 示例

```typescript
// 查找程序集合
const result = await mcp.callTool("findCollectionByUrl", {
  url: "/sap/bc/adt/repository/prog"
});

console.log(`集合名称: ${result.collection.name}`);
console.log(`类型: ${result.collection.type}`);
console.log(`URL: ${result.collection.url}`);
```
