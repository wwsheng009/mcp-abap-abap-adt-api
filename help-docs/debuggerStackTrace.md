# debuggerStackTrace

获取调试调用栈。

## 功能说明

此工具用于获取当前调试会话的调用栈信息，显示程序的执行路径。

## 调用方法

**参数**:
- `semanticURIs` (boolean, 可选): 是否使用语义 URI（默认：true）

**返回值**:
```json
{
  "status": "success",
  "result": {
    "isRfc": false,
    "debugCursorStackIndex": 2,
    "isSameSystem": true,
    "serverName": "vhcalnplci.local",
    "stack": [
      {
        "stackPosition": 0,
        "stackType": "ABAP",
        "programName": "ZDEBUG_PROGRAM",
        "includeName": 1002,
        "line": 10,
        "eventType": "LINE",
        "eventName": "10",
        "sourceType": "ABAP",
        "systemProgram": false,
        "isVit": false,
        "uri": "/sap/bc/adt/programs/programs/zdebug_program/source/main",
        "uriObj": "/sap/bc/adt/programs/programs/zdebug_program"
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "debuggerStackTrace",
  "arguments": {
    "semanticURIs": true
  }
}
```

## 注意事项

1. **语义 URI**: 使用语义 URI 可以获得更可读的路径信息

2. **栈帧顺序**: 第一个帧是当前的执行位置

3. **调试游标**: `debugCursorStackIndex` 指示当前栈帧

4. **RFC 调用**: `isRfc` 标识是否为 RFC 调用

5. **系统程序**: `systemProgram` 标识是否为系统程序

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| semanticURIs | boolean | 否 | 默认 true |

## 与其他工具的关联性

1. **调试流程**:
   ```
   debuggerListen → debuggerStackTrace → debuggerGoToStack → debuggerStep
   ```

2. **配合使用**:
   ```
   debuggerStackTrace + debuggerVariables = 完整的调试状态
   ```

## 使用场景说明

### 场景 1: 查看调用栈
```json
{
  "tool": "debuggerStackTrace",
  "arguments": {
    "semanticURIs": true
  }
}
```

### 场景 2: 跳转到栈帧
```json
// 步骤 1: 获取调用栈
{
  "tool": "debuggerStackTrace",
  "arguments": {}
}

// 步骤 2: 跳转到特定栈帧
{
  "tool": "debuggerGoToStack",
  "arguments": {
    "positionOrUrl": 2
  }
}
```

## 调试工作流程

```json
// 标准调试流程
debuggerSetBreakpoints → debuggerListen → debuggerStackTrace → debuggerGoToStack → debuggerStep → debuggerVariables
```

