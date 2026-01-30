# unPublishServiceBinding

## 功能说明
取消发布OData服务绑定，使服务不再对外可用。该工具用于停用已发布的ABAP服务绑定，停止外部系统的访问。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "unPublishServiceBinding",
  "arguments": {
    "name": "ZMY_SERVICE",
    "version": "0001"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "status": "unpublished",
    "serviceUrl": "/sap/opu/odata/sap/ZMY_SERVICE",
    "timestamp": "2024-01-30T10:30:00Z"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 服务绑定的名称，通常以"Z"或"Y"开头表示自定义服务 |
| version | string | 是 | 服务绑定的版本号，通常为4位数字（如"0001"） |

## 注意事项

⚠️ **重要提示：**
1. 取消发布后，所有外部系统将无法访问该服务
2. 确保没有正在进行的业务操作依赖该服务
3. 建议在业务低峰期执行取消发布操作
4. 取消发布不会删除服务配置，只是停止对外访问
5. 需要相应的权限才能取消发布服务

## 参数限制

- `name`参数：长度不超过30个字符，必须符合ABAP命名规范
- `version`参数：必须为4位数字字符串（"0001"-"9999"）

## 与其他工具的关联性

- **publishServiceBinding** - 使用此工具重新发布服务
- **bindingDetails** - 在取消发布前可查看服务绑定详情
- **searchObject** - 搜索服务绑定对象以确认存在

## 使用场景说明

### 场景1：停用过时的服务
```json
{
  "name": "ZLEGACY_SERVICE",
  "version": "0001"
}
```

### 场景2：临时维护停用
```json
{
  "name": "ZMAINTENANCE_SRV",
  "version": "0005"
}
```

### 场景3：切换到新版本前停用旧版本
```json
{
  "name": "ZAPI_V1",
  "version": "0001"
}
```

## 最佳实践

✅ **推荐做法：**
1. 在取消发布前通知所有服务消费者
2. 检查是否有活动连接或正在进行的请求
3. 在业务低峰期执行取消发布操作
4. 记录取消发布日志，便于审计和追踪
5. 保留服务配置以便后续重新发布

❌ **避免做法：**
1. 不要在业务高峰期取消发布关键服务
2. 避免未经通知直接取消发布生产服务
3. 不要取消发布正在迁移的服务

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Service binding not found" | 服务绑定不存在 | 检查服务名称和版本号是否正确 |
| "Authorization failed" | 缺少必要权限 | 联系管理员授予取消发布权限 |
| "Service not published" | 服务未发布 | 无需取消发布，服务当前已停用 |
| "Active connections exist" | 存在活动连接 | 等待所有连接结束后再取消发布 |
| "Invalid version format" | 版本号格式错误 | 使用4位数字字符串格式 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Cannot unpublish service with active connections",
    "details": "Please wait for all active connections to close",
    "activeConnections": 3
  }
}
```

## 高级用法

### 1. 安全的取消发布流程
```javascript
async function safeUnpublishService(name, version) {
  try {
    // 1. 检查服务状态
    const details = await bindingDetails({ name, version });
    
    if (details.status !== "published") {
      console.log("Service is not published");
      return;
    }
    
    // 2. 通知相关方
    await notifyConsumers({ name, version, action: "unpublish" });
    
    // 3. 等待活动连接结束
    await waitForNoConnections({ name, version });
    
    // 4. 取消发布
    const result = await unPublishServiceBinding({ name, version });
    
    console.log("Service unpublished successfully");
    return result;
  } catch (error) {
    console.error("Failed to unpublish:", error);
    throw error;
  }
}
```

### 2. 版本切换流程
```javascript
// 切换从V1到V2
async function switchServiceVersion(serviceName) {
  const v1 = { name: serviceName, version: "0001" };
  const v2 = { name: serviceName, version: "0002" };
  
  try {
    // 1. 发布新版本
    await publishServiceBinding(v2);
    console.log("V2 published");
    
    // 2. 等待验证
    await validateService(v2);
    
    // 3. 取消发布旧版本
    await unPublishServiceBinding(v1);
    console.log("V1 unpublished");
    
    console.log("Version switch completed");
  } catch (error) {
    console.error("Version switch failed:", error);
    throw error;
  }
}
```

### 3. 批量取消发布
```javascript
const servicesToUnpublish = [
  { name: "ZLEGACY_01", version: "0001" },
  { name: "ZLEGACY_02", version: "0001" },
  { name: "ZLEGACY_03", version: "0001" }
];

