# debuggerVariables

获取调试变量。

## 功能说明

此工具用于获取调试会话中的变量及其值。可以获取局部变量、类属性、系统变量等。

## 调用方法

**参数**:
- `parents` (array, 必需): 父变量名数组

**返回值**:
```json
{
  "status": "success",
  "result": {
    "variables": [
      {
        "name": "lv_variable",
        "value": "123",
        "type": "I",
        "attributes": [
          {
            "name": "read-only",
            "type": "boolean",
            "value": false
          }
        ]
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["@ROOT"]
  }
}
```

## 注意事项

1. **父变量**: 使用父变量路径访问嵌套变量

2. **变量路径**: 
   - `["@ROOT"]`: 根级变量
   - `["@ROOT", "lv_table"]`: 表中的变量
   - `["@ROOT", "lv_struct", "@DATAAGING", "@ROOT"]`: 结构中的字段

3. **DATAAGING**: 用于访问深层嵌套的数据

4. **变量类型**: 返回变量的 ABAP 类型（I, C, STRING 等）

5. **属性**: 包含变量的属性信息（只读、常量等）

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| parents | array | 是 | 变量路径数组 |

## 与其他工具的关联性

1. **调试流程**:
   ```
   debuggerListen → debuggerVariables → debuggerStackTrace → debuggerStep
   ```

2. **配合使用**:
   ```
   debuggerStackTrace + debuggerVariables = 完整的调试状态
   ```

## 使用场景说明

### 场景 1: 获取根级变量
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["@ROOT"]
  }
}
```

### 场景 2: 获取表变量
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["@ROOT", "lt_table"]
  }
}
```

### 场景 3: 获取结构字段
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["@ROOT", "ls_struct", "@DATAAGING", "@ROOT"]
  }
}
```

## 调试工作流程

```json
// 标准调试流程
debuggerSetBreakpoints → debuggerListen → debuggerStackTrace → debuggerVariables → debuggerStep
```

