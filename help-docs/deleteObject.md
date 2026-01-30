# deleteObject

删除 ABAP 对象。

## 功能说明

此工具从系统中删除 ABAP 对象。删除是不可逆操作,需要谨慎使用。

## 调用方法

**参数**:
- `objectUrl` (string, 必需): 要删除的对象 URL
- `lockHandle` (string, 必需): 对象锁定句柄
- `transport` (string, 可选): 传输请求号

**返回值**:
```json
{
  "status": "success",
  "result": {
    "deleted": true,
    "object": "ZCL_MY_CLASS"
  },
  "message": "Object deleted successfully"
}
```

**示例**:
```json
{
  "tool": "deleteObject",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}
```

## 注意事项

1. **不可逆操作**: 删除无法撤销

2. **锁定要求**: 必须先锁定对象

3. **传输请求**: 需要传输请求记录删除操作

4. **依赖检查**: 删除前应检查依赖关系

5. **权限要求**: 需要删除权限

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUrl | string | 是 | 有效的对象 URL |
| lockHandle | string | 是 | 有效的锁定句柄 |
| transport | string | 否 | 传输请求号 |

## 与其他工具的关联性

1. **与 lock/unLock 的关系**:
   ```
   lock → deleteObject → unLock
   ```

2. **与 transportInfo 的关系**:
   ```
   transportInfo → 获取传输 → deleteObject
   ```

## 使用场景说明

### 场景 1: 删除不再使用的类
```json
{
  "tool": "deleteObject",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_old_class",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}
```

## 最佳实践

1. **检查依赖**: 删除前检查是否有其他对象依赖

2. **备份**: 删除前备份重要代码

3. **确认**: 删除前再次确认

4. **传输**: 使用正确的传输请求

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象不存在 | 对象已被删除 | 检查对象 |
| 权限不足 | 没有删除权限 | 联系管理员 |
| 依赖存在 | 其他对象依赖 | 先处理依赖 |

## 高级用法

### 批量删除
```json
// 批量删除多个对象
for each object in objects:
  {
    "tool": "lock",
    "arguments": { "objectUrl": object.url }
  }
  {
    "tool": "deleteObject",
    "arguments": {
      "objectUrl": object.url,
      "lockHandle": lockHandle,
      "transport": transport
    }
  }
```
