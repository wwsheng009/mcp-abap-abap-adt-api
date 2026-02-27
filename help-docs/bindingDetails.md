# bindingDetails

## 功能说明
获取OData服务绑定的详细信息，包括配置状态、访问URL、端点信息等。该工具用于查询服务绑定的完整配置和运行时状态。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "bindingDetails",
  "arguments": {
    "binding": {
      "name": "ZMY_SERVICE",
      "version": "0001"
    },
    "index": 0
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "details": {
    "name": "ZMY_SERVICE",
    "version": "0001",
    "status": "published",
    "serviceUrl": "/sap/opu/odata/sap/ZMY_SERVICE_SRV",
    "metadataUrl": "/sap/opu/odata/sap/ZMY_SERVICE_SRV/$metadata",
    "technicalName": "ZMY_SERVICE_SRV",
    "package": "Z_MY_PACKAGE",
    "transport": "<TRANSPORT_NUMBER>",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastModifiedAt": "2024-01-30T14:30:00Z",
    "lastModifiedBy": "DEVELOPER01",
    "activeConnections": 5
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| binding | object | 是 | 服务绑定对象，包含name和version属性 |
| binding.name | string | 是 | 服务绑定的名称 |
| binding.version | string | 是 | 服务绑定的版本号 |
| index | number | 否 | 服务绑定在列表中的索引（用于多个绑定的情况） |

## 注意事项

⚠️ **重要提示：**
1. `binding`对象可以是从其他工具返回的服务绑定对象
2. 如果有多个同名服务，使用`index`参数指定具体的服务
3. 返回的详细信息包括技术配置和运行时状态
4. 某些敏感信息可能不会在返回结果中显示

## 参数限制

- `binding`参数：必须包含有效的name和version属性
- `index`参数：可选，范围为0到服务绑定列表长度-1

## 与其他工具的关联性

- **publishServiceBinding** - 在发布前使用此工具验证服务配置
- **unPublishServiceBinding** - 在取消发布前检查服务状态
- **searchObject** - 搜索服务绑定对象
- **objectTypes** - 查询OData服务绑定的对象类型

## 使用场景说明

### 场景1：查询服务配置信息
```json
{
  "binding": {
    "name": "ZMY_SERVICE",
    "version": "0001"
  }
}
```

### 场景2：检查服务发布状态
```json
{
  "binding": {
    "name": "ZPRODUCTION_SRV",
    "version": "0003"
  },
  "index": 0
}
```

### 场景3：获取服务端点信息
```json
{
  "binding": {
    "name": "ZAPI_SRV",
    "version": "0002"
  }
}
```

## 最佳实践

✅ **推荐做法：**
1. 在发布服务前使用此工具验证配置
2. 定期检查服务的运行时状态和连接数
3. 记录服务详情以便审计和追踪
4. 使用返回的URL测试服务可访问性
5. 在取消发布前检查活动连接数

❌ **避免做法：**
1. 不要频繁调用此工具，避免对系统造成性能影响
2. 避免依赖未记录的字段，因为返回结构可能变化

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Service binding not found" | 服务绑定不存在 | 检查服务名称、版本号和索引是否正确 |
| "Invalid binding object" | binding对象格式错误 | 确保binding包含name和version属性 |
| "Index out of range" | 索引超出范围 | 检查index参数是否有效 |
| "Authorization failed" | 缺少必要权限 | 联系管理员授予查看权限 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Service binding not found",
    "details": {
      "name": "ZMY_SERVICE",
      "version": "0001",
      "index": 0
    }
  }
}
```

## 高级用法

### 1. 服务健康检查
```javascript
async function checkServiceHealth(binding) {
  const details = await bindingDetails({ binding });
  
  const health = {
    name: details.name,
    version: details.version,
    status: details.status,
    available: details.status === "published",
    activeConnections: details.activeConnections,
    lastModified: details.lastModifiedAt,
    url: details.serviceUrl
  };
  
  // 检查是否超过阈值
  if (details.activeConnections > 100) {
    health.warning = "High number of active connections";
  }
  
  return health;
}
```

### 2. 服务目录生成
```javascript
async function generateServiceCatalog(bindings) {
  const catalog = [];
  
  for (const binding of bindings) {
    const details = await bindingDetails({ binding });
    
    catalog.push({
      name: details.name,
      version: details.version,
      url: details.serviceUrl,
      metadata: details.metadataUrl,
      package: details.package,
      status: details.status,
      lastModified: details.lastModifiedAt
    });
  }
  
  return catalog;
}
```

### 3. 服务迁移前的检查
```javascript
async function preMigrationCheck(binding) {
  const details = await bindingDetails({ binding });
  
  const checks = {
    status: details.status,
    activeConnections: details.activeConnections,
    package: details.package,
    transport: details.transport,
    lastModified: details.lastModifiedAt
  };
  
  // 评估是否可以迁移
  if (details.activeConnections > 0) {
    checks.canMigrate = false;
    checks.message = "Active connections exist, wait for them to close";
  } else if (details.status !== "published") {
    checks.canMigrate = true;
    checks.message = "Service is not published, safe to migrate";
  } else {
    checks.canMigrate = true;
    checks.message = "Service is ready for migration";
  }
  
  return checks;
}
```

### 4. 批量服务状态监控
```javascript
const servicesToMonitor = [
  { name: "ZSERVICE_01", version: "0001" },
  { name: "ZSERVICE_02", version: "0001" },
  { name: "ZSERVICE_03", version: "0001" }
];

