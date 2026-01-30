# V2 Handlers 实现和测试文档

## 创建的文件

### 源代码文件

| 文件路径 | 描述 |
|----------|------|
| `src/lib/tokenUtils.ts` | Token 生成和验证工具类 |
| `src/lib/sourceCache.ts` | 源代码缓存管理类 (LRU + TTL) |
| `src/handlersV2/ObjectSourceHandlersV2.ts` | V2 处理器实现 |

### 测试文件

| 文件路径 | 描述 |
|----------|------|
| `src/test/setup.ts` | 测试配置和环境变量加载 |
| `src/test/tokenUtils.test.ts` | TokenUtils 单元测试 |
| `src/test/sourceCache.test.ts` | SourceCache 单元测试 |
| `src/test/objectSourceHandlersV2.integration.test.ts` | V2 Handlers 集成测试 |
| `src/test/aiWorkflowSimulator.test.ts` | AI 工作流模拟演示 |

### 配置文件

| 文件路径 | 描述 |
|----------|------|
| `jest.config.js` | Jest 测试配置 (已更新) |

---

## 运行测试

### 前置条件

确保 `.env` 文件配置正确：

```env
SAP_URL=http://HOST:PORT
SAP_USER=
SAP_PASSWORD=
SAP_CLIENT=300
SAP_LANGUAGE=ZH
```

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 只运行单元测试
npm test -- tokenUtils
npm test -- sourceCache

# 只运行集成测试 (需要 SAP 连接)
npm test -- integration

# 运行 AI 工作流模拟
npm test -- aiWorkflowSimulator

# 监视模式
npm run test:watch
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

---

## V2 API 使用示例

### 1. 读取源代码 (带 Token)

```typescript
const result = await handler.handle('getObjectSourceV2', {
  objectUrl: '/sap/bc/adt/programs/programs/ztest',
  startLine: 1,
  endLine: 100
});

const data = JSON.parse(result.content[0].text);
// {
//   status: 'success',
//   data: {
//     content: '...',
//     token: '1706140800000_a3f5b8c2d9e1f4a6',
//     lineCount: 5000,
//     changedAt: 1706140800000,
//     expiresAt: 1706141100000
//   }
// }
```

### 2. 读取 CLASS include

```typescript
const result = await handler.handle('getObjectSourceV2', {
  objectUrl: '/sap/bc/adt/oo/cl/zcl_myclass',
  includeType: 'implementations',
  startLine: 1,
  endLine: 50
});
```

### 3. 搜索源代码

```typescript
const result = await handler.handle('grepObjectSource', {
  objectUrl: '/sap/bc/adt/programs/programs/ztest',
  pattern: 'METHODS\\s+\\w+',
  caseInsensitive: true,
  contextLines: 2,
  maxMatches: 50
});
```

### 4. 修改源代码 (带 Token 验证)

```typescript
// 1. 先读取获取 token
const readResult = await handler.handle('getObjectSourceV2', {
  objectUrl: '/sap/bc/adt/programs/programs/ztest'
});
const { token } = JSON.parse(readResult.content[0].text).data;

// 2. 获取锁
const lock = await client.lock(objectUrl, 'MODIFY');

// 3. 提交修改 (带上 token)
await handler.handle('setObjectSourceV2', {
  objectUrl: '/sap/bc/adt/programs/programs/ztest',
  token: token,
  startLine: 10,
  endLine: 20,
  content: '* New content',
  lockHandle: lock.LOCK_HANDLE
});

// 4. 释放锁
await client.unLock(objectUrl, lock.LOCK_HANDLE);
```

---

## AI 客户端工作流

### 标准修改流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. AI 解析用户请求                                         │
│     "修改 ZCL_MYCLASS 的 calculate_result 方法"            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. getObjectSourceV2(objectUrl, includeType: 'definitions')│
│     → 返回: { content, token, lineCount, ... }             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. grepObjectSource(objectUrl, includeType, pattern)       │
│     → 查找方法定义位置                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. getObjectSourceV2(objectUrl, includeType, startLine,   │
│                          endLine)                          │
│     → 读取方法实现代码                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. AI 分析并生成修改后的代码                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. lock(objectUrl)                                        │
│     → 获取锁                                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. setObjectSourceV2(objectUrl, token, startLine, endLine,│
│                        content, lockHandle)                 │
│     → 验证 token → 提交修改                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  8. unLock(objectUrl, lockHandle)                          │
│     → 释放锁                                                │
└─────────────────────────────────────────────────────────────┘
```

### 冲突处理流程

```
setObjectSourceV2 返回冲突
         ↓
┌──────────────────────────────────────────────────────┐
│  {                                                   │
│    error: "版本冲突：源代码已被修改",                 │
│    details: {                                        │
│      expectedToken: "1706140800_a3f5...",            │
│      currentChangedAt: 1706140900,                   │
│      changedBy: "OTHER_USER",                        │
│      resolution: "请调用 getObjectSourceV2 重新获取"  │
│    }                                                 │
│  }                                                   │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│  AI 决策:                                            │
│  1. 提示用户源代码已被修改                            │
│  2. 调用 getObjectSourceV2 获取最新版本               │
│  3. 在新版本上重新应用修改                            │
│  4. 或提示用户手动处理冲突                            │
└──────────────────────────────────────────────────────┘
```

---

## 类图

```
┌─────────────────────┐
│    BaseHandler      │
│  ─────────────────   │
│  + adtclient: ADT   │
│  + logger           │
│  ─────────────────   │
│  + getTools()       │
│  + handle()         │
└─────────┬───────────┘
          │
          │ extends
          ▼
┌─────────────────────────────────┐
│  ObjectSourceHandlersV2         │
│  ─────────────────────────────  │
│  - cache: SourceCache           │
│  ─────────────────────────────  │
│  + handleGetObjectSourceV2()    │
│  + handleGrepObjectSource()     │
│  + handleSetObjectSourceV2()    │
│  + getCache()                   │
└─────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│    TokenUtils       │         │    SourceCache       │
│  ─────────────────   │         │  ─────────────────   │
│  + generateToken()   │         │  - cache: Map        │
│  + isValidToken()    │         │  + get()             │
│  + extractChangedAt()│         │  + set()             │
│  + hashContent()     │         │  + validateToken()   │
│  + verifyToken()     │         │  + invalidate()      │
└─────────────────────┘         │  + cleanup()          │
                                 │  + getStats()        │
                                 └─────────────────────┘
```

---

## 错误码

| 错误码 | 常量 | 描述 |
|--------|------|------|
| 4000 | CACHE_EXPIRED | 缓存已过期 |
| 4001 | TOKEN_INVALID | Token 格式无效 |
| 4002 | TOKEN_MISMATCH | Token 不匹配 |
| 4003 | VERSION_CONFLICT | 版本冲突 |
| 4004 | LINE_OUT_OF_RANGE | 行号超出范围 |
| 4007 | INCLUDE_NOT_FOUND | 请求的 includeType 不存在 |

---

## 配置选项

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| MCP_CACHE_TTL | 300000 | 缓存 TTL (毫秒) |
| MCP_CACHE_SIZE | 100 | 最大缓存条目 |
| MCP_MAX_MATCHES | 100 | grep 最大匹配数 |
