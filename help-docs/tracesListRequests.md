# tracesListRequests

## 功能说明
获取追踪请求列表，显示所有追踪请求的详细信息。

## 调用方法
```json
{
  "tool": "tracesListRequests",
  "arguments": {
    "user": "DEVELOPER01"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user | string | 否 | 用户名，用于过滤 |

## 返回结果示例
```json
{
  "status": "success",
  "requests": [
    {
      "id": "req_001",
      "traceId": "trace_001",
      "timestamp": "2024-01-30T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

## 使用场景
查看追踪请求的详细信息。

---

## 相关工具
- [tracesList](tracesList.md) - 获取追踪列表
- [tracesHitList](tracesHitList.md) - 获取命中列表
