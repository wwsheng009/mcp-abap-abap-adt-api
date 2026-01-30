# Legacy Stdio Bridge 协议保护机制

## 📋 问题背景

在使用 `legacy-stdio-bridge.ts` 作为 MCP 协议网关时，客户端初始化失败并报错：

```
calling "initialize": invalid message version tag ""; expected "2.0"
```

## 🔍 问题根源

### 1. 协议字段删除（直接原因）
Bridge 错误地删除了 JSON-RPC 响应中的 `jsonrpc` 字段，导致客户端收到的消息格式不符合 JSON-RPC 2.0 规范。

### 2. 子进程环境变量缺失（深层原因）
Bridge 启动子进程时，**没有传递关键的环境变量**：

```typescript
// ❌ 错误做法
const child = spawn(process.execPath, [SERVER_ENTRY], {
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env  // 继承了父进程环境变量，但 bridge 自己没设置 MCP_STDIO_MODE
})
```

**问题链**：
1. Bridge 没有设置 `MCP_STDIO_MODE = 'true'`
2. 子进程收到未设置的环境变量
3. 子进程的 logger 不知道自己在 MCP stdio 模式下
4. 子进程可能向 stdout 输出日志或其他输出
5. 这些输出通过 `child.stdout` 传回 bridge
6. Bridge 没有过滤，直接转发给客户端
7. 客户端收到非 JSON-RPC 消息，解析失败

### 3. Bridge 转换逻辑不匹配
- **设计假设**：客户端使用"旧格式"（无 `jsonrpc` 字段），需要添加
- **实际情况**：客户端和服务器都使用标准 JSON-RPC 2.0 格式，无需转换

### 4. 日志污染问题（已解决）
在修复过程中发现，日志系统可能会向 stdout 输出非协议消息，导致 MCP stdio 通信被污染。已通过以下机制解决：

- **Runtime Mode Detection**: 自动检测运行模式（CLI/HTTP/MCP_STDIO）
- **Stdout Firewall**: 在 MCP stdio 模式下拦截非 JSON-RPC 消息
- **Safe Logger**: 根据运行模式自动禁用 console 输出

## ✅ 解决方案

### 核心修复 1：保留 jsonrpc 字段
修改 `legacy-stdio-bridge.ts`，直接转发完整的 JSON-RPC 消息，保留 `jsonrpc: "2.0"` 字段：

```typescript
// 修改前（错误）
if (msg.jsonrpc === "2.0") delete msg.jsonrpc
const output = JSON.stringify(msg) + "\n"
process.stdout.write(output)

// 修改后（正确）
// 直接转发，保持完整的 JSON-RPC 格式
const output = JSON.stringify(msg) + "\n"
process.stdout.write(output)
```

### 核心修复 2：设置子进程环境变量
为子进程传递正确的环境变量，防止日志污染协议通道：

```typescript
// ❌ 错误做法
const child = spawn(process.execPath, [SERVER_ENTRY], {
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env  // 继承了父进程环境变量，但 bridge 自己没设置 MCP_STDIO_MODE
})

// ✅ 正确做法
const child = spawn(process.execPath, [SERVER_ENTRY], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    MCP_STDIO_MODE: 'true',  // 子进程知道自己运行在 MCP stdio 模式
    LOG_CONSOLE: 'false',    // 禁用 console 输出
    LOG_FILE: 'true'         // 启用文件日志
  }
})
```

### 辅助保护措施

#### 1. Runtime Mode Detection (`src/lib/runtimeMode.ts`)
```typescript
export enum RuntimeMode {
  CLI = "cli",
  HTTP = "http",
  MCP_STDIO = "mcp_stdio",
}

export function detectRuntimeMode(): RuntimeMode {
  if (process.env.MCP_STDIO_MODE === "true") return RuntimeMode.MCP_STDIO
  if (process.env.HTTP_MODE === "true") return RuntimeMode.HTTP
  return RuntimeMode.CLI
}
```

#### 2. Stdout Firewall (`src/lib/stdioFirewall.ts`)
```typescript
export function protectStdout(): void {
  const mode = detectRuntimeMode();
  if (mode !== RuntimeMode.MCP_STDIO) return;

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);

  process.stdout.write = ((chunk: any, ...args: any[]) => {
    if (typeof chunk === "string") {
      const trimmed = chunk.trimStart();
      // 只允许 JSON-RPC 消息通过
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return originalStdoutWrite(chunk, ...args);
      }
      return true;
    }
    return originalStdoutWrite(chunk, ...args);
  }) as any;
}
```

#### 3. Logger 协议感知 (`src/lib/logger.ts`)
在 MCP stdio 模式下，日志自动写入文件而非 console：

```typescript
function log(level: LogLevel, name: string, message: string, meta?: Record<string, unknown>) {
  const stdioMode = isMcpStdioMode();
  if (stdioMode) {
    const stream = initLogFile();
    if (stream) stream.write(logString + '\n');
    return;
  }
  // 非 stdio 模式输出到 console
  console.error(logString);
}
```

