# fixEdits

应用修复编辑。

## 功能说明

此工具应用 `fixProposals` 返回的修复建议,自动修复代码错误或警告。

## 调用方法

**参数**:
- `proposal` (string, 必需): 修复建议(JSON 字符串)
- `source` (string, 必需): 源代码

**返回值**:
```json
{
  "status": "success",
  "result": {
    "modified": true,
    "newSource": "DATA lv_value TYPE i.\nlv_value = 1.",
    "changes": [
      {
        "startLine": 2,
        "endLine": 2,
        "oldText": "lv_value = 1",
        "newText": "lv_value = 1."
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "fixEdits",
  "arguments": {
    "proposal": "{\"id\":\"fix1\",\"title\":\"Add semicolon\",\"edit\":{\"startLine\":2,\"endLine\":2,\"newText\":\"lv_value = 1.\"}}",
    "source": "DATA lv_value TYPE i\nlv_value = 1"
  }
}
```

## 注意事项

1. **建议格式**: proposal 必须是有效的 JSON 字符串

2. **源代码**: 提供的源代码将被修改

3. **锁定**: 在应用修复前应锁定对象

4. **验证**: 应用后应验证修改

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| proposal | string | 是 | 有效的 JSON 字符串 |
| source | string | 是 | 源代码 |

## 与其他工具的关联性

1. **与 fixProposals 的关系**:
   ```
   fixProposals (获取建议) → fixEdits (应用修复)
   ```

2. **编辑流程**:
   ```
   lock → fixEdits → setObjectSourceV2 → activate
   ```

## 使用场景说明

### 场景 1: 自动修复语法错误
```json
// 步骤 1: 获取修复建议
{
  "tool": "fixProposals",
  "arguments": {
    "url": "/sap/bc/adt/programs/zprog/source/main",
    "source": "WRITE 'Hello'",
    "line": 1,
    "column": 1
  }
}

// 步骤 2: 应用修复
{
  "tool": "fixEdits",
  "arguments": {
    "proposal": "{\"id\":\"fix1\",\"edit\":{\"startLine\":1,\"newText\":\"WRITE 'Hello'.\"}}",
    "source": "WRITE 'Hello'"
  }
}
```

## 最佳实践

1. **审查建议**: 应用前审查修复内容

2. **备份代码**: 在批量修复前备份

3. **测试验证**: 应用后进行测试

4. **逐步应用**: 分批应用修复

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| JSON 解析错误 | proposal 不是有效的 JSON | 检查 JSON 格式 |
| 应用失败 | 编辑范围无效 | 检查编辑参数 |

## 高级用法

### 批量修复
```json
// 应用多个修复建议
for each proposal in proposals:
  {
    "tool": "fixEdits",
    "arguments": {
      "proposal": JSON.stringify(proposal),
      "source": currentSource
    }
  }
  currentSource = result.newSource
```

### CI/CD 集成
```json
// 在持续集成中自动修复
{
  "tool": "fixProposals",
  "arguments": { ... }
}
{
  "tool": "fixEdits",
  "arguments": { ... }
}
{
  "tool": "setObjectSourceV2",
  "arguments": { ... }
}
```
