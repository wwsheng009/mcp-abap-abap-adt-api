# fixProposals

获取修复建议。

## 功能说明

此工具用于获取代码错误或警告的修复建议。它分析代码问题并提供可能的解决方案。

## 调用方法

**参数**:
- `url` (string, 必需): 源代码 URL
- `source` (string, 必需): 完整源代码
- `line` (number, 必需): 行号
- `column` (number, 必需): 列号

**返回值**:
```json
{
  "status": "success",
  "result": {
    "proposals": [
      {
        "id": "fix1",
        "title": "Add missing semicolon",
        "description": "Add a semicolon at the end of the statement",
        "edit": {
          "startLine": 10,
          "endLine": 10,
          "startColumn": 20,
          "endColumn": 20,
          "newText": ";"
        }
      },
      {
        "id": "fix2",
        "title": "Replace obsolete statement",
        "description": "Replace WRITE with cl_demo_output=>write",
        "edit": {
          "startLine": 15,
          "endLine": 15,
          "startColumn": 1,
          "endColumn": 15,
          "newText": "cl_demo_output=>write("
        }
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "fixProposals",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "source": "DATA lv_value TYPE i\nlv_value = 1",
    "line": 2,
    "column": 15
  }
}
```

## 注意事项

1. **完整源代码**: 必须提供完整源代码

2. **位置信息**: line 和 column 指定错误位置

3. **多个建议**: 可能返回多个修复建议

4. **编辑范围**: 每个建议包含具体的编辑范围

5. **自动应用**: 可以使用 `fixEdits` 应用修复

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 有效的源代码 URL |
| source | string | 是 | 完整源代码 |
| line | number | 是 | >= 1 |
| column | number | 是 | >= 1 |

## 与其他工具的关联性

1. **与 fixEdits 的关系**:
   ```
   fixProposals → 获取建议 → fixEdits (应用修复)
   ```

2. **与 syntaxCheckCode 的关系**:
   ```
   syntaxCheckCode (检查) → 发现错误 → fixProposals (获取建议)
   ```

## 使用场景说明

### 场景 1: 修复语法错误
```json
{
  "tool": "fixProposals",
  "arguments": {
    "url": "/sap/bc/adt/programs/zprog/source/main",
    "source": "WRITE 'Hello'",
    "line": 1,
    "column": 1
  }
}
// 返回: 添加句号的建议
```

### 场景 2: 修复过时语法
```json
{
  "tool": "fixProposals",
  "arguments": {
    "url": "/sap/bc/adt/programs/zprog/source/main",
    "source": "WRITE 'Hello'.",
    "line": 1,
    "column": 1
  }
}
// 返回: 替换为 cl_demo_output 的建议
```

## 修复建议类型

| 类型 | 说明 |
|------|------|
| syntax_fix | 语法错误修复 |
| deprecation_fix | 过时语法替换 |
| style_fix | 代码风格改进 |
| optimization | 性能优化 |

## 最佳实践

1. **查看所有建议**: 评估所有可用的建议

2. **选择最合适的**: 根据实际情况选择

3. **测试修复**: 应用修复后进行测试

4. **手动审查**: 不要盲目应用所有修复

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无建议 | 没有可用的修复建议 | 手动修复 |
| 位置错误 | line/column 不正确 | 检查位置 |

## 高级用法

### 批量修复
```json
// 为多个错误获取修复建议
for each error in errors:
  {
    "tool": "fixProposals",
    "arguments": {
      "url": error.url,
      "source": error.source,
      "line": error.line,
      "column": error.column
    }
  }
```

### 智能选择
```json
// 根据上下文选择最合适的建议
{
  "tool": "fixProposals",
  "arguments": { ... }
}
// 分析建议的描述和影响
// 选择最合适的
```
