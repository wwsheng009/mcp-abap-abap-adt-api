# ddicRepositoryAccess - 访问DDIC仓库

## 功能说明

`ddicRepositoryAccess` 工具用于访问 ABAP 数据字典（DDIC）仓库，获取数据源的详细信息。这对于理解数据来源、查看元数据和访问配置非常有用。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("ddicRepositoryAccess", {
  path: "ZMY_TABLE"
});
```

## 参数说明

- **path** (string, 必需): DDIC 数据源名称
  - 可以是表名、CDS 视图名等
  - 例如: `"ZMY_TABLE"`, `"I_Currency"`, `"ZV_SalesOrder"`

## 返回结果

返回 JSON 格式的数据源信息：

```json
{
  "status": "success",
  "result": {
    "dataSource": "ZMY_TABLE",
    "type": "TABLE",
    "repository": "DDIC",
    "metadata": {
      "created": "2024-01-01T00:00:00Z",
      "modified": "2024-01-30T10:00:00Z",
      "author": "DEVELOPER",
      "package": "Z_MY_PACKAGE"
    },
    "accessInfo": {
      "accessible": true,
      "readable": true,
      "writable": false,
      "authorization": "standard"
    },
    "dependencies": [
      {
        "name": "T000",
        "type": "TABLE",
        "relationship": "foreign_key"
      }
    ],
    "statistics": {
      "records": 10000,
      "size": "5.2 MB"
    }
  }
}
```

## 注意事项

1. 数据源必须在 DDIC 中注册
2. 某些数据源可能有访问限制
3. 返回的信息可能因数据源类型而异
4. 统计信息可能不是实时的

## 参数限制

- `path` 必须是有效的数据源名称
- 数据源必须存在于 DDIC 仓库中
- 需要相应的访问权限

## 与其他工具的关联性

- 与 `ddicElement` 配合使用获取详细结构
- 使用 `searchObject` 查找数据源
- 使用 `runQuery` 查询数据源内容
- 与 `objectStructure` 配合理解对象层次

## 使用场景说明

1. **数据源发现**: 查找和理解数据源
2. **元数据查询**: 获取数据源的元数据
3. **访问验证**: 验证数据源的访问权限
4. **依赖分析**: 分析数据源的依赖关系

## 最佳实践

1. 先验证数据源是否存在
2. 检查访问权限
3. 分析依赖关系
4. 了解统计信息

## 错误处理

可能的错误：
- **数据源不存在**: 指定的数据源在 DDIC 中不存在
- **权限不足**: 无权访问该数据源
- **授权问题**: 需要特定授权
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 分析数据源依赖
async function analyzeDependencies(dataSource) {
  const result = await mcp.callTool("ddicRepositoryAccess", {
    path: dataSource
  });
  
  const dependencies = result.result.dependencies || [];
  
  return {
    source: dataSource,
    dependencyCount: dependencies.length,
    dependencyTypes: [...new Set(dependencies.map(d => d.relationship))],
    dependencies: dependencies
  };
}

// 验证数据访问权限
async function checkAccessRights(dataSources) {
  const results = [];
  
  for (const ds of dataSources) {
    try {
      const result = await mcp.callTool("ddicRepositoryAccess", { path: ds });
      const access = result.result.accessInfo;
      
      results.push({
        source: ds,
        accessible: access.accessible,
        readable: access.readable,
        writable: access.writable,
        status: 'ok'
      });
    } catch (error) {
      results.push({
        source: ds,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

// 构建数据源地图
async function buildDataSourceMap() {
  const result = await mcp.callTool("ddicRepositoryAccess", {
    path: "*" // 如果支持通配符
  });
  
  // 按类型分组
  const byType = {};
  result.result.items.forEach(item => {
    if (!byType[item.type]) {
      byType[item.type] = [];
    }
    byType[item.type].push(item);
  });
  
  return {
    total: result.result.items.length,
    byType,
    metadata: result.result.metadata
  };
}
```

## 示例

