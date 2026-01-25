# 服务器架构

本文档详细说明 MCP ABAP ADT API Server 的架构设计、核心组件和工作原理。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                   MCP Client (Claude/Cline)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ MCP Protocol
                         │ (JSON-RPC over stdio)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AbapAdtServer (Main Class)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tool Request Router                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────────┬────────────┬─────────────┐
    │ AuthHandler │ ObjectHandler │TransportHandler│
    └────────────┴────────────┴─────────────┘
         │               │               │
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    abap-adt-api Library                       │
│              (SAP ADT REST API Client)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SAP ABAP System                            │
│                    (ADT REST API)                             │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. AbapAdtServer (主服务器类)

**位置**: `src/index.ts`

**职责**:
- MCP 服务器生命周期管理
- 工具路由和请求分发
- 错误处理和结果序列化
- ADTClient 初始化和配置

**关键方法**:

```typescript
class AbapAdtServer {
  // 初始化所有处理器
  constructor()
  
  // 设置工具处理器
  private setupToolHandlers()
  
  // 序列化返回结果
  private serializeResult(result: any)
  
  // 错误处理
  private handleError(error: unknown)
  
  // 启动服务器
  async run()
}
```

**事件处理**:
- `SIGINT` / `SIGTERM` - 优雅关闭
- Error 事件 - 错误日志记录

### 2. BaseHandler (基类处理器)

**位置**: `src/handlers/BaseHandler.ts`

**职责**:
- 提供处理器的基础功能
- 实现通用功能（日志、指标收集、速率限制）
- 定义处理器接口

**功能**:

| 功能 | 说明 |
|------|------|
| `trackRequest()` | 请求追踪和指标收集 |
| `checkRateLimit()` | 速率限制检查 |
| `getMetrics()` | 获取性能指标 |
| `getTools()` | 抽象方法，子类必须实现 |
| `handle()` | 抽象方法，子类必须实现 |

**指标收集**:
```typescript
{
  requestCount: number,      // 总请求数
  errorCount: number,        // 错误数
  successCount: number,      // 成功数
  totalTime: number,         // 总耗时
  averageTime: number        // 平均响应时间
}
```

**速率限制**:
- 默认限制: 每秒 1 个请求
- 基于 IP 或客户端标识
- 可在子类中覆盖

### 3. Handler 模块

服务器采用模块化 Handler 架构，每个功能领域一个 Handler 类。

#### Handler 列表

| Handler | 职责 | 工具数 |
|---------|------|--------|
| `AuthHandlers` | 身份验证（登录/登出） | 3 |
| `ObjectHandlers` | 对象操作（搜索、结构、查找） | 5 |
| `TransportHandlers` | 传输管理（创建、查询、释放） | 13 |
| `ObjectLockHandlers` | 对象锁定/解锁 | 2 |
| `ObjectSourceHandlers` | 源代码读写 | 2 |
| `ObjectManagementHandlers` | 对象管理（激活） | 3 |
| `ObjectRegistrationHandlers` | 对象注册和创建 | 3 |
| `NodeHandlers` | 节点内容和主程序 | 2 |
| `DiscoveryHandlers` | ADT 发现和类型 | 7 |
| `UnitTestHandlers` | 单元测试 | 4 |
| `CodeAnalysisHandlers` | 代码分析（语法、补全、导航） | 13 |
| `PrettyPrinterHandlers` | 代码格式化 | 3 |
| `GitHandlers` | abapGit 集成 | 11 |
| `DdicHandlers` | DDIC（数据字典）操作 | 4 |
| `ServiceBindingHandlers` | 服务绑定 | 3 |
| `QueryHandlers` | 数据库查询 | 2 |
| `FeedHandlers` | Feed 和 Dump | 2 |
| `DebugHandlers` | 调试器 | 13 |
| `RenameHandlers` | 重命名重构 | 3 |
| `AtcHandlers` | ATC 检查 | 10 |
| `TraceHandlers` | 性能追踪 | 10 |
| `RefactorHandlers` | 重构（提取方法） | 3 |
| `RevisionHandlers` | 版本历史 | 1 |

**总计**: 约 120+ 工具

### 4. Logger (日志系统)

**位置**: `src/lib/logger.ts`

**功能**:
- 结构化日志输出
- JSON 格式日志
- 多级别日志（error, warn, info, debug）
- 统一的日志接口

**日志格式**:
```json
{
  "timestamp": "2025-01-20T10:00:00.000Z",
  "level": "info",
  "service": "AuthHandlers",
  "message": "Request completed",
  "duration": 123.45,
  "success": true,
  "meta": {
    "additional": "context"
  }
}
```

