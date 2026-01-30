# createTestInclude - 创建测试包含文件

## 功能说明

`createTestInclude` 工具用于为 ABAP 类创建测试包含文件（Test Include）。测试包含文件通常用于组织和管理单元测试代码。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("createTestInclude", {
  clas: "ZCL_MY_CLASS",
  lockHandle: "1234567890ABCDEF",
  transport: "K123456"
});
```

## 参数说明

- **clas** (string, 必需): 要创建测试包含的类名称
- **lockHandle** (string, 必需): 对象锁定句柄，用于防止并发修改冲突
- **transport** (string, 可选): 传输请求号，用于将更改记录到传输请求

## 返回结果

返回 JSON 格式的创建结果：

```json
{
  "status": "success",
  "result": {
    "className": "ZCL_MY_CLASS",
    "includeName": "ZCL_MY_CLASS_TESTS",
    "includeType": "test",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class/includes/test",
    "message": "Test include created successfully"
  },
  "message": "Test include created successfully"
}
```

## 注意事项

1. 必须先锁定对象才能创建测试包含
2. 类必须已存在于系统中
3. 如果测试包含已存在，可能会返回错误
4. 创建测试包含需要相应的开发权限

## 参数限制

- `clas` 必须是有效的 ABAP 类名
- `lockHandle` 必须是有效的锁定句柄
- `transport` 如果提供，必须是有效的传输请求号

## 与其他工具的关联性

- 使用 `lock` 工具锁定对象获取 `lockHandle`
- 使用 `getObjectSourceV2` 查看创建的测试包含
- 使用 `setObjectSourceV2` 编辑测试包含内容
- 使用 `activateByName` 激活测试包含
- 使用 `transportInfo` 将更改分配到传输请求

## 使用场景说明

1. **测试初始化**: 为现有类创建测试基础设施
2. **批量创建**: 为多个类批量创建测试包含
4. **重构支持**: 在重构时创建新的测试结构

## 最佳实践

1. 在创建前确认对象未被锁定
2. 为测试包含使用清晰的命名约定
3. 将测试包含关联到正确的传输请求
4. 创建后立即编写测试代码

## 错误处理

可能的错误：
- **类不存在**: 指定的类在系统中不存在
- **锁定失败**: 对象锁定句柄无效或已过期
- **权限不足**: 无权创建测试包含
- **已存在**: 测试包含已经存在
- **传输错误**: 传输请求无效或不可用

## 高级用法

```typescript
// 为类创建测试包含的完整流程
async function createTestClassWithTests(clas, transport) {
  // 锁定对象
  const lockResult = await mcp.callTool("lock", { url: `/sap/bc/adt/oo/classes/${clas.toLowerCase()}` });
  
  // 创建测试包含
  const createResult = await mcp.callTool("createTestInclude", {
    clas,
    lockHandle: lockResult.lockHandle,
    transport
  });
  
  // 编辑测试包含
  const testCode = generateTestClassCode(clas);
  await mcp.callTool("setObjectSourceV2", {
    url: createResult.result.url,
    source: testCode,
    lockHandle: lockResult.lockHandle
  });
  
  // 激活测试包含
  await mcp.callTool("activateByName", {
    name: createResult.result.includeName,
    url: createResult.result.url
  });
  
  return createResult;
}

// 批量创建测试包含
async function createMultipleTestIncludes(classes, transport) {
  const results = [];
  for (const clas of classes) {
    try {
      const result = await createTestClassWithTests(clas, transport);
      results.push({ clas, success: true, result });
    } catch (error) {
      results.push({ clas, success: false, error: error.message });
    }
  }
  return results;
}
```

## 示例

```typescript
// 为类创建测试包含
const clas = "ZCL_MY_CLASS";
const lockResult = await mcp.callTool("lock", {
  url: `/sap/bc/adt/oo/classes/${clas.toLowerCase()}`
});

const result = await mcp.callTool("createTestInclude", {
  clas,
  lockHandle: lockResult.lockHandle,
  transport: "K123456"
});

console.log(`成功创建测试包含: ${result.result.includeName}`);
console.log(`URL: ${result.result.url}`);
console.log(`消息: ${result.message}`);
```
