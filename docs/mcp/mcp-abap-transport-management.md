# MCP ABAP ADT API - 传输请求管理

## 概述

传输请求（Transport Request）是 SAP ABAP 开发中用于在不同系统之间移动对象的重要机制。本文档介绍如何使用 MCP API 管理传输请求。

## 核心概念

### 传输请求类型

| 类型 | 说明 | 作用范围 |
|-----|------|---------|
| Workbench | 包含所有自定义对象 | 开发货号 (K/本地) |
| Customizing | 包含客户配置 | 配置更改 |

### 请求状态

| 状态 | 说明 |
|-----|------|
| Modifiable | 可修改 |
| Released | 已释放 |
| Distributed | 已分发 |

## MCP 传输管理工具

### 可用工具

```javascript
// 1. 检查传输配置
await ecc1809_hasTransportConfig()

// 2. 获取传输配置列表
await ecc1809_transportConfigurations()

// 3. 获取用户传输请求
await ecc1809_userTransports({ targets: true })

// 4. 创建传输请求
await ecc1809_createTransport({ ... })

// 5. 释放传输请求
await ecc1809_transportRelease({ ... })

// 6. 获取对象传输信息
await ecc1809_transportInfo({ ... })
```

## 实战案例

### 案例 1: 创建新的工作台请求

```javascript
// 步骤 1: 检查传输配置
const hasConfig = await ecc1809_hasTransportConfig();

if (!hasConfig.hasConfig) {
  console.error("系统未配置传输");
  return;
}

// 步骤 2: 获取可用传输配置
const configs = await ecc1809_transportConfigurations();

// 步骤 3: 选择开发类和传输层
const devClass = "$TMP";          // 本地对象
const transportLayer = config.uri; // 传输层URI

// 步骤 4: 创建传输请求
const transport = await ecc1809_createTransport({
  objSourceUrl: "/sap/bc/adt/programs/programs/znew_program",
  REQUEST_TEXT: "New program for demo",
  DEVCLASS: devClass,
  transportLayer: transportLayer
});

console.log("传输请求号:", transport.request);
console.log("任务号:", transport.task);
```

### 案例 2: 配置默认传输

```javascript
// 创建传输配置
await ecc1809_createTransportsConfig();

// 设置传输配置
const configTemplate = {
  "transportFolder": "/sap/bc/adt/cts/transports",
  "transportLayer": "ZUSER",
  "devclass": "$TMP"
};

await ecc1809_setTransportsConfig({
  uri: "/sap/bc/adt/core/transportconfigs/default",
  etag: "\"1234567890\"",
  config: JSON.stringify(configTemplate)
});
```

### 案例 3: 查看用户的传输请求

```javascript
// 获取当前用户的所有传输请求
const transports = await ecc1809_userTransports({
  user: sy-uname,
  targets: true  // 包含目标系统信息
});

transports.forEach(t => {
  console.log("----------------------------------------");
  console.log("请求号:", t.request);
  console.log("描述:", t.description);
  console.log("状态:", t.state);
  console.log("所有者:", t.owner);
  console.log("目标系统:", t.target);
  
  if (t.tasks) {
    t.tasks.forEach(task => {
      console.log("  任务:", task.task, "-", task.description);
    });
  }
});
```

### 案例 4: 释放传输请求

```javascript
// 释放单个请求
const result = await ecc1809_transportRelease({
  transportNumber: "DEVK900123",
  ignoreLocks: false,  // 是否忽略锁定
  IgnoreATC: false     // 是否忽略 ATC 检查
});

if (result.success) {
  console.log("传输请求已释放");
} else {
  console.error("释放失败:", result.errors);
}
```

### 案例 5: 批量释放请求

```javascript
const transportNumbers = [
  "DEVK900111",
  "DEVK900222",
  "DEVK900333"
];

for (const transport of transportNumbers) {
  try {
    await ecc1809_transportRelease({
      transportNumber: transport,
      ignoreLocks: false,
      IgnoreATC: false
    });
    console.log(`✓ ${transport} 已释放`);
  } catch (error) {
    console.error(`✗ ${transport} 失败:`, error.message);
  }
}
```

### 案例 6: 转移传输请求所有权

```javascript
// 将请求所有权转移给另一个用户
await ecc1809_transportSetOwner({
  transportNumber: "DEVK900123",
  targetuser: "NEW_OWNER"
});
```

### 案例 7: 添加用户到传输请求

```javascript
// 协作开发：添加其他开发者
await ecc1809_transportAddUser({
  transportNumber: "DEVK900123",
  user: "COLLEAGUE_01"
});
```

## 传输工作流最佳实践

### 标准开发流程

```
┌──────────────┐
│ 1. 创建请求    │ ← ecc1809_createTransport
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 2. 开发对象    │ ← ecc1809_setObjectSource
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 3. 激活对象    │ ← ecc1809_activateByName
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 4. 测试        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 5. 释放请求    │ ← ecc1809_transportRelease
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 6. 导出传输    │ ← SE01 / STMS
└───────────────────┘
```

### 开发对象时的传输集成