async function monitorServices(services) {
  const report = [];
  
  for (const service of services) {
    const details = await bindingDetails({ binding: service });
    
    report.push({
      name: service.name,
      version: service.version,
      status: details.status,
      connections: details.activeConnections,
      lastModified: details.lastModifiedAt,
      health: details.activeConnections > 50 ? "warning" : "ok"
    });
  }
  
  return report;
}
```

## 示例

### 示例1：查询简单服务详情
```json
{
  "tool": "bindingDetails",
  "arguments": {
    "binding": {
      "name": "ZHELLO_WORLD_SRV",
      "version": "0001"
    }
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "details": {
    "name": "ZHELLO_WORLD_SRV",
    "version": "0001",
    "status": "published",
    "serviceUrl": "/sap/opu/odata/sap/ZHELLO_WORLD_SRV",
    "metadataUrl": "/sap/opu/odata/sap/ZHELLO_WORLD_SRV/$metadata",
    "technicalName": "ZHELLO_WORLD_SRV",
    "package": "Z_HELLO_PKG",
    "createdAt": "2024-01-15T09:00:00Z",
    "lastModifiedAt": "2024-01-15T09:00:00Z",
    "lastModifiedBy": "DEVELOPER01",
    "activeConnections": 0
  }
}
```

### 示例2：查询业务服务详情
```json
{
  "tool": "bindingDetails",
  "arguments": {
    "binding": {
      "name": "ZSALES_ORDER_SRV",
      "version": "0002"
    },
    "index": 0
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "details": {
    "name": "ZSALES_ORDER_SRV",
    "version": "0002",
    "status": "published",
    "serviceUrl": "/sap/opu/odata/sap/ZSALES_ORDER_SRV",
    "metadataUrl": "/sap/opu/odata/sap/ZSALES_ORDER_SRV/$metadata",
    "technicalName": "ZSALES_ORDER_SRV",
    "package": "Z_SALES_PKG",
    "transport": "<TRANSPORT_NUMBER>",
    "businessContext": "Sales Management",
    "createdAt": "2024-01-10T10:00:00Z",
    "lastModifiedAt": "2024-01-28T16:30:00Z",
    "lastModifiedBy": "DEVELOPER02",
    "activeConnections": 23,
    "endpoints": [
      {
        "name": "SalesOrder",
        "path": "/SalesOrderSet",
        "methods": ["GET", "POST", "PUT", "DELETE"]
      },
      {
        "name": "SalesOrderItem",
        "path": "/SalesOrderItemSet",
        "methods": ["GET", "POST", "PUT", "DELETE"]
      }
    ]
  }
}
```

### 示例3：查询未发布的服务
```json
{
  "tool": "bindingDetails",
  "arguments": {
    "binding": {
      "name": "ZDRAFT_SRV",
      "version": "0001"
    }
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "details": {
    "name": "ZDRAFT_SRV",
    "version": "0001",
    "status": "configured",
    "serviceUrl": null,
    "metadataUrl": null,
    "technicalName": "ZDRAFT_SRV",
    "package": "Z_DRAFT_PKG",
    "createdAt": "2024-01-29T11:00:00Z",
    "lastModifiedAt": "2024-01-29T11:00:00Z",
    "lastModifiedBy": "DEVELOPER03",
    "activeConnections": 0,
    "readyForPublish": true,
    "warnings": []
  }
}
```

### 示例4：发布前验证流程
```javascript
async function validateBeforePublish(name, version) {
  console.log(`Validating service ${name} version ${version}...`);
  
  // 1. 获取服务详情
  const details = await bindingDetails({
    binding: { name, version }
  });
  
  console.log("Service Details:");
  console.log(`  - Name: ${details.name}`);
  console.log(`  - Version: ${details.version}`);
  console.log(`  - Status: ${details.status}`);
  console.log(`  - Package: ${details.package}`);
  console.log(`  - Transport: ${details.transport}`);
  
  // 2. 验证状态
  if (details.status === "published") {
    console.warn("⚠️  Service is already published");
    return false;
  }
  
  // 3. 检查配置完整性
  if (!details.package || !details.transport) {
    console.error("❌ Service configuration incomplete");
    return false;
  }
  
  // 4. 检查是否有警告
  if (details.warnings && details.warnings.length > 0) {
    console.warn("Warnings:");
    details.warnings.forEach(w => console.warn(`  - ${w}`));
  }
  
  // 5. 验证通过
  console.log("✅ Service is ready for publishing");
  return true;
}

// 使用示例
const isValid = await validateBeforePublish("ZMY_SERVICE", "0001");
if (isValid) {
  await publishServiceBinding({ name: "ZMY_SERVICE", version: "0001" });
}
```

---

## 相关工具

- [publishServiceBinding](publishServiceBinding.md) - 发布服务绑定
- [unPublishServiceBinding](unPublishServiceBinding.md) - 取消发布服务绑定
- [searchObject](searchObject.md) - 搜索服务绑定对象
- [objectTypes](objectTypes.md) - 查询对象类型信息
