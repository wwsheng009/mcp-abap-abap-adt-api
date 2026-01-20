# 开发指南

本文档面向开发者，说明如何扩展和开发 MCP ABAP ADT API Server。

## 开发环境设置

### 1. 克隆和安装

```bash
git clone https://github.com/mario-andreschak/mcp-abap-abap-abap-adt-api.git
cd mcp-abap-abap-adt-api
npm install
```

### 2. 开发命令

```bash
# 构建项目
npm run build

# 监听模式（自动重新编译）
npm run watch

# 运行测试
npm run test

# 测试监听模式
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 启动 MCP Inspector（推荐用于开发）
npm run dev
```

### 3. 开发工具推荐

- **VS Code** - 推荐的代码编辑器
- **MCP Inspector** - 交互式测试工具
- **Jest** - 测试框架
- **TypeScript** - 类型检查

## 项目结构

```
mcp/
├── src/
│   ├── index.ts                    # 服务器入口
│   ├── handlers/                  # 工具处理器
│   │   ├── BaseHandler.ts        # 基类
│   │   ├── AuthHandlers.ts        # 示例处理器
│   │   └── ...                  # 其他处理器
│   ├── lib/                       # 工具库
│   │   └── logger.ts             # 日志
│   └── types/                     # 类型定义
│       └── tools.ts              # 工具类型
├── docs/                         # 文档
├── dist/                        # 编译输出
├── package.json
├── tsconfig.json                 # TS 配置
└── jest.config.js                # Jest 配置
```

## 创建新 Handler

### 步骤 1: 创建 Handler 文件

在 `src/handlers/` 目录下创建新文件 `MyCustomHandler.ts`:

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';

export class MyCustomHandler extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'myTool',
        description: 'My custom tool description',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'First parameter',
              optional: false
            },
            param2: {
              type: 'number',
              description: 'Second parameter',
              optional: true
            }
          },
          required: ['param1']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    const startTime = performance.now();

    try {
      switch (toolName) {
        case 'myTool':
          const result = await this.handleMyTool(args);
          this.trackRequest(startTime, true);
          return result;
        default:
          this.trackRequest(startTime, false);
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
      }
    } catch (error) {
      this.trackRequest(startTime, false);
      throw error;
    }
  }

  private async handleMyTool(args: { param1: string; param2?: number }) {
    this.logger.info('Executing myTool', { param1: args.param1 });

    // 调用 ADTClient
    const result = await this.adtclient.searchObject(args.param1);

    // 返回结果
    return result;
  }
}
```

### 步骤 2: 注册 Handler

在 `src/index.ts` 中:

```typescript
import { MyCustomHandler } from './handlers/MyCustomHandler.js';

export class AbapAdtServer extends Server {
  private myCustomHandlers: MyCustomHandler;

  constructor() {
    // ... 现有初始化代码
    
    this.myCustomHandlers = new MyCustomHandler(this.adtClient);
  }

  private setupToolHandlers() {
    // 添加工具到列表
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ... 现有工具
          ...this.myCustomHandlers.getTools()
        ]
      };
    });

    // 添加路由
    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      // ... 现有路由
      
      switch (request.params.name) {
        // ... 现有工具路由
        
        // 添加新工具
        case 'myTool':
          result = await this.myCustomHandlers.handle(request.params.name, request.params.arguments);
          break;
      }
      
      // ... 现有返回逻辑
    });
  }
}
```

## 添加新工具到现有 Handler

### 在 ObjectHandlers 中添加工具

```typescript
// src/handlers/ObjectHandlers.ts

getTools(): ToolDefinition[] {
  return [
    // ... 现有工具
    
    {
      name: 'myNewObjectTool',
      description: 'Description of the new tool',
      inputSchema: {
        type: 'object',
        properties: {
          objectUrl: {
            type: 'string',
            description: 'Object URL',
            optional: false
          }
        },
        required: ['objectUrl']
      }
    }
  ];
}

