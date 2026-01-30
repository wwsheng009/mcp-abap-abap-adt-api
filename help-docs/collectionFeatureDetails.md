# collectionFeatureDetails - 获取集合功能详细信息

## 功能说明

`collectionFeatureDetails` 工具用于获取指定集合功能的详细信息。集合功能通常代表一组相关的操作或资源。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("collectionFeatureDetails", {
  url: "/sap/bc/adt/collections/..."
});
```

## 参数说明

- **url** (string, 必需): 集合功能的 URL 地址

## 返回结果

返回 JSON 格式的集合功能详细信息：

```json
{
  "status": "success",
  "details": {
    "name": "集合名称",
    "description": "集合描述",
    "members": [ /* 集合成员列表 */ ],
    "operations": [ /* 支持的操作 */ ]
  }
}
```

## 注意事项

1. URL 必须是有效的 ADT 集合 URL
2. 集合可能包含大量成员，需注意性能
3. 某些集合可能有访问限制

## 参数限制

- `url` 必须是完整的、有效的 ADT URL
- URL 路径必须正确

## 与其他工具的关联性

- 与 `findCollectionByUrl` 配合，先查找集合，再获取详情
- 集合成员可通过 `searchObject` 进一步查询
- 集合操作可能关联到多个工具

## 使用场景说明

1. **集合浏览**: 查看集合包含的所有成员
2. **批量操作**: 对集合中的多个对象执行相同操作
3. **资源发现**: 发现特定类型的所有可用资源
4. **导航辅助**: 在资源树中导航

## 最佳实践

1. 使用 `findCollectionByUrl` 验证 URL 有效性
2. 对大型集合使用分页或过滤
3. 缓存集合详情以减少网络请求

## 错误处理

可能的错误：
- **URL 无效**: 提供的 URL 不正确或不存在
- **权限不足**: 无权访问该集合
- **集合不存在**: URL 指向的集合不存在

## 高级用法

```typescript
// 递归获取嵌套集合
async function getNestedCollections(url) {
  const result = await mcp.callTool("collectionFeatureDetails", { url });
  const nested = [];
  for (const member of result.details.members) {
    if (member.type === 'collection') {
      nested.push(...await getNestedCollections(member.url));
    }
  }
  return [result.details, ...nested];
}
```

## 示例

```typescript
// 获取程序集合详情
const result = await mcp.callTool("collectionFeatureDetails", {
  url: "/sap/bc/adt/repository/prog"
});

console.log(`集合名称: ${result.details.name}`);
console.log(`成员数量: ${result.details.members.length}`);
```
