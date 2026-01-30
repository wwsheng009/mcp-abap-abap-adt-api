# tracesHitList

## 功能说明
获取追踪的命中列表，显示程序执行期间的命中统计信息。

## 调用方法
```json
{
  "tool": "tracesHitList",
  "arguments": {
    "id": "trace_001",
    "withSystemEvents": false
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 追踪ID |
| withSystemEvents | boolean | 否 | 是否包含系统事件 |

## 返回结果示例
```json
{
  "status": "success",
  "hits": [
    {
      "line": 50,
      "hits": 10,
      "time": "15ms"
    }
  ]
}
```

## 使用场景
分析程序执行的热点。

---

## 相关工具
- [tracesList](tracesList.md) - 获取追踪列表
- [tracesStatements](tracesStatements.md) - 获取语句追踪
