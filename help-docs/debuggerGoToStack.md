# debuggerGoToStack

## 功能说明
跳转到调试堆栈中的指定位置，切换调试上下文。这在分析多层次的调用关系时非常有用，可以检查不同调用层次的变量状态。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerGoToStack",
  "arguments": {
    "urlOrPosition": "1"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "navigated": true,
    "currentFrame": {
      "index": 1,
      "uri": "/sap/bc/adt/programs/programs/zhandler.abap",
      "line": 85,
      "method": "handle_request",
      "program": "ZHANDLER"
    }
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| urlOrPosition | string | 是 | 堆栈帧的URL或位置索引 |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. 跳转后会改变当前的调试上下文
3. 位置索引从0开始，0表示当前执行位置
4. 跳转后变量列表会更新为新上下文的变量

## 参数限制

- `urlOrPosition`：必须是有效的堆栈帧位置或URL

## 与其他工具的关联性

- **debuggerStackTrace** - 查看堆栈（获取位置信息）
- **debuggerVariables** - 查看变量（跳转后查看新上下文的变量）
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：跳转到父调用帧
```json
{
  "urlOrPosition": "1"
}
```

### 场景2：跳转到指定方法
```json
{
  "urlOrPosition": "/sap/bc/adt/programs/programs/zhandler.abap#85"
}
```

## 最佳实践

✅ **推荐做法：**
1. 先使用`debuggerStackTrace`查看完整的堆栈
2. 使用位置索引进行快速跳转
3. 跳转后检查变量值
4. 用于分析调用链和参数传递

❌ **避免做法：**
1. 不要在非调试状态下调用
2. 避免使用无效的位置索引

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |
| "Invalid stack frame" | 堆栈帧无效 | 检查urlOrPosition参数 |
| "Stack frame out of range" | 堆栈帧超出范围 | 检查位置索引是否正确 |

## 高级用法

### 1. 分析调用链参数
```javascript
async function analyzeCallChain() {
  const stack = await debuggerStackTrace({ semanticURIs: true });
  
  const analysis = [];
  
  for (let i = 0; i < stack.stackFrames.length; i++) {
    // 跳转到该帧
    await debuggerGoToStack({ urlOrPosition: String(i) });
    
    // 获取变量
    const variables = await debuggerVariables({ parents: ["local"] });
    
    analysis.push({
      frame: stack.stackFrames[i],
      variables: variables.variables.map(v => ({
        name: v.name,
        value: v.value
      }))
    });
  }
  
  return analysis;
}
```

### 2. 参数追踪
```javascript
async function traceParameter(parameterName) {
  const stack = await debuggerStackTrace({ semanticURIs: true });
  
  const trace = [];
  
  for (let i = 0; i < stack.stackFrames.length; i++) {
    // 跳转到该帧
    await debuggerGoToStack({ urlOrPosition: String(i) });
    
    // 查找参数
    const variables = await debuggerVariables({ parents: ["local"] });
    const parameter = variables.variables.find(v => v.name === parameterName);
    
    if (parameter) {
      trace.push({
        frame: i,
        program: stack.stackFrames[i].program,
        method: stack.stackFrames[i].method,
        value: parameter.value
      });
    }
  }
  
  return trace;
}
```

## 示例

### 示例1：跳转到父调用帧
```json
{
  "tool": "debuggerGoToStack",
  "arguments": {
    "urlOrPosition": "1"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "navigated": true,
    "currentFrame": {
      "index": 1,
      "uri": "/sap/bc/adt/programs/programs/zhandler.abap",
      "line": 85,
      "method": "handle_request",
      "program": "ZHANDLER"
    }
  }
}
```

---

## 相关工具

- [debuggerStackTrace](debuggerStackTrace.md) - 查看堆栈
- [debuggerVariables](debuggerVariables.md) - 查看变量
- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
