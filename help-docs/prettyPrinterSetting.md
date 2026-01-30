# prettyPrinterSetting - 获取格式化打印设置

## 功能说明

`prettyPrinterSetting` 工具用于获取当前 ABAP 代码格式化打印器的设置。这些设置控制代码自动格式化的行为，包括缩进、样式、关键字处理等。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("prettyPrinterSetting", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的格式化设置：

```json
{
  "status": "success",
  "settings": {
    "indent": true,
    "style": "upper_lower",
    "keywords": "uppercase",
    "comments": "preserve",
    "blankLines": "compact",
    "alignment": "align",
    "maxLineLength": 120,
    "indentSize": 2,
    "indentType": "spaces",
    "formatOptions": {
      "convertCase": true,
      "optimizeImports": true,
      "sortComponents": false
    },
    "profile": "SAP_STANDARD"
  }
}
```

## 注意事项

1. 设置是全局的，适用于所有格式化操作
2. 某些设置可能因系统版本而异
3. 修改设置需要相应的权限
4. 设置可能在不同的工作空间中有所不同

## 参数限制

无。

## 与其他工具的关联性

- 设置应用于 `prettyPrinter` 工具的格式化操作
- 使用 `setPrettyPrinterSetting` 修改设置
- 格式化后的代码可通过 `setObjectSourceV2` 保存

## 使用场景说明

1. **设置查看**: 查看当前格式化配置
2. **一致性检查**: 确保格式化设置符合团队标准
3. **配置导入**: 将设置导出到其他环境
4. **调试格式化**: 分析格式化问题

## 最佳实践

1. 在首次连接时获取并保存设置
2. 遵循团队的编码规范配置设置
3. 在不同环境间保持一致的格式化设置
4. 定期审查和更新设置

## 错误处理

可能的错误：
- **权限不足**: 无权访问格式化设置
- **系统错误**: ABAP 系统内部错误
- **配置损坏**: 设置数据损坏或无效

## 高级用法

```typescript
// 比较两个环境中的格式化设置
function compareSettings(settings1, settings2) {
  const differences = [];
  for (const key in settings1) {
    if (JSON.stringify(settings1[key]) !== JSON.stringify(settings2[key])) {
      differences.push({
        key,
        value1: settings1[key],
        value2: settings2[key]
      });
    }
  }
  return differences;
}

// 验证设置是否符合团队标准
function validateSettings(settings, standards) {
  const violations = [];
  for (const [key, standard] of Object.entries(standards)) {
    if (settings[key] !== standard) {
      violations.push({
        key,
        expected: standard,
        actual: settings[key]
      });
    }
  }
  return violations;
}

// 生成设置文档
function generateSettingsDocumentation(settings) {
  let doc = "ABAP 格式化设置\n";
  doc += "================\n\n";
  for (const [key, value] of Object.entries(settings)) {
    doc += `${key}: ${JSON.stringify(value)}\n`;
  }
  return doc;
}
```

## 示例

```typescript
// 获取当前格式化设置
const result = await mcp.callTool("prettyPrinterSetting", {});
const settings = result.settings;

// 显示关键设置
console.log('格式化打印设置:');
console.log(`  缩进: ${settings.indent ? '启用' : '禁用'}`);
console.log(`  样式: ${settings.style}`);
console.log(`  关键字: ${settings.keywords}`);
console.log(`  注释处理: ${settings.comments}`);
console.log(`  最大行长: ${settings.maxLineLength}`);
console.log(`  缩进大小: ${settings.indentSize}`);
console.log(`  缩进类型: ${settings.indentType}`);
console.log(`  配置文件: ${settings.profile}`);

// 检查是否符合团队标准
const teamStandards = {
  indent: true,
  style: 'upper_lower',
  keywords: 'uppercase',
  indentSize: 2
};

for (const [key, expected] of Object.entries(teamStandards)) {
  const actual = settings[key];
  if (actual !== expected) {
    console.log(`⚠️  ${key} 设置不符合标准 (预期: ${expected}, 实际: ${actual})`);
  }
}
```
