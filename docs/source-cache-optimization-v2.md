# MCP Server 源代码处理优化方案 (V2)

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | 1.0 |
| **创建日期** | 2025-01-25 |
| **状态** | 方案审查中 |
| **作者** | Claude |

---

## 1. 背景与问题分析

### 1.1 当前实现

**数据流架构**:
```
AI Client (Claude) → MCP Server → SAP ADT API
     ↓                    ↓            ↓
  全量请求          转发请求      全量数据传输
  全量响应          转发响应
```

**现有工具** (`ObjectSourceHandlers`):

| 工具 | 功能 | 问题 |
|------|------|------|
| `getObjectSource` | 获取完整源代码 | 大文件数据传输量大 |
| `setObjectSource` | 设置完整源代码 | 修改少量代码也需要全量提交 |

### 1.2 问题场景

**场景 1: 大文件读取**
```
ABAP 类有 10,000 行代码
AI 只需要查看 100-150 行的方法实现
→ 需要传输全部 10,000 行
→ 浪费带宽，增加 Token 消耗
```

**场景 2: 小范围修改**
```
AI 只修改第 500-520 行的代码
→ 需要先获取全部 10,000 行
→ 修改后再提交全部 10,000 行
→ 增加网络延迟和处理开销
```

**场景 3: 代码搜索**
```
AI 需要搜索特定方法或变量
→ 需要获取全部代码后在客户端搜索
→ 无法在服务端过滤
```

### 1.3 优化目标

| 目标 | 指标 |
|------|------|
| **减少数据传输** | 大文件场景下传输量降低 80%+ |
| **提升响应速度** | 小范围读取响应时间降低 50%+ |
| **保持兼容性** | 原 V1 API 保持不变 |
| **并发安全** | 支持多用户并发编辑场景 |

---

## 2. ADT API 能力分析

### 2.1 objectStructure API 能力

**API 签名**:
```typescript
function objectStructure(
  h: AdtHTTP,
  objectUrl: string,
  version?: ObjectVersion  // "active" | "inactive" | "workingArea"
): Promise<AbapObjectStructure>
```

**返回的元数据**:
```typescript
interface GenericMetaData {
  "abapsource:sourceUri": string;        // ← 源代码 URL
  "adtcore:changedAt": number;           // ← 版本标识
  "adtcore:changedBy": string;
  "adtcore:createdAt": number;
  "adtcore:name": string;
  "adtcore:type": string;
  "adtcore:version": string;
  "adtcore:language": string;
  // ...
}

interface Link {
  etag?: number;                         // ← 仅某些 link 有
  href: string;
  rel: string;
  type?: string;                         // "text/plain" 指向源代码
  title?: string;
}

// 对于 CLASS 类型，还有额外的 includes 信息
interface AbapClassStructure {
  objectUrl: string;
  metaData: ClassMetaData;
  links?: Link[];
  includes: ClassInclude[];              // ← 各个部分的独立信息
}

interface ClassInclude {
  "abapsource:sourceUri": string;        // ← 各部分的源代码 URI
  "adtcore:changedAt": number;
  "adtcore:name": string;
  "class:includeType": "definitions" | "implementations" |
                        "macros" | "testclasses" | "main";
  links: Link[];
}
```

**可用于优化的信息**:

| 信息 | 用途 | 节省 |
|------|------|------|
| `abapsource:sourceUri` | 直接获取源代码 URL | 省去额外参数 |
| `adtcore:changedAt` | Token 生成、版本验证 | 核心机制 |
| `links[].type: "text/plain"` | 备用源代码 URL | 兼容性 |
| `includes` (CLASS) | 各部分独立读取 | **可按需读取** |

**关键发现**:
- ✅ `objectStructure` 不返回源代码内容，但可以获取 `sourceUri`
- ✅ 对于 CLASS，`includes` 允许**按部分读取**源代码
- ✅ `changedAt` 直接可用于版本控制
- ❌ `links[].etag` 仅用于特定资源，**不用于 source**

---

### 2.2 现有并发控制机制

**Lock 机制** (已实现):
```typescript
// objectcontents.js
async function lock(h, objectUrl, accessMode = "MODIFY"): Promise<AdtLock>
async function unLock(h, objectUrl, lockHandle): Promise<string>

interface AdtLock {
  LOCK_HANDLE: string;      // ← 提交时必需
  CORRNR: string;
  MODIFICATION_SUPPORT: string;
}
```

**时间戳机制** (可用):
```typescript
// objectstructure.d.ts
interface GenericMetaData {
  "adtcore:changedAt": number;    // ← 可用于版本检测
  "adtcore:changedBy": string;
}
```

**版本参数** (已支持):
```typescript
type ObjectVersion = "active" | "inactive" | "workingArea";

function getObjectSource(
  h: AdtHTTP,
  objectSourceUrl: string,
  options?: { version?: ObjectVersion }
): Promise<string>
```

