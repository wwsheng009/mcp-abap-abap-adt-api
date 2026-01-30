# dumps

## 功能说明
获取系统转储（Dumps）信息列表。转储是ABAP系统在运行时错误发生时生成的详细错误报告，包含错误堆栈、变量状态等调试信息，用于故障排查和问题诊断。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "dumps",
  "arguments": {
    "query": "USER EQ 'DEVELOPER01'"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "dumps": [
    {
      "id": "dump_001",
      "timestamp": "2024-01-30T10:15:30Z",
      "user": "DEVELOPER01",
      "program": "Z_MY_PROGRAM",
      "transaction": "SE38",
      "errorType": "CX_SY_ASSIGN_CAST_ERROR",
      "shortDump": "Type conflict when assigning",
      "errorMessage": "Unable to interpret value",
      "line": 145,
      "status": "new"
    },
    {
      "id": "dump_002",
      "timestamp": "2024-01-30T09:45:00Z",
      "user": "DEVELOPER02",
      "program": "Z_ORDER_PROCESS",
      "transaction": "ZORD",
      "errorType": "CX_SY_ZERODIVIDE",
      "shortDump": "Division by zero",
      "errorMessage": "Division by 0",
      "line": 78,
      "status": "analyzed"
    }
  ]
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| query | string | 否 | 可选的查询字符串用于过滤转储列表 |

## 注意事项

⚠️ **重要提示：**
1. 转储可能包含敏感信息，需要适当的访问权限
2. 某些系统限制转dump的保留时间
3. 查询语法取决于系统配置
4. 大量转储查询可能影响性能
5. 转堆信息可用于调试但不应用于生产环境分析

## 参数限制

- `query`参数：最大长度256字符，语法取决于系统配置

## 与其他工具的关联性

- **feeds** - 获取Feed列表，可能包含错误相关的Feed
- **healthcheck** - 检查系统健康状态
- **searchObject** - 搜索出错的程序对象
- **getObjectSourceV2** - 查看出错程序的源代码

## 使用场景说明

### 场景1：查询所有转储
```json
{}
```

### 场景2：查询特定用户的转储
```json
{
  "query": "USER EQ 'DEVELOPER01'"
}
```

### 场景3：查询特定类型的错误
```json
{
  "query": "ERRORTYPE EQ 'CX_SY_ASSIGN_CAST_ERROR'"
}
```

### 场景4：查询最近发生的转储
```json
{
  "query": "TIMESTAMP GE '20240130100000'"
}
```

## 最佳实践

✅ **推荐做法：**
1. 定期查询和分析转堆，及时发现系统问题
2. 使用查询过滤特定类型的转堆，提高分析效率
3. 记录和分析常见错误模式
4. 将严重错误通知开发团队
5. 清理已解决的转堆，避免列表过长

❌ **避免做法：**
1. 不要在生产环境频繁查询转堆，影响性能
2. 避免查询没有时间限制的转堆列表
3. 不要忽视转堆中的警告信息
4. 避免直接在生产系统上调试，先在开发环境复现

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Authorization failed" | 缺少查看转堆的权限 | 联系管理员授予相应权限 |
| "Invalid query syntax" | 查询语法错误 | 检查查询字符串格式 |
| "No dumps found" | 没有找到符合条件的转堆 | 调整查询条件或扩大范围 |
| "Service unavailable" | 转堆服务不可用 | 检查系统状态或稍后重试 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "AUTHORIZATION_FAILED",
    "message": "No authorization to access dumps",
    "details": {
      "requiredAuth": "S_DUMP_DISPLAY",
      "missingAuth": true
    }
  }
}
```

## 高级用法

### 1. 转堆统计分析
```javascript
async function analyzeDumps() {
  const result = await dumps();
  
  const stats = {
    total: result.dumps.length,
    byUser: {},
    byErrorType: {},
    byProgram: {},
    byStatus: {}
  };
  
  result.dumps.forEach(dump => {
    // 按用户统计
    if (!stats.byUser[dump.user]) {
      stats.byUser[dump.user] = 0;
    }
    stats.byUser[dump.user]++;
    
    // 按错误类型统计
    if (!stats.byErrorType[dump.errorType]) {
      stats.byErrorType[dump.errorType] = 0;
    }
    stats.byErrorType[dump.errorType]++;
    
    // 按程序统计
    if (!stats.byProgram[dump.program]) {
      stats.byProgram[dump.program] = 0;
    }
    stats.byProgram[dump.program]++;
    
    // 按状态统计
    if (!stats.byStatus[dump.status]) {
      stats.byStatus[dump.status] = 0;
    }
    stats.byStatus[dump.status]++;
  });
  
  return stats;
}
```

### 2. 查询特定时间范围内的转堆
```javascript
async function getRecentDumps(hours = 24) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
  
  const startTimeStr = startTime.toISOString().replace(/[-:]/g, '').substring(0, 14);
  
  const query = `TIMESTAMP GE '${startTimeStr}'`;
  
  const result = await dumps({ query });
  
  console.log(`Found ${result.dumps.length} dumps in the last ${hours} hours`);
  
  return result.dumps;
}
```

### 3. 转堆分类和优先级
```javascript
function categorizeDumps(dumps) {
  return dumps.map(dump => {
    let priority = "low";
    let category = "other";
    
    // 根据错误类型分类
    if (dump.errorType.startsWith('CX_SY_')) {
      category = "system";
      priority = "high";
    } else if (dump.errorType.startsWith('CX_')) {
      category = "application";
      priority = "medium";
    }
    
    // 根据状态调整优先级
    if (dump.status === "new") {
      priority = "high";
    } else if (dump.status === "analyzed") {
      priority = "medium";
    }
    
    return {
      ...dump,
      priority,
      category
    };
  }).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

### 4. 转堆报告生成
```javascript
async function generateDumpReport(hours = 24) {
  const recentDumps = await getRecentDumps(hours);
  const categorized = categorizeDumps(recentDumps);
  
  const report = {
    period: `Last ${hours} hours`,
    timestamp: new Date().toISOString(),
    summary: {
      total: recentDumps.length,
      highPriority: categorized.filter(d => d.priority === "high").length,
      mediumPriority: categorized.filter(d => d.priority === "medium").length,
      lowPriority: categorized.filter(d => d.priority === "low").length
    },
    topErrors: getTopErrors(recentDumps, 5),
    topUsers: getTopUsers(recentDumps, 5),
    topPrograms: getTopPrograms(recentDumps, 5),
    details: categorized
  };
  
  return report;
}

function getTopErrors(dumps, limit) {
  const counts = {};
  dumps.forEach(dump => {
    const key = dump.errorType;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([error, count]) => ({ error, count }));
}

function getTopUsers(dumps, limit) {
  const counts = {};
  dumps.forEach(dump => {
    const key = dump.user;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([user, count]) => ({ user, count }));
}

function getTopPrograms(dumps, limit) {
  const counts = {};
  dumps.forEach(dump => {
    const key = dump.program;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([program, count]) => ({ program, count }));
}
```

## 示例

### 示例1：查询所有转堆
```json
{
  "tool": "dumps",
  "arguments": {}
}
```

**预期结果：**
```json
{
  "status": "success",
  "dumps": [
    {
      "id": "dump_001",
      "timestamp": "2024-01-30T10:15:30Z",
      "user": "DEVELOPER01",
      "program": "Z_MY_PROGRAM",
      "transaction": "SE38",
      "errorType": "CX_SY_ASSIGN_CAST_ERROR",
      "shortDump": "Type conflict when assigning",
      "errorMessage": "Unable to interpret value",
      "line": 145,
      "status": "new"
    },
    {
      "id": "dump_002",
      "timestamp": "2024-01-30T09:45:00Z",
      "user": "DEVELOPER02",
      "program": "Z_ORDER_PROCESS",
      "transaction": "ZORD",
      "errorType": "CX_SY_ZERODIVIDE",
      "shortDump": "Division by zero",
      "errorMessage": "Division by 0",
      "line": 78,
      "status": "analyzed"
    }
  ]
}
```

### 示例2：查询特定用户的转堆
```json
{
  "tool": "dumps",
  "arguments": {
    "query": "USER EQ 'DEVELOPER01'"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "dumps": [
    {
      "id": "dump_001",
      "timestamp": "2024-01-30T10:15:30Z",
      "user": "DEVELOPER01",
      "program": "Z_MY_PROGRAM",
      "transaction": "SE38",
      "errorType": "CX_SY_ASSIGN_CAST_ERROR",
      "shortDump": "Type conflict when assigning",
      "errorMessage": "Unable to interpret value",
      "line": 145,
      "status": "new"
    }
  ]
}
```

### 示例3：查询最近的转堆
```json
{
  "tool": "dumps",
  "arguments": {
    "query": "TIMESTAMP GE '20240130100000'"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "dumps": [
    {
      "id": "dump_001",
      "timestamp": "2024-01-30T10:15:30Z",
      "user": "DEVELOPER01",
      "program": "Z_MY_PROGRAM",
      "transaction": "SE38",
      "errorType": "CX_SY_ASSIGN_CAST_ERROR",
      "shortDump": "Type conflict when assigning",
      "errorMessage": "Unable to interpret value",
      "line": 145,
      "status": "new"
    }
  ]
}
```

### 示例4：完整的转堆分析流程
```javascript
async function analyzeSystemDumps() {
  console.log("Analyzing system dumps...");
  
  // 1. 获取最近24小时的转堆
  const recentDumps = await getRecentDumps(24);
  console.log(`Found ${recentDumps.length} dumps in the last 24 hours`);
  
  // 2. 分类和优先级排序
  const categorized = categorizeDumps(recentDumps);
  
  // 3. 统计分析
  const stats = await analyzeDumps();
  console.log("\nDump Statistics:");
  console.log(`  Total: ${stats.total}`);
  console.log(`  By User:`, stats.byUser);
  console.log(`  By Error Type:`, stats.byErrorType);
  console.log(`  By Program:`, stats.byProgram);
  
  // 4. 生成报告
  const report = await generateDumpReport(24);
  console.log("\nDump Report Generated:");
  console.log(`  Period: ${report.period}`);
  console.log(`  Total: ${report.summary.total}`);
  console.log(`  High Priority: ${report.summary.highPriority}`);
  console.log(`  Medium Priority: ${report.summary.mediumPriority}`);
  console.log(`  Low Priority: ${report.summary.lowPriority}`);
  
  // 5. 显示高优先级转堆
  const highPriorityDumps = categorized.filter(d => d.priority === "high");
  if (highPriorityDumps.length > 0) {
    console.log("\nHigh Priority Dumps:");
    highPriorityDumps.forEach(dump => {
      console.log(`  - ${dump.id}: ${dump.shortDump} (${dump.program}:${dump.line})`);
    });
  }
  
  return report;
}

// 使用示例
const report = await analyzeSystemDumps();
console.log("\nFinal Report:", JSON.stringify(report, null, 2));
```

### 示例5：转堆监控和告警
```javascript
class DumpMonitor {
  constructor(threshold = 10) {
    this.threshold = threshold;
    this.lastCheckTime = new Date();
  }
  
  async checkForCriticalDumps() {
    const now = new Date();
    const timeDiff = (now - this.lastCheckTime) / 1000 / 60; // 分钟
    
    const recentDumps = await getRecentDumps(Math.ceil(timeDiff));
    const criticalDumps = recentDumps.filter(dump => 
      dump.priority === "high" || dump.status === "new"
    );
    
    if (criticalDumps.length > 0) {
      console.warn(`⚠️  Found ${criticalDumps.length} critical dumps!`);
      
      // 可以发送通知
      await this.sendAlert({
        type: "critical_dumps",
        count: criticalDumps.length,
        dumps: criticalDumps.slice(0, 5) // 只发送前5个
      });
    } else if (recentDumps.length > this.threshold) {
      console.warn(`⚠️  High dump rate: ${recentDumps.length} dumps in ${timeDiff.toFixed(0)} minutes`);
    } else {
      console.log(`✅ Normal: ${recentDumps.length} dumps in ${timeDiff.toFixed(0)} minutes`);
    }
    
    this.lastCheckTime = now;
    return recentDumps;
  }
  
  async sendAlert(alert) {
    // 这里可以实现发送邮件、Slack、Teams等通知
    console.log("Sending alert:", JSON.stringify(alert, null, 2));
  }
}

// 使用示例
const monitor = new DumpMonitor(5);
setInterval(async () => {
  await monitor.checkForCriticalDumps();
}, 300000); // 每5分钟检查一次
```

---

## 相关工具

- [feeds](feeds.md) - 获取Feed列表
- [healthcheck](healthcheck.md) - 检查系统健康状态
- [searchObject](searchObject.md) - 搜索出错的程序对象
- [getObjectSourceV2](getObjectSourceV2.md) - 查看出错程序的源代码
