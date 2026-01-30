# atcCustomizing

## 功能说明
获取ATC（ABAP Test Cockpit）自定义配置信息。ATC是SAP系统中的代码质量检查工具，此工具用于查看当前系统的ATC配置。

## 调用方法
```json
{
  "tool": "atcCustomizing",
  "arguments": {}
}
```

## 参数说明
无参数。

## 返回结果示例
```json
{
  "status": "success",
  "customizing": {
    "enabled": true,
    "defaultVariant": "DEFAULT_CHECK",
    "categories": ["syntax", "security", "performance"],
    "severityLevels": ["error", "warning", "info"]
  }
}
```

## 使用场景
查看系统的ATC配置，了解可用的检查类别和严重级别。

---

## 相关工具
- [atcCheckVariant](atcCheckVariant.md) - 获取检查变体信息
- [createAtcRun](createAtcRun.md) - 创建ATC运行