**ETag 机制** (有限支持):
```typescript
// 仅用于 transport 配置，不用于 source
async function setTransportsConfig(
  h: AdtHTTP,
  uri: string,
  etag: string,              // ← 使用 If-Match header
  config: TransportConfiguration
): Promise<TransportConfiguration>
```

### 2.2 关键发现

| 机制 | 状态 | V2 方案使用 |
|------|------|-------------|
| Lock/Unlock | ✅ 已实现 | 复用 |
| changedAt | ✅ 可获取 | 作为版本标识 |
| ETag | ❌ 不支持 source | 不使用 |
| Version | ✅ 已支持 | 可选 |

---

## 3. V2 方案设计

### 3.1 核心设计理念

**读写分离 + Token 机制**:

```
┌─────────────────────────────────────────────────────────────┐
│                         AI Client                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  1. getObjectSourceV2(objectUrl)                            │
│     → 返回: { content, token, lineCount, changedAt }        │
│                                                              │
│  2. grepObjectSource(objectUrl, pattern)                    │
│     → 返回: { matches[] }                                    │
│                                                              │
│  3. setObjectSourceV2(objectUrl, token, startLine, ...)     │
│     → 验证 token → 提交修改                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server Cache                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  { objectUrl: {                                      │    │
│  │      token: "changedAt_hash",                        │    │
│  │      changedAt: 1234567890,                          │    │
│  │      lineCount: 10000,                               │    │
│  │      timestamp: 1706140800000,                       │    │
│  │      expiresAt: 1706141100000                       │    │
│  │    }                                                 │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      SAP ADT API                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Token 设计

**Token 组成**:
```
token = changedAt + "_" + contentHash(前16位)

示例: 1706140800_a3f5b8c2d9e1f4a6
```

**生成逻辑**:
```typescript
import { createHash } from 'crypto';

function generateToken(changedAt: number, content: string): string {
  const hash = createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 16);
  return `${changedAt}_${hash}`;
}
```

### 3.3 缓存策略

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| **CACHE_TTL** | 5 分钟 | Token 有效期 |
| **MAX_CACHE_SIZE** | 100 条 | 最大缓存条目 |
| **CACHE_CLEANUP_INTERVAL** | 1 分钟 | 清理过期缓存间隔 |

**缓存清理策略**:
```typescript
// LRU + TTL 混合策略
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    // 1. 清理过期缓存
    if (now > value.expiresAt) {
      cache.delete(key);
      continue;
    }
    // 2. 超出容量时删除最旧的
    if (cache.size > MAX_CACHE_SIZE) {
      const oldest = [...cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      cache.delete(oldest[0]);
    }
  }
}
```

---

## 4. API 接口设计

### 4.1 getObjectSourceV2

**功能**: 读取源代码，支持行号范围，返回版本 token

```typescript
{
  name: 'getObjectSourceV2',
  description: '读取 ABAP 对象源代码，支持行号范围和版本标识',
  inputSchema: {
    type: 'object',
    properties: {
      objectSourceUrl: {
        type: 'string',
        description: '源代码 URL (从 objectStructure.links 获取)'
      },
      objectUrl: {
        type: 'string',
        description: '对象 URL (用于获取元数据和版本信息)'
      },
      startLine: {
        type: 'number',
        description: '起始行号 (1-based, 包含, 默认: 1)'
      },
      endLine: {
        type: 'number',
        description: '结束行号 (1-based, 包含, 默认: 文件末尾)'
      },
      version: {
        type: 'string',
        description: '版本: active | inactive | workingArea',
        enum: ['active', 'inactive', 'workingArea']
      }
    },
    required: ['objectSourceUrl', 'objectUrl']
  }
}
```

**响应格式**:
```json
{
  "status": "success",
  "data": {
    "content": "REPORT ztest.\n...",
    "token": "1706140800_a3f5b8c2d9e1f4a6",
    "lineCount": 10000,
    "startLine": 1,
    "endLine": 10000,
    "requestedStartLine": 1,
    "requestedEndLine": 10000,
    "changedAt": 1706140800000,
    "changedBy": "DEVELOPER",
    "expiresAt": 1706141100000
  }
}
```

### 4.2 getObjectSourceV2 - CLASS includes 优化

**对于 ABAP Class 的特殊优化**:

ABAP Class 由多个部分组成，可以按需读取：

```typescript
{
  name: 'getObjectSourceV2',
  description: '读取 ABAP 对象源代码，支持行号范围和版本标识',
  inputSchema: {
    type: 'object',
    properties: {
      objectUrl: {
        type: 'string',
        description: '对象 URL (用于获取元数据)'
      },
      // 对于 CLASS，可以使用 includeType 替代 objectSourceUrl
      includeType: {
        type: 'string',
        description: 'CLASS 类型的 include 部分',
        enum: ['definitions', 'implementations', 'macros', 'testclasses', 'main'],
        optional: true
      },
      startLine: {
        type: 'number',
        description: '起始行号 (1-based, 包含, 默认: 1)'
      },
      endLine: {
        type: 'number',
        description: '结束行号 (1-based, 包含, 默认: 文件末尾)'
      },
      version: {
        type: 'string',
        description: '版本: active | inactive | workingArea',
        enum: ['active', 'inactive', 'workingArea']
      }
    },
    required: ['objectUrl']
  }
}
```

**优化的读取流程**:
```typescript
async handleGetObjectSourceV2(args: any) {
  // 1. 获取对象结构
  const structure = await this.adtclient.objectStructure(
    args.objectUrl,
    { version: args.version }
  );

  // 2. 确定源代码 URL
  let sourceUrl: string;
  let includeName = '';

  if (isClassStructure(structure) && args.includeType) {
    // CLASS + includeType: 只读取特定部分
    const include = structure.includes.find(
      i => i["class:includeType"] === args.includeType
    );
    if (!include) {
      throw new McpError(ErrorCode.InvalidRequest,
        `Include type "${args.includeType}" not found`);
    }
    sourceUrl = include["abapsource:sourceUri"];
    includeName = args.includeType;
  } else {
    // 使用默认 sourceUri
    sourceUrl = structure.metaData["abapsource:sourceUri"];
  }

  // 3. 获取源代码
  const fullSource = await this.adtclient.getObjectSource(
    sourceUrl,
    { version: args.version }
  );

  // 4. 按行切割
  const lines = fullSource.split('\n');
  const startLine = args.startLine ?? 1;
  const endLine = args.endLine ?? lines.length;
  const content = lines.slice(startLine - 1, endLine).join('\n');

  // 5. 生成 token (使用 object 级别的 changedAt)
  const changedAt = structure.metaData["adtcore:changedAt"];
  const token = TokenUtils.generateToken(changedAt, fullSource);

  // 6. 缓存
  const cacheKey = includeName ? `${args.objectUrl}#${includeName}` : args.objectUrl;
  this.cache.set(cacheKey, {
    token,
    changedAt,
    lineCount: lines.length,
    timestamp: Date.now(),
    expiresAt: Date.now() + this.cache.DEFAULT_TTL,
    objectUrl: args.objectUrl,
    includeType: includeName
  });

  return {
    status: 'success',
    data: {
      content,
      token,
      lineCount: lines.length,
      objectType: structure.metaData["adtcore:type"],
      includeType: includeName || undefined,
      changedAt,
      changedBy: structure.metaData["adtcore:changedBy"],
      expiresAt: Date.now() + this.cache.DEFAULT_TTL
    }
  };
}
```

**CLASS 分块读取示例**:
```typescript
// 只读取 CLASS 的 main 部分
mcpClient.callTool({
  name: 'getObjectSourceV2',
  arguments: {
    objectUrl: '/sap/bc/adt/oo/cl/zcl_myclass',
    includeType: 'main',
    startLine: 1,
    endLine: 100
  }
})

