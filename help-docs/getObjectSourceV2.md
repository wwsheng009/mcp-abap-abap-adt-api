# getObjectSourceV2

读取 ABAP 源代码,支持行范围和版本令牌。

## 功能说明

此工具是 V2 版本的源代码读取工具,相比 V1 版本提供以下增强功能:
- 支持行范围读取(读取特定行)
- 返回版本令牌用于冲突检测
- 集成缓存机制提高性能
- 支持增量读取大文件

版本令牌机制确保在编辑代码时检测到并发修改,避免覆盖他人的更改。

## 调用方法

**参数**:
- `sourceUrl` (string, 必需): 源代码 URL,从 `objectStructure` 的 `abapsource:sourceUri` 获取
- `startLine` (number, 可选): 起始行号(从 1 开始,包含,默认: 1)
- `endLine` (number, 可选): 结束行号(从 1 开始,包含,默认: 文件末尾)

**返回值**:
```json
{
  "status": "success",
  "sourceCode": "REPORT zmy_program.\nWRITE 'Hello World'.\n...",
  "lineRange": {
    "start": 1,
    "end": 100
  },
  "totalLines": 100,
  "token": "abc123def456...",
  "meta": {
    "encoding": "utf-8",
    "eol": "\n",
    "tabSize": 2
  }
}
```

**示例**:
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "startLine": 1,
    "endLine": 50
  }
}
```

## 注意事项

1. **源代码 URL**: 必须使用完整的源代码 URL,可以从 `objectStructure` 的 `abapsource:sourceUri` 获取

2. **行号范围**:
   - 行号从 1 开始
   - `startLine` 和 `endLine` 都包含在内
   - 如果 `endLine` 超过文件总行数,会自动调整为文件末尾

3. **版本令牌**:
   - `token` 字段包含源代码内容的哈希值
   - 在使用 `setObjectSourceV2` 编辑时必须提供相同的 token
   - 如果内容已更改,编辑会被拒绝(冲突检测)

4. **缓存机制**:
   - 工具内部使用缓存提高性能
   - 重复读取相同的文件会从缓存返回

5. **性能优化**:
   - 对于大文件,使用行范围只读取需要的部分
   - 避免一次性读取整个文件

6. **编码处理**:
   - 返回的代码采用 UTF-8 编码
   - `meta` 字段包含编码和换行符信息

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| sourceUrl | string | 是 | 必须是有效的源代码 URL,以 / 开头 |
| startLine | number | 否 | 必须 >= 1,默认 1 |
| endLine | number | 否 | 必须 >= startLine,默认文件末尾 |

## 与其他工具的关联性

1. **V1 版本对比**:
   ```
   getObjectSource (V1): 简单读取,无行范围,无版本令牌
   getObjectSourceV2 (V2): 支持行范围,返回版本令牌
   ```

2. **编辑流程**:
   ```
   getObjectSourceV2 (获取 token) → lock → setObjectSourceV2 (使用 token)
   ```

3. **与 objectStructure 的关系**:
   ```
   objectStructure → 获取 abapsource:sourceUri → getObjectSourceV2
   ```

4. **与 grepObjectSource 的关系**:
   ```
   getObjectSourceV2: 读取代码
   grepObjectSource: 搜索代码
   ```

5. **激活流程**:
   ```
   getObjectSourceV2 → 编辑代码 → setObjectSourceV2 → activateByName
   ```

## 使用场景说明

### 场景 1: 读取整个文件
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回完整源代码和版本令牌
```

### 场景 2: 读取部分行
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 50,
    "endLine": 100
  }
}
// 只读取 50-100 行
```

### 场景 3: 读取单行
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 42,
    "endLine": 42
  }
}
// 只读取第 42 行
```

### 场景 4: 编辑前准备
```json
// 步骤 1: 获取源代码和 token
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回: { "sourceCode": "...", "token": "abc123" }

// 步骤 2: 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: { "lockHandle": "lock123" }

// 步骤 3: 编辑代码(在其他地方)

// 步骤 4: 保存修改(使用 token)
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123",
    "startLine": 1,
    "endLine": 50,
    "content": "modified code...",
    "lockHandle": "lock123"
  }
}
```

## 版本令牌机制

### 工作原理

版本令牌是源代码内容的哈希值,用于检测并发修改:

