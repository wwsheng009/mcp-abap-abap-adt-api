# debuggerSetBreakpoints

设置断点。

**参数**:
- `debuggingMode` (string, 必需): 调试模式
- `terminalId` (string, 必需): 终端 ID
- `ideId` (string, 必需): IDE ID
- `clientId` (string, 必需): 客户端 ID
- `breakpoints` (array, 必需): 断点数组
- `user` (string, 必需): 用户名
- `scope` (string, 可选): 调试器范围
- `systemDebugging` (boolean, 可选): 是否启用系统调试
- `deactivated` (boolean, 可选): 是否停用断点

**返回值**:
```json
{
  "status": "success",
  "result": "Breakpoints set successfully"
}
```