// 只读取 CLASS 的 definitions 部分
mcpClient.callTool({
  name: 'getObjectSourceV2',
  arguments: {
    objectUrl: '/sap/bc/adt/oo/cl/zcl_myclass',
    includeType: 'definitions'
  }
})
```

**数据传输对比**:

| 场景 | 传统方式 | V2 优化 (includeType) | 节省 |
|------|----------|----------------------|------|
| 读取 CLASS main (500 行) | 传输全部 (5000 行) | 只传输 main (500 行) | 90% |
| 读取 CLASS definitions (200 行) | 传输全部 (5000 行) | 只传输 definitions (200 行) | 96% |
| 修改 CLASS implementations | 传输全部 + 修改 | 只读取/修改 implementations | 90%+ |

---

### 4.3 grepObjectSource

**功能**: 在源代码中搜索模式（支持 CLASS includeType）

```typescript
{
  name: 'grepObjectSource',
  description: '在 ABAP 源代码中搜索匹配的行',
  inputSchema: {
    type: 'object',
    properties: {
      objectUrl: {
        type: 'string',
        description: '对象 URL'
      },
      includeType: {
        type: 'string',
        description: 'CLASS 类型的 include 部分 (可选)',
        enum: ['definitions', 'implementations', 'macros', 'testclasses', 'main'],
        optional: true
      },
      pattern: {
        type: 'string',
        description: '搜索模式 (支持正则表达式)'
      },
      caseInsensitive: {
        type: 'boolean',
        description: '忽略大小写',
        default: false
      },
      contextLines: {
        type: 'number',
        description: '上下文行数',
        default: 0
      },
      maxMatches: {
        type: 'number',
        description: '最大匹配数',
        default: 100
      }
    },
    required: ['objectSourceUrl', 'pattern']
  }
}
```

**响应格式**:
```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "lineNumber": 42,
        "content": "METHODS calculate_result.",
        "contextBefore": ["* 功能方法定义", ""],
        "contextAfter": ["METHODS get_status.", ""]
      },
      {
        "lineNumber": 156,
        "content": "  calculate_result( ).",
        "contextBefore": ["    me->", ""],
        "contextAfter": ["  catch cx_root."}
      ]
    ],
    "matchCount": 2,
    "lineCount": 10000
  }
}
```

### 4.3 setObjectSourceV2

**功能**: 修改源代码的指定行号范围

```typescript
{
  name: 'setObjectSourceV2',
  description: '修改 ABAP 源代码的指定行号范围',
  inputSchema: {
    type: 'object',
    properties: {
      objectSourceUrl: {
        type: 'string',
        description: '源代码 URL'
      },
      objectUrl: {
        type: 'string',
        description: '对象 URL (用于版本验证)'
      },
      token: {
        type: 'string',
        description: 'getObjectSourceV2 返回的版本标识'
      },
      startLine: {
        type: 'number',
        description: '起始行号 (1-based, 包含)'
      },
      endLine: {
        type: 'number',
        description: '结束行号 (1-based, 包含)'
      },
      content: {
        type: 'string',
        description: '新的内容 (将替换指定行号范围)'
      },
      lockHandle: {
        type: 'string',
        description: '对象锁定句柄 (通过 lock 工具获取)'
      },
      transport: {
        type: 'string',
        description: '传输请求号 (可选)'
      },
      skipConflictCheck: {
        type: 'boolean',
        description: '跳过冲突检查 (不推荐)',
        default: false
      }
    },
    required: ['objectSourceUrl', 'objectUrl', 'token', 'startLine', 'endLine', 'content', 'lockHandle']
  }
}
```

**响应格式 (成功)**:
```json
{
  "status": "success",
  "data": {
    "updated": true,
    "lineCount": 10020,
    "oldRange": [100, 110],
    "newRange": [100, 115],
    "timestamp": 1706141123456
  }
}
```

**响应格式 (冲突)**:
```json
{
  "status": "conflict",
  "error": "版本冲突：源代码已被修改",
  "details": {
    "expectedToken": "1706140800_a3f5b8c2d9e1f4a6",
    "currentToken": "1706140900_b4g6c9d3e0f2g5b7",
    "changedBy": "OTHER_USER",
    "changedAt": 1706140900000,
    "resolution": "请调用 getObjectSourceV2 重新获取最新内容和 token"
  }
}
```

---

## 5. 实现设计

### 5.1 文件结构

```
src/
├── handlers/
│   ├── ObjectSourceHandlers.ts          # V1 (保持不变)
│   └── ObjectSourceHandlersV2.ts        # V2 (新增)
├── lib/
│   ├── logger.ts
│   ├── sourceCache.ts                    # 新增: 缓存管理
│   └── tokenUtils.ts                     # 新增: Token 工具
└── index.ts                              # 注册 V2 handlers
```

### 5.2 核心类设计

**SourceCache 类**:
```typescript
// src/lib/sourceCache.ts

