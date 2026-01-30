# runQuery

## 功能说明
在ABAP系统上执行自定义SQL查询。该工具提供比`tableContents`更灵活的查询能力，支持多表关联、聚合函数、排序等复杂查询操作。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "runQuery",
  "arguments": {
    "sqlQuery": "SELECT KUNNR, NAME1, ORT01 FROM KNA1 WHERE LAND1 = 'US' ORDER BY NAME1",
    "rowNumber": 50,
    "decode": true
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "KUNNR", "type": "CHAR", "length": 10 },
      { "name": "NAME1", "type": "CHAR", "length": 35 },
      { "name": "ORT01", "type": "CHAR", "length": 35 }
    ],
    "rows": [
      {
        "KUNNR": "0000000010",
        "NAME1": "Acme Corporation",
        "ORT01": "New York"
      },
      {
        "KUNNR": "0000000020",
        "NAME1": "Beta Industries",
        "ORT01": "Los Angeles"
      }
    ],
    "totalRows": 2,
    "executionTime": 15
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sqlQuery | string | 是 | 要执行的SQL查询语句 |
| rowNumber | number | 否 | 最大返回行数，默认为50 |
| decode | boolean | 否 | 是否解码数据，默认为true |

## 注意事项

⚠️ **重要提示：**
1. 使用ABAP Open SQL语法，不是标准SQL
2. 需要相应的数据库访问权限
3. 避免执行性能密集型查询（如全表扫描）
4. 对于大型结果集，始终设置`rowNumber`限制
5. 某些SQL特性在ABAP中可能不支持

## 参数限制

- `sqlQuery`：最大长度32000字符，必须为有效的Open SQL语句
- `rowNumber`：建议范围1-1000，超出可能导致性能问题
- 不支持的SQL特性：子查询、UNION、某些聚合函数

## 与其他工具的关联性

- **tableContents** - 简单的表查询，适合单表操作
- **ddicElement** - 查询表结构，帮助构建SQL
- **ddicRepositoryAccess** - 访问DDIC仓库数据源

## 使用场景说明

### 场景1：多表关联查询
```json
{
  "sqlQuery": "SELECT VBAK.VBELN, VBAK.KUNNR, KNA1.NAME1 FROM VBAK INNER JOIN KNA1 ON VBAK.KUNNR = KNA1.KUNNR WHERE VBAK.VKORG = '1000'",
  "rowNumber": 100
}
```

### 场景2：聚合统计查询
```json
{
  "sqlQuery": "SELECT VKORG, COUNT(*) AS ORDER_COUNT, SUM(NETWR) AS TOTAL_AMOUNT FROM VBAK WHERE ERDAT GE '20240101' GROUP BY VKORG",
  "rowNumber": 50
}
```

### 场景3：排序和分页
```json
{
  "sqlQuery": "SELECT * FROM MARA ORDER BY ERDAT DESC, MATNR ASC",
  "rowNumber": 20
}
```

## 最佳实践

✅ **推荐做法：**
1. 使用`ddicElement`先了解表结构再编写查询
2. 在WHERE子句中使用索引字段提高性能
3. 使用`rowNumber`限制返回行数
4. 对复杂查询考虑创建数据库视图
5. 测试查询性能后再在生产环境执行

❌ **避免做法：**
1. 不要查询未建立索引的大表
2. 避免在WHERE子句中使用函数（会导致索引失效）
3. 不要执行全表扫描或笛卡尔积
4. 避免频繁执行相同的复杂查询

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Invalid SQL syntax" | SQL语法错误 | 检查是否使用Open SQL语法 |
| "Table not found" | 表或视图不存在 | 检查表名拼写是否正确 |
| "Authorization failed" | 缺少访问权限 | 联系管理员授予查询权限 |
| "Query timeout" | 查询超时 | 优化查询或减少返回行数 |
| "Feature not supported" | 使用了不支持的SQL特性 | 简化查询或使用视图 |

### 错误处理示例
```json
{
  "status": "error",
  "error": {
    "code": "SQL_SYNTAX_ERROR",
    "message": "Invalid SQL syntax: unexpected token",
    "details": {
      "query": "SELECT * FROM KNA1 WHERE NAME1 LIKE '%A'",
      "errorPosition": 37
    }
  }
}
```

