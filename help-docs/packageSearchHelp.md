# packageSearchHelp - 包搜索帮助

## 功能说明

`packageSearchHelp` 工具用于执行包级别的搜索帮助操作。这对于查找包相关的帮助信息、搜索包内的对象或获取包的搜索辅助非常有用。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("packageSearchHelp", {
  type: "PACKAGE",
  name: "Z_MY_PACKAGE"
});
```

## 参数说明

- **type** (string, 必需): 包值帮助的类型
  - `PACKAGE`: 包搜索
  - `OBJECT`: 对象搜索
  - `FIELD`: 字段搜索
  - 其他支持的搜索类型

- **name** (string, 可选): 包名称
  - 用于限定搜索范围
  - 如果省略，可能返回全局搜索结果

## 返回结果

返回 JSON 格式的搜索帮助结果：

```json
{
  "status": "success",
  "result": {
    "type": "PACKAGE",
    "packageName": "Z_MY_PACKAGE",
    "matches": [
      {
        "name": "ZCL_MY_CLASS",
        "type": "CLAS",
        "description": "我的类",
        "path": "/sap/bc/adt/oo/classes/zcl_my_class"
      },
      {
        "name": "ZMY_PROG",
        "type": "PROG",
        "description": "我的程序",
        "path": "/sap/bc/adt/programs/zmy_prog"
      },
      {
        "name": "ZMY_TABLE",
        "type": "TABL",
        "description": "我的表",
        "path": "/sap/bc/adt/ddic/tables/zmy_table"
      }
    ],
    "total": 3,
    "helpAvailable": true
  }
}
```

## 注意事项

1. 搜索类型必须受系统支持
2. 搜索结果可能受权限限制
3. 返回的匹配项数量可能有限制
4. 某些搜索类型可能需要特定参数

## 参数限制

- `type` 必须是有效的搜索类型
- `name` 如果提供，必须是有效的包名

## 与其他工具的关联性

- 与 `searchObject` 配合使用进行对象搜索
- 使用 `findObjectPath` 查找对象路径
- 与 `objectStructure` 配合了解对象结构
- 搜索结果可用于 `getObjectSourceV2`

## 使用场景说明

1. **包浏览**: 浏览包内的对象
2. **快速查找**: 快速找到特定对象
3. **搜索辅助**: 获取搜索帮助和提示
4. **对象发现**: 发现包中可用的对象

## 最佳实践

1. 使用正确的搜索类型
2. 指定包名以缩小搜索范围
3. 查看匹配的描述和类型
4. 结合其他工具获取详细信息

## 错误处理

可能的错误：
- **类型无效**: 指定的搜索类型不支持
- **包不存在**: 指定的包不存在
- **权限不足**: 无权搜索该包
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 在包内搜索对象
async function searchInPackage(packageName, objectPattern) {
  const result = await mcp.callTool("packageSearchHelp", {
    type: "OBJECT",
    name: packageName
  });
  
  // 过滤匹配对象
  const matches = result.result.matches.filter(m => 
    m.name.toLowerCase().includes(objectPattern.toLowerCase())
  );
  
  return {
    package: packageName,
    pattern: objectPattern,
    matches,
    count: matches.length
  };
}

// 按类型分组搜索结果
function groupByType(matches) {
  const grouped = {};
  
  matches.forEach(match => {
    if (!grouped[match.type]) {
      grouped[match.type] = [];
    }
    grouped[match.type].push(match);
  });
  
  return grouped;
}

// 搜索多个包
async function searchMultiplePackages(packageNames, type) {
  const results = {};
  
  for (const pkg of packageNames) {
    try {
      const result = await mcp.callTool("packageSearchHelp", {
        type,
        name: pkg
      });
      
      results[pkg] = {
        success: true,
        count: result.result.total,
        matches: result.result.matches
      };
    } catch (error) {
      results[pkg] = {
        success: false,
        error: error.message
      };
    }
  }
  
  return results;
}

// 生成包内容报告
async function generatePackageReport(packageName) {
  const result = await mcp.callTool("packageSearchHelp", {
    type: "PACKAGE",
    name: packageName
  });
  
  const matches = result.result.matches;
  const grouped = groupByType(matches);
  
  let report = `# 包报告: ${packageName}\n\n`;
  report += `总对象数: ${matches.length}\n\n`;
  
  for (const [type, items] of Object.entries(grouped)) {
    report += `## ${type} (${items.length} 个)\n\n`;
    items.forEach(item => {
      report += `- ${item.name}: ${item.description || '无描述'}\n`;
    });
  }
  
  return report;
}
```

## 示例

```typescript
// 搜索包内的对象
const packageName = "Z_MY_PACKAGE";
const searchType = "OBJECT";

console.log(`搜索包: ${packageName}`);
console.log(`搜索类型: ${searchType}`);

const result = await mcp.callTool("packageSearchHelp", {
  type: searchType,
  name: packageName
});

// 显示搜索结果
const matches = result.result.matches;
console.log(`\n搜索结果:`);
console.log(`  包名称: ${result.result.packageName}`);
console.log(`  匹配数: ${result.result.total}`);
console.log(`  帮助可用: ${result.result.helpAvailable ? '是' : '否'}`);