interface CacheEntry {
  token: string;
  changedAt: number;
  lineCount: number;
  timestamp: number;
  expiresAt: number;
  objectUrl: string;
  includeType?: string;  // 新增: 支持 CLASS include
}

export class SourceCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 分钟
  private readonly MAX_SIZE = 100;

  // 获取缓存
  get(key: string): CacheEntry | undefined;

  // 设置缓存
  set(key: string, entry: CacheEntry): void;

  // 验证 token
  validateToken(key: string, token: string): boolean;

  // 清理过期缓存
  cleanup(): void;

  // 清除指定缓存
  invalidate(key: string): void;

  // 清空所有缓存
  clear(): void;

  // 获取缓存统计
  getStats(): CacheStats;
}
```

**TokenUtils 类**:
```typescript
// src/lib/tokenUtils.ts

export class TokenUtils {
  // 生成 token
  static generateToken(changedAt: number, content: string): string;

  // 验证 token 格式
  static isValidToken(token: string): boolean;

  // 从 token 提取 changedAt
  static extractChangedAt(token: string): number | null;

  // 计算内容 hash
  static hashContent(content: string): string;
}
```

**ObjectSourceHandlersV2 类**:
```typescript
// src/handlers/ObjectSourceHandlersV2.ts

export class ObjectSourceHandlersV2 extends BaseHandler {
  private cache: SourceCache;

  constructor(adtclient: ADTClient) {
    super(adtclient);
    this.cache = new SourceCache();
    // 启动定期清理
    setInterval(() => this.cache.cleanup(), 60 * 1000);
  }

  getTools(): ToolDefinition[];

  async handle(toolName: string, args: any): Promise<any>;

  // 处理读取
  private async handleGetObjectSourceV2(args: any): Promise<any>;

  // 处理搜索
  private async handleGrepObjectSource(args: any): Promise<any>;

