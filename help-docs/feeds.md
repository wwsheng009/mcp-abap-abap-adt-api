# feeds

## 功能说明
获取系统中可用的Feed（信息源）列表。Feed是SAP系统中用于收集和组织系统事件、通知和信息的机制，包括错误日志、警告消息、性能数据等。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "feeds",
  "arguments": {}
}
```

### 返回结果
```json
{
  "status": "success",
  "feeds": [
    {
      "id": "feed_001",
      "name": "Error Log",
      "description": "System error messages and exceptions",
      "type": "errors",
      "category": "logging"
    },
    {
      "id": "feed_002",
      "name": "Performance Monitor",
      "description": "Performance and response time data",
      "type": "performance",
      "category": "monitoring"
    },
    {
      "id": "feed_003",
      "name": "Security Events",
      "description": "Security-related events and alerts",
      "type": "security",
      "category": "security"
    }
  ]
}
```

## 参数说明

此工具不需要任何参数。

## 注意事项

⚠️ **重要提示：**
1. 不同系统可能有不同的Feed配置
2. Feed列表的顺序不代表优先级
3. 某些Feed可能需要特定权限才能访问
4. Feed内容可能需要使用其他工具获取详细信息
5. Feed列表可能随系统配置变化而更新

## 参数限制

无参数限制。

## 与其他工具的关联性

- **dumps** - 获取系统转储信息，可能与某些Feed相关
- **healthcheck** - 检查系统健康状态，可结合Feed信息使用
- **inactiveObjects** - 查询未激活对象，可能与Feed中的警告相关

## 使用场景说明

### 场景1：获取系统可用的信息源
```json
{}
```

### 场景2：监控系统状态
在系统维护或故障排查时，先获取Feed列表了解可用的监控信息源。

### 场景3：自动化监控脚本
编写监控脚本时，先查询Feed列表，然后针对性地获取相关Feed的内容。

## 最佳实践

✅ **推荐做法：**
1. 定期查询Feed列表，了解系统配置变化
2. 将Feed列表信息记录到日志中，便于追踪
3. 根据业务需求选择相关的Feed进行监控
4. 结合其他工具（如dumps）获取详细信息
5. 对Feed信息进行分类和分析

❌ **避免做法：**
1. 不要过度频繁调用此工具
2. 避免忽略权限检查
3. 不要假设Feed列表固定不变

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Authorization failed" | 缺少查看Feed的权限 | 联系管理员授予相应权限 |
| "Service unavailable" | Feed服务不可用 | 检查系统状态或稍后重试 |
| "No feeds configured" | 系统未配置Feed | 联系管理员配置Feed服务 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "AUTHORIZATION_FAILED",
    "message": "No authorization to access feeds",
    "details": {
      "requiredAuth": "S_FEED_READ",
      "missingAuth": true
    }
  }
}
```

## 高级用法

### 1. Feed分析和分类
```javascript
async function analyzeFeeds() {
  const result = await feeds();
  
  // 按类型分类
  const byType = {};
  const byCategory = {};
  
  result.feeds.forEach(feed => {
    // 按类型分类
    if (!byType[feed.type]) {
      byType[feed.type] = [];
    }
    byType[feed.type].push(feed);
    
    // 按类别分类
    if (!byCategory[feed.category]) {
      byCategory[feed.category] = [];
    }
    byCategory[feed.category].push(feed);
  });
  
  return {
    totalFeeds: result.feeds.length,
    byType,
    byCategory,
    feeds: result.feeds
  };
}
```

### 2. Feed健康检查
```javascript
async function checkFeedHealth() {
  const result = await feeds();
  
  const healthReport = {
    total: result.feeds.length,
    active: 0,
    inactive: 0,
    status: "healthy"
  };
  
  // 假设Feed有active状态属性
  result.feeds.forEach(feed => {
    if (feed.active) {
      healthReport.active++;
    } else {
      healthReport.inactive++;
    }
  });
  
  if (healthReport.inactive > healthReport.active) {
    healthReport.status = "warning";
  }
  
  return healthReport;
}
```

### 3. Feed内容监控
```javascript
async function monitorFeeds(targetTypes) {
  const result = await feeds();
  
  // 筛选目标类型的Feed
  const targetFeeds = result.feeds.filter(feed => 
    targetTypes.includes(feed.type)
  );
  
  console.log(`Monitoring ${targetFeeds.length} feeds of types: ${targetTypes.join(', ')}`);
  
  // 这里可以进一步获取每个Feed的内容
  // 例如使用dumps工具获取错误转储
  
  return targetFeeds;
}
```

### 4. Feed变更通知
```javascript
let previousFeeds = [];

async function checkForNewFeeds() {
  const result = await feeds();
  const currentFeeds = result.feeds;
  
  const newFeeds = currentFeeds.filter(feed => 
    !previousFeeds.find(prev => prev.id === feed.id)
  );
  
  const removedFeeds = previousFeeds.filter(prev => 
    !currentFeeds.find(curr => curr.id === prev.id)
  );
  
  if (newFeeds.length > 0) {
    console.log("New feeds detected:");
    newFeeds.forEach(feed => console.log(`  - ${feed.name} (${feed.id})`));
  }
  
  if (removedFeeds.length > 0) {
    console.warn("Feeds removed:");
    removedFeeds.forEach(feed => console.warn(`  - ${feed.name} (${feed.id})`));
  }
  
  previousFeeds = currentFeeds;
  
  return { newFeeds, removedFeeds };
}
```

