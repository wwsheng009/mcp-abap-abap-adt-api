# unLock

解锁 ABAP 对象。

## 功能说明

此工具用于释放之前通过 `lock` 工具获取的对象锁定。完成对象编辑后必须调用此工具，否则其他用户无法编辑该对象。

## 调用方法

**参数**:
- `objectUrl` (string, 必需): 对象的 URL
- `lockHandle` (string, 必需): 锁定句柄（从 lock 操作获得）

**返回值**:
```json
{
  "status": "success",
  "message": "Object unlocked successfully"
}
```

**示例**:
```json
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "lock_handle_string"
  }
}
```

## 注意事项

1. **句柄匹配**: `lockHandle` 必须与之前 `lock` 操作返回的句柄完全匹配

2. **解锁必要性**: 
   - 锁定后必须解锁，否则对象会一直保持锁定状态
   - 即使编辑失败也要解锁

3. **幂等性**: 多次解锁同一对象通常不会报错，但仍建议只解锁一次

4. **会话隔离**: 只能解锁同一会话中的锁定

5. **丢失句柄**: 如果丢失 `lockHandle`，可能需要系统管理员介入解锁

6. **自动解锁**: 某些情况下系统会自动解锁（如会话超时），但不应依赖此机制

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUrl | string | 是 | 必须与 lock 时使用的一致 |
| lockHandle | string | 是 | 必须是 lock 操作返回的有效句柄 |

## 与其他工具的关联性

1. **必需后续操作**:
   ```
   lock → [编辑操作] → unLock
   ```

2. **错误处理**:
   ```
   try {
     lock
     // 操作
   } catch {
     // 处理错误
   } finally {
     unLock // 确保解锁
   }
   ```

3. **与对象激活的关系**:
   - 建议在激活后再解锁，确保对象状态正确

## 使用场景说明

### 场景 1: 标准编辑流程
```json
// 完整的编辑-解锁流程
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: {"lockHandle": "abc123", "transport": "TR123"}

{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "lockHandle": "abc123",
    "source": "updated code"
  }
}

{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "abc123"
  }
}
```

### 场景 2: 错误恢复
```json
// 即使编辑失败，也要解锁
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "abc123"
  }
}
```

### 场景 3: 批量操作解锁
```json
// 批量解锁之前批量锁定的对象
// 注意：必须使用各自对应的 lockHandle
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无效的锁定句柄 | lockHandle 错误或已过期 | 检查 lockHandle 是否正确 |
| 对象未锁定 | 对象当前未被锁定 | 确认对象状态 |
| 不是锁定所有者 | 其他用户锁定了对象 | 只能解锁自己创建的锁定 |
| 锁定已过期 | 锁定时间过长导致过期 | 重新获取锁定 |

## 最佳实践

1. **总是使用 try-finally 确保解锁**:
   ```
   try {
     lock
     // 执行操作
   } finally {
     unLock // 确保无论成功失败都解锁
   }
   ```

2. **保存 lockHandle** - 在应用程序中妥善保存锁定句柄

3. **及时解锁** - 操作完成后立即解锁，不要长时间持有

4. **激活后解锁** - 建议在激活对象后再解锁

5. **检查解锁状态** - 解锁后验证对象是否正确释放

6. **批量解锁顺序** - 按锁定顺序的反序解锁

7. **句柄管理** - 使用数据结构管理多个锁定句柄

## 锁定管理建议

### 单个对象
```json
// 1. 锁定
lock → 保存 lockHandle

// 2. 编辑
setObjectSource（使用 lockHandle）

// 3. 激活
activateByName

// 4. 解锁
unLock（使用 lockHandle）
```

### 多个对象
```json
// 1. 逐个锁定，保存所有 lockHandle
for each object:
  lock → save lockHandle

// 2. 编辑对象
for each object:
  setObjectSource

// 3. 激活对象
for each object:
  activateByName

// 4. 反序解锁
for each object (reverse order):
  unLock
```