  // 处理修改
  private async handleSetObjectSourceV2(args: any): Promise<any>;
}
```

### 5.3 关键流程

**读取流程**:
```typescript
async handleGetObjectSourceV2(args: any) {
  // 1. 获取对象结构 (包含 changedAt)
  const structure = await this.adtclient.objectStructure(args.objectUrl);
  const changedAt = structure.metaData["adtcore:changedAt"];

  // 2. 获取完整源代码
  const fullSource = await this.adtclient.getObjectSource(
    args.objectSourceUrl,
    { version: args.version }
  );

  // 3. 按行切割
  const lines = fullSource.split('\n');
  const startLine = args.startLine ?? 1;
  const endLine = args.endLine ?? lines.length;
  const content = lines.slice(startLine - 1, endLine).join('\n');

  // 4. 生成 token
  const token = TokenUtils.generateToken(changedAt, fullSource);

  // 5. 缓存
  this.cache.set(args.objectSourceUrl, {
    token,
    changedAt,
    lineCount: lines.length,
    timestamp: Date.now(),
    expiresAt: Date.now() + this.cache.DEFAULT_TTL,
    objectUrl: args.objectUrl
  });

  // 6. 返回
  return { status: 'success', data: { ... } };
}
```

**修改流程**:
```typescript
async handleSetObjectSourceV2(args: any) {
  // 1. 验证缓存和 token
  const cached = this.cache.get(args.objectSourceUrl);

  if (!cached || Date.now() > cached.expiresAt) {
    throw new McpError(ErrorCode.InvalidRequest,
      '缓存已过期，请先调用 getObjectSourceV2 重新获取');
  }

  if (cached.token !== args.token && !args.skipConflictCheck) {
    // 尝试获取当前状态
    const structure = await this.adtclient.objectStructure(args.objectUrl);
    const currentChangedAt = structure.metaData["adtcore:changedAt"];

    this.cache.invalidate(args.objectSourceUrl);

    throw new McpError(ErrorCode.InvalidRequest, JSON.stringify({
      error: '版本冲突：源代码已被修改',
      details: {
        expectedToken: cached.token,
        currentChangedAt,
        changedBy: structure.metaData["adtcore:changedBy"],
        resolution: '请调用 getObjectSourceV2 重新获取最新内容和 token'
      }
    }));
  }

  // 2. 获取当前完整源代码
  const fullSource = await this.adtclient.getObjectSource(args.objectSourceUrl);
  const lines = fullSource.split('\n');

  // 3. 行号范围校验
  if (args.startLine < 1 || args.endLine > lines.length) {
    throw new McpError(ErrorCode.InvalidRequest,
      `行号超出范围：文件共 ${lines.length} 行`);
  }

  // 4. 应用修改
  const newLines = [
    ...lines.slice(0, args.startLine - 1),
    ...args.content.split('\n'),
    ...lines.slice(args.endLine)
  ];
  const newSource = newLines.join('\n');

  // 5. 提交
  await this.adtclient.setObjectSource(
    args.objectSourceUrl,
    newSource,
    args.lockHandle,
    args.transport
  );

  // 6. 清除缓存 (已修改，旧 token 失效)
  this.cache.invalidate(args.objectSourceUrl);

  return { status: 'success', data: { ... } };
}
```

**搜索流程**:
```typescript
async handleGrepObjectSource(args: any) {
  // 1. 确定源代码 URL (支持 includeType)
  let sourceUrl: string;
  let includeName = '';

  if (args.includeType) {
    // 获取对象结构以找到 include 的 sourceUri
    const structure = await this.adtclient.objectStructure(args.objectUrl);
    if (isClassStructure(structure)) {
      const include = structure.includes.find(
        i => i["class:includeType"] === args.includeType
      );
      if (!include) {
        throw new McpError(ErrorCode.InvalidRequest,
          `Include type "${args.includeType}" not found`);
      }
      sourceUrl = include["abapsource:sourceUri"];
      includeName = args.includeType;
    } else {
      // 非 CLASS 类型，忽略 includeType
      sourceUrl = structure.metaData["abapsource:sourceUri"];
    }
  } else {
    // 使用默认 sourceUri
    const structure = await this.adtclient.objectStructure(args.objectUrl);
    sourceUrl = structure.metaData["abapsource:sourceUri"];
  }

  // 2. 获取源代码
  const fullSource = await this.adtclient.getObjectSource(sourceUrl);
  const lines = fullSource.split('\n');

  // 2. 编译正则表达式
  const flags = args.caseInsensitive ? 'gi' : 'g';
  let regex: RegExp;

  try {
    regex = new RegExp(args.pattern, flags);
  } catch (error) {
    throw new McpError(ErrorCode.InvalidRequest,
      `无效的正则表达式: ${args.pattern}`);
  }

  // 3. 搜索匹配行
  const matches: GrepMatch[] = [];
  const maxMatches = args.maxMatches ?? 100;
  const contextLines = args.contextLines ?? 0;

  for (let i = 0; i < lines.length && matches.length < maxMatches; i++) {
    const line = lines[i];

    if (regex.test(line)) {
      // 重置 regex 的 lastIndex
      regex.lastIndex = 0;

      const match: GrepMatch = {
        lineNumber: i + 1,  // 1-based
        content: line
      };

      // 添加上下文
      if (contextLines > 0) {
        const start = Math.max(0, i - contextLines);
        const end = Math.min(lines.length, i + contextLines + 1);

        match.contextBefore = lines.slice(start, i).map(l => l);
        match.contextAfter = lines.slice(i + 1, end).map(l => l);
      }

      matches.push(match);
    }
  }

  // 4. 返回结果
  return {
    status: 'success',
    data: {
      matches,
      matchCount: matches.length,
      lineCount: lines.length,
      pattern: args.pattern,
      includeType: includeName || undefined,
      truncated: matches.length >= maxMatches
    }
  };
}

