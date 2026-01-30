# debuggerListeners

## 功能说明
获取当前系统中可用的调试器监听器列表。调试器监听器用于监听ABAP系统中的调试事件，是远程调试的基础设施。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerListeners",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01",
    "checkConflict": true
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "listeners": [
      {
        "id": "listener_001",
        "terminalId": "TERM_001",
        "ideId": "IDE_001",
        "user": "DEVELOPER01",
        "mode": "DEBUGGING",
        "status": "active"
      }
    ],
    "hasConflict": false
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

## 注意事项

⚠️ **重要提示：**
1. 调试器监听器与调试会话紧密关联
2. 每个用户只能同时有有限数量的活跃监听器
3. 调试模式取决于系统配置和权限
4. 检查冲突可以帮助避免多个调试会话冲突

## 参数限制

- `debuggingMode`：必须是有效的调试模式字符串
- `terminalId`：长度不超过50字符
- `ideId`：长度不超过50字符
- `user`：必须是有效的ABAP用户名

## 与其他工具的关联性

- **debuggerListen** - 启动调试器监听
- **debuggerDeleteListener** - 删除调试器监听器
- **debuggerSetBreakpoints** - 设置断点
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：查询当前监听器
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "user": "DEVELOPER01"
}
```

### 场景2：检查监听器冲突
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "user": "DEVELOPER01",
  "checkConflict": true
}
```

## 最佳实践

✅ **推荐做法：**
1. 在启动调试前检查监听器状态
2. 使用唯一的terminalId和ideId避免冲突
3. 定期清理不再使用的监听器
4. 检查冲突以确保调试会话稳定

❌ **避免做法：**
1. 不要创建过多的监听器
2. 避免使用冲突的terminalId

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Authorization failed" | 缺少调试权限 | 联系管理员授予调试权限 |
| "Too many listeners" | 监听器数量超限 | 删除不需要的监听器 |
| "Invalid user" | 用户名无效 | 检查用户名是否正确 |

## 高级用法

### 1. 监听器状态检查
```javascript
async function checkListenerStatus(debuggingMode, terminalId, ideId, user) {
  const result = await debuggerListeners({
    debuggingMode,
    terminalId,
    ideId,
    user,
    checkConflict: true
  });
  
  return {
    active: result.listeners.length > 0,
    conflict: result.hasConflict,
    listeners: result.listeners
  };
}
```

## 示例

### 示例1：获取监听器列表
```json
{
  "tool": "debuggerListeners",
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
    "listeners": [
      {
        "id": "listener_001",
        "terminalId": "TERM_001",
        "ideId": "IDE_001",
        "user": "DEVELOPER01",
        "mode": "DEBUGGING",
        "status": "active"
      }
    ],
    "hasConflict": false
  }
}
```

---

## 相关工具

- [debuggerListen](debuggerListen.md) - 启动调试器监听
- [debuggerDeleteListener](debuggerDeleteListener.md) - 删除调试器监听器
- [debuggerSetBreakpoints](debuggerSetBreakpoints.md) - 设置断点
