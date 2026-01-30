# setObjectSource

设置对象的源代码。

## 功能说明

此工具用于保存 ABAP 对象的源代码。必须在对象被锁定后才能调用此工具，使用 lock 操作返回的锁定句柄。

## 调用方法

**参数**:
- `objectSourceUrl` (string, 必需): 对象源代码的 URL
- `lockHandle` (string, 必需): 锁定句柄（从 lock 操作获得）
- `source` (string, 必需): 新的源代码
- `transport` (string, 可选): 传输请求号（如果未在 lock 时获得）

**返回值**:
```json
{
  "status": "success",
  "message": "Source code updated successfully"
}
```

**示例**:
```json
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "lockHandle": "lock_handle_string",
    "source": "CLASS zcl_my_class DEFINITION.\n  PUBLIC SECTION.\n    METHODS: my_method.\nENDCLASS."
  }
}
```

## 注意事项

1. **必需锁定**: 对象必须先通过 `lock` 工具锁定才能编辑

2. **锁定句柄**: 必须使用 `lock` 返回的有效 `lockHandle`

3. **传输请求**: 如果对象在传输请求中，需要提供传输号

4. **语法检查**: 建议在保存前使用 `syntaxCheckCode` 检查语法

5. **激活要求**: 保存后的对象需要激活才能在系统中使用

6. **abapGit**: 对于 abapGit 对象，需要额外的 Git 凭据

7. **并发限制**: 同一对象在同一时间只能有一个编辑会话

8. **错误回滚**: 如果保存失败，之前的内容不会丢失

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectSourceUrl | string | 是 | 必须是有效的源代码 URL |
| lockHandle | string | 是 | 必须是有效的锁定句柄 |
| source | string | 是 | 必须是有效的 ABAP 代码 |
| transport | string | 否 | 可选的传输请求号 |

## 与其他工具的关联性

1. **必需的前置操作**:
   ```
   lock → getObjectSource → 编辑 → syntaxCheckCode → setObjectSource
   ```

2. **后续操作**:
   ```
   setObjectSource → activateByName → unLock
   ```

3. **传输管理**:
   ```
   transportInfo → lock → setObjectSource（使用 transport）
   ```

## 使用场景说明

### 场景 1: 标准编辑流程
```json
// 完整的编辑工作流

// 1. 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}

// 2. 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"}}

// 3. 获取传输信息
{"tool": "transportInfo", "arguments": {"objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"}}

// 4. 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}
// 返回: {"lockHandle": "abc123", "transport": "TR123"}

// 5. 语法检查（可选但推荐）
{"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "new source"}}

// 6. 保存源代码
{"tool": "setObjectSource", "arguments": {
  "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
  "lockHandle": "abc123",
  "source": "updated source code"
}}

// 7. 激活对象
{"tool": "activateByName", "arguments": {"object": "ZCL_CLASS", "url": "/sap/bc/adt/oo/classes/zcl_class"}}

// 8. 解锁对象
{"tool": "unLock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class", "lockHandle": "abc123"}}
```

### 场景 2: 批量编辑
```json
// 对多个对象批量编辑
// 注意：需要分别锁定和编辑每个对象
```

### 场景 3: 创建新对象后编辑
```json
// 步骤 1: 创建对象
{"tool": "createObject", "arguments": {"objtype": "CLAS/OC", "name": "ZCL_NEW", ...}}

// 步骤 2: 锁定新创建的对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_new"}}

// 步骤 3: 设置源代码
{"tool": "setObjectSource", "arguments": {...}}
```

### 场景 4: 错误恢复
```json
// 如果编辑失败，对象保持在旧状态
// 可以重新读取源代码并重试
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无效的锁定句柄 | lockHandle 不正确或已过期 | 重新调用 lock |
| 对象未锁定 | 对象未被锁定 | 先调用 lock |
| 锁定冲突 | 对象被其他用户锁定 | 等待或联系对方 |
| 语法错误 | 源代码有语法错误 | 使用 syntaxCheckCode 检查 |
| 传输错误 | 传输请求不可用 | 使用 transportInfo 获取有效传输 |
| 权限不足 | 没有编辑权限 | 检查用户权限 |

## 最佳实践

1. **使用 try-finally 确保解锁**:
   ```
   try {
     lock
     // 准备源代码
     syntaxCheckCode
     setObjectSource
     activateByName
   } finally {
     unLock
   }
   ```

2. **保存前语法检查**: 使用 `syntaxCheckCode` 避免保存有错误的代码

3. **激活后解锁**: 确保对象激活后再解锁

4. **传输管理**: 正确处理传输请求号

5. **大文件处理**: 对于大型源代码文件，注意性能和超时

6. **版本控制**: 考虑在修改前备份源代码

## 源代码编辑检查清单

在调用 `setObjectSource` 前，确保:

- [ ] 对象已通过 `lock` 锁定
- [ ] 获得并保存了 `lockHandle`
- [ ] 确认了传输请求号
- [ ] 通过 `syntaxCheckCode` 检查了语法
- [ ] 验证了源代码格式
- [ ] 准备了激活步骤

## abapGit 特殊处理

对于 abapGit 管理的对象：

```json
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_git_class/source/main",
    "lockHandle": "lock_handle",
    "source": "source code",
    "gitUser": "username",
    "gitPassword": "password"
  }
}
```

## 完整示例

```json
// 从读取到保存的完整流程示例

// 1. 搜索对象
{"tool": "searchObject", "arguments": {"query": "ZCL_EXAMPLE", "objType": "CLAS"}}

// 2. 获取结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_example"}}

// 3. 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_example/source/main"}}
// 返回: {"source": "original source code"}

// 4. 编辑源代码（在外部进行）
// 修改 source

// 5. 语法检查
{"tool": "syntaxCheckCode", "arguments": {"url": "/sap/bc/adt/oo/classes/zcl_example/source/main", "code": "modified source"}}
// 返回: {"results": []} // 无错误

// 6. 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_example"}}
// 返回: {"lockHandle": "xyz789", "transport": "TR456"}

// 7. 保存源代码
{"tool": "setObjectSource", "arguments": {
  "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_example/source/main",
  "lockHandle": "xyz789",
  "source": "modified source code"
}}

// 8. 激活对象
{"tool": "activateByName", "arguments": {"object": "ZCL_EXAMPLE", "url": "/sap/bc/adt/oo/classes/zcl_example"}}

// 9. 解锁对象
{"tool": "unLock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_example", "lockHandle": "xyz789"}}
```