# atcCheckVariant

## 功能说明
获取特定ATC检查变体的详细信息。检查变体定义了要执行的检查集合、对象范围和优先级。

## 调用方法
```json
{
  "tool": "atcCheckVariant",
  "arguments": {
    "variant": "DEFAULT_CHECK"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| variant | string | 是 | 检查变体名称 |

## 返回结果示例
```json
{
  "status": "success",
  "variant": {
    "name": "DEFAULT_CHECK",
    "checks": ["SYNTAX_CHECK", "SECURITY_CHECK"],
    "objectSet": "ALL_OBJECTS",
    "priority": "high"
  }
}
```

## 使用场景
查看检查变体的配置，了解将要执行的检查类型。

---

## 相关工具
- [atcCustomizing](atcCustomizing.md) - 获取ATC配置
- [createAtcRun](createAtcRun.md) - 创建ATC运行
