# codeCompletionElement

检索代码补全元素信息。

## 功能说明

此工具用于获取特定代码补全元素的详细信息,比 `codeCompletionFull` 提供更深入的信息。

## 调用方法

**参数**:
- `sourceUrl` (string, 必需): 源代码 URL
- `source` (string, 必需): 完整源代码
- `line` (number, 必需): 行号
- `column` (number, 必需): 列号

**返回值**:
```json
{
  "status": "success",
  "result": {
    "element": {
      "name": "execute",
      "type": "method",
      "description": "Execute main logic",
      "documentation": "Full documentation...",
      "signature": "execute( )",
      "parameters": [
        {
          "name": "iv_param",
          "type": "STRING",
          "direction": "importing",
          "optional": false
        }
      ],
      "returnType": "I"
    }
  }
}
```

**示例**:
```json
{
  "tool": "codeCompletionElement",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "lo_helper->execute(",
    "line": 10,
    "column": 15
  }
}
```

## 注意事项

1. **详细查询**: 提供比标准补全更详细的信息

2. **参数签名**: 包含方法的参数列表

3. **文档**: 包含完整的文档说明

4. **性能**: 比标准补全稍慢

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| sourceUrl | string | 是 | 有效的源代码 URL |
| source | string | 是 | 完整源代码 |
| line | number | 是 | >= 1 |
| column | number | 是 | >= 1 |

## 与其他工具的关联性

1. **与 codeCompletion 的关系**:
   ```
   codeCompletion (获取列表) → codeCompletionElement (详细信息)
   ```

2. **与 abapDocumentation 的关系**:
   ```
   codeCompletionElement → 查看参数 → abapDocumentation
   ```

## 使用场景说明

### 场景 1: 查看方法参数
```json
{
  "tool": "codeCompletionElement",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "lo_helper->execute(",
    "line": 10,
    "column": 15
  }
}
// 返回方法的参数列表
```

### 场景 2: 查看变量类型
```json
{
  "tool": "codeCompletionElement",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "lv_value",
    "line": 10,
    "column": 10
  }
}
// 返回变量的类型信息
```

## 元素类型

| 类型 | 说明 |
|------|------|
| method | 方法 |
| attribute | 属性 |
| variable | 变量 |
| type | 类型 |
| class | 类 |

## 最佳实践

1. **参数提示**: 显示方法的参数列表

2. **类型信息**: 显示元素的类型

3. **文档查看**: 显示完整的文档

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无元素 | 位置没有元素 | 检查位置 |

## 高级用法

### 智能参数提示
```json
// 在输入参数时显示参数信息
{
  "tool": "codeCompletionElement",
  "arguments": {
    "sourceUrl": "...",
    "source": "lo_helper->execute( iv_",
    "line": 10,
    "column": 20
  }
}
// 显示当前参数的类型和描述
```
