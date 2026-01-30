# debuggerStep

## 功能说明
执行单步调试操作，包括单步进入、单步跳过、单步跳出等。这是调试时逐行执行代码的核心功能。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerStep",
  "arguments": {
    "steptype": "stepInto",
    "url": "/sap/bc/adt/programs/programs/zmy_program.abap"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "stepped": true,
    "currentLine": 151,
    "currentUri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "nextLine": 152
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| steptype | string | 是 | 步骤类型 |
| url | string | 否 | 程序URL（用于stepRunToLine和stepJumpToLine类型） |

## 步骤类型说明

| 步骤类型 | 说明 |
|---------|------|
| stepInto | 单步进入，进入调用的子程序 |
| stepOver | 单步跳过，执行当前行但不进入子程序 |
| stepOut | 单步跳出，从当前子程序返回调用者 |
| stepContinue | 继续执行，直到下一个断点 |
| stepRunToLine | 执行到指定行 |
| stepJumpToLine | 跳转到指定行（不执行中间代码） |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. 不同的步骤类型有不同的执行行为
3. stepJumpToLine会跳过中间代码，可能影响程序逻辑
4. 某些步骤类型需要额外的URL参数

## 参数限制

- `steptype`：必须是有效的步骤类型
- `url`：当steptype为stepRunToLine或stepJumpToLine时必填

## 与其他工具的关联性

- **debuggerAttach** - 附加到调试会话（必须先调用）
- **debuggerStackTrace** - 查看堆栈（了解当前位置）
- **debuggerVariables** - 查看变量（配合单步调试使用）

## 使用场景说明

### 场景1：单步进入
```json
{
  "steptype": "stepInto"
}
```

### 场景2：单步跳过
```json
{
  "steptype": "stepOver"
}
```

### 场景3：继续执行
```json
{
  "steptype": "stepContinue"
}
```

### 场景4：执行到指定行
```json
{
  "steptype": "stepRunToLine",
  "url": "/sap/bc/adt/programs/programs/zmy_program.abap?line=200"
}
```

## 最佳实践

✅ **推荐做法：**
1. 根据调试需求选择合适的步骤类型
2. 使用stepInto深入分析函数逻辑
3. 使用stepOver快速跳过不相关的代码
4. 定期检查变量值以跟踪状态变化
5. 使用stepContinue跳到下一个断点

❌ **避免做法：**
1. 不要在非调试状态下调用
2. 避免使用stepJumpToLine跳过重要逻辑
3. 不要过度使用stepInto影响调试效率

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |
| "Invalid step type" | 步骤类型无效 | 检查steptype参数 |
| "End of program" | 程序已结束 | 无法继续执行 |

## 高级用法

### 1. 条件单步调试
```javascript
async function conditionalStep(steptype, condition) {
  // 检查变量值
  const variables = await debuggerVariables({ parents: ["local"] });
  const conditionMet = checkCondition(variables, condition);
  
  if (conditionMet) {
    // 条件满足，执行单步
    const result = await debuggerStep({ steptype });
    return result;
  } else {
    // 条件不满足，跳过
    console.log("Condition not met, skipping step");
    return null;
  }
}
```

### 2. 自动化调试流程
```javascript
async function autoDebug(targetLine) {
  let currentLine = 0;
  
  while (currentLine < targetLine) {
    // 获取当前位置
    const stack = await debuggerStackTrace({ semanticURIs: true });
    currentLine = stack.stackFrames[0].line;
    
    // 检查变量
    const variables = await debuggerVariables({ parents: ["local"] });
    console.log(`Line ${currentLine}:`, variables);
    
    // 单步执行
    await debuggerStep({ steptype: "stepOver" });
  }
  
  console.log("Reached target line:", targetLine);
}
```

## 示例

### 示例1：单步进入
```json
{
  "tool": "debuggerStep",
  "arguments": {
    "steptype": "stepInto"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "stepped": true,
    "currentLine": 151,
    "currentUri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "nextLine": 152
  }
}
```

### 示例2：继续执行到下一个断点
```json
{
  "tool": "debuggerStep",
  "arguments": {
    "steptype": "stepContinue"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "stepped": true,
    "stoppedAtBreakpoint": true,
    "currentLine": 200,
    "currentUri": "/sap/bc/adt/programs/programs/zmy_program.abap"
  }
}
```

---

## 相关工具

- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
- [debuggerStackTrace](debuggerStackTrace.md) - 查看堆栈
- [debuggerVariables](debuggerVariables.md) - 查看变量
