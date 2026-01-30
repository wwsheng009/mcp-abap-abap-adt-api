# debuggerDeleteBreakpoints

## 功能说明
删除ABAP程序中的断点。可以删除单个或多个断点，释放资源并恢复程序正常执行。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerDeleteBreakpoints",
  "arguments": {
    "breakpoint": {
      "id": "bp_001",
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 50
    },
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "requestUser": "DEVELOPER01",
    "scope": "SESSION"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "deleted": true,
    "breakpointId": "bp_001",
    "message": "Breakpoint deleted successfully"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| breakpoint | object | 是 | 要删除的断点对象 |
| breakpoint.id | string | 是 | 断点ID |
| breakpoint.uri | string | 是 | 程序URI |
| breakpoint.line | number | 是 | 行号 |
| debuggingMode | string | 是 | 调试模式 |
| terminalId | string | 是 | 终端ID |
| ideId | string | 是 | IDE ID |
| requestUser | string | 是 | 请求用户 |
| scope | string | 否 | 断点作用域 |

## 注意事项

⚠️ **重要提示：**
1. 删除断点会立即生效，程序执行不会暂停
2. 只能删除当前用户的断点
3. 删除前确认断点ID正确
4. 建议在调试会话结束时清理所有断点

## 参数限制

- `breakpoint`：必须包含有效的id、uri和line属性

## 与其他工具的关联性

- **debuggerSetBreakpoints** - 设置断点
- **debuggerListen** - 启动监听器
- **debuggerDeleteListener** - 删除监听器

## 使用场景说明

### 场景1：删除断点
```json
{
  "breakpoint": {
    "id": "bp_001",
    "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "line": 50
  },
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "requestUser": "DEVELOPER01"
}
```

## 最佳实践

✅ **推荐做法：**
1. 调试结束后清理所有断点
2. 记录删除操作
3. 使用try-finally确保断点被删除

❌ **避免做法：**
1. 不要删除其他用户的断点

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Breakpoint not found" | 断点不存在 | 检查断点ID是否正确 |
| "Authorization failed" | 权限不足 | 只能删除自己的断点 |

## 高级用法

### 1. 批量删除断点
```javascript
async function deleteAllBreakpoints(breakpoints, debuggingMode, terminalId, ideId, user) {
  const results = [];
  
  for (const bp of breakpoints) {
    try {
      const result = await debuggerDeleteBreakpoints({
        breakpoint: bp,
        debuggingMode,
        terminalId,
        ideId,
        requestUser: user
      });
      results.push({ breakpoint: bp, status: "deleted" });
    } catch (error) {
      results.push({ breakpoint: bp, status: "failed", error: error.message });
    }
  }
  
  return results;
}
```

## 示例

### 示例1：删除断点
```json
{
  "tool": "debuggerDeleteBreakpoints",
  "arguments": {
    "breakpoint": {
      "id": "bp_001",
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 50
    },
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "requestUser": "DEVELOPER01"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "deleted": true,
    "breakpointId": "bp_001",
    "message": "Breakpoint deleted successfully"
  }
}
```

---

## 相关工具

- [debuggerSetBreakpoints](debuggerSetBreakpoints.md) - 设置断点
- [debuggerListen](debuggerListen.md) - 启动监听器