interface GrepMatch {
  lineNumber: number;
  content: string;
  contextBefore?: string[];
  contextAfter?: string[];
}
```

---

## 6. AI 客户端使用流程

### 6.1 标准修改流程

```
┌─────────────────────────────────────────────────────────────┐
│  AI Agent 工作流                                             │
└─────────────────────────────────────────────────────────────┘

1. 读取源代码
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'getObjectSourceV2',                         │
   │   arguments: {                                       │
   │     objectSourceUrl: '...',                         │
   │     objectUrl: '...',                               │
   │     startLine: 100,                                 │
   │     endLine: 150                                    │
   │   }                                                  │
   │ })                                                   │
   │ → { content, token, lineCount, ... }                │
   └──────────────────────────────────────────────────────┘

2. 分析并生成修改内容 (AI 内部处理)

3. 获取对象锁
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'lock',                                      │
   │   arguments: { objectUrl: '...' }                    │
   │ })                                                   │
   │ → { LOCK_HANDLE: '...' }                             │
   └──────────────────────────────────────────────────────┘

4. 提交修改
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'setObjectSourceV2',                         │
   │   arguments: {                                       │
   │     objectSourceUrl: '...',                         │
   │     objectUrl: '...',                               │
   │     token: '1706140800_a3f5...',                    │
   │     startLine: 120,                                 │
   │     endLine: 130,                                   │
   │     content: 'METHOD new_method...',                │
   │     lockHandle: '...'                               │
   │   }                                                  │
   │ })                                                   │
   └──────────────────────────────────────────────────────┘

5. 释放锁
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'unLock',                                    │
   │   arguments: {                                       │
   │     objectUrl: '...',                               │
   │     lockHandle: '...'                               │
   │   }                                                  │
   │ })                                                   │
   └──────────────────────────────────────────────────────┘
```

### 6.2 冲突处理流程

```
┌─────────────────────────────────────────────────────────────┐
│  冲突检测与恢复                                              │
└─────────────────────────────────────────────────────────────┘

setObjectSourceV2 返回冲突
         ↓
┌──────────────────────────────────────────────────────┐
│  检测到版本冲突                                       │
│  - expectedToken: 1706140800_a3f5...                 │
│  - currentChangedAt: 1706140900                      │
│  - changedBy: OTHER_USER                             │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│  AI Agent 决策:                                       │
│  1. 提示用户源代码已被修改                            │
│  2. 重新调用 getObjectSourceV2 获取最新版本           │
│  3. 在新版本上重新应用修改                            │
│  4. 或提示用户手动处理冲突                            │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│  重新执行修改流程                                     │
└──────────────────────────────────────────────────────┘
```

### 6.3 搜索流程

```
┌─────────────────────────────────────────────────────────────┐
│  代码搜索工作流                                              │
└─────────────────────────────────────────────────────────────┘

1. 搜索方法定义
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'grepObjectSource',                         │
   │   arguments: {                                       │
   │     objectSourceUrl: '...',                         │
   │     pattern: 'METHODS\\s+\\w+',                     │
   │     contextLines: 2                                 │
   │   }                                                  │
   │ })                                                   │
   │ → { matches: [{ lineNumber, content, context }] }  │
   └──────────────────────────────────────────────────────┘

2. AI 分析搜索结果

3. 获取特定方法的完整代码
   ┌──────────────────────────────────────────────────────┐
   │ mcpClient.callTool({                                 │
   │   name: 'getObjectSourceV2',                         │
   │   arguments: {                                       │
   │     objectSourceUrl: '...',                         │
   │     startLine: 42,                                  │
   │     endLine: 80                                     │
   │   }                                                  │
   │ })                                                   │
   └──────────────────────────────────────────────────────┘
