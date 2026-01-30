# debuggerStackTrace

## 功能说明
获取调试器的堆栈跟踪信息，显示当前执行的程序调用链。这对于理解程序的执行流程和定位问题非常有用。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerStackTrace",
  "arguments": {
    "semanticURIs": true
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "stackFrames": [
      {
        "index": 0,
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 150,
        "method": "process_order",
        "program": "ZMY_PROGRAM"
      },
      {
        "index": 1,
        "uri": "/sap/bc/adt/programs/programs/zhandler.abap",
        "line": 85,
        "method": "handle_request",
        "program": "ZHANDLER"
      }
    ]
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| semanticURIs | boolean | 否 | 是否使用语义URI，默认为false |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. 堆栈跟踪会显示从当前点到程序入口的完整调用链
3. 使用语义URI可以获得更可读的结果

## 参数限制

无特殊限制

## 与其他工具的关联性

- **debuggerAttach** - 附加到调试会话（必须先调用）
- **debuggerGoToStack** - 跳转到指定堆栈帧
- **debuggerVariables** - 查看变量（结合堆栈使用）

## 使用场景说明

### 场景1：获取堆栈跟踪
```json
{
  "semanticURIs": true
}
```

### 场景2：获取原始URI的堆栈
```json
{
  "semanticURIs": false
}
```

## 最佳实践

✅ **推荐做法：**
1. 使用语义URI以获得更好的可读性
2. 定期检查堆栈以跟踪执行流程
3. 结合变量查看进行问题定位

❌ **避免做法：**
1. 不要在非调试状态下调用

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |

## 高级用法

### 1. 分析堆栈跟踪
```javascript
async function analyzeStackTrace() {
  const result = await debuggerStackTrace({ semanticURIs: true });
  
  const analysis = {
    depth: result.stackFrames.length,
    programs: [...new Set(result.stackFrames.map(f => f.program))],
    methods: [...new Set(result.stackFrames.map(f => f.method))]
  };
  
  console.log("Stack Analysis:", analysis);
  return analysis;
}
```

## 示例

### 示例1：获取堆栈跟踪
```json
{
  "tool": "debuggerStackTrace",
  "arguments": {
    "semanticURIs": true
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "stackFrames": [
      {
        "index": 0,
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 150,
        "method": "process_order",
        "program": "ZMY_PROGRAM"
      },
      {
        "index": 1,
        "uri": "/sap/bc/adt/programs/programs/zhandler.abap",
        "line": 85,
        "method": "handle_request",
        "program": "ZHANDLER"
      }
    ]
  }
}
```

---

## 相关工具

- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
- [debuggerGoToStack](debuggerGoToStack.md) - 跳转到堆栈帧
- [debuggerVariables](debuggerVariables.md) - 查看变量
