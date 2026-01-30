# atcUsers

## 功能说明
获取ATC用户列表，显示有权访问和管理ATC的用户。此工具用于了解ATC的用户权限结构。

## 调用方法
```json
{
  "tool": "atcUsers",
  "arguments": {}
}
```

## 参数说明
无参数。

## 返回结果示例
```json
{
  "status": "success",
  "users": [
    {
      "username": "DEVELOPER01",
      "role": "developer",
      "permissions": ["view", "create_run"]
    },
    {
      "username": "QUALITY_USER",
      "role": "quality_manager",
      "permissions": ["view", "create_run", "exempt"]
    }
  ]
}
```

## 使用场景
查看ATC用户和权限配置。

---

## 相关工具
- [atcCustomizing](atcCustomizing.md) - 获取ATC配置
- [atcChangeContact](atcChangeContact.md) - 更改ATC联系人
