# usageReferenceSnippets

获取使用引用片段。

## 功能说明

此工具获取代码引用的代码片段,帮助理解引用的上下文。

## 调用方法

**参数**:
- `references` (array, 必需): 引用列表

**返回值**:
```json
{
  "status": "success",
  "result": {
    "snippets": [
      {
        "reference": {
          "url": "/sap/bc/adt/programs/zprog/source/main",
          "line": 10,
          "column": 15
        },
        "snippet": "DATA: lv_value TYPE i.\nlv_value = 1.\nWRITE lv_value.",
        "contextBefore": ["* Start of method"],
        "contextAfter": ["* End of method"]
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "usageReferenceSnippets",
  "arguments": {
    "references": [
      {
        "url": "/sap/bc/adt/programs/zprog/source/main",
        "line": 10,
        "column": 15
      }
    ]
  }
}
```

## 注意事项

1. **引用列表**: 必须提供有效的引用列表

2. **上下文**: 包含引用前后的代码

3. **批量获取**: 可以一次性获取多个引用的片段

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| references | array | 是 | 引用对象数组 |

## 与其他工具的关联性

1. **与 usageReferences 的关系**:
   ```
   usageReferences (获取引用) → usageReferenceSnippets (获取片段)
   ```

## 使用场景说明

### 场景 1: 查看引用上下文
```json
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "line": 10,
    "column": 15
  }
}
// 返回引用列表

{
  "tool": "usageReferenceSnippets",
  "arguments": {
    "references": [
      { "url": "...", "line": 10, "column": 15 }
    ]
  }
}
// 获取引用的代码片段
```

## 片段结构

| 字段 | 说明 |
|------|------|
| reference | 引用位置 |
| snippet | 代码片段 |
| contextBefore | 前置代码 |
| contextAfter | 后置代码 |

## 最佳实践

1. **批量获取**: 一次性获取多个引用片段

2. **上下文大小**: 适当调整上下文大小

3. **代码分析**: 分析引用的上下文理解用法

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无效引用 | 引用不存在 | 检查引用 |

## 高级用法

### 代码分析
```json
// 分析方法的所有引用
{
  "tool": "usageReferences",
  "arguments": { ... }
}
{
  "tool": "usageReferenceSnippets",
  "arguments": { ... }
}
// 分析每个引用的上下文
```