```json
// 1. 用户 A 读取代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回 token: "abc123"

// 2. 用户 B 修改并保存代码
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "abc123",
    ...
  }
}
// 代码已更改,新的 token 是 "def456"

// 3. 用户 A 尝试保存修改
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "abc123",  // 过期的 token
    ...
  }
}
// 错误: 冲突检测失败,代码已被他人修改
```

### 冲突处理

当检测到冲突时:
1. 重新读取源代码获取新的 token
2. 合并修改
3. 使用新的 token 再次保存

```json
// 冲突处理流程
// 1. 检测到冲突
{
  "error": "Conflict detected",
  "message": "Content has been modified",
  "currentToken": "def456",
  "yourToken": "abc123"
}

// 2. 重新读取
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回新 token: "def456"

// 3. 合并修改后再次保存
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "...",
    "token": "def456",  // 使用新 token
    ...
  }
}
```

## 行范围示例

### 从第 1 行开始到第 100 行
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 1,
    "endLine": 100
  }
}
```

### 读取文件的最后 50 行
```json
// 假设文件有 200 行
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 151,
    "endLine": 200
  }
}
```

### 只读取方法定义
```json
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 50,
    "endLine": 100
  }
}
// 假设方法定义在 50-100 行
```

## 最佳实践

1. **使用 V2 版本**: 优先使用 `getObjectSourceV2` 而不是 V1 版本

2. **获取 URL**: 从 `objectStructure` 的 `abapsource:sourceUri` 获取正确的 URL

3. **版本令牌**: 在编辑代码时始终使用版本令牌

4. **大文件处理**: 对于大文件,使用行范围只读取需要的部分

5. **冲突检测**: 不要忽略冲突检测,要正确处理冲突

6. **缓存利用**: 利用缓存机制,避免重复读取

7. **错误处理**: 妥善处理超出行范围的请求

## 完整工作流程

```json
// 使用 V2 工具的标准编辑流程

// 1. 获取对象结构
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回 abapsource:sourceUri: "/sap/bc/adt/oo/classes/zcl_class/source/main"

// 2. 读取源代码(V2)
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回: {
//   "sourceCode": "REPORT ...",
//   "token": "abc123def456",
//   "totalLines": 150
// }

// 3. 搜索特定代码(可选)
{
  "tool": "grepObjectSource",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "pattern": "METHOD execute"
  }
}
// 返回匹配的行

// 4. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: { "lockHandle": "lock123" }

// 5. 编辑代码(客户端)

// 6. 语法检查(可选)
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "edited code..."
  }
}

// 7. 保存修改(V2)
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "abc123def456",  // 使用步骤 2 的 token
    "startLine": 50,
    "endLine": 100,
    "content": "modified method code...",
    "lockHandle": "lock123"
  }
}

// 8. 激活对象
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 9. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "lock123"
  }
}
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 源代码 URL 无效 | URL 格式错误 | 检查 URL 格式 |
| 行号无效 | startLine 或 endLine 不正确 | 确保行号 >= 1 且 endLine >= startLine |
| 超出文件范围 | 行号超过文件总行数 | 减小行号范围 |
| 对象不存在 | URL 指向的对象不存在 | 检查对象 URL |
| 权限不足 | 没有读取权限 | 联系管理员 |

## 高级用法

### 分块读取大文件
```json
// 对于 1000 行的文件,分 10 次读取,每次 100 行
for i in range(1, 1001, 100):
  {
    "tool": "getObjectSourceV2",
    "arguments": {
      "sourceUrl": "/sap/bc/adt/programs/zlarge_prog/source/main",
      "startLine": i,
      "endLine": min(i + 99, 1000)
    }
  }
```

### 追踪代码变更
```json
// 定期读取代码并比较 token
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 记录 token,下次读取时比较是否变更
```

### 代码差异分析
```json
// 读取不同版本进行差异比较
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "startLine": 1,
    "endLine": 100
  }
}
// 在客户端进行差异分析
```

## 性能优化建议

1. **使用行范围**: 只读取需要的行
2. **利用缓存**: 重复读取相同文件会从缓存返回
3. **批量操作**: 对于多个文件,使用并行请求
4. **避免频繁读取**: 在内存中缓存已读取的代码
