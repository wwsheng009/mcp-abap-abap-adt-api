# debuggerDeleteListener

## 功能说明
停止调试器监听器，释放系统资源。当调试完成后或不再需要监听调试事件时，应调用此工具清理监听器。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerDeleteListener",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "user": "DEVELOPER01"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "deleted": true,
    "listenerId": "listener_001",
    "message": "Listener deleted successfully"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debuggingMode | string | 是 | 调试模式 |
| terminalId | string | 是 | 终端ID |
| ideId | string | 是 | IDE ID |
| user | string | 是 | 用户名 |

## 注意事项

⚠️ **重要提示：**
1. 删除监听器会停止所有相关的调试活动
2. 删除前确保所有断点已清理
3. 删除后无法恢复，需要重新启动监听器
4. 建议在调试会话结束时调用此工具

## 参数限制

- `debuggingMode`：必须与启动时使用的一致
- `terminalId`：必须与启动时使用的一致
- `ideId`：必须与启动时使用的一致
- `user`：必须是启动监听器的用户

## 与其他工具的关联性

- **debuggerListeners** - 查询监听器列表
- **debuggerListen** - 启动监听器
- **debuggerSetBreakpoints** - 设置断点

## 使用场景说明

### 场景1：删除监听器
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "user": "DEVELOPER01"
}
```

## 最佳实践

✅ **推荐做法：**
1. 调试完成后立即删除监听器
2. 删除前清理所有断点
3. 记录删除操作以便审计
4. 使用try-finally确保监听器被正确删除

❌ **避免做法：**
1. 不要删除其他用户的监听器
2. 避免在调试会话进行中删除监听器

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Listener not found" | 监听器不存在 | 检查参数是否正确 |
| "Authorization failed" | 缺少权限 | 联系管理员 |

## 高级用法

### 1. 安全的监听器清理
```javascript
async function cleanupListener(debuggingMode, terminalId, ideId, user) {
  try {
    // 1. 删除断点
    await debuggerDeleteBreakpoints({
      debuggingMode,
      terminalId,
      ideId,
      requestUser: user
    });
    
    // 2. 删除监听器
    await debuggerDeleteListener({
      debuggingMode,
      terminalId,
      ideId,
      user
    });
    
    console.log("Listener cleaned up successfully");
  } catch (error) {
    console.error("Failed to cleanup listener:", error);
    throw error;
  }
}
```

## 示例

### 示例1：删除监听器
```json
{
  "tool": "debuggerDeleteListener",
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
    "deleted": true,
    "listenerId": "listener_001",
    "message": "Listener deleted successfully"
  }
}
```

---

## 相关工具

- [debuggerListeners](debuggerListeners.md) - 查询监听器列表
- [debuggerListen](debuggerListen.md) - 启动监听器
