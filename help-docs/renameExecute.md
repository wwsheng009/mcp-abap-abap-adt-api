# renameExecute

## 功能说明
执行重命名重构操作，将代码中的所有引用从旧名称更新为新名称。这是重构的最后一步，在确认预览结果正确后调用。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "renameExecute",
  "arguments": {
    "refactoring": {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "currentName": "lv_counter",
      "newName": "lv_item_count",
      "line": 50,
      "startColumn": 10,
      "endColumn": 20,
      "changes": [
        {
          "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
          "line": 50,
          "oldText": "lv_counter",
          "newText": "lv_item_count"
        }
      ]
    }
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "executed": true,
    "changesApplied": 15,
    "transport": "<TRANSPORT_NUMBER>",
    "message": "Rename completed successfully"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refactoring | object | 是 | 重命名重构对象（通常从renamePreview获取） |
| refactoring.uri | string | 是 | ABAP对象的URI |
| refactoring.currentName | string | 是 | 当前名称 |
| refactoring.newName | string | 是 | 新名称 |
| refactoring.line | number | 是 | 行号 |
| refactoring.startColumn | number | 是 | 起始列号 |
| refactoring.endColumn | number | 是 | 结束列号 |
| refactoring.changes | array | 否 | 要应用的变更列表 |

## 注意事项

⚠️ **重要提示：**
1. 执行后会实际修改代码，无法撤销
2. 建议先执行预览确认变更正确
3. 变更会记录到运输请求中
4. 执行后需要激活对象

## 参数限制

- `refactoring`：必须包含完整的重构信息

## 与其他工具的关联性

- **renameEvaluate** - 评估重命名操作（执行前调用）
- **renamePreview** - 预览重命名操作（执行前调用）
- **activateObjects** - 激活修改后的对象

## 使用场景说明

### 场景1：执行重命名
```json
{
  "refactoring": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "currentName": "lv_counter",
    "newName": "lv_item_count",
    "line": 50,
    "startColumn": 10,
    "endColumn": 20
  }
}
```

## 最佳实践

✅ **推荐做法：**
1. 始终先预览再执行
2. 确认所有变更正确后再执行
3. 执行后立即激活对象
4. 在非生产环境先测试

❌ **避免做法：**
1. 不要跳过预览直接执行
2. 避免在生产环境执行未经测试的重构

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Execution failed" | 执行失败 | 检查重构信息和权限 |
| "Activation failed" | 激活失败 | 检查代码语法和依赖 |

## 高级用法

### 1. 安全的重命名流程
```javascript
async function safeRename(uri, line, startColumn, endColumn, newName) {
  try {
    // 1. 评估
    const evaluation = await renameEvaluate({
      uri,
      line,
      startColumn,
      endColumn
    });
    
    if (!evaluation.canRename) {
      throw new Error("Cannot rename this element");
    }
    
    // 2. 预览
    const preview = await renamePreview({
      renameRefactoring: {
        uri,
        currentName: evaluation.currentName,
        newName,
        line,
        startColumn,
        endColumn
      }
    });
    
    console.log(`Will apply ${preview.totalChanges} changes`);
    
    // 3. 执行
    const result = await renameExecute({
      refactoring: {
        uri,
        currentName: evaluation.currentName,
        newName,
        line,
        startColumn,
        endColumn
      }
    });
    
    console.log("Rename completed:", result);
    
    return result;
  } catch (error) {
    console.error("Rename failed:", error);
    throw error;
  }
}
```

## 示例

### 示例1：执行重命名
```json
{
  "tool": "renameExecute",
  "arguments": {
    "refactoring": {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "currentName": "lv_counter",
      "newName": "lv_item_count",
      "line": 50,
      "startColumn": 10,
      "endColumn": 20
    }
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "executed": true,
    "changesApplied": 15,
    "transport": "<TRANSPORT_NUMBER>",
    "message": "Rename completed successfully"
  }
}
```

---

## 相关工具

- [renameEvaluate](renameEvaluate.md) - 评估重命名操作
- [renamePreview](renamePreview.md) - 预览重命名操作
- [activateObjects](activateObjects.md) - 激活对象