for (const service of servicesToUnpublish) {
  try {
    await unPublishServiceBinding(service);
    console.log(`Unpublished ${service.name}`);
  } catch (error) {
    console.error(`Failed to unpublish ${service.name}:`, error);
  }
}
```

## 示例

### 示例1：取消发布过时服务
```json
{
  "tool": "unPublishServiceBinding",
  "arguments": {
    "name": "ZOLD_API_SRV",
    "version": "0001"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "status": "unpublished",
    "serviceUrl": "/sap/opu/odata/sap/ZOLD_API_SRV",
    "timestamp": "2024-01-30T15:20:00Z",
    "message": "Service has been successfully unpublished"
  }
}
```

### 示例2：取消发布维护中的服务
```json
{
  "tool": "unPublishServiceBinding",
  "arguments": {
    "name": "ZMAINTENANCE_SRV",
    "version": "0003"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "status": "unpublished",
    "serviceUrl": "/sap/opu/odata/sap/ZMAINTENANCE_SRV",
    "reason": "Scheduled maintenance",
    "scheduledRestoreTime": "2024-01-30T20:00:00Z",
    "timestamp": "2024-01-30T15:30:00Z"
  }
}
```

### 示例3：完整的停用流程
```javascript
// 1. 检查服务状态
const serviceDetails = await bindingDetails({
  name: "ZMY_SERVICE",
  index: 0
});

if (serviceDetails.status !== "published") {
  console.log("Service is already unpublished");
  process.exit(0);
}

// 2. 检查活动连接
const connectionCount = serviceDetails.activeConnections || 0;
if (connectionCount > 0) {
  console.log(`Waiting for ${connectionCount} active connections to close...`);
  await sleep(60000); // 等待60秒
}

// 3. 取消发布
const unpublishResult = await unPublishServiceBinding({
  name: "ZMY_SERVICE",
  version: serviceDetails.version
});

console.log("Unpublish Result:", unpublishResult);

if (unpublishResult.status === "success") {
  console.log("Service unpublished successfully");
  console.log("You can now republish it later using publishServiceBinding");
}
```

### 示例4：带确认的取消发布
```javascript
async function unpublishWithConfirmation(name, version) {
  // 1. 获取服务详情
  const details = await bindingDetails({ name, version });
  
  // 2. 显示警告信息
  console.warn(`
⚠️  WARNING: You are about to unpublish service ${name} version ${version}
This action will:
  - Stop all external access to this service
  - Interrupt any ongoing operations
  - Affect all dependent systems
  
Service Details:
  - Name: ${details.name}
  - Version: ${details.version}
  - URL: ${details.serviceUrl}
  - Active Connections: ${details.activeConnections || 0}
  
Are you sure you want to continue? (yes/no)
  `);
  
  // 3. 确认后执行
  const confirmation = await prompt();
  if (confirmation.toLowerCase() === 'yes') {
    const result = await unPublishServiceBinding({ name, version });
    console.log("Service unpublished:", result.status);
    return result;
  } else {
    console.log("Operation cancelled");
    return null;
  }
}
```

---

## 相关工具

- [publishServiceBinding](publishServiceBinding.md) - 发布服务绑定
- [bindingDetails](bindingDetails.md) - 获取服务绑定详情
- [searchObject](searchObject.md) - 搜索服务绑定对象
- [objectTypes](objectTypes.md) - 查询对象类型信息
