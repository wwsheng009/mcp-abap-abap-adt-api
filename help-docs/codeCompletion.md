# codeCompletion

获取代码补全建议。

## 功能说明

此工具用于在 ABAP 代码的指定位置获取智能代码补全建议。建议包括关键字、变量、方法、类等，帮助提高编码效率。

## 调用方法

**参数**:
- `url` (string, 必需): 对象 URL（源代码 URL）
- `code` (string, 必需): 代码上下文（完整的源代码）
- `line` (number, 必需): 行号（要补全的位置）
- `column` (number, 必需): 列号（要补全的位置）

**返回值**:
```json
{
  "status": "success",
  "suggestions": [
    {
      "label": "WRITE",
      "kind": "keyword",
      "detail": "ABAP keyword"
    },
    {
      "label": "lv_value",
      "kind": "variable",
      "detail": "Local variable"
    },
    {
      "label": "method_name",
      "kind": "method",
      "detail": "Method of zcl_class"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "codeCompletion",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "code": "CLASS zcl_my_class DEFINITION.\n  PUBLIC SECTION.\n    METHODS: my_method.\nENDCLASS.\nCLASS zcl_my_class IMPLEMENTATION.\n  METHOD my_method.\n    DATA: lv_",
    "line": 5,
    "column": 12
  }
}
```

## 注意事项

1. **代码上下文**: 必须提供完整的源代码，而不仅仅是补全位置的行

2. **位置精确**: `line` 和 `column` 必须精确指向补全位置（通常在最后一个字符后）

3. **语法要求**: 提供的代码必须有正确的语法，否则可能无法获取补全建议

4. **性能考虑**: 代码补全是相对快速的，但对于大型文件可能有延迟

5. **建议类型**: 补全建议包括：
   - 关键字（如 WRITE, DATA）
   - 变量（本地变量、实例属性）
   - 方法（类的方法、函数模块）
   - 类和接口

6. **上下文感知**: 补全建议基于当前位置的上下文

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 必须是有效的源代码 URL |
| code | string | 是 | 必须是完整的源代码 |
| line | number | 是 | 必须在代码范围内 |
| column | number | 是 | 必须在行范围内 |

## 与其他工具的关联性

1. **配合使用**:
   ```
   getObjectSource → 编辑 → codeCompletion → setObjectSource
   ```

2. **编辑流程**:
   ```
   读取源代码 → 在编辑过程中使用 codeCompletion → 保存源代码
   ```

3. **与语法检查的关系**:
   ```
   codeCompletion → syntaxCheckCode → 保存
   ```

## 使用场景说明

### 场景 1: 获取变量补全
```json
{
  "tool": "codeCompletion",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "DATA: lv_var1 TYPE i.\nDATA: lv_var2 TYPE string.\nWRITE: lv",
    "line": 2,
    "column": 10
  }
}
// 返回: lv_var1, lv_var2 的补全建议
```

### 场景 2: 获取方法补全
```json
{
  "tool": "codeCompletion",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "METHOD my_method.\n  zcl_helper=>",
    "line": 2,
    "column": 18
  }
}
// 返回: zcl_helper 的所有公共方法
```

### 场景 3: 获取关键字补全
```json
{
  "tool": "codeCompletion",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "code": "REPORT zprog.\n\nW",
    "line": 3,
    "column": 2
  }
}
// 返回: WRITE, WHILE 等关键字的补全建议
```

### 场景 4: 实时补全
```json
// 在集成开发环境中，每当用户输入时调用 codeCompletion
// 提供实时的补全建议
```

## 补全建议类型

| kind 类型 | 说明 | 示例 |
|----------|------|------|
| keyword | ABAP 关键字 | WRITE, DATA, METHOD |
| variable | 变量 | lv_value, gs_instance |
| method | 方法 | execute, calculate |
| class | 类 | zcl_helper, cl_abap_unit_assert |
| interface | 接口 | zif_example |
| field | 结构字段 | matnr, wrbtr |
| constant | 常量 | co_default_value |

## 最佳实践

1. **提供完整代码**: 总是提供完整的源代码，而不仅是补全位置

2. **精确定位**: 确保行号和列号精确指向补全位置

3. **语法正确**: 提供的代码应该有正确的语法

4. **性能优化**: 避免在大型代码中频繁调用

5. **用户界面**: 在编辑器中实现实时补全功能

6. **建议排序**: 按相关性对补全建议排序

## 完整工作流程

```json
// 编辑器中的实时补全流程

// 1. 用户打开文件
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "..."}}

// 2. 用户编辑代码（在客户端进行）

// 3. 用户触发补全（如按 Ctrl+Space）
{
  "tool": "codeCompletion",
  "arguments": {
    "url": "...",
    "code": "完整的当前源代码",
    "line": 42,
    "column": 15
  }
}

// 4. 显示补全建议给用户
// 返回的建议显示在补全列表中

// 5. 用户选择建议，插入代码

// 6. 保存时检查语法
{"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "..."}}

// 7. 如果语法正确，保存代码
{"tool": "setObjectSource", "arguments": {...}}
```

## 补全结果处理

```json
{
  "suggestions": [
    {
      "label": "lv_variable",
      "kind": "variable",
      "detail": "Local variable",
      "documentation": "Type: i",
      "insertText": "lv_variable"
    },
    {
      "label": "WRITE",
      "kind": "keyword",
      "detail": "ABAP keyword",
      "documentation": "Outputs data to the list",
      "insertText": "WRITE "
    }
  ]
}
```

## 高级用法

### 模糊匹配
系统支持部分匹配，不要求完全输入：
```
输入: "lv_v"
返回: lv_var1, lv_value, lv_variable
```

### 上下文相关
补全建议基于当前上下文：
```
在 DATA 语句中: 只显示类型
在 WRITE 语句中: 只显示变量
在方法调用中: 只显示方法
```

### 文档提示
某些补全建议包含文档信息：
```json
{
  "label": "cl_abap_unit_assert",
  "kind": "class",
  "detail": "ABAP Unit Assertion",
  "documentation": "Class for ABAP Unit assertions"
}
```

