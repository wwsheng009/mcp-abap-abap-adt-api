# annotationDefinitions - 获取注解定义

## 功能说明

`annotationDefinitions` 工具用于获取 ABAP 系统中可用的注解（Annotation）定义列表。注解用于为 CDS 视图、数据元素等添加元数据，是 ABAP 编程中的重要特性。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("annotationDefinitions", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的注解定义列表：

```json
{
  "status": "success",
  "result": {
    "annotations": [
      {
        "name": "@EndUserText.label",
        "type": "string",
        "description": "End user text label",
        "category": "UI",
        "since": "7.40"
      },
      {
        "name": "@OData.publish",
        "type": "boolean",
        "description": "Publish as OData service",
        "category": "OData",
        "since": "7.50"
      },
      {
        "name": "@Analytics.query",
        "type": "boolean",
        "description": "Analytical query",
        "category": "Analytics",
        "since": "7.40"
      }
    ],
    "categories": ["UI", "OData", "Analytics", "Security"],
    "total": 50
  }
}
```

## 注意事项

1. 注解定义随 ABAP 版本而异
2. 某些高级注解可能需要特定版本
3. 注解名称区分大小写
4. 注解可以用于不同的对象类型

## 参数限制

无。

## 与其他工具的关联性

- 注解用于 `ddicElement` 中定义的数据元素
- CDS 视图中使用注解进行 OData 发布
- 与 `objectStructure` 配合使用了解对象结构

## 使用场景说明

1. **注解探索**: 查看系统中可用的所有注解
2. **CDS开发**: 在 CDS 视图中使用适当的注解
3. **OData配置**: 选择正确的 OData 发布注解
4. **UI定制**: 使用 UI 相关注解定制界面

## 最佳实践

1. 熟悉常用的注解类别
2. 查看 ABAP 版本要求
3. 选择最合适的注解类型
4. 组合使用多个注解

## 错误处理

可能的错误：
- **权限不足**: 无权访问注解定义
- **系统错误**: ABAP 系统内部错误
- **版本不支持**: 当前系统版本不支持某些注解

## 高级用法

```typescript
// 按类别过滤注解
function filterAnnotationsByCategory(annotations, category) {
  return annotations.filter(a => a.category === category);
}

// 查找特定注解
function findAnnotation(annotations, name) {
  return annotations.find(a => a.name === name);
}

// 获取版本兼容的注解
function getCompatibleAnnotations(annotations, version) {
  return annotations.filter(a => {
    const requiredVersion = parseFloat(a.since);
    return requiredVersion <= version;
  });
}

// 生成注解参考文档
async function generateAnnotationReference() {
  const result = await mcp.callTool("annotationDefinitions", {});
  const annotations = result.result.annotations;
  
  let reference = "# ABAP 注解参考\n\n";
  
  // 按类别分组
  const byCategory = {};
  annotations.forEach(a => {
    if (!byCategory[a.category]) {
      byCategory[a.category] = [];
    }
    byCategory[a.category].push(a);
  });
  
  // 生成文档
  for (const [category, items] of Object.entries(byCategory)) {
    reference += `## ${category}\n\n`;
    items.forEach(a => {
      reference += `### ${a.name}\n`;
      reference += `- **类型**: ${a.type}\n`;
      reference += `- **描述**: ${a.description}\n`;
      reference += `- **最低版本**: ${a.since}\n\n`;
    });
  }
  
  return reference;
}
```

## 示例

```typescript
// 获取所有注解定义
const result = await mcp.callTool("annotationDefinitions", {});

// 显示摘要
console.log(`\n注解定义统计:`);
console.log(`  总数: ${result.result.total}`);
console.log(`  类别数: ${result.result.categories.length}`);
console.log(`  类别: ${result.result.categories.join(', ')}`);

// 显示所有注解
console.log(`\n注解列表:`);
result.result.annotations.forEach((annotation, index) => {
  console.log(`\n${index + 1}. ${annotation.name}`);
  console.log(`   类型: ${annotation.type}`);
  console.log(`   类别: ${annotation.category}`);
  console.log(`   描述: ${annotation.description}`);
  console.log(`   最低版本: ${annotation.since}`);
});

// 查找特定注解
const odataPublish = result.result.annotations.find(a => 
  a.name === '@OData.publish'
);

if (odataPublish) {
  console.log(`\n✓ 找到 OData 发布注解:`);
  console.log(`  名称: ${odataPublish.name}`);
  console.log(`  类型: ${odataPublish.type}`);
  console.log(`  用途: ${odataPublish.description}`);
}

// 过滤 UI 相关注解
const uiAnnotations = result.result.annotations.filter(a => 
  a.category === 'UI'
);

console.log(`\nUI 注解 (${uiAnnotations.length} 个):`);
uiAnnotations.forEach(a => {
  console.log(`  - ${a.name}: ${a.description}`);
});

// 检查版本兼容性
const currentVersion = 7.50;
const compatibleAnnotations = result.result.annotations.filter(a => 
  parseFloat(a.since) <= currentVersion
);

console.log(`\n版本 ${currentVersion} 兼容的注解: ${compatibleAnnotations.length} 个`);

// 生成快速参考
console.log(`\n常用注解快速参考:`);
const commonAnnotations = [
  '@EndUserText.label',
  '@OData.publish',
  '@Analytics.query',
  '@UI.lineItem',
  '@VDM.viewType'
];

commonAnnotations.forEach(name => {
  const found = result.result.annotations.find(a => a.name === name);
  if (found) {
    console.log(`  ${name}: ${found.description}`);
  }
});
```

## 注解类别说明

### UI 类注解
用于控制界面显示和行为：
- `@EndUserText.*` - 用户界面文本
- `@UI.lineItem` - 列表显示
- `@UI.hidden` - 隐藏字段
- `@UI.identification` - 标识字段

### OData 类注解
用于 OData 服务配置：
- `@OData.publish` - 发布为 OData 服务
- `@OData.draft.enabled` - 启用草稿功能
- `@OData.etag` - ETag 支持

### Analytics 类注解
用于分析查询：
- `@Analytics.query` - 分析查询
- `@Analytics.details.query` - 详细查询
- `@Analytics.dataCategory` - 数据类别

### Security 类注解
用于安全配置：
- `@AccessControl.authorizationCheck` - 授权检查
- `@AccessControl.personalData` - 个人数据
- `@AccessControl.pseudonymization` - 假名化

## 使用注解示例

```typescript
// 在 CDS 视图中使用注解
@EndUserText.label: '销售订单'
@OData.publish: true
@Analytics.query: true
define view Z_SalesOrder as select from vbak {
  key vbeln as SalesOrder,
      erdat as CreationDate,
      ernam as CreatedBy
};
```
