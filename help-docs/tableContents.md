# tableContents

## 功能说明
获取ABAP数据库表或视图的内容数据。该工具用于从ABAP系统中检索DDIC（数据字典）实体（表或视图）的数据记录，支持分页、过滤和SQL查询。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "tableContents",
  "arguments": {
    "ddicEntityName": "T001",
    "rowNumber": 10,
    "decode": true,
    "sqlQuery": "MANDT EQ '100'"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "columns": [
      {
        "name": "MANDT",
        "type": "CLNT",
        "length": 3
      },
      {
        "name": "BUKRS",
        "type": "CHAR",
        "length": 4
      },
      {
        "name": "BUTXT",
        "type": "CHAR",
        "length": 25
      }
    ],
    "rows": [
      {
        "MANDT": "100",
        "BUKRS": "0001",
        "BUTXT": "Company A"
      },
      {
        "MANDT": "100",
        "BUKRS": "0002",
        "BUTXT": "Company B"
      }
    ],
    "totalRows": 2,
    "fetchedRows": 2
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ddicEntityName | string | 是 | DDIC实体名称（表名或视图名） |
| rowNumber | number | 否 | 要检索的最大行数，默认为50 |
| decode | boolean | 否 | 是否解码数据（如转换为可读格式），默认为true |
| sqlQuery | string | 否 | 可选的SQL查询语句用于过滤数据 |

## 注意事项

⚠️ **重要提示：**
1. 需要相应的数据库访问权限（S_TABU_DIS或S_TABU_NAM）
2. 对于大型表，建议使用`rowNumber`限制返回行数
3. `sqlQuery`使用ABAP Open SQL语法，不是标准SQL
4. 敏感数据可能受保护，需要额外授权
5. 性能考虑：避免查询包含大量数据的表

## 参数限制

- `ddicEntityName`：最大长度30个字符，必须存在于DDIC中
- `rowNumber`：建议范围1-1000，超出可能导致性能问题
- `sqlQuery`：仅支持简单的WHERE条件，不支持复杂查询

## 与其他工具的关联性

- **runQuery** - 执行自定义SQL查询，提供更多灵活性
- **ddicElement** - 查询表/视图的结构和字段信息
- **ddicRepositoryAccess** - 访问DDIC仓库数据源
- **packageSearchHelp** - 查找包含特定表的包

## 使用场景说明

### 场景1：获取完整的公司代码列表
```json
{
  "ddicEntityName": "T001",
  "rowNumber": 100
}
```

### 场景2：查询特定客户的订单
```json
{
  "ddicEntityName": "VBAK",
  "rowNumber": 20,
  "sqlQuery": "KUNNR EQ '0000000010'"
}
```

### 场景3：获取物料主数据（不解码）
```json
{
  "ddicEntityName": "MARA",
  "rowNumber": 50,
  "decode": false
}
```

## 最佳实践

✅ **推荐做法：**
1. 始终指定`rowNumber`限制返回行数
2. 使用`ddicElement`先了解表结构再查询数据
3. 对大表使用`sqlQuery`进行过滤
4. 定期检查数据访问日志
5. 考虑使用视图而非直接查询表

❌ **避免做法：**
1. 不要查询包含海量数据的表（如CDHDR、CDPOS）
2. 避免不设置`rowNumber`限制的查询
3. 不要在生产环境执行性能密集型查询
4. 避免频繁查询同一数据，考虑缓存

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Table not found" | 表或视图不存在 | 检查表名拼写是否正确 |
| "Authorization failed" | 缺少访问权限 | 联系管理员授予S_TABU_DIS授权 |
| "Invalid SQL syntax" | SQL查询语法错误 | 检查sqlQuery语法，使用Open SQL语法 |
| "Too many rows" | 返回行数过多 | 减小rowNumber值或添加过滤条件 |
| "Data locked by user" | 数据被锁定 | 等待锁定释放或联系相关用户 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "AUTHORIZATION_FAILED",
    "message": "No authorization to access table T001",
    "details": {
      "requiredAuth": "S_TABU_DIS",
      "missingAuth": true
    }
  }
}
```

## 高级用法

### 1. 分页查询
```javascript
async function queryWithPagination(tableName, pageSize = 100) {
  let offset = 0;
  let allData = [];
  
  while (true) {
    const result = await tableContents({
      ddicEntityName: tableName,
      rowNumber: pageSize
    });
    
    if (result.rows.length === 0) break;
    
    allData = allData.concat(result.rows);
    offset += pageSize;
    
    // 如果返回行数小于请求的行数，说明已到末尾
    if (result.rows.length < pageSize) break;
  }
  
  return allData;
}
```

### 2. 复杂过滤条件
```javascript
// 使用AND条件
await tableContents({
  ddicEntityName: "VBAK",
  sqlQuery: "KUNNR EQ '0000000010' AND VKORG EQ '1000'"
});

