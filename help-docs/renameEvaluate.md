# renameEvaluate

## 功能说明
评估重命名重构操作的可行性。在执行重命名前，使用此工具分析重命名操作的影响范围，检查是否会影响到其他对象，并提供预览信息。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "renameEvaluate",
  "arguments": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "line": 50,
    "startColumn": 10,
    "endColumn": 20
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "canRename": true,
    "currentName": "lv_counter",
    "type": "variable",
    "usages": 15,
    "affectedObjects": [
      "ZMY_PROGRAM",
      "Z_OTHER_PROGRAM"
    ],
    "conflicts": []
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uri | string | 是 | ABAP对象的URI |
| line | number | 是 | 行号，标识要重命名的元素位置 |
| startColumn | number | 是 | 起始列号 |
| endColumn | number | 是 | 结束列号 |

## 注意事项

⚠️ **重要提示：**
1. 必须在源代码中的正确位置选择要重命名的元素
2. 评估结果会显示重命名的影响范围
3. 某些元素（如系统类、关键字）可能无法重命名
4. 重命名可能影响到其他程序，需要仔细检查

## 参数限制

- `uri`：必须是有效的ABAP对象URI
- `line`：必须大于0
- `startColumn`和`endColumn`：必须构成有效的选择范围

## 与其他工具的关联性

- **renamePreview** - 预览重命名操作（评估后调用）
- **renameExecute** - 执行重命名操作（预览后调用）
- **searchObject** - 搜索受影响的对象

## 使用场景说明

### 场景1：评估变量重命名
```json
{
  "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
  "line": 50,
  "startColumn": 10,
  "endColumn": 20
}
```

### 场景2：评估方法重命名
```json
{
  "uri": "/sap/bc/adt/programs/programs/zmy_class.clas.abap",
  "line": 100,
  "startColumn": 5,
  "endColumn": 25
}
```

## 最佳实践

✅ **推荐做法：**
1. 重命名前始终先评估影响范围
2. 检查所有受影响的对象
3. 确认没有冲突或依赖问题
4. 在非生产环境先测试

❌ **避免做法：**
1. 不要重命名系统关键字或系统类
2. 避免在多个程序间广泛使用的方法名上直接重命名

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Cannot rename" | 元素无法重命名 | 检查元素类型和权限 |
| "Invalid selection" | 选择范围无效 | 检查位置参数 |
| "Object not found" | 对象不存在 | 检查URI是否正确 |

## 高级用法

### 1. 影响分析
```javascript
async function analyzeRenameImpact(uri, line, startColumn, endColumn) {
  const result = await renameEvaluate({
    uri,
    line,
    startColumn,
    endColumn
  });
  
  const impact = {
    canRename: result.canRename,
    currentName: result.currentName,
    type: result.type,
    totalUsages: result.usages,
    affectedFiles: result.affectedObjects.length,
    conflicts: result.conflicts.length,
    riskLevel: result.usages > 10 ? "high" : result.usages > 5 ? "medium" : "low"
  };
  
  return impact;
}
```

## 示例

### 示例1：评估变量重命名
```json
{
  "tool": "renameEvaluate",
  "arguments": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "line": 50,
    "startColumn": 10,
    "endColumn": 20
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "canRename": true,
    "currentName": "lv_counter",
    "type": "variable",
    "usages": 15,
    "affectedObjects": [
      "ZMY_PROGRAM",
      "Z_OTHER_PROGRAM"
    ],
    "conflicts": []
  }
}
```

---

## 相关工具

- [renamePreview](renamePreview.md) - 预览重命名操作
- [renameExecute](renameExecute.md) - 执行重命名操作
