# debuggerListen

监听调试事件。

**参数**:
- `debuggingMode` (string, 必需): 调试模式
- `terminalId` (string, 必需): 终端 ID
- `ideId` (string, 必需): IDE ID
- `user` (string, 必需): 用户名
- `checkConflict` (boolean, 可选): 是否检查冲突
- `isNotifiedOnConflict` (boolean, 可选): 冲突时是否通知

**返回值**:
```json
{
  "status": "success",
  "result": "Debug listener started"
}
```