```

---

## 7. 错误处理

### 7.1 错误码定义

| 错误码 | 常量 | 描述 |
|--------|------|------|
| 4000 | `CACHE_EXPIRED` | 缓存已过期 |
| 4001 | `TOKEN_INVALID` | Token 格式无效 |
| 4002 | `TOKEN_MISMATCH` | Token 不匹配 |
| 4003 | `VERSION_CONFLICT` | 版本冲突 |
| 4004 | `LINE_OUT_OF_RANGE` | 行号超出范围 |
| 4005 | `LOCK_REQUIRED` | 需要先获取锁 |
| 4006 | `PATTERN_INVALID` | 正则表达式无效 |
| 4007 | `INCLUDE_NOT_FOUND` | 请求的 includeType 不存在 |
| 4008 | `NOT_CLASS_OBJECT` | 对象不是 CLASS 类型，不支持 includeType |

### 7.2 错误响应格式

```json
{
  "content": [{
    "type": "text",
    "text": JSON.stringify({
      "error": "版本冲突：源代码已被修改",
      "code": 4003,
      "details": {
        "expectedToken": "1706140800_a3f5b8c2d9e1f4a6",
        "currentChangedAt": 1706140900000,
        "changedBy": "OTHER_USER",
        "resolution": "请调用 getObjectSourceV2 重新获取最新内容和 token"
      },
      "retry": true,
      "retryAction": "getObjectSourceV2"
    })
  }],
  "isError": true
}
```

### 7.3 重试策略

| 场景 | 重试策略 |
|------|----------|
| **缓存过期** | 自动重试: 调用 getObjectSourceV2 |
| **版本冲突** | 提示用户: 让用户决定是否覆盖 |
| **网络错误** | 指数退避重试 (1s, 2s, 4s) |
| **行号越界** | 不重试，返回错误详情 |

---

## 8. 性能分析

### 8.1 优化效果预估

| 场景 | V1 (当前) | V2 (优化) | 改善 |
|------|-----------|-----------|------|
| **读取 100 行 / 10000 行文件** | 传输 10000 行 | 传输 100 行 | 99% |
| **修改 10 行代码** | 传输 20000 行 | 传输 100 行 | 99.5% |
| **搜索方法定义** | 传输全部 + 客户端搜索 | 传输匹配结果 | 80%+ |
| **CLASS 读取 main (500 行)** | 传输全部 5000 行 | 只传输 main 500 行 | 90% |
| **CLASS 读取 definitions** | 传输全部 5000 行 | 只传输 definitions 200 行 | 96% |
| **响应时间 (大文件)** | 2-5 秒 | 0.5-1 秒 | 50-75% |

### 8.2 缓存开销

| 项目 | 影响 |
|------|------|
| **内存开销** | 每条缓存约 1KB，100 条约 100KB |
| **CPU 开销** | Token 生成: sha256 hash，约 1ms/MB |
| **网络开销** | 无额外开销 |

### 8.3 并发性能

| 指标 | 影响 |
|------|------|
| **多用户** | 每个用户独立缓存，无冲突 |
| **多对象** | 不同对象独立缓存，无冲突 |
| **同一对象** | Token 机制保证一致性 |

---

## 9. 风险与缓解

### 9.1 风险矩阵

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| **SAP 不支持 changedAt** | 低 | 高 | 使用纯 hash 作为 token |
| **缓存内存泄漏** | 中 | 中 | 定期清理 + 大小限制 |
| **Token 碰撞** | 极低 | 高 | sha256 确保唯一性 |
| **网络延迟增加** | 低 | 中 | 可选跳过冲突检查 |
| **并发竞争** | 中 | 高 | Lock + Token 双重保护 |

### 9.2 边界情况处理

| 情况 | 处理方式 |
|------|----------|
| **文件为空** | 返回空内容，token = "0_empty" |
| **行号超出范围** | 返回错误，提示文件行数 |
| **特殊字符/编码** | 保持原始内容，不做转换 |
| **换行符混合** | 统一为 `\n`，返回时保留 |
| **缓存满载** | LRU 淘汰最旧条目 |
| **服务器重启** | 缓存清空，用户重新读取 |
| **includeType 不存在** | 返回错误，列出可用的 include 类型 |
| **非 CLASS 使用 includeType** | 忽略 includeType，使用默认 sourceUri |

---

## 10. 兼容性策略

### 10.1 版本共存

```
V1 API (保持不变)          V2 API (新增)
├─ getObjectSource         ├─ getObjectSourceV2 (支持 includeType)
└─ setObjectSource         ├─ grepObjectSource (支持 includeType)
                           └─ setObjectSourceV2 (支持 includeType)
