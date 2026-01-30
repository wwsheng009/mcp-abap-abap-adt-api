# abapDocumentation

检索 ABAP 文档。

## 功能说明

此工具用于获取 ABAP 语法、关键字、对象等的文档信息。帮助开发者:
- 理解 ABAP 语法
- 查看关键字的详细说明
- 了解对象的使用方法
- 获取示例代码

## 调用方法

**参数**:
- `objectUri` (string, 必需): 对象 URI
- `body` (string, 必需): 文档主体内容
- `line` (number, 必需): 行号
- `column` (number, 必需): 列号
- `language` (string, 可选): 文档语言,默认系统语言

**返回值**:
```json
{
  "status": "success",
  "result": {
    "title": "WRITE Statement",
    "description": "The WRITE statement outputs values to the list.",
    "syntax": "WRITE [pos] (len) [format] dobj.",
    "examples": [
      {
        "code": "WRITE: / 'Hello World'.",
        "description": "Output text to list"
      }
    ],
    "parameters": [
      {
        "name": "dobj",
        "type": "data_object",
        "description": "Data object to be output"
      }
    ],
    "notes": [
      "The WRITE statement is obsolete for most use cases",
      "Use cl_demo_output instead"
    ],
    "seeAlso": [
      "cl_demo_output",
      "WRITE TO"
    ],
    "language": "EN"
  }
}
```

**示例**:
```json
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/programs/zprog/source/main",
    "body": "WRITE 'Hello World'.",
    "line": 1,
    "column": 1,
    "language": "EN"
  }
}
```

## 注意事项

1. **位置信息**: `line` 和 `column` 指定要获取文档的位置

2. **语言**:
   - 默认使用系统语言
   - 可以指定语言代码(如 "EN", "DE")
   - 不是所有语言都有文档

3. **文档类型**:
   - 关键字文档
   - 语句文档
   - 类文档
   - 方法文档
   - 类型文档

4. **文档内容**:
   - 描述
   - 语法
   - 示例代码
   - 参数说明
   - 注意事项
   - 相关文档

5. **性能**:
   - 文档查询通常较快
   - 可以缓存结果

6. **完整性**:
   - 不是所有元素都有文档
   - 文档可能不完整

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUri | string | 是 | 必须是有效的对象 URI |
| body | string | 是 | 文档主体内容 |
| line | number | 是 | 必须 >= 1 |
| column | number | 是 | 必须 >= 1 |
| language | string | 否 | 语言代码,如 "EN", "DE" |

## 与其他工具的关联性

1. **与 codeCompletion 的关系**:
   ```
   codeCompletion → 获取补全 → abapDocumentation (查看文档)
   ```

2. **与 findDefinition 的关系**:
   ```
   findDefinition → 查找定义 → abapDocumentation (查看文档)
   ```

3. **学习流程**:
   ```
   遇到不熟悉的语法 → abapDocumentation → 理解用法
   ```

4. **编辑器集成**:
   ```
   用户按 F1 → abapDocumentation → 显示文档
   ```

## 使用场景说明

### 场景 1: 查看关键字文档
```json
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/programs/zprog/source/main",
    "body": "WRITE 'Hello'.",
    "line": 1,
    "column": 1,
    "language": "EN"
  }
}
// 返回 WRITE 语句的完整文档
```

### 场景 2: 查看类文档
```json
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/oo/classes/cl_abap_unit_assert",
    "body": "",
    "line": 1,
    "column": 1
  }
}
// 返回 CL_ABAP_UNIT_ASSERT 类的文档
```

### 场景 3: 查看方法文档
```json
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/oo/classes/cl_abap_unit_assert",
    "body": "assert_equals(",
    "line": 50,
    "column": 10
  }
}
// 返回 ASSERT_EQUALS 方法的文档
```

### 场景 4: 查看类型文档
```json
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/programs/zprog/source/main",
    "body": "DATA: lv_value TYPE i.",
    "line": 1,
    "column": 20
  }
}
// 返回类型 I 的文档
```

### 场景 5: 代码学习
```json
// 用户看到不熟悉的代码
// 代码: "cl_demo_output=>write( 'Hello' )."

// 获取文档
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/oo/classes/cl_demo_output",
    "body": "cl_demo_output=>write",
    "line": 1,
    "column": 1
  }
}
// 学习 CL_DEMO_OUTPUT 的用法
```

## 文档结构详解

### 1. 标题 (title)
```json
{
  "title": "WRITE Statement"
}
```
- 文档标题
- 描述文档内容

### 2. 描述 (description)
```json
{
  "description": "The WRITE statement outputs values to the list."
}
```
- 简短描述
- 说明功能

### 3. 语法 (syntax)
```json
{
  "syntax": "WRITE [pos] (len) [format] dobj."
}
```
- 语法格式
- 展示可能的选项

### 4. 示例 (examples)
```json
{
  "examples": [
    {
      "code": "WRITE: / 'Hello World'.",
      "description": "Output text to list"
    },
    {
      "code": "WRITE lv_value NO-GAP.",
      "description": "Output without leading blanks"
    }
  ]
}
```
- 提供示例代码
- 每个示例有说明

