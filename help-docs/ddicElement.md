# ddicElement - 获取DDIC元素信息

## 功能说明

`ddicElement` 工具用于获取 ABAP 数据字典（DDIC）元素的详细信息。DDIC 元素包括表、结构、视图、数据元素等核心数据结构。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("ddicElement", {
  path: "ZMY_TABLE",
  getTargetForAssociation: false,
  getExtensionViews: false,
  getSecondaryObjects: false
});
```

## 参数说明

- **path** (string, 必需): DDIC 元素的名称
  - 使用表名、视图名或结构名
  - **不要**使用完整的 ADT URI
  - 例如: `"ZMY_TABLE"`, `"SPFLI"`, `"USR01"`
  - ❌ 错误: `"/sap/bc/adt/ddic/tables/zmy_table"`
  - ✅ 正确: `"ZMY_TABLE"`

- **getTargetForAssociation** (boolean, 可选): 是否获取关联的目标
  - `true`: 获取关联的目标信息
  - `false`: 不获取（默认）

- **getExtensionViews** (boolean, 可选): 是否获取扩展视图
  - `true`: 获取扩展视图信息
  - `false`: 不获取（默认）

- **getSecondaryObjects** (boolean, 可选): 是否获取次级对象
  - `true`: 获取次级对象信息
  - `false`: 不获取（默认）

## 返回结果

返回 JSON 格式的 DDIC 元素信息：

```json
{
  "status": "success",
  "result": {
    "name": "ZMY_TABLE",
    "type": "TABLE",
    "description": "自定义表",
    "fields": [
      {
        "name": "MANDT",
        "type": "CLNT",
        "description": "客户端",
        "key": true,
        "nullable": false,
        "length": 3
      },
      {
        "name": "ID",
        "type": "NUMC",
        "description": "ID",
        "key": true,
        "nullable": false,
        "length": 10
      },
      {
        "name": "DESCRIPTION",
        "type": "CHAR",
        "description": "描述",
        "key": false,
        "nullable": true,
        "length": 50
      }
    ],
    "primaryKey": ["MANDT", "ID"],
    "foreignKeys": [
      {
        "field": "MANDT",
        "checkTable": "T000",
        "cardinality": "1:1"
      }
    ],
    "extensions": [],
    "associations": []
  }
}
```

## 注意事项

1. **重要**: 使用表/视图名称，而不是 ADT URI
2. DDIC 元素必须存在于系统中
3. 某些高级选项可能影响性能
4. 返回的信息可能因元素类型而异

## 参数限制

- `path` 不能以 `/` 或 `/sap/bc/` 开头
- `path` 必须是有效的 DDIC 元素名称
- 元素必须存在于系统中

## 与其他工具的关联性

- 使用 `searchObject` 查找 DDIC 元素
- 使用 `ddicRepositoryAccess` 获取数据源信息
- 与 `objectStructure` 配合了解对象层次结构
- 字段信息可用于 `getObjectSourceV2`

## 使用场景说明

1. **表结构分析**: 分析表的结构和字段
2. **数据建模**: 在开发中参考现有数据结构
3. **集成开发**: 了解接口表的结构
4. **调试排查**: 查看表和字段定义

## 最佳实践

1. 使用准确的表名称
2. 按需启用高级选项
3. 分析关键字段和关系
4. 检查数据类型和长度

## 错误处理

可能的错误：
- **路径格式错误**: 使用了 ADT URI 而非表名
- **元素不存在**: 指定的 DDIC 元素不存在
- **权限不足**: 无权访问该元素
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 分析表结构
async function analyzeTable(tableName) {
  const result = await mcp.callTool("ddicElement", {
    path: tableName,
    getTargetForAssociation: true,
    getExtensionViews: true
  });
  
  const table = result.result;
  
  return {
    name: table.name,
    type: table.type,
    fieldCount: table.fields.length,
    primaryKey: table.primaryKey,
    foreignKeys: table.foreignKeys,
    hasExtensions: table.extensions.length > 0
  };
}

// 生成表文档
async function generateTableDoc(tableName) {
  const result = await mcp.callTool("ddicElement", { path: tableName });
  const table = result.result;
  
  let doc = `# 表文档: ${table.name}\n\n`;
  doc += `**类型**: ${table.type}\n`;
  doc += `**描述**: ${table.description}\n\n`;
  
  doc += `## 字段\n\n`;
  doc += `| 字段名 | 类型 | 长度 | 描述 | 键 |\n`;
  doc += `|--------|------|------|------|-----|\n`;
  
  table.fields.forEach(field => {
    const key = field.key ? '✓' : '-';
    doc += `| ${field.name} | ${field.type} | ${field.length || '-'} | ${field.description || '-'} | ${key} |\n`;
  });
  
  if (table.primaryKey.length > 0) {
    doc += `\n## 主键\n\n`;
    doc += `${table.primaryKey.join(', ')}\n`;
  }
  
  if (table.foreignKeys.length > 0) {
    doc += `\n## 外键\n\n`;
    table.foreignKeys.forEach(fk => {
      doc += `- ${fk.field} -> ${fk.checkTable} (${fk.cardinality})\n`;
    });
  }
  
  return doc;
}