## 示例

### 示例1：获取Feed列表
```json
{
  "tool": "feeds",
  "arguments": {}
}
```

**预期结果：**
```json
{
  "status": "success",
  "feeds": [
    {
      "id": "feed_001",
      "name": "Error Log",
      "description": "System error messages and exceptions",
      "type": "errors",
      "category": "logging",
      "enabled": true
    },
    {
      "id": "feed_002",
      "name": "Performance Monitor",
      "description": "Performance and response time data",
      "type": "performance",
      "category": "monitoring",
      "enabled": true
    },
    {
      "id": "feed_003",
      "name": "Security Events",
      "description": "Security-related events and alerts",
      "type": "security",
      "category": "security",
      "enabled": true
    },
    {
      "id": "feed_004",
      "name": "Business Events",
      "description": "Business process events and notifications",
      "type": "business",
      "category": "business",
      "enabled": true
    }
  ]
}
```

### 示例2：监控特定类型的Feed
```javascript
async function monitorErrorFeeds() {
  const result = await feeds();
  
  // 筛选错误类型的Feed
  const errorFeeds = result.feeds.filter(feed => 
    feed.type === "errors" || feed.category === "logging"
  );
  
  console.log(`Found ${errorFeeds.length} error-related feeds:`);
  errorFeeds.forEach(feed => {
    console.log(`  - ${feed.name}: ${feed.description}`);
  });
  
  // 可以进一步获取这些Feed的详细内容
  // 例如使用dumps工具获取系统转储信息
  
  return errorFeeds;
}

// 使用示例
const errorFeeds = await monitorErrorFeeds();
console.log(errorFeeds);
```

### 示例3：Feed配置分析
```javascript
async function analyzeFeedConfiguration() {
  const result = await feeds();
  
  const analysis = {
    totalFeeds: result.feeds.length,
    enabledCount: 0,
    disabledCount: 0,
    types: {},
    categories: {}
  };
  
  result.feeds.forEach(feed => {
    // 统计启用/禁用状态
    if (feed.enabled) {
      analysis.enabledCount++;
    } else {
      analysis.disabledCount++;
    }
    
    // 统计类型分布
    if (!analysis.types[feed.type]) {
      analysis.types[feed.type] = 0;
    }
    analysis.types[feed.type]++;
    
    // 统计类别分布
    if (!analysis.categories[feed.category]) {
      analysis.categories[feed.category] = 0;
    }
    analysis.categories[feed.category]++;
  });
  
  console.log("Feed Configuration Analysis:");
  console.log(`  Total Feeds: ${analysis.totalFeeds}`);
  console.log(`  Enabled: ${analysis.enabledCount}`);
  console.log(`  Disabled: ${analysis.disabledCount}`);
  console.log(`  Types:`, analysis.types);
  console.log(`  Categories:`, analysis.categories);
  
  return analysis;
}

// 使用示例
const config = await analyzeFeedConfiguration();
console.log(config);
```

### 示例4：完整的Feed监控系统
```javascript
class FeedMonitor {
  constructor() {
    this.feeds = [];
    this.monitoring = false;
    this.intervalId = null;
  }
  
  async init() {
    await this.updateFeeds();
    console.log(`Initialized with ${this.feeds.length} feeds`);
  }
  
  async updateFeeds() {
    const result = await feeds();
    this.feeds = result.feeds;
    return this.feeds;
  }
  
  async startMonitoring(intervalMs = 60000) {
    if (this.monitoring) {
      console.log("Monitoring already started");
      return;
    }
    
    this.monitoring = true;
    this.intervalId = setInterval(async () => {
      await this.checkForChanges();
    }, intervalMs);
    
    console.log(`Started monitoring (interval: ${intervalMs}ms)`);
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.monitoring = false;
    console.log("Stopped monitoring");
  }
  
  async checkForChanges() {
    const oldFeeds = this.feeds;
    await this.updateFeeds();
    
    const newFeeds = this.feeds.filter(feed => 
      !oldFeeds.find(old => old.id === feed.id)
    );
    
    if (newFeeds.length > 0) {
      console.log(`Detected ${newFeeds.length} new feeds:`);
      newFeeds.forEach(feed => console.log(`  - ${feed.name}`));
    }
  }
  
  getFeedsByType(type) {
    return this.feeds.filter(feed => feed.type === type);
  }
  
  getFeedsByCategory(category) {
    return this.feeds.filter(feed => feed.category === category);
  }
}

// 使用示例
const monitor = new FeedMonitor();
await monitor.init();
await monitor.startMonitoring(60000); // 每分钟检查一次

// 10分钟后停止
setTimeout(() => {
  monitor.stopMonitoring();
}, 600000);
```

---

## 相关工具

- [dumps](dumps.md) - 获取系统转储信息
- [healthcheck](healthcheck.md) - 检查系统健康状态
- [inactiveObjects](inactiveObjects.md) - 查询未激活对象