**日志级别**:
- `error` - 错误信息
- `warn` - 警告信息
- `info` - 一般信息
- `debug` - 调试信息

## 数据流

### 请求流程

```
1. MCP Client 发送请求
   ↓
2. StdioServerTransport 接收
   ↓
3. AbapAdtServer.CallToolRequestSchema 处理
   ↓
4. 路由到对应的 Handler
   ↓
5. Handler.handle() 执行
   ↓
6. 调用 abap-adt-api 客户端
   ↓
7. 返回结果序列化
   ↓
8. 发回 MCP Client
```

### 响应格式

**成功响应**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{ ... JSON result ... }"
    }
  ]
}
```

**错误响应**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{ \"error\": \"Error message\", \"code\": -32603 }"
    }
  ],
  "isError": true
}
```

## 会话管理

### Stateful vs Stateless

服务器使用 `abap-adt-api` 的会话管理：

```typescript
// stateful - 保持会话（默认）
this.adtClient.stateful = session_types.stateful

// 启用 stateful 模式可以提高性能，但需要管理会话生命周期
this.adtClient.dropSession()
this.adtClient.logout()
```

### 会话生命周期

```
1. 服务器启动
   ↓
2. 调用 login()
   ↓
3. 建立会话
   ↓
4. 处理多个请求
   ↓
5. 调用 dropSession() (可选)
   ↓
6. 调用 logout()
   ↓
7. 会话结束
   ↓
8. 服务器关闭
```

## 工具定义

### 工具定义接口

**位置**: `src/types/tools.ts`

```typescript
interface ToolDefinition {
  name: string;                                    // 工具名称
  description: string;                             // 工具描述
  inputSchema: {
    type: string;                                 // "object"
    properties: Record<string, {                 // 参数定义
      type: string;
      description?: string;
      optional?: boolean;
    }>;
    required?: string[];                         // 必填参数列表
  };
}
```

### 工具注册

每个 Handler 通过 `getTools()` 方法注册其工具：

```typescript
class ExampleHandler extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'exampleTool',
        description: 'ExampleTool description',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'First parameter',
              optional: false
            }
          },
          required: ['param1']
        }
      }
    ];
  }
  
  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'exampleTool':
        return this.handleExampleTool(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
  }
}
```

## 错误处理

### 错误类型

| 错误类型 | 错误码 | 描述 |
|----------|--------|------|
| `McpError` | 由 SDK 定义 | MCP 协议错误 |
| `CustomErrorCode.TooManyRequests` | 429 | 速率限制超出 |
| `CustomErrorCode.InvalidParameters` | 400 | 参数无效 |
| `ErrorCode.MethodNotFound` | -32601 | 工具不存在 |
| `ErrorCode.InternalError` | -32603 | 内部错误 |

### 错误处理流程

```
1. 方法调用抛出异常
   ↓
2. catch 块捕获
   ↓
3. Handler.trackRequest(success=false)
   ↓
4. AbapAdtServer.handleError()
   ↓
5. 返回错误响应给客户端
```

### 错误恢复策略

| 错误类型 | 恢复策略 |
|----------|----------|
| 网络错误 | 重试（由 abap-adt-api 处理） |
| 认证错误 | 返回错误，提示重新登录 |
| 参数错误 | 返回详细错误信息 |
| 速率限制 | 节流请求 |
| 内部错误 | 记录日志，返回通用错误 |

## 性能优化

### 1. 请求追踪

每个请求自动追踪：
- 开始时间
- 结束时间
- 成功/失败状态
- 性能指标

### 2. 批量操作

对于批量操作，考虑：
- 分批处理，避免超时
- 使用并发控制
- 实现进度报告

### 3. 缓存策略

建议使用的缓存时机：
- 对象类型定义（很少变化）
- 用户权限（短期内不变）
- 系统配置信息

### 4. 异步处理

服务器当前的实现是同步的。未来可以考虑：
- 长时间运行操作使用异步模式
- 提供进度回调
- 实现操作取消功能

## 扩展性

### 添加新 Handler

1. 创建 Handler 类继承 `BaseHandler`
2. 实现 `getTools()` 方法
3. 实现 `handle()` 方法
4. 在 `AbapAdtServer` 中注册

**示例**:

```typescript
// src/handlers/MyHandler.ts

import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';

export class MyHandler extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'myTool',
        description: 'My custom tool',
        inputSchema: {
          type: 'object',
          properties: {
            param: { type: 'string', optional: false }
          },
          required: ['param']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    if (toolName === 'myTool') {
      return this.handleMyTool(args);
    }
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }

  private async handleMyTool(args: any) {
    // 实现逻辑
    return { result: 'success' };
  }
}
```

