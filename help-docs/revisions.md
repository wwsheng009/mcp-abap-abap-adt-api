# revisions

## 功能说明
获取ABAP对象的版本历史，显示对象的所有修改记录。

## 调用方法
```json
{
  "tool": "revisions",
  "arguments": {
    "objectUrl": "/sap/bc/adt/programs/programs/zmy_program.abap",
    "clsInclude": "active"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| objectUrl | string | 是 | 对象URL |
| clsInclude | string | 否 | 类包含（用于类对象） |

## 返回结果示例
```json
{
  "status": "success",
  "revisions": [
    {
      "version": "1",
      "timestamp": "2024-01-15T10:00:00Z",
      "author": "DEVELOPER01",
      "description": "Initial version"
    },
    {
      "version": "2",
      "timestamp": "2024-01-30T14:30:00Z",
      "author": "DEVELOPER02",
      "description": "Performance optimization"
    }
  ]
}
```

## 使用场景
查看对象的修改历史，追踪变更。

---

## 相关工具
- [getObjectSourceV2](getObjectSourceV2.md) - 获取对象源代码
- [searchObject](searchObject.md) - 搜索对象
