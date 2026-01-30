# atcWorklists

获取 ATC 工作列表。

## 功能说明

此工具用于获取 ATC 检查的详细结果，包括发现的问题、位置、优先级等信息。需要使用 `createAtcRun` 返回的运行 ID。

## 调用方法

**参数**:
- `runResultId` (string, 必需): 运行结果 ID（从 createAtcRun 获得）
- `timestamp` (number, 可选): 时间戳（用于增量更新）
- `usedObjectSet` (string, 可选): 使用的对象集
- `includeExempted` (boolean, 可选): 是否包含豁免的问题（默认：false）

**返回值**:
```json
{
  "status": "success",
  "worklists": {
    "id": "atc_run_id",
    "timestamp": 1705600000000,
    "usedObjectSet": "object_set_1",
    "objectSetIsComplete": true,
    "objects": [
      {
        "uri": "/sap/bc/adt/oo/classes/zcl_my_class",
        "type": "CLAS",
        "name": "ZCL_MY_CLASS",
        "packageName": "Z_MY_PACKAGE",
        "author": "DEVELOPER",
        "objectTypeId": "CLAS/OC",
        "findings": [
          {
            "uri": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
            "location": {
              "type": "source",
              "name": "zcl_my_class",
              "path": "/source/main",
              "line": 42,
              "column": 10
            },
            "priority": 9,
            "checkId": "1_CHECK_LINE_LENGTH",
            "checkTitle": "Line length check",
            "messageId": "LINE_TOO_LONG",
            "messageTitle": "Line exceeds maximum length",
            "exemptionApproval": "",
            "exemptionKind": "",
            "quickfixInfo": "",
            "link": "/sap/bc/adt/atc/findings/..."
          }
        ]
      }
    ]
  }
}
```

**示例**:
```json
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id_12345"
  }
}
```

## 注意事项

1. **运行 ID**: 必须使用 `createAtcRun` 返回的有效 `runResultId`

2. **问题优先级**: 
   - 9-10: 严重问题，必须修复
   - 7-8: 高优先级问题，应该修复
   - 5-6: 中等优先级问题，建议修复
   - 1-4: 低优先级问题，可以选择性修复

3. **豁免问题**: 被豁免的问题默认不返回，除非设置 `includeExempted: true`

4. **增量更新**: 使用 `timestamp` 参数进行增量更新

5. **结果数量**: 可能返回大量问题，建议分批处理

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| runResultId | string | 是 | 有效的运行 ID |
| timestamp | number | 否 | Unix 毫秒时间戳 |
| usedObjectSet | string | 否 | 对象集名称 |
| includeExempted | boolean | 否 | 默认 false |

## 与其他工具的关联性

1. **ATC 流程**:
   ```
   createAtcRun → atcWorklists → 分析和修复问题
   ```

2. **与 atcExemptProposal 的关系**:
   - 对于高优先级问题，可以使用豁免请求

3. **与 transportRelease 的关系**:
   - ATC 问题修复后才能释放传输

## 使用场景说明

### 场景 1: 获取所有问题
```json
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id_12345"
  }
}
```

### 场景 2: 查看高优先级问题
```json
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id_12345"
  }
}
// 过滤 priority >= 7 的问题
```

### 场景 3: 包含豁免的问题
```json
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id_12345",
    "includeExempted": true
  }
}
```

### 场景 4: 增量更新
```json
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id_12345",
    "timestamp": 1705600000000
  }
}
```

## 问题优先级说明

| 优先级范围 | 严重程度 | 行动建议 |
|-----------|---------|---------|
| 9-10 | 严重 | 必须立即修复 |
| 7-8 | 高 | 应该尽快修复 |
| 5-6 | 中等 | 建议修复 |
| 1-4 | 低 | 可以选择性修复 |

## 问题信息结构

```json
{
  "uri": "问题位置的 URI",
  "location": {
    "type": "source/other",
    "name": "对象名称",
    "path": "路径",
    "line": 行号,
    "column": 列号
  },
  "priority": 优先级 (1-10),
  "checkId": "检查规则 ID",
  "checkTitle": "检查规则标题",
  "messageId": "消息 ID",
  "messageTitle": "消息标题",
  "exemptionApproval": "豁免批准",
  "exemptionKind": "豁免类型",
  "quickfixInfo": "快速修复信息",
  "link": "详细信息链接"
}
```

## 最佳实践

1. **优先级排序**: 按优先级排序问题，优先修复高优先级问题

2. **系统性修复**: 一次性修复同一类型的问题

3. **代码审查**: ATC 结果用于代码审查

4. **持续改进**: 定期运行 ATC 检查，持续改进代码质量

5. **文档记录**: 记录发现的问题和修复措施

## 完整工作流程

```json
// ATC 检查和修复完整流程

// 1. 运行 ATC 检查
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 2. 获取结果
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id"
  }
}

// 3. 分析结果
const criticalIssues = worklists.objects
  .flatMap(o => o.findings)
  .filter(f => f.priority >= 9)

const highPriorityIssues = worklists.objects
  .flatMap(o => o.findings)
  .filter(f => f.priority >= 7 && f.priority < 9)

// 4. 修复问题
for each issue in criticalIssues:
  // 修复严重问题...

// 5. 重新检查
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 6. 确认修复
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "new_atc_run_id"
  }
}
```

## 常见 ATC 检查规则

| 检查规则 | 优先级 | 说明 |
|---------|--------|------|
| 1_CHECK_LINE_LENGTH | 8 | 行长度检查 |
| 1_SYNTAX_CHECK | 10 | 语法错误检查 |
| 2_NAMING_CONVENTIONS | 7 | 命名约定检查 |
| 3_PERFORMANCE | 6 | 性能问题检查 |
| 4_SECURITY | 9 | 安全问题检查 |

---

## 错误处理

所有工具可能返回以下错误格式：

```json
{
  "error": "Error message",
  "code": -32603
}
```

### 常见错误码

| 错误码 | 名称 | 描述 |
|--------|------|------|
| -32600 | InvalidRequest | 无效的请求 |
| -32601 | MethodNotFound | 工具不存在 |
| -32602 | InvalidParams | 无效的参数 |
| -32603 | InternalError | 内部服务器错误 |
| 429 | TooManyRequests | 速率限制超出 |

---

## 使用建议

1. **定期检查**: 定期运行 ATC 检查，确保代码质量
2. **修复高优先级问题**: 优先修复高优先级问题
3. **系统性修复**: 系统性修复同一类型的问题
4. **代码审查**: 将 ATC 结果作为代码审查依据
5. **持续改进**: 持续运行 ATC 检查，持续改进代码质量
6. **文档记录**: 记录发现的问题和修复措施，便于后续追踪

## 相关工具
- [createAtcRun](createAtcRun.md) - 创建ATC运行
- [atcExemptProposal](atcExemptProposal.md) - 获取豁免建议
