# atcChangeContact

## 功能说明
更改ATC问题的联系人，将问题重新分配给其他用户或团队。

## 调用方法
```json
{
  "tool": "atcChangeContact",
  "arguments": {
    "itemUri": "/sap/bc/adt/atc/findings/find_001",
    "userId": "QUALITY_USER"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| itemUri | string | 是 | 项目URI |
| userId | string | 是 | 用户ID |

## 返回结果示例
```json
{
  "status": "success",
  "changed": true,
  "previousContact": "DEVELOPER01",
  "newContact": "QUALITY_USER",
  "changedAt": "2024-01-30T10:30:00Z"
}
```

## 使用场景
重新分配问题给其他用户。

---

## 相关工具
- [atcContactUri](atcContactUri.md) - 获取联系人URI
- [atcWorklists](atcWorklists.md) - 获取工作列表