// 比较表结构
async function compareTables(table1, table2) {
  const [r1, r2] = await Promise.all([
    mcp.callTool("ddicElement", { path: table1 }),
    mcp.callTool("ddicElement", { path: table2 })
  ]);
  
  return {
    fieldDifference: r1.result.fields.length - r2.result.fields.length,
    keyDifference: r1.result.primaryKey.length - r2.result.primaryKey.length
  };
}
```

## 示例

```typescript
// 获取表信息
const tableName = "ZMY_TABLE";

console.log(`获取表信息: ${tableName}`);
const result = await mcp.callTool("ddicElement", {
  path: tableName
});

// 显示基本信息
const table = result.result;
console.log(`\n表信息:`);
console.log(`  名称: ${table.name}`);
console.log(`  类型: ${table.type}`);
console.log(`  描述: ${table.description || '无'}`);

// 显示字段列表
if (table.fields && table.fields.length > 0) {
  console.log(`\n字段列表 (${table.fields.length} 个):`);
  console.log('  字段名         | 类型  | 长度 | 描述           | 键   | 可空');
  console.log('  ---------------|-------|-------|----------------|------|------');
  
  table.fields.forEach(field => {
    const key = field.key ? '✓' : ' ';
    const nullable = field.nullable ? '是' : '否';
    const length = field.length ? field.length.toString().padEnd(5) : '     ';
    const desc = (field.description || '无').padEnd(14);
    
    console.log(`  ${field.name.padEnd(15)} | ${field.type.padEnd(5)} | ${length} | ${desc} | ${key}    | ${nullable}`);
  });
}

// 显示主键
if (table.primaryKey && table.primaryKey.length > 0) {
  console.log(`\n主键:`);
  console.log(`  ${table.primaryKey.join(', ')}`);
}

// 显示外键
if (table.foreignKeys && table.foreignKeys.length > 0) {
  console.log(`\n外键 (${table.foreignKeys.length} 个):`);
  table.foreignKeys.forEach((fk, index) => {
    console.log(`  ${index + 1}. ${fk.field} -> ${fk.checkTable} (${fk.cardinality})`);
  });
}

// 带高级选项获取
console.log('\n获取关联和扩展...');
const detailed = await mcp.callTool("ddicElement", {
  path: tableName,
  getTargetForAssociation: true,
  getExtensionViews: true,
  getSecondaryObjects: true
});

if (detailed.result.associations && detailed.result.associations.length > 0) {
  console.log(`\n关联 (${detailed.result.associations.length} 个):`);
  detailed.result.associations.forEach(assoc => {
    console.log(`  - ${assoc.name}: ${assoc.description}`);
  });
}

if (detailed.result.extensions && detailed.result.extensions.length > 0) {
  console.log(`\n扩展视图 (${detailed.result.extensions.length} 个):`);
  detailed.result.extensions.forEach(ext => {
    console.log(`  - ${ext.name}`);
  });
}

// 错误示例：使用 ADT URI
console.log('\n❌ 错误示例:');
try {
  await mcp.callTool("ddicElement", {
    path: "/sap/bc/adt/ddic/tables/zmy_table"
  });
} catch (error) {
  console.log(`  错误: ${error.message}`);
  console.log(`  正确用法: 使用表名 "ZMY_TABLE" 而非 ADT URI`);
}
```

## 常见 DDIC 元素类型

### 表 (TABLE)
标准的数据库表
- 透明表 (Transparent Table)
- 汇总表 (Cluster Table)
- 池化表 (Pooled Table)

### 视图 (VIEW)
数据库视图
- 数据库视图 (Database View)
- 投影视图 (Projection View)
- 维护视图 (Maintenance View)
- 帮助视图 (Help View)

### 结构 (STRUCTURE)
数据结构定义
- 扁平结构 (Flat Structure)
- 嵌套结构 (Nested Structure)

### 数据类型 (TYPE)
数据类型定义
- 域 (Domain)
- 数据元素 (Data Element)

## 字段属性说明

| 属性 | 说明 | 常见值 |
|------|------|---------|
| key | 是否为关键字段 | true/false |
| nullable | 是否允许空值 | true/false |
| length | 字段长度 | 数字 |
| decimals | 小数位数 | 数字 |
| type | 数据类型 | CHAR, NUMC, DATS, TIMS, etc. |

## 常见数据类型

- **CHAR**: 字符串
- **NUMC**: 数字字符串
- **INT1/2/4**: 整数
- **DEC**: 小数
- **DATS**: 日期 (YYYYMMDD)
- **TIMS**: 时间 (HHMMSS)
- **TIMESTAMP**: 时间戳
- **CLNT**: 客户端 (3位)
- **LANG**: 语言 (2位)
