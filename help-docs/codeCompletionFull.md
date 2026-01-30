# codeCompletionFull

执行完整的代码补全。

## 功能说明

此工具提供比标准代码补全更全面的功能,支持更高级的补全场景。与 `codeCompletion` 相比,它提供:
- 更多的补全选项
- 更智能的上下文感知
- 模式键(patternKey)支持
- 更详细的补全信息

适用于需要更复杂代码补全的场景。

## 调用方法

**参数**:
- `sourceUrl` (string, 必需): 源代码 URL
- `source` (string, 必需): 完整源代码
- `line` (number, 必需): 光标所在行号
- `column` (number, 必需): 光标所在列号
- `patternKey` (string, 必需): 模式键,用于指定补全模式

**返回值**:
```json
{
  "status": "success",
  "result": {
    "completions": [
      {
        "text": "execute",
        "type": "method",
        "description": "Execute main logic",
        "documentation": "Detailed documentation...",
        "prefix": "",
        "suffix": "()",
        "insertText": "execute()",
        "sortText": "a_execute"
      },
      {
        "text": "export",
        "type": "keyword",
        "description": "Export keyword",
        "prefix": "",
        "suffix": " ",
        "insertText": "export "
      }
    ],
    "patternKey": "method_call",
    "context": {
      "position": "after_method_call"
    }
  }
}
```

**示例**:
```json
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "CLASS zcl_my_class IMPLEMENTATION.\n  METHOD execute.\n    lo_helper-\n  ENDMETHOD.\nENDCLASS.",
    "line": 3,
    "column": 15,
    "patternKey": "method_call"
  }
}
```

## 注意事项

1. **完整源代码**: 必须提供完整的源代码,而不仅仅是当前行

2. **模式键(patternKey)**:
   - 用于指定补全模式和上下文
   - 影响补全的类型和结果
   - 常见值: `method_call`, `variable`, `type`, `keyword`

3. **光标位置**:
   - `line` 和 `column` 指定补全的位置
   - 从 1 开始计数

4. **与 codeCompletion 的区别**:
   - `codeCompletion`: 标准补全,简单快速
   - `codeCompletionFull`: 完整补全,更多选项

5. **补全类型**:
   - 方法(method)
   - 属性(attribute)
   - 关键字(keyword)
   - 类型(type)
   - 变量(variable)

6. **性能考虑**:
   - 需要完整源代码,可能较慢
   - 提供更多信息,但消耗更多资源

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| sourceUrl | string | 是 | 必须是有效的源代码 URL |
| source | string | 是 | 必须是完整的源代码 |
| line | number | 是 | 必须 >= 1 |
| column | number | 是 | 必须 >= 1 |
| patternKey | string | 是 | 必须是有效的模式键 |

## 与其他工具的关联性

1. **与 codeCompletion 的关系**:
   ```
   codeCompletion: 标准补全,快速
   codeCompletionFull: 完整补全,全面
   ```

2. **与 codeCompletionElement 的关系**:
   ```
   codeCompletionFull: 获取补全列表
   codeCompletionElement: 获取特定补全的详细信息
   ```

3. **编辑流程**:
   ```
   codeCompletionFull → 选择补全 → 插入代码
   ```

4. **与 findDefinition 的关系**:
   ```
   codeCompletionFull (查看可用选项) → 选择 → findDefinition (查看定义)
   ```

## 使用场景说明

### 场景 1: 方法调用补全
```json
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "lo_helper->",
    "line": 1,
    "column": 11,
    "patternKey": "method_call"
  }
}
// 返回 lo_helper 对象的所有可用方法
```

### 场景 2: 类型补全
```json
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "DATA: lv_value TYPE ",
    "line": 1,
    "column": 20,
    "patternKey": "type"
  }
}
// 返回所有可用的类型
```

### 场景 3: 关键字补全
```json
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zprog/source/main",
    "source": "WRI",
    "line": 1,
    "column": 4,
    "patternKey": "keyword"
  }
}
// 返回以 WRI 开头的关键字,如 WRITE
```

### 场景 4: 变量补全
```json
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "METHOD execute.\n  lv_",
    "line": 2,
    "column": 4,
    "patternKey": "variable"
  }
}
// 返回所有以 lv_ 开头的变量
```

## 模式键(patternKey)详解

