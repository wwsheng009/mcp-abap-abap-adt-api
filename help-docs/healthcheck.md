# healthcheck - 服务器健康检查

## 功能说明

`healthcheck` 工具用于检查 MCP 服务器的健康状态和运行状况。这是一个轻量级的检查工具，用于验证服务器是否正常运行。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("healthcheck", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的健康状态：

```json
{
  "status": "healthy",
  "timestamp": "2024-01-30T10:30:00.000Z"
}
```

## 注意事项

1. 此工具不检查与 ABAP 系统的连接状态
2. 健康检查仅验证 MCP 服务器本身的运行状态
3. 返回时间戳使用 ISO 8601 格式
4. 此工具始终可用，不受工具组配置影响

## 参数限制

无。

## 与其他工具的关联性

- 与 `login` 工具配合使用，先检查服务器状态再建立连接
- 可用于监控和自动化场景

## 使用场景说明

1. **连接测试**: 在开始使用其他工具前验证服务器状态
2. **监控集成**: 将健康检查集成到监控系统中
3. **负载均衡**: 在负载均衡器中使用健康检查
4. **故障排查**: 作为故障排查的第一步

## 最佳实践

1. 在建立连接前调用健康检查
2. 定期执行健康检查以确保服务器可用性
3. 将健康检查结果记录到日志中
4. 根据健康检查结果决定是否继续执行操作

## 错误处理

正常情况下不应返回错误。如果调用失败，说明：
- MCP 服务器未运行
- 服务器内部错误
- 网络连接问题

## 高级用法

```typescript
// 定期健康检查
async function monitorHealth(interval = 60000) {
  setInterval(async () => {
    try {
      const result = await mcp.callTool("healthcheck", {});
      console.log(`[${new Date().toISOString()}] Server status: ${result.status}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Health check failed:`, error);
    }
  }, interval);
}

// 带重试的健康检查
async function healthCheckWithRetry(maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await mcp.callTool("healthcheck", {});
      return result;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 集成到初始化流程
async function initializeServer() {
  console.log('Checking server health...');
  const health = await mcp.callTool("healthcheck", {});
  
  if (health.status === 'healthy') {
    console.log('Server is healthy. Proceeding with initialization...');
    // 继续初始化流程
  } else {
    console.error('Server is not healthy. Aborting initialization.');
    throw new Error('Server unhealthy');
  }
}

// 健康检查日志记录
async function healthCheckWithLogging() {
  const startTime = Date.now();
  const result = await mcp.callTool("healthcheck", {});
  const duration = Date.now() - startTime;
  
  console.log({
    timestamp: new Date().toISOString(),
    healthStatus: result.status,
    checkDuration: `${duration}ms`,
    serverTimestamp: result.timestamp
  });
  
  return result;
}
```

## 示例

```typescript
// 基本健康检查
const health = await mcp.callTool("healthcheck", {});

console.log(`服务器状态: ${health.status}`);
console.log(`时间戳: ${health.timestamp}`);

// 检查服务器是否健康
if (health.status === 'healthy') {
  console.log('服务器运行正常，可以继续使用其他工具');
} else {
  console.error('服务器状态异常');
}

// 计算响应时间
const startTime = Date.now();
await mcp.callTool("healthcheck", {});
const responseTime = Date.now() - startTime;

console.log(`响应时间: ${responseTime}ms`);
```

## 监控指标

虽然健康检查只返回基本状态，但可以结合以下指标进行监控：

1. **可用性**: 健康检查是否成功
2. **响应时间**: 健康检查的响应时间
3. **一致性**: 健康状态是否持续一致
4. **时间准确性**: 返回的时间戳是否准确

## 告警规则

建议设置以下告警规则：

1. **健康检查失败**: 立即告警
2. **响应时间超过阈值**: 警告（如 > 1000ms）
3. **连续失败**: 累计失败次数达到阈值时告警

## 与外部系统集成

```typescript
// Prometheus 格式导出
async function exportPrometheusMetrics() {
  const health = await mcp.callTool("healthcheck", {});
  const isHealthy = health.status === 'healthy' ? 1 : 0;
  
  return `# HELP abap_adt_server_health Health status of ABAP ADT MCP server
# TYPE abap_adt_server_health gauge
abap_adt_server_health ${isHealthy}
`;
}

// JSON 格式导出（用于 Web API）
async function exportJsonMetrics() {
  const health = await mcp.callTool("healthcheck", {});
  return {
    server: "abap-adt-mcp",
    status: health.status,
    timestamp: health.timestamp,
    checkedAt: new Date().toISOString()
  };
}
```

## 注意事项总结

- ✓ 健康检查是轻量级的，不应频繁调用
- ✓ 健康检查结果仅反映服务器状态，不包括 ABAP 系统状态
- ✗ 不要使用健康检查替代完整的连接测试
- ✗ 健康检查失败不代表 ABAP 系统不可用，可能是 MCP 服务器问题
- ✗ 健康检查成功不代表 ABAP 系统连接正常
