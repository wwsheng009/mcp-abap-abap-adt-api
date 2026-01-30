# setObjectSourceV2

修改源代码的特定行范围,支持版本冲突检测。

## 功能说明

此工具是 V2 版本的源代码写入工具,相比 V1 版本提供以下增强功能:
- 支持行范围编辑(只修改特定行)
- 版本令牌机制防止并发冲突
- 与 `getObjectSourceV2` 配合使用
- 支持部分更新大文件

版本令牌机制确保多人协作编辑时不会覆盖他人的更改。

## 调用方法

**参数**:
- `sourceUrl` (string, 必需): 源代码 URL
- `token` (string, 必需): 版本令牌,由 `getObjectSourceV2` 返回
- `startLine` (number, 必需): 起始行号(从 1 开始,包含)
- `endLine` (number, 必需): 结束行号(从 1 开始,包含)
- `content` (string, 必需): 新内容(将替换指定的行范围)
- `lockHandle` (string, 必需): 对象锁定句柄,通过 `lock` 工具获取
- `transport` (string, 可选): 传输请求号
- `skipConflictCheck` (boolean, 可选): 跳过冲突检查(不推荐),默认: false

**返回值**:
```json
{
  "status": "success",
  "message": "Source code updated successfully",
  "updatedRange": {
    "start": 50,
    "end": 100,
    "linesReplaced": 51
  },
  "newToken": "def456abc123..."
}
```

**示例**:
```json
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123def456",
    "startLine": 50,
    "endLine": 100,
    "content": "METHOD execute.\n  DATA: lv_result TYPE i.\n  lv_result = 1 + 1.\nENDMETHOD.",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}
```

## 注意事项

1. **版本令牌**:
   - 必须使用 `getObjectSourceV2` 返回的最新 `token`
   - token 是源代码内容的哈希值
   - 如果代码已被他人修改,编辑会被拒绝(冲突检测)

2. **行范围**:
   - `startLine` 和 `endLine` 都包含在内
   - `content` 会完全替换指定行范围的内容
   - 如果 `content` 包含多行,行数可以与替换的行数不同

3. **对象锁定**:
   - 必须先锁定对象(`lock` 工具)
   - 使用返回的 `lockHandle`
   - 编辑完成后记得解锁(`unLock`)

4. **传输请求**:
   - 如果对象在传输系统中,需要提供 `transport` 号
   - 可以通过 `transportInfo` 获取可用的传输

5. **冲突检测**:
   - 默认启用冲突检测
   - 不要设置 `skipConflictCheck: true` 除非明确知道后果

6. **换行符**:
   - 确保使用正确的换行符(通常是 `\n`)
   - 保持与原始代码一致的缩进

7. **语法检查**:
   - 在保存前使用 `syntaxCheckCode` 检查语法
   - 避免保存语法错误的代码

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| sourceUrl | string | 是 | 必须是有效的源代码 URL |
| token | string | 是 | 必须是 getObjectSourceV2 返回的 token |
| startLine | number | 是 | 必须 >= 1 |
| endLine | number | 是 | 必须 >= startLine |
| content | string | 是 | 新内容字符串 |
| lockHandle | string | 是 | 必须通过 lock 工具获取 |
| transport | string | 否 | 传输请求号 |
| skipConflictCheck | boolean | 否 | 默认 false,不推荐设置为 true |

## 与其他工具的关联性

1. **V1 版本对比**:
   ```
   setObjectSource (V1): 简单写入,无行范围,无版本令牌
   setObjectSourceV2 (V2): 支持行范围,版本令牌冲突检测
   ```

2. **编辑流程**:
   ```
   getObjectSourceV2 (获取 token) → lock → syntaxCheckCode → setObjectSourceV2 → activateByName → unLock
   ```

3. **与 lock/unLock 的关系**:
   ```
   lock (获取 lockHandle) → setObjectSourceV2 (使用 lockHandle) → unLock
   ```

4. **与 transportInfo 的关系**:
   ```
   transportInfo (获取传输) → setObjectSourceV2 (使用 transport)
   ```

5. **与 activateByName 的关系**:
   ```
   setObjectSourceV2 (保存) → activateByName (激活)
   ```

## 使用场景说明

### 场景 1: 修改单个方法
```json
// 步骤 1: 读取源代码获取 token
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回 token: "abc123"

// 步骤 2: 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回 lockHandle: "lock123"

// 步骤 3: 保存修改
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 50,
    "endLine": 100,
    "content": "METHOD execute.\n  NEW CODE HERE\nENDMETHOD.",
    "lockHandle": "lock123"
  }
}
```

### 场景 2: 在文件末尾添加代码
```json
// 假设文件有 150 行
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zprog/source/main",
    "token": "abc123",
    "startLine": 151,
    "endLine": 150,  // 空 range 表示追加
    "content": "\n* Added by MCP\nWRITE 'Hello World'.",
    "lockHandle": "lock123"
  }
}
```

### 场景 3: 删除代码行
```json
// 删除 50-60 行
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 50,
    "endLine": 60,
    "content": "",  // 空内容表示删除
    "lockHandle": "lock123"
  }
}
```

### 场景 4: 替换大段代码
```json
// 替换 100-200 行为新代码(可能 50 行)
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 100,
    "endLine": 200,
    "content": "METHOD new_method.\n  ... 50 lines of code ...\nENDMETHOD.",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}
```