// 使用OR条件（需要用括号）
await tableContents({
  ddicEntityName: "VBAK",
  sqlQuery: "(VKORG EQ '1000') OR (VKORG EQ '2000')"
});
```

### 3. 数据导出到CSV
```javascript
async function exportTableToCsv(tableName, fileName) {
  const result = await tableContents({
    ddicEntityName: tableName,
    rowNumber: 1000,
    decode: true
  });
  
  // 生成CSV头部
  const headers = result.columns.map(c => c.name).join(',');
  
  // 生成CSV数据行
  const rows = result.rows.map(row => {
    return result.columns.map(c => row[c.name]).join(',');
  });
  
  // 合并
  const csv = [headers, ...rows].join('\n');
  
  // 保存到文件
  await fs.writeFile(fileName, csv, 'utf-8');
  console.log(`Exported ${result.rows.length} rows to ${fileName}`);
}
```

### 4. 数据验证和检查
```javascript
async function validateData(tableName, conditions) {
  const result = await tableContents({
    ddicEntityName: tableName,
    sqlQuery: conditions
  });
  
  const issues = [];
  
  // 检查是否有重复记录
  const duplicates = findDuplicates(result.rows);
  if (duplicates.length > 0) {
    issues.push(`Found ${duplicates.length} duplicate records`);
  }
  
  // 检查必填字段
  result.columns.forEach(col => {
    const missing = result.rows.filter(row => !row[col.name]);
    if (missing.length > 0) {
      issues.push(`Found ${missing.length} rows with missing ${col.name}`);
    }
  });
  
  return issues;
}
```

## 示例

### 示例1：查询公司代码表
```json
{
  "tool": "tableContents",
  "arguments": {
    "ddicEntityName": "T001",
    "rowNumber": 10,
    "decode": true
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "MANDT", "type": "CLNT", "length": 3 },
      { "name": "BUKRS", "type": "CHAR", "length": 4 },
      { "name": "BUTXT", "type": "CHAR", "length": 25 },
      { "name": "ORT01", "type": "CHAR", "length": 25 },
      { "name": "LAND1", "type": "CHAR", "length": 3 }
    ],
    "rows": [
      {
        "MANDT": "100",
        "BUKRS": "0001",
        "BUTXT": "Headquarters",
        "ORT01": "New York",
        "LAND1": "US"
      },
      {
        "MANDT": "100",
        "BUKRS": "0002",
        "BUTXT": "Branch Office",
        "ORT01": "Chicago",
        "LAND1": "US"
      }
    ],
    "totalRows": 2,
    "fetchedRows": 2
  }
}
```

### 示例2：查询销售订单（带过滤）
```json
{
  "tool": "tableContents",
  "arguments": {
    "ddicEntityName": "VBAK",
    "rowNumber": 20,
    "decode": true,
    "sqlQuery": "KUNNR EQ '0000000010' AND ERDAT GE '20240101'"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "MANDT", "type": "CLNT", "length": 3 },
      { "name": "VBELN", "type": "CHAR", "length": 10 },
      { "name": "KUNNR", "type": "CHAR", "length": 10 },
      { "name": "ERDAT", "type": "DATS", "length": 8 },
      { "name": "NETWR", "type": "CURR", "length": 15 }
    ],
    "rows": [
      {
        "MANDT": "100",
        "VBELN": "0000000010",
        "KUNNR": "0000000010",
        "ERDAT": "20240115",
        "NETWR": "5000.00"
      },
      {
        "MANDT": "100",
        "VBELN": "0000000015",
        "KUNNR": "0000000010",
        "ERDAT": "20240120",
        "NETWR": "7500.00"
      }
    ],
    "totalRows": 2,
    "fetchedRows": 2
  }
}
```

### 示例3：查询客户主数据（使用视图）
```json
{
  "tool": "tableContents",
  "arguments": {
    "ddicEntityName": "KNA1",
    "rowNumber": 5,
    "decode": true,
    "sqlQuery": "LAND1 EQ 'US'"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "MANDT", "type": "CLNT", "length": 3 },
      { "name": "KUNNR", "type": "CHAR", "length": 10 },
      { "name": "LAND1", "type": "CHAR", "length": 3 },
      { "name": "NAME1", "type": "CHAR", "length": 35 },
      { "name": "ORT01", "type": "CHAR", "length": 35 }
    ],
    "rows": [
      {
        "MANDT": "100",
        "KUNNR": "0000000010",
        "LAND1": "US",
        "NAME1": "Acme Corporation",
        "ORT01": "New York"
      },
      {
        "MANDT": "100",
        "KUNNR": "0000000020",
        "LAND1": "US",
        "NAME1": "Beta Industries",
        "ORT01": "Los Angeles"
      }
    ],
    "totalRows": 2,
    "fetchedRows": 2
  }
}
```

### 示例4：完整的数据分析流程
```javascript
async function analyzeCustomerOrders(customerId) {
  // 1. 获取客户信息
  const customerInfo = await tableContents({
    ddicEntityName: "KNA1",
    rowNumber: 1,
    sqlQuery: `KUNNR EQ '${customerId}'`
  });
  
  console.log("Customer Info:", customerInfo.rows[0]);
  
  // 2. 获取订单列表
  const orders = await tableContents({
    ddicEntityName: "VBAK",
    rowNumber: 100,
    sqlQuery: `KUNNR EQ '${customerId}' AND ERDAT GE '20240101'`
  });
  
  console.log(`Found ${orders.rows.length} orders`);
  
  // 3. 计算总金额
  const totalAmount = orders.rows.reduce((sum, order) => {
    return sum + parseFloat(order.NETWR);
  }, 0);
  
  console.log(`Total amount: ${totalAmount.toFixed(2)}`);
  
  // 4. 返回分析结果
  return {
    customer: customerInfo.rows[0],
    orderCount: orders.rows.length,
    totalAmount: totalAmount.toFixed(2),
    averageOrder: (totalAmount / orders.rows.length).toFixed(2)
  };
}

// 使用示例
const analysis = await analyzeCustomerOrders("0000000010");
console.log(analysis);
```

---

## 相关工具

- [runQuery](runQuery.md) - 执行自定义SQL查询
- [ddicElement](ddicElement.md) - 查询表/视图结构
- [ddicRepositoryAccess](ddicRepositoryAccess.md) - 访问DDIC仓库
- [packageSearchHelp](packageSearchHelp.md) - 搜索包
