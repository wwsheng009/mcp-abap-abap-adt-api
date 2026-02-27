# extractMethodExecute

## 功能说明
执行提取方法重构操作，将选定的代码范围提取为一个新方法，并在原位置添加方法调用。这是重构的最后一步，在确认预览结果正确后调用。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "extractMethodExecute",
  "arguments": {
    "refactoring": {
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
      "returnType": "I",
      "code": "METHOD calculate_total.\n  DATA: lv_result TYPE i.\n  lv_result = iv_amount * 2.\n  rv_total = lv_result.\nENDMETHOD."
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
    "methodName": "calculate_total",
    "changesApplied": 2,
    "transport": "<TRANSPORT_NUMBER>",
    "message": "Method extraction completed successfully"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refactoring | object | 是 | 重构对象（通常从extractMethodPreview获取） |
| refactoring.uri | string | 是 | ABAP对象的URI |
| refactoring.methodName | string | 是 | 新方法的名称 |
| refactoring.range | string | 是 | 要提取的代码范围 |
| refactoring.parameters | array | 是 | 方法参数列表 |
| refactoring.returnType | string | 是 | 返回值类型 |
| refactoring.code | string | 是 | 新方法的代码 |

## 注意事项

⚠️ **重要提示：**
1. 执行后会实际修改代码，无法撤销
2. 建议先执行预览确认变更正确
3. 变更会记录到运输请求中
4. 执行后需要激活对象

## 参数限制

- `refactoring`：必须包含完整的重构信息

## 与其他工具的关联性

- **extractMethodEvaluate** - 评估提取方法操作（执行前调用）
- **extractMethodPreview** - 预览提取方法操作（执行前调用）
- **activateObjects** - 激活修改后的对象

## 使用场景说明

### 场景1：执行提取方法
```json
{
  "refactoring": {
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
    "returnType": "I",
    "code": "METHOD calculate_total.\n  DATA: lv_result TYPE i.\n  lv_result = iv_amount * 2.\n  rv_total = lv_result.\nENDMETHOD."
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

### 1. 安全的提取方法流程
```javascript
async function safeExtractMethod(uri, range, methodName) {
  try {
    // 1. 评估
    const evaluation = await extractMethodEvaluate({ uri, range });
    
    if (!evaluation.canExtract) {
      throw new Error("Cannot extract method from this code");
    }
    
    // 2. 预览
    const preview = await extractMethodPreview({
      proposal: {
        uri,
        methodName,
        range,
        parameters: evaluation.parameters,
        returnType: evaluation.returnType
      }
    });
    
    console.log("New method code:", preview.newMethod.code);
    
    // 3. 执行
    const result = await extractMethodExecute({
      refactoring: {
        uri,
        methodName,
        range,
        parameters: evaluation.parameters,
        returnType: evaluation.returnType,
        code: preview.newMethod.code
      }
    });
    
    console.log("Extraction completed:", result);
    
    return result;
  } catch (error) {
    console.error("Extraction failed:", error);
    throw error;
  }
}
```

## 示例

### 示例1：执行提取方法
```json
{
  "tool": "extractMethodExecute",
  "arguments": {
    "refactoring": {
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
      "returnType": "I",
      "code": "METHOD calculate_total.\n  DATA: lv_result TYPE i.\n  lv_result = iv_amount * 2.\n  rv_total = lv_result.\nENDMETHOD."
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
    "methodName": "calculate_total",
    "changesApplied": 2,
    "transport": "<TRANSPORT_NUMBER>",
    "message": "Method extraction completed successfully"
  }
}
```

---

## 相关工具

- [extractMethodEvaluate](extractMethodEvaluate.md) - 评估提取方法操作
- [extractMethodPreview](extractMethodPreview.md) - 预览提取方法操作
- [activateObjects](activateObjects.md) - 激活对象