async handle(toolName: string, args: any): Promise<any> {
  switch (toolName) {
    // ... 现有路由
    
    case 'myNewObjectTool':
      return this.handleMyNewObjectTool(args);
      
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
}

private async handleMyNewObjectTool(args: { objectUrl: string }) {
  this.logger.info('Handle myNewObjectTool', { objectUrl: args.objectUrl });
  
  // 实现逻辑
  const result = await this.adtclient.objectStructure(args.objectUrl);
  return result;
}
```

## 编写测试

### 单元测试示例

```typescript
// src/handlers/__tests__/AuthHandlers.test.ts

import { AuthHandlers } from '../AuthHandlers.js';
import { ADTClient } from "abap-adt-api";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

describe('AuthHandlers', () => {
  let handler: AuthHandlers;
  let mockClient: jest.Mocked<ADTClient>;

  beforeEach(() => {
    mockClient = {
      login: jest.fn().mockResolvedValue({ success: true }),
      logout: jest.fn().mockResolvedValue(),
      dropSession: jest.fn().mockResolvedValue()
    } as any;

    handler = new AuthHandlers(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTools', () => {
    it('should return all auth tools', () => {
      const tools = handler.getTools();
      expect(tools).toHaveLength(3);
      expect(tools.map(t => t.name)).toContain('login');
    });
  });

  describe('handle', () => {
    it('should handle login', async () => {
      const result = await handler.handle('login', {});
      expect(mockClient.login).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle logout', async () => {
      const result = await handler.handle('logout', {});
      expect(mockClient.logout).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw on unknown tool', async () => {
      await expect(
        handler.handle('unknownTool', {})
      ).rejects.toThrow();
    });

    it('should track metrics on success', async () => {
      await handler.handle('login', {});
      const metrics = handler.getMetrics();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.successCount).toBe(1);
    });
  });
});
```

### 集成测试

```typescript
// src/__tests__/integration.test.ts

import { AbapAdtServer } from '../index';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

describe('AbapAdtServer Integration', () => {
  let server: AbapAdapServer;

  beforeEach(() => {
    // 设置测试环境变量
    process.env.SAP_URL = 'https://test-sap.com:8000';
    process.env.SAP_USER = 'TEST_USER';
    process.env.SAP_PASSWORD = 'TEST_PASS';
    server = new AbapAdtServer();
  });

  afterEach(() => {
    // 清理
  });

  it('should start and handle requests', async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // 测试工具调用
  });
});
```

## 调试技巧

### 1. 使用 MCP Inspector

```bash
npm run dev
```

在 Inspector 界面中：
- 选择工具
- 填写参数
- 查看 JSON 格式的请求和响应

### 2. 查看日志

日志以 JSON 格式输出到 stderr：

```json
{
  "timestamp": "2025-01-20T10:00:00.000Z",
  "level": "info",
  "service": "ObjectHandlers",
  "message": "Request completed",
  "duration": 123.45,
  "success": true
}
```

### 3. 类型检查

```bash
npx tsc --noEmit
```

### 4. 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率
npm run test:coverage
```

## 代码风格指南

### TypeScript 规范

```typescript
// ✅ 推荐
import type { ToolDefinition } from '../types/tools.js';

// ❌ 避免
import * as types from '../types/tools';
```

### 命名规范

- **类名**: PascalCase (如 `AuthHandlers`)
- **方法名**: camelCase (如 `handleLogin`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_ATTEMPTS`)
- **工具名**: camelCase (如 `searchObject`)

### 注释规范

```typescript
/**
 * Handles login operation
 * @param args - Function arguments
 * @returns Login result
 */
private async handleLogin(args: any): Promise<any> {
  // 实现
}
```

## 错误处理

### 正确的错误处理

```typescript
async handleTool(args: any): Promise<any> {
  const startTime = performance.now();
  
  try {
    // 验证参数
    if (!args.requiredParam) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Required parameter missing'
      );
    }
    
    // 调用 API
    const result = await this.adtclient.someMethod(args);
    
    this.trackRequest(startTime, true);
    return result;
    
  } catch (error) {
    this.trackRequest(startTime, false);
    
    if (error instanceof McpError) {
      throw error;  // 重新抛出 MCP 错误
    }
    
    // 转换为 MCP 错误
    throw new McpError(
      ErrorCode.InternalError,
      `Internal error: ${error.message}`
    );
  }
}
```

## 性能优化

### 1. 异步处理

```typescript
// 串行处理
await Promise.all([
  handleItem(item1),
  handleItem(item2),
  handleItem(item3)
]);

// 批量处理时限制并发数
import pLimit from 'p-limit';
const limit = pLimit(10); // 最多10个并发
await Promise.all(items.map(item => limit(() => handleItem(item))));
```

### 2. 缓存

```typescript
class CachedHandler extends BaseHandler {
  private cache = new Map<string, any>();
  private cacheTimeout = 60000; // 1分钟缓存

  async handleWithCache(key: string, fn: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached) {
      this.logger.debug('Cache hit', { key });
      return cached;
    }

    const result = await fn();
    this.cache.set(key, result);
    
    setTimeout(() => this.cache.delete(key), this.cacheTimeout);
    return result;
  }
}
```

### 3. 批量操作

```typescript
// 而不是一个一个获取，而是批量获取
const allObjects = [];
const batchResults = await Promise.all(
  chunks.map(chunk => this.fetchBatch(chunk))
);
```

## 提交代码

### 前置要求

1. 所有测试通过
2. 无 linting 错误
3. 代码已格式化
4. 类型检查通过

### 提交检查清单

- [ ] 功能已实现
- [ ] 测试已添加
- [ ] 文档已更新
- [ ] 无 linting 错误
- [ ] 类型检查通过
- [ ] 测试通过

### Pull Request 模板

```markdown
## 变更说明
简要描述变更内容

## 测试
描述测试方法

## 截图
如适用

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 测试已添加
- [ ] 文档已更新
```

## 发布流程

### 1. 更新版本号

编辑 `package.json`:

```json
{
  "version": "0.2.0"
}
```

### 2. 更新 CHANGELOG

### 3. 构建项目

```bash
npm run build
```

### 4. 发布到 NPM

```bash
npm publish
```

### 5. 标签 Release

```bash
git tag v0.2.0
git push origin v0.2.0
```

## 资源和链接

- [TypeScript 文档](https://www.typescriptlang.org/)
- [MCP SDK 文档](https://modelcontextprotocol.io/)
- [abap-adt-api 文档](https://github.com/marcellourbani/abap-adt-api/)
- [Node.js 最佳实践](https://nodejs.org/en/docs/guides/)

## 获取帮助

- 查看现有 Handler 作为参考
- 使用 MCP Inspector 测试工具
- 查看 [架构文档](architecture.md) 了解整体设计
- 在 GitHub 提交 Issue