```typescript
// 访问 DDIC 仓库
const dataSource = "ZMY_TABLE";

console.log(`访问数据源: ${dataSource}`);
const result = await mcp.callTool("ddicRepositoryAccess", {
  path: dataSource
});

// 显示基本信息
const info = result.result;
console.log(`\n数据源信息:`);
console.log(`  名称: ${info.dataSource}`);
console.log(`  类型: ${info.type}`);
console.log(`  仓库: ${info.repository}`);

// 显示元数据
if (info.metadata) {
  const meta = info.metadata;
  console.log(`\n元数据:`);
  console.log(`  包: ${meta.package || '未知'}`);
  console.log(`  作者: ${meta.author || '未知'}`);
  console.log(`  创建时间: ${meta.created || '未知'}`);
  console.log(`  修改时间: ${meta.modified || '未知'}`);
}

// 显示访问信息
if (info.accessInfo) {
  const access = info.accessInfo;
  console.log(`\n访问信息:`);
  console.log(`  可访问: ${access.accessible ? '是' : '否'}`);
  console.log(`  可读: ${access.readable ? '是' : '否'}`);
  console.log(`  可写: ${access.writable ? '是' : '否'}`);
  console.log(`  授权: ${access.authorization || '未知'}`);
  
  if (!access.accessible) {
    console.log('\n⚠️  无权访问此数据源');
  }
}

// 显示依赖关系
if (info.dependencies && info.dependencies.length > 0) {
  console.log(`\n依赖关系 (${info.dependencies.length} 个):`);
  info.dependencies.forEach((dep, index) => {
    console.log(`  ${index + 1}. ${dep.name} (${dep.type})`);
    console.log(`     关系: ${dep.relationship}`);
  });
}

// 显示统计信息
if (info.statistics) {
  const stats = info.statistics;
  console.log(`\n统计信息:`);
  if (stats.records !== undefined) {
    console.log(`  记录数: ${stats.records.toLocaleString()}`);
  }
  if (stats.size) {
    console.log(`  大小: ${stats.size}`);
  }
}

// 查询数据源（如果有读取权限）
if (info.accessInfo && info.accessInfo.readable) {
  console.log('\n可以查询数据源内容...');
  // 这里可以调用 runQuery 工具
}

// 批量检查多个数据源
console.log('\n批量检查示例:');
const dataSources = ["ZMY_TABLE", "SPFLI", "USR01"];

for (const ds of dataSources) {
  try {
    const checkResult = await mcp.callTool("ddicRepositoryAccess", {
      path: ds
    });
    
    console.log(`\n${ds}:`);
    console.log(`  类型: ${checkResult.result.type}`);
    console.log(`  可访问: ${checkResult.result.accessInfo.accessible ? '是' : '否'}`);
    
  } catch (error) {
    console.log(`\n${ds}:`);
    console.log(`  状态: 错误`);
    console.log(`  消息: ${error.message}`);
  }
}
```

## 数据源类型

### 表类型 (TABLE)
- 透明表
- 汇总表
- 池化表

### 视图类型 (VIEW)
- 数据库视图
- CDS 视图
- 投影视图
- 维护视图

### 其他类型
- 数据元素
- 域
- 结构
- 锁对象
- 搜索帮助

## 访问权限说明

| 权限 | 说明 |
|------|------|
| accessible | 是否可以访问该数据源 |
| readable | 是否可以读取数据 |
| writable | 是否可以修改数据 |
| authorization | 使用的授权类型 |

## 授权类型

- **standard**: 标准授权
- **custom**: 自定义授权
- **role**: 基于角色的授权
- **field**: 字段级授权
- **none**: 无授权要求

## 使用场景

### 开发场景
```typescript
// 查找表并分析
async function findAndAnalyzeTable(tableName) {
  try {
    // 1. 访问 DDIC 仓库
    const repoInfo = await mcp.callTool("ddicRepositoryAccess", {
      path: tableName
    });
    
    console.log(`找到表: ${repoInfo.result.dataSource}`);
    
    // 2. 获取详细结构
    const details = await mcp.callTool("ddicElement", {
      path: tableName
    });
    
    return {
      repositoryInfo: repoInfo.result,
      elementInfo: details.result
    };
  } catch (error) {
    console.error(`访问失败: ${error.message}`);
    throw error;
  }
}
```

### 集成场景
```typescript
// 验证集成表
async function verifyIntegrationTables(tables) {
  const results = [];
  
  for (const table of tables) {
    const repoInfo = await mcp.callTool("ddicRepositoryAccess", {
      path: table
    });
    
    results.push({
      table,
      accessible: repoInfo.result.accessInfo.accessible,
      type: repoInfo.result.type,
      dependencies: repoInfo.result.dependencies.length
    });
  }
  
  return results;
}
```