```javascript
// 创建对象时自动绑定传输请求
async function createProgramWithTransport(programName, description) {
  // 1. 创建传输请求
  const transport = await ecc1809_createTransport({
    objSourceUrl: `/sap/bc/adt/programs/programs/${programName.toLowerCase()}`,
    REQUEST_TEXT: `创建程序: ${description}`,
    DEVCLASS: "$TMP"
  });

  // 2. 创建对象（会自动关联到传输请求）
  const lockResult = await ecc1809_lock({
    objectUrl: `/sap/bc/adt/programs/programs/${programName.toLowerCase()}`,
    accessMode: "MODIFY"
  });

  // 3. 编写代码...

  // 4. 保存并激活
  await ecc1809_setObjectSource({...});
  await ecc1809_unLock({...});
  
  const activateResult = await ecc1809_activateByName({
    objectName: programName,
    objectUrl: `/sap/bc/adt/programs/programs/${programName.toLowerCase()}`
  });

  console.log("传输请求号:", transport.request);
  console.log("任务号:", transport.task);

  return {
    success: activateResult.success,
    transport: transport.request,
    task: transport.task
  };
}

// 使用示例
const result = await createProgramWithTransport(
  "ZMY_PROGRAM",
  "我的新程序"
);
```

## 常见场景

### 场景 1: 本地开发（$TMP）

```javascript
// 本地开发，不使用传输
const transport = await ecc1809_createTransport({
  objSourceUrl: "...",
  REQUEST_TEXT: "Local development",
  DEVCLASS: "$TMP"
});
```

### 场景 2: 正式开发（Z 开发包）

```javascript
// 正式开发，使用传输到其他系统
const transport = await ecc1809_createTransport({
  objSourceUrl: "...",
  REQUEST_TEXT: "Feature: New user management",
  DEVCLASS: "ZMY_PACKAGE",    // 正式开发包
  transportLayer: "/sap/bc/adt/cts/transportlayers/ZUSER"
});
```

### 场景 3: 修复（Z 开发包）

```javascript
// 修复创建，带 BUG 前缀
const transport = await ecc1809_createTransport({
  objSourceUrl: "...",
  REQUEST_TEXT: "BUG: Fix issue in user login",
  DEVCLASS: "ZMY_PACKAGE",
  transportLayer: "/sap/bc/adt/cts/transportlayers/ZUSER"
});
```

### 场景 4: 协作开发

```javascript
// 团队开发，添加协作者
const transport = await ecc1809_createTransport({...});

// 添加多个协作者
await ecc1809_transportAddUser({
  transportNumber: transport.request,
  user: "DEVELOPER_01"
});

await ecc1809_transportAddUser({
  transportNumber: transport.request,
  user: "DEVELOPER_02"
});
```

## 注意事项

### ⚠️ 警告

1. **释放前务必检查**
   ```javascript
   // 检查对象是否正确激活
   const inactive = await ecc1809_inactiveObjects();
   if (inactive.length > 0) {
     console.warn("还有未激活的对象，请先激活！");
     return;
   }
   ```

2. **不要跳过 ATC 检查**
   ```javascript
   // ❌ 不推荐：跳过检查
   await ecc1809_transportRelease({
     transportNumber: "XXX",
     IgnoreATC: true
   });
   
   // ✅ 推荐：执行检查
   await ecc1809_transportRelease({
     transportNumber: "XXX",
     IgnoreATC: false
   });
   ```

3. **本地开发 vs 正式开发**
   - $TMP: 用于实验和测试
   - Z 开发包: 正式功能开发
   - $HOME: 私人对象（不推荐）

### ✅ 建议

1. **使用有意义的描述**
   ```javascript
   // ✅ 好
   REQUEST_TEXT: "FEAT: 新增用户批量导入功能"
   
   // ❌ 差
   REQUEST_TEXT: "new program"
   ```

2. **按功能组织请求**
   - 每个功能一个请求
   - 避免将不相关的对象放在同一个请求中

3. **定期释放**
   - 每周/每月定期释放
   - 避免请求堆积

## 完整示例：开发管理工具

```javascript
class TransportManager {
  constructor() {
    this.transports = [];
  }

  async getMyTransports() {
    this.transports = await ecc1809_userTransports({
      user: sy-uname,
      targets: true
    });
    return this.transports;
  }

  async createRequest(description, devClass = "$TMP") {
    const transport = await ecc1809_createTransport({
      objSourceUrl: "/sap/bc/adt/programs",
      REQUEST_TEXT: description,
      DEVCLASS: devClass
    });
    return transport;
  }

  async releaseRequest(transportNumber) {
    try {
      const result = await ecc1809_transportRelease({
        transportNumber,
        ignoreLocks: false,
        IgnoreATC: false
      });
      
      console.log(`✓ ${transportNumber} 已释放`);
      return result;
    } catch (error) {
      console.error(`✗ ${transportNumber} 失败:`, error.message);
      throw error;
    }
  }

  async addCollaborator(transportNumber, user) {
    await ecc1809_transportAddUser({
      transportNumber,
      user
    });
    console.log(`✓ 用户 ${user} 已添加到 ${transportNumber}`);
  }

  formatTransports() {
    let output = "========================================\n";
    output += "我的传输请求列表\n";
    output += "========================================\n\n";

    this.transports.forEach(t => {
      output += `请求: ${t.request}\n`;
      output += `描述: ${t.description}\n`;
      output += `状态: ${t.state}\n`;
      output += `目标: ${t.target || '未设置'}\n`;
      output += "----------------------------------------\n";
    });

    return output;
  }
}

// 使用方法
const manager = new TransportManager();

// 获取我的请求
await manager.getMyTransports();
console.log(manager.formatTransports());

// 创建新请求
const newTransport = await manager.createRequest(
  "新功能：用户管理 dashboard"
);

// 释放请求
await manager.releaseRequest(newTransport.request);

// 添加协作者
await manager.addCollaborator(newTransport.request, "COLLEAGUE");
```

---

**文档版本：** v1.0  
**最后更新：** 2025-01-25  
**作者：** AI Assistant