### 5. 参数 (parameters)
```json
{
  "parameters": [
    {
      "name": "dobj",
      "type": "data_object",
      "description": "Data object to be output",
      "optional": false
    },
    {
      "name": "pos",
      "type": "integer",
      "description": "Output position",
      "optional": true
    }
  ]
}
```
- 参数列表
- 每个参数有类型和描述

### 6. 注意事项 (notes)
```json
{
  "notes": [
    "The WRITE statement is obsolete for most use cases",
    "Use cl_demo_output instead"
  ]
}
```
- 重要提示
- 最佳实践

### 7. 相关文档 (seeAlso)
```json
{
  "seeAlso": [
    "cl_demo_output",
    "WRITE TO",
    "NEW-LINE"
  ]
}
```
- 相关语句或对象
- 进一步学习

## 完整工作流程

```json
// 代码学习和开发流程

// 1. 读取代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zprog/source/main"
  }
}

// 2. 用户看到不熟悉的代码
// 例如: "cl_abap_unit_assert=>assert_equals( exp = 1, act = lv_value )."

// 3. 获取文档
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/oo/classes/cl_abap_unit_assert",
    "body": "assert_equals",
    "line": 10,
    "column": 20
  }
}

// 4. 查看文档内容
{
  "result": {
    "title": "ASSERT_EQUALS",
    "description": "Asserts that two values are equal",
    "syntax": "assert_equals( exp = ... act = ... msg = ... ).",
    "examples": [...],
    "parameters": [...]
  }
}

// 5. 理解用法,应用到自己的代码

// 6. 可选: 查看相关文档
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": "/sap/bc/adt/oo/classes/cl_abap_unit_assert",
    "body": "assert_not_initial",
    "line": 1,
    "column": 1
  }
}
```

## 最佳实践

1. **主动学习**: 遇到不熟悉的代码时主动查询文档

2. **理解示例**: 仔细阅读示例代码

3. **注意警告**: 关注文档中的警告和注意事项

4. **查看相关文档**: 通过 "seeAlso" 扩展学习

5. **语言选择**: 使用熟悉的语言查看文档

6. **文档反馈**: 如果文档不准确,提供反馈

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无文档 | 该元素没有文档 | 检查元素是否正确,或查阅其他资源 |
| 语言不支持 | 请求的语言没有文档 | 使用系统默认语言 |
| 位置无效 | line 或 column 不正确 | 检查位置信息 |
| 对象不存在 | 对象不存在 | 检查对象 URI |

## 高级用法

### 批量文档查询
```json
// 为代码中的所有元素获取文档
for each element in code:
  {
    "tool": "abapDocumentation",
    "arguments": {
      "objectUri": element.uri,
      "body": element.text,
      "line": element.line,
      "column": element.column
    }
  }
```

### 文档缓存
```json
// 缓存常用文档,避免重复查询
if cachedDocumentation[ elementName ]:
  return cachedDocumentation[ elementName ]
else:
  {
    "tool": "abapDocumentation",
    "arguments": {
      "objectUri": "...",
      "body": elementName,
      "line": 1,
      "column": 1
    }
  }
  cache result
```

### 上下文帮助
```json
// 在编辑器中实现上下文帮助
// 用户按 F1 或 Ctrl+Click
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": currentFileUri,
    "body": currentLine,
    "line": cursorLine,
    "column": cursorColumn
  }
}
// 显示文档窗口
```

## 支持的语言

| 语言代码 | 语言 | 说明 |
|----------|------|------|
| EN | 英语 | 最常用,文档最完整 |
| DE | 德语 | SAP 原始语言 |
| JA | 日语 | 日文文档 |
| ZH | 中文 | 中文文档(部分) |
| FR | 法语 | 法文文档(部分) |

## 与编辑器集成

### 快捷键
```json
// 用户按 F1
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": editor.currentFile.uri,
    "body": editor.currentLine.text,
    "line": cursor.line,
    "column": cursor.column
  }
}
// 显示文档侧边栏或弹出窗口
```

### 悬停提示
```json
// 用户鼠标悬停在代码上
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": editor.currentFile.uri,
    "body": hoveredText,
    "line": hoverLine,
    "column": hoverColumn
  }
}
// 显示简短描述作为悬停提示
```

### 代码补全增强
```json
// 用户选择补全后,显示文档
{
  "tool": "abapDocumentation",
  "arguments": {
    "objectUri": selectedElement.uri,
    "body": selectedElement.name,
    "line": 1,
    "column": 1
  }
}
// 显示文档面板
```

## 文档质量评估

| 评估标准 | 优秀 | 良好 | 一般 |
|----------|------|------|------|
| 描述清晰 | 是 | 是 | 否 |
| 示例代码 | 多且详细 | 有示例 | 无示例 |
| 参数说明 | 完整 | 部分缺失 | 缺失 |
| 注意事项 | 详细 | 有提示 | 无提示 |
| 相关文档 | 链接完整 | 部分链接 | 无链接 |

## 性能优化建议

1. **缓存文档**: 缓存常用文档

2. **批量查询**: 一次性查询多个文档

3. **延迟加载**: 用户请求时再加载

4. **增量更新**: 只更新变化的部分

5. **预加载**: 预加载常用文档
