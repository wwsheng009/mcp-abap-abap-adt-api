# tracesList

## 功能说明
获取系统中的追踪列表。追踪用于分析ABAP程序的执行路径、性能瓶颈和数据库访问。

## 调用方法
```json
{
  "tool": "tracesList",
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
  "traces": [
    {
      "id": "trace_001",
      "timestamp": "2024-01-30T10:30:00Z",
      "user": "DEVELOPER01",
      "program": "ZMY_PROGRAM",
      "status": "completed"
    }
  ]
}
```

## 使用场景
查看可用的追踪记录。

---

## 相关工具
- [tracesListRequests](tracesListRequests.md) - 获取追踪请求列表
- [tracesHitList](tracesHitList.md) - 获取命中列表