| 模式键 | 说明 | 补全内容 |
|--------|------|----------|
| method_call | 方法调用 | 可调用的方法 |
| variable | 变量 | 局部和全局变量 |
| type | 类型 | 数据类型 |
| keyword | 关键字 | ABAP 关键字 |
| class | 类 | 可用的类 |
| table | 表 | 数据库表 |
| structure | 结构 | 结构类型 |
| interface | 接口 | 可用的接口 |

## 补全项结构

```json
{
  "text": "execute",
  "type": "method",
  "description": "Execute main logic",
  "documentation": "Full documentation...",
  "prefix": "",
  "suffix": "()",
  "insertText": "execute()",
  "sortText": "a_execute",
  "detail": "METHOD execute",
  "kind": "Method"
}
```

**字段说明**:
- `text`: 补全文本
- `type`: 补全类型
- `description`: 简短描述
- `documentation`: 详细文档
- `prefix`: 前缀
- `suffix`: 后缀
- `insertText`: 插入的完整文本
- `sortText`: 排序文本
- `detail`: 详细信息
- `kind`: 种类

## 完整工作流程

```json
// 智能代码编辑流程

// 1. 读取源代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 2. 用户输入代码,在特定位置请求补全
// 例如: 用户输入 "lo_helper->"

// 3. 调用完整补全
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "METHOD execute.\n  lo_helper->\nENDMETHOD.",
    "line": 2,
    "column": 11,
    "patternKey": "method_call"
  }
}

// 4. 返回补全列表
{
  "completions": [
    {
      "text": "execute",
      "insertText": "execute()",
      "documentation": "Execute the helper method"
    },
    {
      "text": "calculate",
      "insertText": "calculate()",
      "documentation": "Calculate something"
    }
  ]
}

// 5. 用户选择补全(例如: "execute")

// 6. 插入补全文本
// 代码变为: "lo_helper->execute()"

// 7. 可选: 查看补全的详细信息
{
  "tool": "codeCompletionElement",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "...",
    "line": 2,
    "column": 11
  }
}

// 8. 可选: 查看定义
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "...",
    "line": 2,
    "startCol": 11,
    "endCol": 17
  }
}
```

## 最佳实践

1. **选择合适模式**: 根据上下文选择正确的 `patternKey`

2. **提供完整源代码**: 确保提供完整准确的源代码

3. **处理补全结果**:
   - 过滤和排序补全项
   - 根据用户输入进一步筛选

4. **显示信息**:
   - 显示补全的描述
   - 显示参数信息(对于方法)

5. **性能优化**:
   - 使用 `codeCompletion` 进行快速补全
   - 仅在需要时使用 `codeCompletionFull`

6. **用户体验**:
   - 提供实时补全
   - 支持键盘导航

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 源代码无效 | 源代码有语法错误 | 修复语法错误 |
| 位置无效 | line 或 column 超出范围 | 检查位置 |
| 模式键无效 | patternKey 不正确 | 使用有效的模式键 |
| 无补全 | 上下文没有可补全项 | 检查代码上下文 |

## 高级用法

### 上下文感知补全
```json
// 根据不同上下文使用不同模式
if 上下文 == "方法调用":
  patternKey = "method_call"
else if 上下文 == "类型定义":
  patternKey = "type"
else if 上下文 == "变量声明":
  patternKey = "variable"
```

### 模糊匹配
```json
// 使用部分输入进行补全
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "...",
    "source": "lo_hel->",
    "line": 1,
    "column": 7,
    "patternKey": "method_call"
  }
}
// 返回: "execute", "calculate" 等(lo_helper 的方法)
```

### 参数信息
```json
// 获取方法的参数信息
{
  "tool": "codeCompletionFull",
  "arguments": {
    "sourceUrl": "...",
    "source": "lo_helper->execute( ",
    "line": 1,
    "column": 20,
    "patternKey": "method_call"
  }
}
// 返回: 方法的参数列表
```

## 与标准补全对比

| 特性 | codeCompletion | codeCompletionFull |
|------|----------------|-------------------|
| 补全选项 | 基本 | 全面 |
| 上下文感知 | 简单 | 智能 |
| 模式键 | 不支持 | 支持 |
| 性能 | 快 | 较慢 |
| 信息量 | 少 | 多 |

## 性能优化建议

1. **延迟调用**: 用户停止输入后再调用

2. **缓存结果**: 缓存常用补全结果

3. **分页显示**: 对于大量补全,分页显示

4. **优先级排序**: 根据使用频率排序

5. **减少频率**: 不要在每次按键时调用
