# grepObjectSource

在源代码中搜索匹配模式的行(支持正则表达式)。

## 功能说明

此工具用于在 ABAP 源代码中搜索匹配特定模式(正则表达式)的行,类似于 Unix 的 grep 命令。支持:
- 正则表达式模式匹配
- 大小写敏感/不敏感搜索
- 上下文行显示
- 限制最大匹配数
- 服务器端搜索(更快速)

相比在客户端读取整个文件后搜索,此工具在服务器端执行搜索,性能更好。

## 调用方法

**参数**:
- `sourceUrl` (string, 必需): 源代码 URL
- `pattern` (string, 必需): 搜索模式(支持正则表达式)
- `caseInsensitive` (boolean, 可选): 大小写不敏感搜索,默认: false
- `contextLines` (number, 可选): 上下文行数,默认: 0
- `maxMatches` (number, 可选): 最大匹配数,默认: 100

**返回值**:
```json
{
  "status": "success",
  "matches": [
    {
      "lineNumber": 25,
      "content": "METHOD execute.",
      "contextBefore": ["CLASS zcl_my_class IMPLEMENTATION.", ""],
      "contextAfter": ["  DATA: lv_result TYPE i.", "  lv_result = 1 + 1."]
    },
    {
      "lineNumber": 50,
      "content": "METHOD calculate.",
      "contextBefore": ["ENDMETHOD.", ""],
      "contextAfter": ["  RETURN rv_result."]
    }
  ],
  "totalMatches": 2,
  "truncated": false
}
```

**示例**:
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute",
    "caseInsensitive": false,
    "contextLines": 2,
    "maxMatches": 10
  }
}
```

## 注意事项

1. **正则表达式**: `pattern` 参数支持完整的正则表达式语法

2. **大小写敏感**:
   - 默认区分大小写
   - 设置 `caseInsensitive: true` 进行不区分大小写的搜索

3. **上下文行**:
   - `contextLines` 指定在匹配行前后显示的行数
   - 例如 `contextLines: 2` 显示匹配行前后各 2 行
   - 默认为 0,只显示匹配行

4. **最大匹配数**:
   - `maxMatches` 限制返回的匹配数量
   - 默认为 100
   - 设置为 0 或更大的值获取所有匹配

5. **服务器端搜索**: 搜索在服务器端执行,性能优于客户端搜索

6. **截断标记**: `truncated` 字段指示是否还有更多匹配

7. **性能优化**: 对于大文件,服务器端搜索比读取整个文件更快

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| sourceUrl | string | 是 | 必须是有效的源代码 URL |
| pattern | string | 是 | 必须是有效的正则表达式 |
| caseInsensitive | boolean | 否 | 默认 false |
| contextLines | number | 否 | 必须 >= 0,默认 0 |
| maxMatches | number | 否 | 必须 >= 0,默认 100 |

## 与其他工具的关联性

1. **与 getObjectSourceV2 的关系**:
   ```
   getObjectSourceV2: 读取整个源代码
   grepObjectSource: 在源代码中搜索特定模式
   ```

2. **配合使用**:
   ```
   grepObjectSource (搜索) → getObjectSourceV2 (读取匹配上下文)
   ```

3. **代码导航**:
   ```
   grepObjectSource (查找方法) →getObjectSourceV2 (读取方法代码)
   ```

4. **与 codeCompletion 的关系**:
   ```
   grepObjectSource: 查找现有代码模式
   codeCompletion: 获取代码补全建议
   ```

5. **与 findDefinition/usageReferences 的关系**:
   ```
   findDefinition: 查找定义位置
   usageReferences: 查找使用位置
   grepObjectSource: 按模式搜索代码
   ```

## 使用场景说明

### 场景 1: 查找方法定义
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "^METHOD\\s+\\w+\\.$"
  }
}
// 返回所有方法定义
```

### 场景 2: 查找变量声明
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "DATA\\s+\\w+\\s+TYPE"
  }
}
// 返回所有 DATA 声明
```

### 场景 3: 查找特定字符串(不区分大小写)
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "hello world",
    "caseInsensitive": true
  }
}
// 查找 "hello world" 或 "Hello World" 或 "HELLO WORLD"
```

### 场景 4: 查找带上下文的方法调用
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zprog/source/main",
    "pattern": "CALL FUNCTION.*ZFM_MY_FUNCTION",
    "contextLines": 3
  }
}
// 返回匹配行前后各 3 行
```

### 场景 5: 查找注释
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "^\\*"
  }
}
// 返回所有注释行(以 * 开头)
```

### 场景 6: 查找特定类的方法
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "zcl_helper\\-\\>execute\\(",
    "maxMatches": 50
  }
}
// 查找 zcl_helper->execute() 的所有调用
```

### 场景 7: 查找错误处理
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "RAISE EXCEPTION|CATCH cx",
    "contextLines": 2
  }
}
// 查找所有异常处理代码
```

## 常用正则表达式模式

