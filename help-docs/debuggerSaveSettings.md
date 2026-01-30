# debuggerSaveSettings

## 功能说明
保存调试器设置，持久化调试配置。这包括断点、变量监视、调试模式等配置，便于下次调试时恢复。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerSaveSettings",
  "arguments": {
    "settings": {
      "breakpoints": [
        {
          "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
          "line": 50,
          "enabled": true
        }
      ],
      "watchedVariables": ["lv_result"],
      "debuggingMode": "DEBUGGING",
      "systemDebugging": false
    }
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "saved": true,
    "settingsId": "settings_001",
    "timestamp": "2024-01-30T10:30:00Z"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| settings | string/object | 是 | 调试器设置对象（可以是JSON字符串或对象） |

## 注意事项

⚠️ **重要提示：**
1. 设置会被保存到服务器端
2. 不同用户的设置是隔离的
3. 可以在下次调试时恢复设置
4. 建议定期保存设置以避免丢失

## 参数限制

- `settings`：必须是有效的JSON对象或字符串

## 与其他工具的关联性

- **debuggerSetBreakpoints** - 设置断点（可以保存断点配置）
- **debuggerListen** - 启动监听器
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：保存调试设置
```json
{
  "settings": {
    "breakpoints": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "enabled": true
      }
    ],
    "watchedVariables": ["lv_result", "lv_counter"]
  }
}
```

## 最佳实践

✅ **推荐做法：**
1. 在配置完断点后保存设置
2. 保存常用调试模式
3. 定期备份设置
4. 使用描述性的设置名称

❌ **避免做法：**
1. 不要保存包含敏感信息的设置

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Invalid settings format" | 设置格式错误 | 检查JSON格式 |
| "Save failed" | 保存失败 | 检查服务器状态和权限 |

## 高级用法

### 1. 保存和恢复调试会话
```javascript
async function saveDebugSession(breakpoints, watchedVariables) {
  const settings = {
    breakpoints,
    watchedVariables,
    debuggingMode: "DEBUGGING",
    systemDebugging: false,
    timestamp: new Date().toISOString()
  };
  
  const result = await debuggerSaveSettings({ settings });
  console.log("Debug session saved:", result.settingsId);
  
  return result;
}
```

## 示例

### 示例1：保存调试设置
```json
{
  "tool": "debuggerSaveSettings",
  "arguments": {
    "settings": {
      "breakpoints": [
        {
          "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
          "line": 50,
          "enabled": true
        }
      ],
      "watchedVariables": ["lv_result"],
      "debuggingMode": "DEBUGGING"
    }
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "saved": true,
    "settingsId": "settings_001",
    "timestamp": "2024-01-30T10:30:00Z"
  }
}
```

---

## 相关工具

- [debuggerSetBreakpoints](debuggerSetBreakpoints.md) - 设置断点
- [debuggerListen](debuggerListen.md) - 启动监听器