```typescript
// src/index.ts

import { MyHandler } from './handlers/MyHandler.js';

class AbapAdtServer extends Server {
  private myHandlers: MyHandler;

  constructor() {
    // ... 其他初始化
    
    this.myHandlers = new MyHandler(this.adtClient);
  }

  private setupToolHandlers() {
    // ... 其他工具
    
    // 添加新工具
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          ...existingTools,
          ...this.myHandlers.getTools()
        ]
      };
    });

    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      // ... 其他工具路由
      
      // 添加新工具路由
      case 'myTool':
        result = await this.myHandlers.handle(request.params.name, request.params.arguments);
        break;
    });
  }
}
```

### 添加新工具到现有 Handler

1. 在 Handler 的 `getTools()` 中添加工具定义
2. 在 `handle()` 方法中添加路由
3. 实现对应的处理方法

**示例**:

```typescript
class ObjectHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      // ... 现有工具
      {
        name: 'newObjectTool',
        description: 'New object tool',
        inputSchema: { /* ... */ }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      // ... 现有路由
      case 'newObjectTool':
        return this.handleNewTool(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
  }
}
```

## 安全架构

### 1. 认证安全

- 凭据通过环境变量管理
- 不在日志中记录敏感信息
- 支持会话终止和清理

### 2. 输入验证

所有工具参数都通过 MCP SDK 的 JSON Schema 验证：
- 类型检查
- 必填字段验证
- 可选字段标识

### 3. 速率限制

- 内置基础的速率限制（每秒 1 个请求）
- 可在 BaseHandler 子类中自定义

### 4. 错误信息

- 不泄露敏感的系统信息
- 提供足够详细的错误信息帮助调试
- 使用标准化的错误码

## 监控和观测

### 指标

每个 Handler 自动收集：
- 请求数
- 成功数
- 错误数
- 平均响应时间
- 总响应时间

**示例输出**:
```json
{
  "requestCount": 100,
  "successCount": 95,
  "errorCount": 5,
  "totalTime": 12345.67,
  "averageTime": 123.45
}
```

### 日志

所有操作都记录结构化日志，便于：
- 问题诊断
- 性能分析
- 审计追踪
- 安全监控

## 部署架构

### 开发环境

```
Claude Desktop ←→ MCP Server (stdio) ←→ SAP System
```

### 生产环境（推荐）

```
┌─────────────┐
│ Claude     │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ MCP Server  │ ←→ 监控
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Load Balancer│
└─────┬───────┘
      │
      ├──────→ MCP Server 1
      ├──────→ MCP Server 2
      └──────→ MCP Server 3
      │
      ▼
┌─────────────┐
│  SAP System │
└─────────────┘
```

## 依赖关系图

```
AbapAdtServer
  │
  ├────> @modelcontextprotocol/sdk (MCP 协议)
  │
  ├────> abap-adt-api (SAP ADT 客户端)
  │        │
  │        ├────> axios (HTTP 客户端)
  │        ├────> fast-xml-parser (XML 解析)
  │        └────> io-ts (类型验证)
  │
  └────> dotenv (环境变量)
           │
           └────> Node.js 内置模块 (fs, path, crypto, etc.)
```

## 最佳实践

### Handler 开发

1. **继承 BaseHandler**
   - 自动获得日志、指标、速率限制功能
   - 保持代码一致性

2. **错误处理**
   - 总是使用 `McpError` 而不是普通异常
   - 提供有意义的错误消息
   - 记录上下文信息

3. **性能考虑**
   - 避免阻塞操作
   - 使用批量操作
   - 实现合理的超时

4. **日志记录**
   - 使用结构化日志
   - 记录关键步骤和错误
   - 不记录敏感信息

### API 设计

1. **命名规范**
   - 工具名使用 camelCase
   - 参数使用 camelCase
   - 保持一致性

2. **输入验证**
   -使用 JSON Schema 验证
   - 提供 clear 的错误消息
   - 标记必填字段

3. **输出格式**
   - 始终返回 JSON
   - 保持一致的结构
   - 包含必要的元数据

## 未来改进方向

1. **异步支持**
   - 实现长时间运行操作
   - 提供进度回调

2. **高级缓存**
   - Redis 缓存层
   - 智能缓存失效

3. **监控集成**
   - Prometheus 指标
   - Grafana 仪表板
   - 分布式追踪

4. **多服务器**
   - 负载均衡
   - 水平扩展
   - 健康检查

5. **插件系统**
   - 动态加载 Handler
   - 第三方扩展支持
