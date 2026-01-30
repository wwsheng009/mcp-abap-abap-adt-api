# lock

锁定 ABAP 对象。

## 功能说明

此工具用于锁定 ABAP 对象，防止其他用户同时修改。在编辑对象前必须先获取锁定，修改完成后需要解锁。

## 调用方法

**参数**:
- `objectUrl` (string, 必需): 对象的 URL
- `accessMode` (string, 可选): 访问模式，默认为 "MODIFY"

**返回值**:
```json
{
  "status": "success",
  "lockHandle": "lock_handle_string",
  "transport": "TRANSPORT_NUMBER",
  "message": "Object locked successfully"
}
```

**示例**:
```json
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

## 注意事项

1. **锁定句柄**: 返回的 `lockHandle` 必须妥善保存，用于后续的 `unLock` 操作

2. **传输请求**: 返回值中可能包含传输请求号，表示锁关联的传输

3. **锁定冲突**: 如果对象已被其他用户锁定，会返回错误

4. **访问模式**: 
   - `MODIFY`: 修改模式（默认）
   - `READ`: 只读模式

5. **超时**: 长时间保持锁定可能导致超时

6. **解锁要求**: 锁定后必须调用 `unLock` 释放锁定

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUrl | string | 是 | 必须是有效的 ADT 对象 URL |
| accessMode | string | 否 | MODIFY 或 READ |

## 与其他工具的关联性

1. **必需前置操作**:
   ```
   lock → setObjectSource → unLock
   ```

2. **与传输管理的关系**:
   ```
   transportInfo → lock → setObjectSource（使用 lock 返回的 transport）
   ```

3. **与对象操作的关系**:
   - `objectStructure`: 在锁定前确认对象信息
   - `getObjectSource`: 读取源代码后再锁定编辑

4. **解锁操作**:
   - 必须使用 `unLock` 释放锁定
   - 传入相同的 `lockHandle`

## 使用场景说明

### 场景 1: 标准编辑流程
```json
// 步骤 1: 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 步骤 2: 编辑对象
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "lockHandle": "returned_lock_handle",
    "source": "new source code"
  }
}

// 步骤 3: 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "returned_lock_handle"
  }
}
```

### 场景 2: 批量编辑
```json
// 对多个对象批量锁定
// 注意：应确保所有锁定都能成功，否则需要回滚已成功的锁定
```

### 场景 3: 只读访问
```json
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "accessMode": "READ"
  }
}
// 获取只读锁定，防止对象在访问期间被修改
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象已被锁定 | 其他用户正在编辑 | 等待其他用户完成或联系对方解锁 |
| 权限不足 | 没有修改对象的权限 | 检查用户权限或联系管理员 |
| 传输请求无效 | 锁关联的传输不可用 | 使用 `transportInfo` 获取有效传输 |

## 最佳实践

1. **使用 try-finally 确保解锁**:
   ```
   try {
     lock
     // 编辑操作
   } finally {
     unLock
   }
   ```

2. **保存 lockHandle** - 必须保存返回的锁定句柄用于解锁

3. **及时解锁** - 完成操作后立即解锁，不要长时间持有锁定

4. **处理锁定冲突** - 检查锁定状态，提供友好的错误信息

5. **批量操作前检查** - 批量锁定前先检查对象是否可用

6. **传输请求管理** - 注意 lock 返回的传输请求号

