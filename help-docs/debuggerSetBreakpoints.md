# debuggerSetBreakpoints

## 功能说明
在ABAP程序中设置断点，用于调试时暂停程序执行。可以设置多个断点，支持指定位置、条件等高级功能。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerSetBreakpoints",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "clientId": "CLIENT_001",
    "user": "DEVELOPER01",
    "breakpoints": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50
      },
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 100
      }
    ],
    "scope": "SESSION",
    "systemDebugging": false,
    "deactivated": false
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "breakpoints": [
      {
        "id": "bp_001",
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "status": "active"
      },
      {
        "id": "bp_002",
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 100,
        "status": "active"
      }
    ]
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| debuggingMode | string | 是 | 调试模式 |
| terminalId | string | 是 | 终端ID |
| ideId | string | 是 | IDE ID |
| clientId | string | 是 | 客户端ID |
| user | string | 是 | 用户名 |
| breakpoints | array | 是 | 断点数组 |
| breakpoints[].uri | string | 是 | 程序URI |
| breakpoints[].line | number | 是 | 行号 |
| scope | string | 否 | 断点作用域（SESSION/GLOBAL等） |
| systemDebugging | boolean | 否 | 是否启用系统调试，默认为false |
| deactivated | boolean | 否 | 是否停用断点，默认为false |
| syncScupeUrl | string | 否 | 作用域同步URL |

## 注意事项

⚠️ **重要提示：**
1. 必须先启动监听器才能设置断点
2. 行号必须有效且在程序范围内
3. URI必须指向有效的ABAP程序
4. 系统调试需要额外权限

## 参数限制

- `breakpoints`：最多100个断点
- `line`：必须大于0且小于程序总行数
- `uri`：必须是有效的ABAP对象URI

## 与其他工具的关联性

- **debuggerListen** - 启动监听器（必须先调用）
- **debuggerDeleteBreakpoints** - 删除断点
- **debuggerAttach** - 附加到调试会话
- **debuggerStackTrace** - 获取堆栈跟踪

## 使用场景说明

### 场景1：设置简单断点
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "clientId": "CLIENT_001",
  "user": "DEVELOPER01",
  "breakpoints": [
    {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 50
    }
  ]
}
```

### 场景2：设置多个断点
```json
{
  "debuggingMode": "DEBUGGING",
  "terminalId": "TERM_001",
  "ideId": "IDE_001",
  "clientId": "CLIENT_001",
  "user": "DEVELOPER01",
  "breakpoints": [
    {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 50
    },
    {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 100
    },
    {
      "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
      "line": 150
    }
  ]
}
```

## 最佳实践

✅ **推荐做法：**
1. 使用精确的行号
2. 验证URI的有效性
3. 限制断点数量以提高性能
4. 使用作用域控制断点生效范围
5. 调试结束后清理断点

❌ **避免做法：**
1. 不要设置过多断点
2. 避免在性能关键路径设置断点

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Listener not active" | 监听器未启动 | 先调用debuggerListen |
| "Invalid line number" | 行号无效 | 检查行号是否在程序范围内 |
| "Invalid URI" | URI无效 | 检查URI格式和程序是否存在 |

## 高级用法

### 1. 条件断点设置
```javascript
async function setConditionalBreakpoint(uri, line, condition) {
  const result = await debuggerSetBreakpoints({
    debuggingMode: "DEBUGGING",
    terminalId: "TERM_001",
    ideId: "IDE_001",
    clientId: "CLIENT_001",
    user: "DEVELOPER01",
    breakpoints: [
      {
        uri,
        line,
        condition: condition // 如果ABAP支持条件断点
      }
    ]
  });
  
  return result;
}
```

## 示例

### 示例1：设置断点
```json
{
  "tool": "debuggerSetBreakpoints",
  "arguments": {
    "debuggingMode": "DEBUGGING",
    "terminalId": "TERM_001",
    "ideId": "IDE_001",
    "clientId": "CLIENT_001",
    "user": "DEVELOPER01",
    "breakpoints": [
      {
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50
      }
    ]
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "breakpoints": [
      {
        "id": "bp_001",
        "uri": "/sap/bc/adt/programs/programs/zmy_program.abap",
        "line": 50,
        "status": "active"
      }
    ]
  }
}
```

---

## 相关工具

- [debuggerListen](debuggerListen.md) - 启动监听器
- [debuggerDeleteBreakpoints](debuggerDeleteBreakpoints.md) - 删除断点
- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
