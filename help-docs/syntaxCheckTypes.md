# syntaxCheckTypes

检索语法检查类型。

## 功能说明

此工具用于获取系统支持的语法检查类型信息。语法检查类型定义了不同种类的语法错误和警告。

了解语法检查类型有助于:
- 理解错误代码的含义
- 配置语法检查
- 自定义错误处理
- 开发代码分析工具

## 调用方法

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "result": {
    "types": [
      {
        "code": "SYNTAX_ERROR",
        "description": "Syntax error",
        "severity": "error",
        "category": "syntax"
      },
      {
        "code": "UNDECLARED_IDENTIFIER",
        "description": "Undeclared identifier",
        "severity": "error",
        "category": "semantic"
      },
      {
        "code": "TYPE_MISMATCH",
        "description": "Type mismatch",
        "severity": "error",
        "category": "semantic"
      },
      {
        "code": "OBSOLETE_STATEMENT",
        "description": "Obsolete statement",
        "severity": "warning",
        "category": "deprecation"
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
```

## 注意事项

1. **无参数**: 此工具不需要任何参数

2. **系统返回**: 返回系统支持的所有语法检查类型

3. **类型用途**:
   - 错误分类
   - 严重级别
   - 错误类别

4. **版本差异**: 不同系统版本可能返回不同的类型

5. **缓存**: 可以缓存结果,避免重复查询

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| 无 | - | - | 无参数 |

## 与其他工具的关联性

1. **与 syntaxCheckCode 的关系**:
   ```
   syntaxCheckTypes → 了解错误类型 → syntaxCheckCode (检查代码)
   ```

2. **与 fixProposals 的关系**:
   ```
   syntaxCheckTypes → 了解错误 → fixProposals → 获取修复建议
   ```

3. **错误处理**:
   ```
   syntaxCheckCode 返回错误代码 → syntaxCheckTypes 查询含义
   ```

## 使用场景说明

### 场景 1: 了解支持的错误类型
```json
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 返回所有支持的语法检查类型
```

### 场景 2: 解析语法检查结果
```json
// 步骤 1: 执行语法检查
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "..."
  }
}
// 返回错误: { "code": "UNDECLARED_IDENTIFIER", ... }

// 步骤 2: 查询错误类型
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 找到 UNDECLARED_IDENTIFIER 的详细说明
```

### 场景 3: 配置代码分析
```json
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 使用返回的类型配置代码分析工具
// 过滤某些类型的错误
```

## 错误类型分类

### 语法错误 (syntax)
```json
{
  "code": "SYNTAX_ERROR",
  "description": "Syntax error",
  "severity": "error",
  "category": "syntax"
}
```
- 语法错误
- 必须修复

### 语义错误 (semantic)
```json
{
  "code": "UNDECLARED_IDENTIFIER",
  "description": "Undeclared identifier",
  "severity": "error",
  "category": "semantic"
}
```
- 语义错误
- 代码含义问题

### 类型错误 (type)
```json
{
  "code": "TYPE_MISMATCH",
  "description": "Type mismatch",
  "severity": "error",
  "category": "type"
}
```
- 类型不匹配

### 过时警告 (deprecation)
```json
{
  "code": "OBSOLETE_STATEMENT",
  "description": "Obsolete statement",
  "severity": "warning",
  "category": "deprecation"
}
```
- 过时的语法
- 建议更新

## 严重级别

| 级别 | 说明 | 处理 |
|------|------|------|
| error | 错误 | 必须修复 |
| warning | 警告 | 建议修复 |
| info | 信息 | 可选 |
| hint | 提示 | 可选 |

## 最佳实践

1. **缓存结果**: 缓存类型列表,避免重复查询

2. **理解严重级别**: 了解不同严重级别的含义

3. **配置过滤**: 根据需要过滤某些错误类型

4. **错误映射**: 创建错误代码到描述的映射

5. **用户友好**: 将错误代码转换为用户友好的消息

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 系统错误 | 系统内部错误 | 联系管理员 |
| 权限不足 | 没有访问权限 | 联系管理员 |

## 高级用法

### 自定义错误处理
```json
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 根据返回的类型创建自定义错误处理器
if severity == "error":
  block activation
else if severity == "warning":
  show warning but allow
```

### 错误统计
```json
{
  "tool": "syntaxCheckCode",
  "arguments": { "code": "..." }
}
// 根据错误类型统计错误数量
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 提供错误的详细说明
```

## 与 IDE 集成

### 错误提示
```json
// 在编辑器中显示错误
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 使用返回的类型为错误提供详细的提示信息
```

### 错误过滤
```json
// 根据用户偏好过滤错误
{
  "tool": "syntaxCheckTypes",
  "arguments": {}
}
// 允许用户选择忽略某些类型的错误
```

## 性能优化建议

1. **缓存结果**: 缓存类型列表

2. **按需查询**: 只在需要时查询

3. **后台更新**: 在后台定期更新类型列表
