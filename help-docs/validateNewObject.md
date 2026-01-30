# validateNewObject

验证新 ABAP 对象的参数。

## 功能说明

此工具验证创建新 ABAP 对象所需的参数,确保参数有效。

## 调用方法

**参数**:
- `options` (string, 必需): 对象选项(JSON 字符串)

**返回值**:
```json
{
  "status": "success",
  "result": {
    "valid": true,
    "warnings": [],
    "suggestions": [
      "Add description for better documentation"
    ]
  }
}
```

**示例**:
```json
{
  "tool": "validateNewObject",
  "arguments": {
    "options": "{\"objtype\":\"CLAS\",\"name\":\"ZCL_MY_CLASS\",\"parentName\":\"Z_MY_PACKAGE\",\"description\":\"My class\",\"parentPath\":\"/sap/bc/adt/packages/z_my_package\"}"
  }
}
```

## 注意事项

1. **参数验证**: 验证所有必需参数

2. **警告**: 可能返回警告信息

3. **建议**: 可能返回改进建议

4. **类型代码差异**: 与 createObject 不同，validateNewObject 可能不接受完整的 `{主类型}/{子类型}` 格式（如 'CLAS/OC'），如果遇到 "Unsupported object type" 错误，请尝试使用简化的类型代码（如 'CLAS'）。经过测试，使用完整类型代码可能导致验证失败。

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| options | string | 是 | 有效的 JSON 字符串 |

## 与其他工具的关联性

1. **与 createObject 的关系**:
   ```
   validateNewObject (验证) → createObject (创建)
   ```

## 使用场景说明

### 场景 1: 验证新类参数
```json
{
  "tool": "validateNewObject",
  "arguments": {
    "options": "{\"objtype\":\"CLAS\",\"name\":\"ZCL_MY_CLASS\",\"parentName\":\"Z_MY_PACKAGE\",\"description\":\"My class\",\"parentPath\":\"/sap/bc/adt/packages/z_my_package\"}"
  }
}
```

## 最佳实践

1. **创建前验证**: 在创建对象前验证参数

2. **查看警告**: 注意警告信息

3. **采纳建议**: 考虑采纳改进建议

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| JSON 解析错误 | options 不是有效的 JSON | 检查 JSON 格式 |
| 参数无效 | 参数值无效 | 修正参数 |
