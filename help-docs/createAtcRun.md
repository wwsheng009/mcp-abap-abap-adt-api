# createAtcRun

创建并运行 ATC 检查。

## 功能说明

此工具用于创建并运行 ABAP Test Cockpit (ATC) 检查。ATC 是 SAP 的代码审查和静态分析工具，用于发现代码质量问题。

## 调用方法

**参数**:
- `variant` (string, 必需): 检查变体（如 DEFAULT, SECURE_CODE）
- `mainUrl` (string, 必需): 主对象 URL
- `maxResults` (number, 可选): 最大结果数（默认：100）

**返回值**:
```json
{
  "status": "success",
  "runResultId": "atc_run_id_12345",
  "timestamp": 1705600000000,
  "infos": [
    {
      "type": "check_variant",
      "description": "DEFAULT variant used"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "maxResults": 100
  }
}
```

## 注意事项

1. **检查变体**: 不同的检查变体有不同的检查规则集

2. **运行时间**: ATC 检查可能需要较长时间，特别是对于大型对象

3. **结果 ID**: 返回的 `runResultId` 用于后续获取详细结果

4. **最大结果**: `maxResults` 限制返回的问题数量

5. **系统资源**: ATC 检查消耗系统资源，避免频繁运行

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| variant | string | 是 | 有效的检查变体名称 |
| mainUrl | string | 是 | 有效的对象 URL |
| maxResults | number | 否 | 推荐 100-1000 |

## 与其他工具的关联性

1. **ATC 流程**:
   ```
   createAtcRun → atcWorklists → 分析结果 → 修复问题
   ```

2. **与 atcWorklists 的关系**:
   - 使用 `createAtcRun` 返回的 `runResultId` 获取详细结果

3. **与 transportRelease 的关系**:
   - ATC 检查通过后才能释放传输（通常）

## 使用场景说明

### 场景 1: 标准检查
```json
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

### 场景 2: 安全检查
```json
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "SECURE_CODE",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_sensitive_class"
  }
}
```

### 场景 3: 获取结果
```json
// 步骤 1: 创建 ATC 运行
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: {"runResultId": "atc_123"}

// 步骤 2: 获取结果
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_123"
  }
}
```

## 常见检查变体

| 变体 | 说明 | 用途 |
|------|------|------|
| DEFAULT | 默认检查 | 通用代码质量检查 |
| SECURE_CODE | 安全代码 | 安全性检查 |
| PERFORMANCE | 性能 | 性能相关检查 |
| TESTABILITY | 可测试性 | 可测试性检查 |

## 最佳实践

1. **定期检查**: 定期运行 ATC 检查，确保代码质量

2. **修复问题**: 及时修复 ATC 发现的问题

3. **检查变体**: 根据需求选择合适的检查变体

4. **结果分析**: 仔细分析 ATC 结果，优先修复高优先级问题

5. **记录问题**: 记录 ATC 发现的问题和修复措施

## 完整工作流程

```json
// ATC 检查和修复流程

// 1. 运行 ATC 检查
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 2. 获取检查结果
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id"
  }
}

// 3. 分析结果
// 按优先级排序问题
const criticalIssues = worklists.objects.flatMap(o => o.findings).filter(f => f.priority > 7)

// 4. 修复问题
// [修复代码...]

// 5. 重新检查（可选）
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 6. 确认问题已修复
```

## 相关工具
- [atcWorklists](atcWorklists.md) - 获取工作列表
- [atcCheckVariant](atcCheckVariant.md) - 获取检查变体
