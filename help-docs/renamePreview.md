# renamePreview

## 功能说明
预览重命名重构操作的结果。显示重命名将如何影响代码，包括所有使用位置的变更详情，帮助在执行前确认修改的正确性。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "renamePreview",
  "arguments": {
    "renameRefactoring": {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "currentName": "lv_counter",
      "newName": "lv_item_count",
      "line": 50,
      "startColumn": 10,
      "endColumn": 20
    },
    "transport": "<TRANSPORT_NUMBER>"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "changes": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "oldText": "lv_counter",
        "newText": "lv_item_count",
        "type": "declaration"
      },
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 75,
        "oldText": "lv_counter",
        "newText": "lv_item_count",
        "type": "reference"
      }
    ],
    "totalChanges": 15,
    "affectedFiles": 1
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| renameRefactoring | object | 是 | 重命名重构对象 |
| renameRefactoring.uri | string | 是 | ABAP对象的URI |
| renameRefactoring.currentName | string | 是 | 当前名称 |
| renameRefactoring.newName | string | 是 | 新名称 |
| renameRefactoring.line | number | 是 | 行号 |
| renameRefactoring.startColumn | number | 是 | 起始列号 |
| renameRefactoring.endColumn | number | 是 | 结束列号 |
| transport | string | 否 | 运输请求号 |

## 注意事项

⚠️ **重要提示：**
1. 预览不会实际修改代码
2. 可以检查所有变更后再决定是否执行
3. 运输请求号用于将变更记录到传输中
4. 新名称必须符合ABAP命名规范

## 参数限制

- `renameRefactoring`：必须包含所有必要属性
- `transport`：必须是有效的运输请求号

## 与其他工具的关联性

- **renameEvaluate** - 评估重命名操作（预览前调用）
- **renameExecute** - 执行重命名操作（预览后调用）

## 使用场景说明

### 场景1：预览重命名
```json
{
  "renameRefactoring": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "currentName": "lv_counter",
    "newName": "lv_item_count",
    "line": 50,
    "startColumn": 10,
    "endColumn": 20
  }
}
```

### 场景2：预览并指定运输请求
```json
{
  "renameRefactoring": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "currentName": "lv_counter",
    "newName": "lv_item_count",
    "line": 50,
    "startColumn": 10,
    "endColumn": 20
  },
  "transport": "<TRANSPORT_NUMBER>"
}
```

## 最佳实践

✅ **推荐做法：**
1. 始终在执行前预览变更
2. 检查所有变更是否正确
3. 使用运输请求记录变更
4. 为新名称选择有意义的名称

❌ **避免做法：**
1. 不要跳过预览直接执行
2. 避免使用不符合命名规范的新名称

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Invalid new name" | 新名称无效 | 检查名称是否符合规范 |
| "Name already exists" | 新名称已存在 | 使用其他名称 |
| "Transport not found" | 运输请求不存在 | 检查运输请求号 |

## 高级用法

### 1. 变更分析
```javascript
async function analyzeRenameChanges(renameRefactoring) {
  const result = await renamePreview({ renameRefactoring });
  
  const analysis = {
    totalChanges: result.totalChanges,
    affectedFiles: result.affectedFiles,
    changeTypes: {},
    filesAffected: {}
  };
  
  result.changes.forEach(change => {
    if (!analysis.changeTypes[change.type]) {
      analysis.changeTypes[change.type] = 0;
    }
    analysis.changeTypes[change.type]++;
    
    if (!analysis.filesAffected[change.uri]) {
      analysis.filesAffected[change.uri] = 0;
    }
    analysis.filesAffected[change.uri]++;
  });
  
  return analysis;
}
```

## 示例

### 示例1：预览重命名
```json
{
  "tool": "renamePreview",
  "arguments": {
    "renameRefactoring": {
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
    "changes": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "oldText": "lv_counter",
        "newText": "lv_item_count",
        "type": "declaration"
      },
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 75,
        "oldText": "lv_counter",
        "newText": "lv_item_count",
        "type": "reference"
      }
    ],
    "totalChanges": 15,
    "affectedFiles": 1
  }
}
```

---

## 相关工具

- [renameEvaluate](renameEvaluate.md) - 评估重命名操作
- [renameExecute](renameExecute.md) - 执行重命名操作
