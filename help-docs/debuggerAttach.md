# debuggerAttach

## 功能说明
附加到ABAP系统的调试会话，开始远程调试。必须在设置断点后调用此工具才能触发断点。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerAttach",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "debuggeeId": "DEBUGGEE_001",
    "user": "DEVELOPER01",
    "dynproDebugging": false
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "attached": true,
    "debuggeeId": "DEBUGGEE_001",
    "sessionId": "SESSION_001",
    "status": "waiting"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debuggingMode | string | 是 | 调试模式 |
| debuggeeId | string | 是 | 被调试对象ID |
| user | string | 是 | 用户名 |
| dynproDebugging | boolean | 否 | 是否启用Dynpro调试，默认为false |

## 注意事项

⚠️ **重要提示：**
1. 必须先启动监听器并设置断点
2. 调试期间被调试程序会被暂停
3. Dynpro调试需要特殊权限
4. 附加后可以执行单步、查看变量等操作

## 参数限制

- `debuggeeId`：必须是有效的调试对象ID

## 与其他工具的关联性

- **debuggerListen** - 启动监听器（必须先调用）
- **debuggerSetBreakpoints** - 设置断点（必须先调用）
- **debuggerStep** - 单步执行
- **debuggerVariables** - 查看变量

## 使用场景说明

### 场景1：附加到调试会话
```json
{
  "debuggingMode": "DEBUGGING",
  "debuggeeId": "DEBUGGEE_001",
  "user": "DEVELOPER01"
}
```

### 场景2：启用Dynpro调试
```json
{
  "debuggingMode": "DEBUGGING",
  "debuggeeId": "DEBUGGEE_001",
  "user": "DEVELOPER01",
  "dynproDebugging": true
}
```

## 最佳实践

✅ **推荐做法：**
1. 确保监听器和断点已设置
2. 使用适当的调试模式
3. 调试完成后及时分离
4. 记录调试会话信息

❌ **避免做法：**
1. 不要附加到其他用户的会话
2. 避免在生产环境使用调试

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active listener" | 监听器未启动 | 先调用debuggerListen |
| "No breakpoints set" | 未设置断点 | 先设置断点 |
| "Debuggee not found" | 调试对象不存在 | 检查debuggeeId |

## 高级用法

### 1. 完整的调试流程
```javascript
async function startDebugging(uri, line, user) {
  const debuggingMode = "DEBUGGING";
  const terminalId = "TERM_001";
  const ideId = "IDE_001";
  const clientId = "CLIENT_001";
  
  try {
    // 1. 启动监听器
    await debuggerListen({
      debuggingMode,
      terminalId,
      ideId,
      user
    });
    
    // 2. 设置断点
    await debuggerSetBreakpoints({
      debuggingMode,
      terminalId,
      ideId,
      clientId,
      user,
      breakpoints: [{ uri, line }]
    });
    
    // 3. 附加到调试会话
    await debuggerAttach({
      debuggingMode,
      debuggeeId: "DEBUGGEE_001",
      user
    });
    
    console.log("Debugging started");
  } catch (error) {
    console.error("Failed to start debugging:", error);
    throw error;
  }
}
```

## 示例

### 示例1：附加到调试会话
```json
{
  "tool": "debuggerAttach",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "debuggeeId": "DEBUGGEE_001",
    "user": "DEVELOPER01"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "attached": true,
    "debuggeeId": "DEBUGGEE_001",
    "sessionId": "SESSION_001",
    "status": "waiting"
  }
}
```

---

## 相关工具

- [debuggerListen](debuggerListen.md) - 启动监听器
- [debuggerSetBreakpoints](debuggerSetBreakpoints.md) - 设置断点
- [debuggerStep](debuggerStep.md) - 单步执行
- [debuggerVariables](debuggerVariables.md) - 查看变量