| 模式 | 说明 | 示例匹配 |
|------|------|----------|
| `^METHOD\s+\w+\.$` | 方法定义 | `METHOD execute.` |
| `DATA\s+\w+` | 变量声明 | `DATA lv_value TYPE i.` |
| `CALL FUNCTION` | 函数调用 | `CALL FUNCTION 'ZFM_FUNC'` |
| `^\\*` | 注释行 | `* This is a comment` |
| `WRITE:?\s+` | 输出语句 | `WRITE: 'Hello'` |
| `IF\s+\w+\s*=` | IF 条件 | `IF lv_value = 1.` |
| `ENDMETHOD\.$` | 方法结束 | `ENDMETHOD.` |
| `CLASS\s+\w+\s+DEFINITION` | 类定义 | `CLASS zcl_class DEFINITION` |
| `RAISE EXCEPTION` | 异常抛出 | `RAISE EXCEPTION TYPE cx_static_check.` |
| `CATCH\s+\w+` | 异常捕获 | `CATCH cx_sy_ref_is_initial.` |
| `TYPE\s+` | 类型声明 | `TYPE i`, `TYPE string` |
| `IMPORTING\s+` | 导入参数 | `IMPORTING iv_param TYPE i` |
| `EXPORTING\s+` | 导出参数 | `EXPORTING ev_result TYPE i` |

## 上下文行示例

### 无上下文(contextLines: 0)
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute",
    "contextLines": 0
  }
}
// 返回:
// {
//   "matches": [
//     {
//       "lineNumber": 25,
//       "content": "METHOD execute."
//     }
//   ]
// }
```

### 带上下文(contextLines: 2)
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute",
    "contextLines": 2
  }
}
// 返回:
// {
//   "matches": [
//     {
//       "lineNumber": 25,
//       "content": "METHOD execute.",
//       "contextBefore": [
//         "CLASS zcl_my_class IMPLEMENTATION.",
//         ""
//       ],
//       "contextAfter": [
//         "  DATA: lv_result TYPE i.",
//         "  lv_result = 1 + 1."
//       ]
//     }
//   ]
// }
```

## 搜索工作流程

### 步骤 1: 搜索模式
```json
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD calculate",
    "contextLines": 5,
    "maxMatches": 1
  }
}
```

### 步骤 2: 分析匹配结果
```json
// 如果找到匹配,获取方法的位置和上下文
{
  "matches": [
    {
      "lineNumber": 50,
      "content": "METHOD calculate.",
      "contextBefore": [...],
      "contextAfter": [...]
    }
  ]
}
```

### 步骤 3: 读取完整方法
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 50,
    "endLine": 100
  }
}
// 读取完整方法代码
```

## 最佳实践

1. **使用正则表达式**: 利用正则表达式进行精确匹配

2. **控制上下文**: 根据需要设置 `contextLines`,避免过多上下文

3. **限制匹配数**: 设置合理的 `maxMatches`,避免返回过多结果

4. **大小写考虑**: ABAP 通常不区分大小写,使用 `caseInsensitive: true`

5. **组合搜索**: 先用 grep 查找,再用 getObjectSourceV2 读取详情

6. **性能优化**: 对于大文件,服务器端搜索比客户端搜索更快

7. **正则验证**: 确保正则表达式正确,避免语法错误

## 完整工作流程

```json
// 代码搜索和分析流程

// 1. 搜索方法定义
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "^METHOD\\s+\\w+\\.$"
  }
}
// 返回所有方法及其行号

// 2. 选择特定方法并读取
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 50,
    "endLine": 100
  }
}
// 读取方法代码

// 3. 查找方法中的特定代码
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "SELECT.*FROM.*ztable",
    "contextLines": 3
  }
}
// 查找数据库查询

// 4. 分析代码引用
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "zcl_another_class\\-\\>execute",
    "maxMatches": 20
  }
}
// 查找对另一个类的调用

// 5. 使用 usageReferences 获取完整引用
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_another_class/source/main",
    "line": 10,
    "column": 1
  }
}
// 获取跨对象的引用
```

## 高级用法

### 多文件搜索
```json
// 在多个文件中搜索相同模式
for each file in files:
  {
    "tool": "grepObjectSource",
    "arguments": {
      "sourceUrl": file,
      "pattern": "RAISE EXCEPTION",
      "contextLines": 2
    }
  }
```

### 模式组合搜索
```json
// 先搜索方法,再在方法内部搜索
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute"
  }
}
// 获取行号后,在该行范围内搜索
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "SELECT.*FROM"
  }
}
```

### 代码重构辅助
```json
// 查找所有需要重构的代码
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "MOVE\\s+\\w+\\s+TO\\s+\\w+",
    "contextLines": 1
  }
}
// 查找所有 MOVE 语句(可能需要替换为现代语法)
```

### 性能分析
```json
// 查找可能的性能问题
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zprog/source/main",
    "pattern": "SELECT.*\\*.*FROM",
    "contextLines": 2
  }
}
// 查找 SELECT * 语句(性能问题)
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 正则表达式无效 | pattern 参数不是有效的正则 | 检查正则表达式语法 |
| 源代码 URL 无效 | URL 格式错误 | 检查 URL 格式 |
| 对象不存在 | URL 指向的对象不存在 | 检查对象 URL |
| 权限不足 | 没有读取权限 | 联系管理员 |
| 超出最大匹配 | maxMatches 限制 | 增大 maxMatches 或 0(无限制) |

## 与客户端搜索对比

| 特性 | grepObjectSource | 客户端搜索 |
|------|------------------|------------|
| 性能 | 服务器端,更快 | 需要下载整个文件 |
| 网络流量 | 只返回匹配结果 | 需要传输整个文件 |
| 功能 | 正则表达式,上下文 | 取决于实现 |
| 复杂度 | 简单 | 需要客户端实现 |

## 性能优化建议

1. **使用服务器端搜索**: 避免读取整个文件
2. **限制上下文行**: 减少返回的数据量
3. **设置最大匹配数**: 避免返回过多结果
4. **精确的模式**: 使用精确的正则表达式
5. **并行搜索**: 对多个文件使用并行请求
