# prettyPrinter - 格式化 ABAP 代码

## 功能说明

`prettyPrinter` 工具使用 ABAP 格式化打印器对提供的 ABAP 源代码进行格式化。格式化应用当前设置的规则，包括缩进、大小写转换、空白处理等。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("prettyPrinter", {
  source: "DATA: lv_value TYPE i. WRITE: / lv_value."
});
```

## 参数说明

- **source** (string, 必需): 要格式化的 ABAP 源代码

## 返回结果

返回 JSON 格式的格式化结果：

```json
{
  "status": "success",
  "source": "DATA: lv_value TYPE i.\nWRITE: / lv_value.",
  "changes": [
    {
      "type": "indentation",
      "line": 1,
      "description": "Adjusted indentation"
    },
    {
      "type": "case",
      "line": 2,
      "description": "Converted keyword to uppercase"
    }
  ],
  "statistics": {
    "linesProcessed": 2,
    "changesApplied": 2,
    "formatTime": "5ms"
  }
}
```

## 注意事项

1. 源代码必须是有效的 ABAP 语法
2. 格式化遵循当前设置的规则
3. 格式化可能改变代码的结构
4. 建议在格式化前备份原始代码

## 参数限制

- `source` 必须是有效的 ABAP 源代码
- 空字符串将返回空结果
- 语法错误的代码可能导致格式化失败

## 与其他工具的关联性

- 使用 `prettyPrinterSetting` 查看当前格式化设置
- 使用 `setPrettyPrinterSetting` 修改格式化规则
- 格式化后的代码通过 `setObjectSourceV2` 保存
- 与 `syntaxCheckCode` 配合使用，格式化后检查语法

## 使用场景说明

1. **代码整理**: 整理混乱或格式不一致的代码
2. **团队标准**: 应用团队统一的编码风格
3. **代码审查**: 在代码审查前格式化代码
4. **重构准备**: 为重构创建格式良好的代码基础

## 最佳实践

1. 在版本控制下使用，便于回退
2. 使用一致的格式化设置
3. 在保存前验证格式化结果
4. 对重要代码进行代码审查

## 错误处理

可能的错误：
- **语法错误**: 源代码包含语法错误
- **格式化失败**: 格式化过程发生错误
- **设置无效**: 格式化设置配置错误
- **权限不足**: 无权执行格式化操作

## 高级用法

```typescript
// 批量格式化多个文件
async function formatMultipleFiles(files) {
  const results = [];
  for (const file of files) {
    const result = await mcp.callTool("prettyPrinter", {
      source: file.content
    });
    results.push({
      file: file.name,
      original: file.content,
      formatted: result.source,
      changes: result.changes
    });
  }
  return results;
}

// 格式化并保存对象
async function formatAndSaveObject(url, source, lockHandle) {
  // 格式化代码
  const formattedResult = await mcp.callTool("prettyPrinter", { source });
  
  // 保存格式化后的代码
  const saveResult = await mcp.callTool("setObjectSourceV2", {
    url,
    source: formattedResult.source,
    lockHandle
  });
  
  return saveResult;
}

// 预览格式化效果
function previewFormatting(source) {
  const formatted = await mcp.callTool("prettyPrinter", { source });
  console.log('原始代码:');
  console.log(source);
  console.log('\n格式化后:');
  console.log(formatted.source);
  console.log('\n更改:');
  formatted.changes.forEach(change => {
    console.log(`  行 ${change.line}: ${change.description}`);
  });
}
```

## 示例

```typescript
// 格式化 ABAP 代码
const source = `REPORT z_test_report.
DATA: lv_value TYPE i,
      lv_name  TYPE string.
lv_value = 100.
WRITE: / lv_value.`;

const result = await mcp.callTool("prettyPrinter", { source });

// 显示格式化结果
console.log('原始代码:');
console.log(source);
console.log('\n格式化后:');
console.log(result.source);

// 显示统计信息
console.log('\n统计:');
console.log(`  处理行数: ${result.statistics.linesProcessed}`);
console.log(`  应用更改: ${result.statistics.changesApplied}`);
console.log(`  格式化时间: ${result.statistics.formatTime}`);

// 显示更改详情
if (result.changes.length > 0) {
  console.log('\n更改详情:');
  result.changes.forEach((change, index) => {
    console.log(`  ${index + 1}. ${change.description} (行 ${change.line})`);
  });
}

// 将格式化后的代码保存到对象
const lockResult = await mcp.callTool("lock", { url: "/sap/bc/adt/programs/z_test_report" });
await mcp.callTool("setObjectSourceV2", {
  url: "/sap/bc/adt/programs/z_test_report/source/main",
  source: result.source,
  lockHandle: lockResult.lockHandle
});

await mcp.callTool("activateByName", {
  name: "Z_TEST_REPORT",
  url: "/sap/bc/adt/programs/z_test_report"
});
```