## 高级用法

### 1. 多表关联查询
```javascript
// 查询订单及其客户信息
const orderQuery = `
  SELECT 
    VBAK.VBELN AS ORDER_NO,
    VBAK.ERDAT AS ORDER_DATE,
    VBAK.NETWR AS AMOUNT,
    KNA1.NAME1 AS CUSTOMER_NAME,
    KNA1.ORT01 AS CITY
  FROM VBAK
  INNER JOIN KNA1 ON VBAK.KUNNR = KNA1.KUNNR
  WHERE VBAK.VKORG = '1000'
    AND VBAK.ERDAT >= '20240101'
  ORDER BY VBAK.ERDAT DESC
`;

await runQuery({
  sqlQuery: orderQuery,
  rowNumber: 100
});
```

### 2. 聚合统计查询
```javascript
// 按销售组织统计订单
const statsQuery = `
  SELECT 
    VKORG AS SALES_ORG,
    COUNT(*) AS ORDER_COUNT,
    SUM(NETWR) AS TOTAL_AMOUNT,
    AVG(NETWR) AS AVG_AMOUNT
  FROM VBAK
  WHERE ERDAT >= '20240101'
  GROUP BY VKORG
  ORDER BY TOTAL_AMOUNT DESC
`;

await runQuery({
  sqlQuery: statsQuery,
  rowNumber: 50
});
```

### 3. 子查询替代方案
```javascript
// ABAP Open SQL不支持子查询，可以使用分步查询

// 第一步：获取客户列表
const customers = await tableContents({
  ddicEntityName: "KNA1",
  rowNumber: 100,
  sqlQuery: "LAND1 EQ 'US'"
});

// 第二步：查询这些客户的订单
const customerIds = customers.rows.map(r => `'${r.KUNNR}'`).join(',');
const orders = await tableContents({
  ddicEntityName: "VBAK",
  rowNumber: 500,
  sqlQuery: `KUNNR IN (${customerIds})`
});
```

### 4. 动态SQL构建
```javascript
function buildCustomerQuery(filters) {
  let conditions = [];
  
  if (filters.country) {
    conditions.push(`LAND1 EQ '${filters.country}'`);
  }
  
  if (filters.city) {
    conditions.push(`ORT01 EQ '${filters.city}'`);
  }
  
  if (filters.region) {
    conditions.push(`REGIO EQ '${filters.region}'`);
  }
  
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}`
    : '';
  
  return `SELECT * FROM KNA1 ${whereClause} ORDER BY NAME1`;
}

const query = buildCustomerQuery({
  country: "US",
  city: "New York"
});

