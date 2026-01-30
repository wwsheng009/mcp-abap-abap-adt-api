# setPrettyPrinterSetting - 设置格式化打印参数

## 功能说明

`setPrettyPrinterSetting` 工具用于设置 ABAP 代码格式化打印器的参数。这些参数控制代码自动格式化的行为和样式。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("setPrettyPrinterSetting", {
  indent: true,
  style: "upper_lower"
});
```

## 参数说明

- **indent** (boolean, 必需): 是否启用缩进
  - `true`: 启用缩进
  - `false`: 禁用缩进

- **style** (string, 必需): 格式化样式
  - `upper_lower`: 大小写混合（推荐）
  - `uppercase`: 全大写
  - `lowercase`: 全小写
  - `preserve`: 保持原样

## 返回结果

返回 JSON 格式的设置结果：

```json
{
  "status": "success",
  "result": {
    "updated": true,
    "settings": {
      "indent": true,
      "style": "upper_lower",
      "keywords": "uppercase"
    },
    "message": "Pretty printer settings updated successfully"
  }
}
```

## 注意事项

1. 设置更改会影响后续的所有格式化操作
2. 修改设置需要相应的权限
3. 某些样式选项可能因 ABAP 版本而异
4. 设置可能在会话结束后重置

## 参数限制

- `indent` 必须是布尔值
- `style` 必须是有效的样式名称
- 无效参数会导致错误

## 与其他工具的关联性

- 新设置应用于后续的 `prettyPrinter` 调用
- 使用 `prettyPrinterSetting` 查看当前设置
- 格式化后的代码通过 `setObjectSourceV2` 保存

## 使用场景说明

1. **标准化配置**: 为项目设置统一的代码格式
2. **临时调整**: 临时修改格式化行为
3. **环境迁移**: 在不同环境间应用相同设置
4. **团队协作**: 确保团队成员使用相同的格式化规则

## 最佳实践

1. 遵循团队的编码规范配置样式
2. 在项目文档中记录格式化设置
3. 考虑使用版本控制管理设置配置
4. 测试格式化效果以确保符合预期

## 错误处理

可能的错误：
- **权限不足**: 无权修改格式化设置
- **无效参数**: 提供的参数值无效
- **系统错误**: ABAP 系统内部错误
- **只读设置**: 某些设置不能被修改

## 高级用法

```typescript
// 应用团队标准配置
async function applyTeamStandards() {
  const teamConfig = {
    indent: true,
    style: 'upper_lower'
  };
  
  return await mcp.callTool("setPrettyPrinterSetting", teamConfig);
}

// 切换到不同的格式化样式
async function switchStyle(newStyle) {
  const currentSettings = await mcp.callTool("prettyPrinterSetting", {});
  return await mcp.callTool("setPrettyPrinterSetting", {
    indent: currentSettings.settings.indent,
    style: newStyle
  });
}

// 验证设置是否生效
async function verifySettings(expectedSettings) {
  const result = await mcp.callTool("prettyPrinterSetting", {});
  const actual = result.settings;
  
  return {
    indent: actual.indent === expectedSettings.indent,
    style: actual.style === expectedSettings.style
  };
}
```

## 示例

```typescript
// 设置格式化参数
const result = await mcp.callTool("setPrettyPrinterSetting", {
  indent: true,
  style: "upper_lower"
});

console.log(`设置更新: ${result.result.updated}`);
console.log(`消息: ${result.result.message}`);

// 验证设置
const verification = await mcp.callTool("prettyPrinterSetting", {});
console.log(`当前缩进设置: ${verification.settings.indent}`);
console.log(`当前样式设置: ${verification.settings.style}`);

// 格式化代码
const code = "DATA: lv_value TYPE i.";
const formatted = await mcp.callTool("prettyPrinter", {
  source: code
});

console.log(`\n原始代码:\n${code}`);
console.log(`\n格式化后:\n${formatted.result.source}`);
```
