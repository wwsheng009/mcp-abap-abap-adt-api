# syntaxCheckCode

执行 ABAP 代码语法检查。

## 功能说明

此工具用于检查 ABAP 代码的语法错误。在保存和激活代码之前进行语法检查可以避免运行时错误和激活失败。

## 调用方法

**参数**:
- `url` (string, 必需): 对象 URL（源代码 URL）
- `code` (string, 必需): 要检查的代码（完整的源代码）
- `mainUrl` (string, 可选): 主包含文件 URL
- `mainProgram` (string, 可选): 主程序名称
- `version` (string, 可选): 版本（"active" 或 "inactive"）

**返回值**:
```json
{
  "status": "success",
  "results": [
    {
      "line": 10,
      "column": 15,
      "message": "Unexpected token",
      "severity": "error",
      "uri": "/sap/bc/adt/oo/classes/zcl_class/source/main"
    },
    {
      "line": 25,
      "message": "Variable not declared",
      "severity": "warning"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "code": "CLASS zcl_my_class DEFINITION.\n  PUBLIC SECTION.\n    METHODS: my_method.\nENDCLASS.\nCLASS zcl_my_class IMPLEMENTATION.\n  METHOD my_method.\n    WRITE: 'Hello'.\nENDMETHOD.\nENDCLASS."
  }
}
```

## 注意事项

1. **完整代码**: 必须提供完整的源代码，而不仅仅是修改的部分

2. **严重程度**:
   - `error`: 严重错误，必须修复
   - `warning`: 警告，建议修复但不阻止激活
   - `info`: 信息性消息

3. **位置精确**: 错误信息包含精确的行号和列号

4. **激活前检查**: 强烈建议在激活前进行语法检查

5. **性能考虑**: 语法检查通常很快，但对于大型文件可能有延迟

6. **CDS 对象**: 对于 CDS 对象，使用专门的 CDS 语法检查

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 必须是有效的源代码 URL |
| code | string | 是 | 必须是完整的源代码 |
| mainUrl | string | 否 | 主包含文件 URL |
| mainProgram | string | 否 | 主程序名称 |
| version | string | 否 | "active" 或 "inactive" |

## 与其他工具的关联性

1. **配合使用**:
   ```
   getObjectSource → 编辑 → syntaxCheckCode → setObjectSource → activateByName
   ```

2. **质量保证**:
   ```
   syntaxCheckCode → 修复错误 → 语法通过 → 激活
   ```

3. **开发流程**:
   ```
   编辑代码 → syntaxCheckCode → 检查结果 → 修复 → 重复直到无错误
   ```

## 使用场景说明

### 场景 1: 编辑前检查
```json
// 步骤 1: 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "..."}}

// 步骤 2: 编辑代码（在客户端进行）

// 步骤 3: 语法检查
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "edited source code"
  }
}
// 返回: {"results": []} // 无错误

// 步骤 4: 保存和激活
{"tool": "setObjectSource", "arguments": {...}}
{"tool": "activateByName", "arguments": {...}}
```

### 场景 2: 错误诊断
```json
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "code": "REPORT zprog.\nDATA: lv_value TYPE i.\nlv_value = 'abc'."
  }
}
// 返回:
{
  "results": [
    {
      "line": 3,
      "column": 12,
      "message": "Type mismatch: expected I, found C",
      "severity": "error"
    }
  ]
}
```

### 场景 3: 批量检查
```json
// 对多个文件批量进行语法检查
for each file:
  {"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "..."}}
```

### 场景 4: 持续集成
```json
// 在 CI/CD 流程中进行语法检查
// 确保代码质量
```

## 错误类型

| 严重程度 | 说明 | 示例 |
|---------|------|------|
| error | 严重错误，阻止激活 | 语法错误、未声明的变量 |
| warning | 警告，建议修复 | 使用已废弃的语句 |
| info | 信息性消息 | 性能建议、最佳实践提示 |

## 常见语法错误

### 错误 1: 未声明的变量
```json
{
  "line": 42,
  "message": "Variable 'lv_undefined' not declared",
  "severity": "error"
}
```

**解决**: 在 DATA 语句中声明变量

### 错误 2: 类型不匹配
```json
{
  "line": 25,
  "message": "Type mismatch: expected I, found C",
  "severity": "error"
}
```

**解决**: 检查类型并确保匹配

### 错误 3: 缺少点号
```json
{
  "line": 50,
  "message": "Unexpected end of statement, expected '.'",
  "severity": "error"
}
```

**解决**: 在语句末尾添加点号

### 错误 4: 方法未定义
```json
{
  "line": 18,
  "message": "Method 'missing_method' not defined",
  "severity": "error"
}
```

**解决**: 在类定义中声明方法

## 最佳实践

1. **激活前检查**: 总是在激活前进行语法检查

2. **修复所有错误**: 必须修复所有 error 级别的错误

3. **处理警告**: 建议修复 warning，但它们不阻止激活

4. **检查多个文件**: 对修改的所有文件进行语法检查

5. **自动检查**: 在编辑器中实现自动语法检查

6. **错误报告**: 生成语法检查报告以便追踪

## 完整工作流程

```json
// 标准编辑-检查-保存流程

// 1. 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "..."}}

// 2. 获取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "..."}}

// 3. 编辑代码（在客户端进行）

// 4. 语法检查
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "edited source code"
  }
}

// 5. 检查结果
if errors.length > 0:
  // 有错误，需要修复
  display errors
  go to step 3
else:
  // 无错误，可以保存
  {"tool": "lock", "arguments": {"objectUrl": "..."}}
  {"tool": "setObjectSource", "arguments": {...}}
  {"tool": "activateByName", "arguments": {...}}
  {"tool": "unLock", "arguments": {...}}
```

## 错误处理策略

### 策略 1: 立即修复
```
发现错误 → 立即修复 → 重新检查 → 保存
```

### 策略 2: 批量修复
```
收集所有错误 → 批量修复 → 重新检查 → 保存
```

### 策略 3: 分阶段修复
```
修复严重错误 → 检查 → 修复警告 → 检查 → 保存
```

## 性能优化

1. **增量检查**: 只检查修改的部分（可能需要额外的支持）

2. **并行检查**: 对多个文件并行进行语法检查

3. **缓存结果**: 对于不常变化的文件，缓存语法检查结果

4. **延迟检查**: 在用户暂停输入后再进行检查

## 高级用法

### 与代码补全配合
```json
// 先进行语法检查，然后提供代码补全
if syntax check passes:
  {"tool": "codeCompletion", "arguments": {...}}
```

### 与 ATC 检查配合
```json
// 语法检查通过后，进行 ATC 检查
syntaxCheckCode → pass → createAtcRun
```

### 生成报告
```json
// 对语法检查结果生成详细报告
包括：错误数量、严重程度分布、修复建议
```

