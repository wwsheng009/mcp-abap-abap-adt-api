# debuggerListen

## 功能说明
启动调试器监听，开始监听ABAP系统中的调试事件。这是远程调试的核心步骤，需要在设置断点前调用。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerListen",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01",
    "checkConflict": true,
    "isNotifiedOnConflict": true
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "listenerId": "listener_001",
    "status": "listening",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01",
    "mode": "DEBUGGING"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debuggingMode | string | 是 | 调试模式（如"DEBUGGING"、"STEP_MODE"等） |
| terminalId | string | 是 | 终端ID，用于标识调试会话 |
| ideId | string | 是 | IDE ID，用于标识开发环境 |
| user | string | 是 | 用户名 |
| checkConflict | boolean | 否 | 是否检查冲突，默认为false |
| isNotifiedOnConflict | boolean | 否 | 发生冲突时是否通知，默认为false |

## 注意事项

⚠️ **重要提示：**
1. 启动监听器后才能设置断点
2. 监听器会占用系统资源，不使用时应删除
3. 冲突检查可以帮助避免多个调试会话干扰
4. 监听器状态会持续到被显式删除或会话结束

## 参数限制

- `debuggingMode`：必须是有效的调试模式字符串
- `terminalId`：长度不超过50字符，建议使用唯一ID
- `ideId`：长度不超过50字符
- `user`：必须是有效的ABAP用户名

## 与其他工具的关联性

- **debuggerListeners** - 查询监听器列表
- **debuggerDeleteListener** - 停止监听
- **debuggerSetBreakpoints** - 设置断点
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：启动调试监听
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "user": "DEVELOPER01"
}
```

### 场景2：启动带冲突检查的监听
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "user": "DEVELOPER01",
  "checkConflict": true,
  "isNotifiedOnConflict": true
}
```

## 最佳实践

✅ **推荐做法：**
1. 使用唯一的terminalId和ideId
2. 启动前检查是否存在冲突
3. 启用冲突通知以便及时发现问题
4. 调试结束后及时删除监听器

❌ **避免做法：**
1. 不要创建多个相同ID的监听器
2. 避免在不需要时保持监听器活跃

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Authorization failed" | 缺少调试权限 | 联系管理员授予调试权限 |
| "Conflict detected" | 监听器冲突 | 使用不同的terminalId或删除现有监听器 |
| "Invalid debugging mode" | 调试模式无效 | 检查debuggingMode参数 |

## 高级用法

### 1. 安全的监听器启动
```javascript
async function startSafeListener(debuggingMode, terminalId, ideId, user) {
  // 1. 检查现有监听器
  const existing = await debuggerListeners({
    debuggingMode,
    terminalId,
    ideId,
    user,
    checkConflict: true
  });
  
  if (existing.hasConflict) {
    throw new Error("Listener conflict detected");
  }
  
  // 2. 启动监听器
  const result = await debuggerListen({
    debuggingMode,
    terminalId,
    ideId,
    user,
    checkConflict: true,
    isNotifiedOnConflict: true
  });
  
  return result;
}
```

## 示例

### 示例1：启动监听器
```json
{
  "tool": "debuggerListen",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "listenerId": "listener_001",
    "status": "listening",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01",
    "mode": "DEBUGGING"
  }
}
```

---

## 相关工具

- [debuggerListeners](debuggerListeners.md) - 查询监听器列表
- [debuggerDeleteListener](debuggerDeleteListener.md) - 删除调试器监听器
- [debuggerSetBreakpoints](debuggerSetBreakpoints.md) - 设置断点