#### 4. 程序入口保护 (`src/index.ts`)
```typescript
process.env.MCP_STDIO_MODE = 'true';
protectStdout();
process.env.LOG_CONSOLE = 'false';
process.env.LOG_STDIO = 'false';
process.env.LOG_FILE = 'true';
```

## 📝 处理过程

### 阶段 1：错误诊断
1. 收集日志文件 `logs/bridge-2026-01-29.log`
2. 分析消息流：客户端请求 → bridge 转发 → 服务器响应 → bridge 回传
3. 发现 bridge 删除了 `jsonrpc` 字段，导致客户端无法解析

### 阶段 2：修复实施
1. **修复 1**：修改 `legacy-stdio-bridge.ts`，移除删除 `jsonrpc` 字段的逻辑
2. **修复 2**：为子进程设置正确的环境变量（`MCP_STDIO_MODE: 'true'`）
3. 验证日志系统，确保不会污染 stdout
4. 重新构建项目：`npm run build`

### 阶段 3：验证测试
- 客户端成功初始化
- JSON-RPC 消息正常传输
- 日志正确写入文件，未污染 stdout

## ⚠️ 重要注意事项

### 1. MCP stdio 铁律
> **stdout 只能出现 MCP JSON-RPC 消息**
>
> 任何日志、空行、BOM、调试输出 = 协议损坏

### 2. Bridge 的正确职责
- **协议转换**：在需要时转换消息格式（如添加/删除 `jsonrpc` 字段）
- **消息转发**：在不需要转换时直接透传
- **日志隔离**：使用文件日志，绝不向 stdout 输出
- **环境变量传递**：为子进程设置正确的运行模式环境变量

### 3. 子进程环境变量设置（关键！）
启动子进程时，必须传递正确的环境变量：

```typescript
const child = spawn(process.execPath, [SERVER_ENTRY], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    MCP_STDIO_MODE: 'true',  // 必须！否则子进程日志会污染协议通道
    LOG_CONSOLE: 'false',    // 禁用 console 输出
    LOG_FILE: 'true'         // 启用文件日志
  }
})
```

**如果不设置这些环境变量**：
- 子进程不知道自己运行在 MCP stdio 模式下
- 子进程的 logger 可能向 stdout 输出日志
- 这些日志通过 `child.stdout` 传回 bridge
- Bridge 转发给客户端，导致协议解析失败

### 4. 协议格式判断
在实现协议转换时，必须根据**实际客户端行为**而非假设：
- 观察客户端发送的请求格式
- 观察服务器返回的响应格式
- 判断是否需要转换，而非盲目删除字段

### 5. 日志系统要求
在 MCP stdio 模式下：
- ✅ 使用文件日志：`process.env.LOG_FILE = 'true'`
- ✅ 禁用 console 输出：`process.env.LOG_CONSOLE = 'false'`
- ✅ 启用 stdout 防火墙：`protectStdout()`
- ❌ 绝不使用 `console.log/error/warn` 向 stdout 输出

### 6. 运行模式检测
在程序入口明确设置运行模式：
```typescript
// MCP Server 入口
process.env.MCP_STDIO_MODE = 'true'

// HTTP Server 入口
process.env.HTTP_MODE = 'true'

// CLI 工具入口
// 不设置任何环境变量，默认为 CLI 模式
```

## 🧪 验证清单

修复后，确保以下检查项全部通过：

- [ ] 客户端成功初始化，无 `version tag ""` 错误
- [ ] JSON-RPC 消息正确传输（包含 `jsonrpc: "2.0"` 字段）
- [ ] 日志文件 `logs/bridge-YYYY-MM-DD.log` 正常写入
- [ ] `console` 无任何输出（stdout 干净）
- [ ] stderr 被正确丢弃或写入日志文件
- [ ] 多次调用正常，无随机失败

## 📚 相关文档

- [网关转换.md](../src/网关转换.md) - 详细的架构分析和设计思路
- [MCP Protocol Specification](https://modelcontextprotocol.io/) - JSON-RPC 2.0 协议规范
- [Stdio Transport](https://modelcontextprotocol.io/docs/concepts/transports/) - MCP stdio 传输层说明

## 🔧 相关文件

- `src/legacy-stdio-bridge.ts` - 协议桥接主文件
- `src/lib/runtimeMode.ts` - 运行模式检测
- `src/lib/stdioFirewall.ts` - stdout 协议防火墙
- `src/lib/logger.ts` - 协议感知日志系统
- `src/lib/structuredLogger.ts` - 结构化日志实现
- `src/index.ts` - MCP Server 入口

## 📊 效果对比

| 指标 | 修复前 | 修复后 |
|-----|-------|-------|
| 客户端初始化 | ❌ 失败：version tag "" | ✅ 成功 |
| 消息传输 | ❌ 协议不兼容 | ✅ 完全兼容 |
| 日志输出 | ⚠️ 可能污染 stdout | ✅ 完全隔离到文件 |
| 稳定性 | ⚠️ 随机失败 | ✅ 长期稳定 |
| 可维护性 | ❌ 需要手动配置 | ✅ 自动检测保护 |