await runQuery({
  sqlQuery: query,
  rowNumber: 50
});
```

### 5. 查询性能分析
```javascript
async function analyzeQueryPerformance(sqlQuery) {
  const startTime = Date.now();
  
  const result = await runQuery({
    sqlQuery: sqlQuery,
    rowNumber: 10
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  return {
    query: sqlQuery,
    duration: duration,
    rowCount: result.rows.length,
    performance: duration < 1000 ? 'good' : duration < 5000 ? 'acceptable' : 'poor',
    recommendation: duration > 5000 ? 'Consider optimizing or adding indexes' : 'Performance is acceptable'
  };
}
```

## 示例

### 示例1：简单查询
```json
{
  "tool": "runQuery",
  "arguments": {
    "sqlQuery": "SELECT KUNNR, NAME1, ORT01 FROM KNA1 WHERE LAND1 = 'US' ORDER BY NAME1",
    "rowNumber": 10
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "KUNNR", "type": "CHAR", "length": 10 },
      { "name": "NAME1", "type": "CHAR", "length": 35 },
      { "name": "ORT01", "type": "CHAR", "length": 35 }
    ],
    "rows": [
      {
        "KUNNR": "0000000010",
        "NAME1": "Acme Corporation",
        "ORT01": "New York"
      },
      {
        "KUNNR": "0000000020",
        "NAME1": "Beta Industries",
        "ORT01": "Los Angeles"
      }
    ],
    "totalRows": 2,
    "executionTime": 45
  }
}
```

### 示例2：多表关联
```json
{
  "tool": "runQuery",
  "arguments": {
    "sqlQuery": "SELECT VBAK.VBELN, VBAK.NETWR, KNA1.NAME1 FROM VBAK INNER JOIN KNA1 ON VBAK.KUNNR = KNA1.KUNNR WHERE VBAK.VKORG = '1000' AND VBAK.ERDAT >= '20240101'",
    "rowNumber": 20
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "VBELN", "type": "CHAR", "length": 10 },
      { "name": "NETWR", "type": "CURR", "length": 15 },
      { "name": "NAME1", "type": "CHAR", "length": 35 }
    ],
    "rows": [
      {
        "VBELN": "0000000010",
        "NETWR": "5000.00",
        "NAME1": "Acme Corporation"
      },
      {
        "VBELN": "0000000015",
        "NETWR": "7500.00",
        "NAME1": "Beta Industries"
      }
    ],
    "totalRows": 2,
    "executionTime": 120
  }
}
```

### 示例3：聚合统计
```json
{
  "tool": "runQuery",
  "arguments": {
    "sqlQuery": "SELECT VKORG, COUNT(*) AS ORDER_COUNT, SUM(NETWR) AS TOTAL_AMOUNT FROM VBAK WHERE ERDAT >= '20240101' GROUP BY VKORG",
    "rowNumber": 10
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "columns": [
      { "name": "VKORG", "type": "CHAR", "length": 4 },
      { "name": "ORDER_COUNT", "type": "INT4", "length": 10 },
      { "name": "TOTAL_AMOUNT", "type": "CURR", "length": 15 }
    ],
    "rows": [
      {
        "VKORG": "1000",
        "ORDER_COUNT": 150,
        "TOTAL_AMOUNT": "750000.00"
      },
      {
        "VKORG": "2000",
        "ORDER_COUNT": 200,
        "TOTAL_AMOUNT": "1000000.00"
      }
    ],
    "totalRows": 2,
    "executionTime": 85
  }
}
```

### 示例4：完整的数据分析流程
```javascript
async function analyzeSalesPerformance() {
  // 1. 查询各销售组织的订单数量和金额
  const salesStats = await runQuery({
    sqlQuery: `
      SELECT 
        VKORG AS SALES_ORG,
        COUNT(*) AS ORDER_COUNT,
        SUM(NETWR) AS TOTAL_AMOUNT
      FROM VBAK
      WHERE ERDAT >= '20240101'
      GROUP BY VKORG
    `,
    rowNumber: 50
  });
  
  console.log("Sales Organization Statistics:");
  salesStats.rows.forEach(stat => {
    console.log(`${stat.SALES_ORG}: ${stat.ORDER_COUNT} orders, ${stat.TOTAL_AMOUNT}`);
  });
  
  // 2. 查询订单最多的客户
  const topCustomers = await runQuery({
    sqlQuery: `
      SELECT 
        VBAK.KUNNR AS CUSTOMER_ID,
        KNA1.NAME1 AS CUSTOMER_NAME,
        COUNT(*) AS ORDER_COUNT
      FROM VBAK
      INNER JOIN KNA1 ON VBAK.KUNNR = KNA1.KUNNR
      WHERE VBAK.ERDAT >= '20240101'
      GROUP BY VBAK.KUNNR, KNA1.NAME1
      ORDER BY ORDER_COUNT DESC
    `,
    rowNumber: 10
  });
  
  console.log("\nTop Customers:");
  topCustomers.rows.forEach(customer => {
    console.log(`${customer.CUSTOMER_NAME}: ${customer.ORDER_COUNT} orders`);
  });
  
  // 3. 返回综合报告
  return {
    salesStats: salesStats.rows,
    topCustomers: topCustomers.rows,
    reportGenerated: new Date().toISOString()
  };
}

// 使用示例
const report = await analyzeSalesPerformance();
console.log("Report:", report);
```

---

## 相关工具

- [tableContents](tableContents.md) - 简单的表查询
- [ddicElement](ddicElement.md) - 查询表结构
- [ddicRepositoryAccess](ddicRepositoryAccess.md) - 访问DDIC仓库
