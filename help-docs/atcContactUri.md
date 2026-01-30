# atcContactUri

## 功能说明
获取ATC问题的联系URI，用于联系负责该问题的人员或团队。

## 调用方法
```json
{
  "tool": "atcContactUri",
  "arguments": {
    "findingUri": "/sap/bc/adt/atc/findings/find_001"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| findingUri | string | 是 | 问题URI |

## 返回结果示例
```json
{
  "status": "success",
  "contact": {
    "uri": "mailto:quality.team@company.com",
    "name": "Quality Assurance Team",
    "role": "ATC Administrator"
  }
}
```

## 使用场景
获取问题负责人的联系信息。

---

## 相关工具
- [atcChangeContact](atcChangeContact.md) - 更改联系人
- [atcWorklists](atcWorklists.md) - 获取工作列表