### 场景 5: 插入新方法
```json
// 在第 100 行之后插入新方法
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 101,
    "endLine": 100,  // 空 range 表示插入
    "content": "METHOD new_method.\n  DATA: lv_value TYPE i.\n  lv_value = 1.\nENDMETHOD.",
    "lockHandle": "lock123"
  }
}
```

## 版本冲突检测

### 正常流程(无冲突)
```json
// 1. 用户 A 读取代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回 token: "abc123"

// 2. 用户 A 编辑并保存
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "abc123",
    ...
  }
}
// 成功,返回新 token: "def456"
```

### 冲突情况
```json
// 1. 用户 A 读取代码,获得 token: "abc123"

// 2. 用户 B 修改并保存代码
// 新 token 变为 "def456"

// 3. 用户 A 尝试保存(使用旧 token)
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "abc123",  // 旧 token
    ...
  }
}
// 错误: 冲突检测失败
{
  "error": "Conflict detected",
  "message": "Content has been modified since last read",
  "currentToken": "def456",
  "yourToken": "abc123"
}
```

### 冲突解决
```json
// 检测到冲突后:
// 1. 重新读取代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回新 token: "def456" 和最新代码

// 2. 合并修改(在客户端)

// 3. 使用新 token 再次保存
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "def456",  // 使用新 token
    ...
  }
}
// 成功
```

## 完整编辑流程

```json
// 标准 ABAP 代码编辑流程

// 1. 获取对象结构
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 2. 读取源代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回: { "sourceCode": "...", "token": "abc123" }

// 3. 搜索代码(可选)
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute"
  }
}

// 4. 获取传输信息(可选)
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 5. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: { "lockHandle": "lock123" }

// 6. 编辑代码(客户端)
// 在客户端进行代码编辑

// 7. 语法检查(可选但推荐)
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "edited code..."
  }
}

// 8. 保存修改
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 50,
    "endLine": 100,
    "content": "edited code...",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}

// 9. 激活对象
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 10. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "lock123"
  }
}
```

## 最佳实践

1. **总是使用版本令牌**: 不要跳过冲突检测

2. **编辑前锁定**: 始终在编辑前锁定对象

3. **语法检查**: 在保存前进行语法检查

4. **使用正确的行范围**: 确保行范围正确

5. **保持格式一致**: 保持代码格式和缩进

6. **小步编辑**: 分小步进行编辑,便于调试

7. **激活测试**: 保存后立即激活并测试

8. **冲突处理**: 正确处理版本冲突

9. **传输请求**: 确保使用正确的传输请求

10. **及时解锁**: 完成后及时解锁对象

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 版本冲突 | 代码已被他人修改 | 重新读取并合并 |
| 对象未锁定 | lockHandle 无效或对象未锁定 | 先锁定对象 |
| 行号无效 | startLine 或 endLine 不正确 | 检查行号 |
| 对象不存在 | URL 指向的对象不存在 | 检查 URL |
| 权限不足 | 没有编辑权限 | 联系管理员 |
| 语法错误 | 代码有语法错误 | 先进行语法检查 |
| 传输无效 | 传输请求号无效 | 使用正确的传输 |

## 高级用法

### 批量修改多个方法
```json
// 修改多个方法,每次调用一个方法
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 50,
    "endLine": 100,
    "content": "METHOD execute_v2.\n...\nENDMETHOD.",
    "lockHandle": "lock123"
  }
}
// 注意: 每次修改后需要重新获取 token
```

### 增量更新大文件
```json
// 对于 1000 行的文件,分块更新
// 更新 1-100 行
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zlarge_prog/source/main",
    "token": "abc123",
    "startLine": 1,
    "endLine": 100,
    "content": "...",
    "lockHandle": "lock123"
  }
}
// 获取新 token
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/programs/zlarge_prog/source/main"
  }
}
// 继续更新 101-200 行,使用新 token
```

### 重构代码
```json
// 重构方法: 删除旧方法,插入新方法
// 1. 读取代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 2. 删除旧方法(50-100 行)
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "abc123",
    "startLine": 50,
    "endLine": 100,
    "content": "",
    "lockHandle": "lock123"
  }
}

// 3. 重新获取 token
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 4. 插入新方法
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "def456",  // 新 token
    "startLine": 50,
    "endLine": 49,
    "content": "METHOD refactored_method.\n...\nENDMETHOD.",
    "lockHandle": "lock123"
  }
}
```

## 性能优化建议

1. **使用行范围**: 只编辑需要的行,提高性能
2. **分块更新**: 对于大文件,分小块更新
3. **减少网络请求**: 合并多个小修改
4. **利用缓存**: 避免重复读取相同内容
5. **并行处理**: 对于多个独立对象,并行处理

## 与 V1 版本迁移

```json
// V1 版本调用
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "lockHandle": "lock123",
    "source": "full source code...",
    "transport": "DEVK900123"
  }
}

// V2 版本调用(推荐)
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
  // 返回 token: "abc123"
}

{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 1,
    "endLine": 150,
    "content": "modified code...",
    "lockHandle": "lock123",
    "transport": "DEVK900123"
  }
}

// V2 的优势:
// 1. 支持部分更新(行范围)
// 2. 版本冲突检测
// 3. 更好的并发控制