// 显示所有匹配项
if (matches.length > 0) {
  console.log(`\n匹配对象 (${matches.length} 个):`);
  console.log('  名称              | 类型  | 描述');
  console.log('  -------------------|-------|------------------------------');
  
  matches.forEach(match => {
    const name = match.name.padEnd(19);
    const type = match.type.padEnd(5);
    const desc = (match.description || '无').substring(0, 28);
    console.log(`  ${name} | ${type} | ${desc}`);
  });
  
  // 按类型分组统计
  const byType = groupByType(matches);
  console.log(`\n按类型统计:`);
  for (const [type, items] of Object.entries(byType)) {
    console.log(`  ${type}: ${items.length} 个`);
  }
  
} else {
  console.log('\n未找到匹配的对象');
}

// 查找特定类型的对象
console.log('\n查找类对象:');
const classes = matches.filter(m => m.type === 'CLAS');

if (classes.length > 0) {
  classes.forEach(cls => {
    console.log(`  - ${cls.name}: ${cls.description || '无描述'}`);
  });
} else {
  console.log('  未找到类对象');
}

// 搜索多个包
console.log('\n搜索多个包:');
const packages = ["Z_PACKAGE_1", "Z_PACKAGE_2", "Z_PACKAGE_3"];

for (const pkg of packages) {
  try {
    const pkgResult = await mcp.callTool("packageSearchHelp", {
      type: "PACKAGE",
      name: pkg
    });
    
    console.log(`\n${pkg}:`);
    console.log(`  对象数: ${pkgResult.result.total}`);
    console.log(`  类型分布: ${[...new Set(pkgResult.result.matches.map(m => m.type))].join(', ')}`);
    
  } catch (error) {
    console.log(`\n${pkg}:`);
    console.log(`  状态: 错误`);
    console.log(`  消息: ${error.message}`);
  }
}

// 不指定包名进行全局搜索
console.log('\n全局搜索（不指定包）:');
try {
  const globalResult = await mcp.callTool("packageSearchHelp", {
    type: "OBJECT"
  });
  
  console.log(`全局匹配数: ${globalResult.result.total}`);
  
  // 显示前10个匹配
  const topMatches = globalResult.result.matches.slice(0, 10);
  console.log('\n前10个匹配:');
  topMatches.forEach((match, index) => {
    console.log(`  ${index + 1}. ${match.name} (${match.type})`);
  });
  
} catch (error) {
  console.log(`全局搜索失败: ${error.message}`);
}
```

## 搜索类型说明

### PACKAGE
包级别的搜索
- 返回包内的所有对象
- 按对象类型分组

### OBJECT
对象搜索
- 搜索特定类型的对象
- 支持模式匹配

### FIELD
字段搜索
- 搜索数据字段
- 返回字段定义和属性

## 对象类型代码

| 代码 | 类型 | 说明 |
|------|------|------|
| CLAS | 类 | ABAP 类 |
| PROG | 程序 | ABAP 程序 |
| FUGR | 函数组 | 函数组 |
| TABL | 表 | 数据库表 |
| VIEW | 视图 | 数据库视图 |
| INTF | 接口 | ABAP 接口 |
| DEVC | 包 | 开发类 |

## 搜索技巧

1. **使用通配符**: 某些搜索支持 * 和 ?
2. **区分大小写**: 某些搜索区分大小写
3. **部分匹配**: 可以搜索部分名称
4. **类型过滤**: 根据类型过滤结果

## 搜索工作流

```typescript
// 完整的对象搜索工作流
async function objectSearchWorkflow(objectName, packageName) {
  console.log(`搜索对象: ${objectName}`);
  
  // 1. 在指定包中搜索
  const pkgResult = await mcp.callTool("packageSearchHelp", {
    type: "OBJECT",
    name: packageName
  });
  
  const exactMatch = pkgResult.result.matches.find(m => 
    m.name.toUpperCase() === objectName.toUpperCase()
  );
  
  if (exactMatch) {
    console.log(`\n✓ 在包 ${packageName} 中找到对象`);
    console.log(`  类型: ${exactMatch.type}`);
    console.log(`  路径: ${exactMatch.path}`);
    
    // 2. 获取对象详情
    const details = await mcp.callTool("ddicElement", {
      path: exactMatch.name
    });
    
    return {
      found: true,
      object: exactMatch,
      details: details.result
    };
  }
  
  // 3. 全局搜索
  console.log('\n在包中未找到，进行全局搜索...');
  const globalResult = await mcp.callTool("packageSearchHelp", {
    type: "OBJECT"
  });
  
  const globalMatches = globalResult.result.matches.filter(m => 
    m.name.toUpperCase() === objectName.toUpperCase()
  );
  
  if (globalMatches.length > 0) {
    console.log(`\n✓ 在全局搜索中找到 ${globalMatches.length} 个匹配`);
    globalMatches.forEach(match => {
      console.log(`  ${match.name} (${match.type})`);
    });
  } else {
    console.log('\n✗ 未找到该对象');
  }
}
```
