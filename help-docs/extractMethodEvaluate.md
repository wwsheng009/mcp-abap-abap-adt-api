# extractMethodEvaluate

## 功能说明
评估提取方法重构操作的可行性。从选定的代码范围中提取出一个新方法，分析代码的依赖关系和提取的可行性。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "extractMethodEvaluate",
  "arguments": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "range": "50-100"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "canExtract": true,
    "suggestedName": "calculate_total",
    "parameters": [
      {
        "name": "iv_amount",
        "type": "I",
        "direction": "importing"
      }
    ],
    "returnType": "I",
    "complexity": "medium",
    "warnings": []
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uri | string | 是 | ABAP对象的URI |
| range | string | 是 | 代码范围（格式：起始行-结束行） |

## 注意事项

⚠️ **重要提示：**
1. 选定的代码范围必须构成完整的逻辑块
2. 代码不能包含不完整的控制结构
3. 提取后的方法需要合适的参数和返回值
4. 某些代码可能因为依赖关系复杂而无法提取

## 参数限制

- `uri`：必须是有效的ABAP对象URI
- `range`：必须是有效的范围格式（"起始行-结束行"）

## 与其他工具的关联性

- **extractMethodPreview** - 预览提取方法操作（评估后调用）
- **extractMethodExecute** - 执行提取方法操作（预览后调用）

## 使用场景说明

### 场景1：评估提取方法
```json
{
  "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
  "range": "50-100"
}
```

### 场景2：评估大块代码提取
```json
{
  "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
  "range": "200-350"
}
```

## 最佳实践

✅ **推荐做法：**
1. 选择逻辑完整的代码块
2. 检查评估结果的警告信息
3. 为提取的方法选择有意义的名称
4. 确认参数和返回值的类型正确

❌ **避免做法：**
1. 不要选择不完整的控制结构
2. 避免提取过于复杂的代码

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Cannot extract" | 无法提取 | 检查代码范围和结构 |
| "Invalid range" | 范围无效 | 检查范围格式 |

## 高级用法

### 1. 代码复杂度分析
```javascript
async function analyzeExtractionComplexity(uri, range) {
  const result = await extractMethodEvaluate({ uri, range });
  
  const analysis = {
    canExtract: result.canExtract,
    complexity: result.complexity,
    parameterCount: result.parameters.length,
    hasReturnValue: result.returnType !== null,
    warnings: result.warnings.length,
    riskLevel: result.complexity === "high" ? "high" : result.complexity === "medium" ? "medium" : "low"
  };
  
  return analysis;
}
```

## 示例

### 示例1：评估提取方法
```json
{
  "tool": "extractMethodEvaluate",
  "arguments": {
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "range": "50-100"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "canExtract": true,
    "suggestedName": "calculate_total",
    "parameters": [
      {
        "name": "iv_amount",
        "type": "I",
        "direction": "importing"
      }
    ],
    "returnType": "I",
    "complexity": "medium",
    "warnings": []
  }
}
```

---

## 相关工具

- [extractMethodPreview](extractMethodPreview.md) - 预览提取方法操作
- [extractMethodExecute](extractMethodExecute.md) - 执行提取方法操作