```

**V2 新增参数**:

| 参数 | 适用工具 | 说明 |
|------|----------|------|
| `includeType` | getObjectSourceV2, grepObjectSource, setObjectSourceV2 | CLASS 类型的 include 部分 |
| `objectUrl` | getObjectSourceV2, grepObjectSource, setObjectSourceV2 | 对象 URL (替代 objectSourceUrl) |
| `token` | setObjectSourceV2 | 版本标识 (从 getObjectSourceV2 获取) |

### 10.2 迁移策略

| 阶段 | 描述 |
|------|------|
| **Phase 1** | V2 API 开发，V1 保持不变 |
| **Phase 2** | V2 API 测试和稳定 |
| **Phase 3** | AI Agent 逐步迁移到 V2 |
| **Phase 4** | V1 标记为 deprecated |
| **Phase 5** | (未来) V1 移除 |

---

## 11. 测试计划

### 11.1 单元测试

| 模块 | 测试用例 |
|------|----------|
| **TokenUtils** | 生成、验证、提取 changedAt |
| **SourceCache** | 设置、获取、过期、清理 |
| **ObjectSourceHandlersV2** | 各工具的正常流程 |

### 11.2 集成测试

| 场景 | 测试内容 |
|------|----------|
| **读取流程** | 行号范围、版本参数 |
| **CLASS include 读取** | includeType 参数、各部分独立读取 |
| **修改流程** | 正常修改、冲突检测 |
| **搜索流程** | 正则匹配、上下文、includeType 过滤 |
| **并发场景** | 多用户同时修改 |

### 11.3 性能测试

| 指标 | 测试方法 |
|------|----------|
| **响应时间** | 大文件 (10k+ 行) 读写 |
| **并发能力** | 10 用户同时操作 |
| **内存使用** | 缓存满载时的内存 |

---

## 12. 实施计划

### 12.1 开发任务

| 任务 | 优先级 | 估计工作量 |
|------|--------|------------|
| **TokenUtils 实现** | P0 | 0.5 天 |
| **SourceCache 实现** | P0 | 1 天 |
| **getObjectSourceV2 (基础)** | P0 | 1 天 |
| **getObjectSourceV2 (includeType)** | P1 | 0.5 天 |
| **grepObjectSource (基础)** | P1 | 0.5 天 |
| **grepObjectSource (includeType)** | P2 | 0.5 天 |
| **setObjectSourceV2** | P0 | 1.5 天 |
| **单元测试** | P0 | 1 天 |
| **集成测试** | P1 | 1 天 |
| **文档更新** | P1 | 0.5 天 |
| **总计** | | 8 天 |

### 12.2 里程碑

| 里程碑 | 交付物 | 日期 |
|--------|--------|------|
| **M1: 核心功能** | V2 基础读写功能 | D+3 |
| **M2: 完整功能** | 包含搜索和错误处理 | D+5 |
| **M3: 测试完成** | 单元和集成测试通过 | D+6 |
| **M4: 发布准备** | 文档和示例完整 | D+7 |

---

## 13. 配置选项

### 13.1 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MCP_CACHE_TTL` | 300000 | 缓存 TTL (毫秒) |
| `MCP_CACHE_SIZE` | 100 | 最大缓存条目 |
| `MCP_CACHE_CLEANUP_INTERVAL` | 60000 | 清理间隔 (毫秒) |
| `MCP_ENABLE_CONFLICT_CHECK` | true | 是否启用冲突检查 |
| `MCP_MAX_MATCHES` | 100 | grep 最大匹配数 |

### 13.2 运行时配置

```typescript
// src/config/cacheConfig.ts
export const cacheConfig = {
  ttl: parseInt(process.env.MCP_CACHE_TTL || '300000'),
  maxSize: parseInt(process.env.MCP_CACHE_SIZE || '100'),
  cleanupInterval: parseInt(process.env.MCP_CACHE_CLEANUP_INTERVAL || '60000'),
  enableConflictCheck: process.env.MCP_ENABLE_CONFLICT_CHECK !== 'false',
  maxMatches: parseInt(process.env.MCP_MAX_MATCHES || '100')
};
```

---

## 14. 附录

### 14.1 术语表

| 术语 | 定义 |
|------|------|
| **Token** | 版本标识，格式为 `changedAt_hash` |
| **changedAt** | SAP 对象最后修改时间戳 |
| **lockHandle** | SAP 对象锁句柄 |
| **objectUrl** | ABAP 对象的 ADT URL |
| **objectSourceUrl** | ABAP 对象源代码的 ADT URL |
| **includeType** | ABAP CLASS 的子部分类型 (definitions/implementations/macros/testclasses/main) |

### 14.2 参考文档

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [abap-adt-api Documentation](https://github.com/marcellourbani/abap-adt-api)
- [SAP ADT API Guide](https://help.sap.com/)

### 14.3 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.1 | 2025-01-25 | 添加 objectStructure API 分析，增加 includeType 支持 |
| 1.0 | 2025-01-25 | 初始版本 |

---

## 15. 审查清单

请在审查时确认以下各项：

- [ ] **方案完整性**: 所有设计要素是否完整？
- [ ] **技术可行性**: 基于 abap-adt-api 的限制，方案是否可行？
- [ ] **并发安全**: Token 机制是否足够安全？
- [ ] **性能改善**: 预期的性能提升是否合理？
- [ ] **兼容性**: V1 API 保持不变的策略是否可行？
- [ ] **错误处理**: 所有边界情况是否有处理？
- [ ] **测试覆盖**: 测试计划是否完整？
- [ ] **实施计划**: 工作量估算是否合理？
- [ ] **includeType 设计**: CLASS include 分离读取是否符合预期？

---

*本文档待审查通过后开始实施*
