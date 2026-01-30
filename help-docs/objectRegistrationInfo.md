# objectRegistrationInfo

获取 ABAP 对象的注册信息。

## 功能说明

此工具获取 ABAP 对象的注册信息,了解对象的元数据和配置。

## 调用方法

**参数**:
- `objectUrl` (string, 必需): 对象 URL

**返回值**:
```json
{
  "status": "success",
  "info": {
    "name": "ZCL_MY_CLASS",
    "type": "CLAS",
    "package": "Z_MY_PACKAGE",
    "author": "DEVELOPER",
    "description": "My class",
    "responsible": "DEVELOPER",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "modifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

**示例**:
```json
{
  "tool": "objectRegistrationInfo",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

## 注意事项

1. **元数据**: 返回对象的元数据信息

2. **状态**: 包含对象的状态信息

3. **作者**: 包含创建者和负责人信息

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUrl | string | 是 | 有效的对象 URL |

## 与其他工具的关联性

1. **与 objectStructure 的关系**:
   ```
   objectStructure (结构) → objectRegistrationInfo (注册信息)
   ```

## 使用场景说明

### 场景 1: 查看对象信息
```json
{
  "tool": "objectRegistrationInfo",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

## 最佳实践

1. **了解元数据**: 查看对象的详细信息

2. **追踪变更**: 查看修改时间

3. **联系负责人**: 需要时联系负责人

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象不存在 | 对象不存在 | 检查对象 |
| 权限不足 | 没有查看权限 | 联系管理员 |
