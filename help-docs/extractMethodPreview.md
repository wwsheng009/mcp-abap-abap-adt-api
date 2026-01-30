# extractMethodPreview

## 功能说明
预览提取方法重构操作的结果。显示提取出的新方法的代码、参数定义、返回值以及调用处的变更，帮助在执行前确认重构的正确性。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "extractMethodPreview",
  "arguments": {
    "proposal": {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "methodName": "calculate_total",
      "range": "50-100",
      "parameters": [
        {
          "name": "iv_amount",
          "type": "I",
          "direction": "importing"
        }
      ],
      "returnType": "I"
    }
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "newMethod": {
      "name": "calculate_total",
      "signature": "METHODS calculate_total IMPORTING iv_amount TYPE i RETURNING VALUE(rv_total) TYPE i",
      "code": "METHOD calculate_total.\n  DATA: lv_result TYPE i.\n  lv_result = iv_amount * 2.\n  rv_total = lv_result.\nENDMETHOD."
    },
    "changes": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "type": "extraction",
        "description": "Extract code to new method"
      },
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 150,
        "type": "call",
        "description": "Replace extracted code with method call",
        "callCode": "lv_total = calculate_total( iv_amount = lv_amount )."
      }
    ]
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| proposal | object | 是 | 提取方法提案对象 |
| proposal.uri | string | 是 | ABAP对象的URI |
| proposal.methodName | string | 是 | 新方法的名称 |
| proposal.range | string | 是 | 要提取的代码范围 |
| proposal.parameters | array | 是 | 方法参数列表 |
| proposal.returnType | string | 是 | 返回值类型 |

## 注意事项

⚠️ **重要提示：**
1. 预览不会实际修改代码
2. 可以检查新方法的代码是否正确
3. 确认参数和返回值类型合适
4. 检查调用处的变更是否符合预期

## 参数限制

- `proposal`：必须包含完整的提案信息

## 与其他工具的关联性

- **extractMethodEvaluate** - 评估提取方法操作（预览前调用）
- **extractMethodExecute** - 执行提取方法操作（预览后调用）

## 使用场景说明

### 场景1：预览提取方法
```json
{
  "proposal": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "methodName": "calculate_total",
    "range": "50-100",
    "parameters": [
      {
        "name": "iv_amount",
        "type": "I",
        "direction": "importing"
      }
    ],
    "returnType": "I"
  }
}
```

## 最佳实践

✅ **推荐做法：**
1. 始终在执行前预览变更
2. 检查新方法的代码逻辑
3. 确认参数和返回值类型正确
4. 验证调用处的代码变更

❌ **避免做法：**
1. 不要跳过预览直接执行

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Invalid proposal" | 提案无效 | 检查提案信息完整性 |
| "Name conflict" | 名称冲突 | 使用其他方法名 |

## 高级用法

### 1. 变更验证
```javascript
async function validateExtractionProposal(proposal) {
  const result = await extractMethodPreview({ proposal });
  
  const validation = {
    methodSignature: result.newMethod.signature,
    parameterCount: proposal.parameters.length,
    hasReturnValue: proposal.returnType !== null,
    changeCount: result.changes.length,
    callSites: result.changes.filter(c => c.type === "call").length
  };
  
  return validation;
}
```

## 示例

### 示例1：预览提取方法
```json
{
  "tool": "extractMethodPreview",
  "arguments": {
    "proposal": {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "methodName": "calculate_total",
      "range": "50-100",
      "parameters": [
        {
          "name": "iv_amount",
          "type": "I",
          "direction": "importing"
        }
      ],
      "returnType": "I"
    }
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "newMethod": {
      "name": "calculate_total",
      "signature": "METHODS calculate_total IMPORTING iv_amount TYPE i RETURNING VALUE(rv_total) TYPE i",
      "code": "METHOD calculate_total.\n  DATA: lv_result TYPE i.\n  lv_result = iv_amount * 2.\n  rv_total = lv_result.\nENDMETHOD."
    },
    "changes": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "type": "extraction",
        "description": "Extract code to new method"
      }
    ]
  }
}
```

---

## 相关工具

- [extractMethodEvaluate](extractMethodEvaluate.md) - 评估提取方法操作
- [extractMethodExecute](extractMethodExecute.md) - 执行提取方法操作
