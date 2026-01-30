# tracesDbAccess

## 功能说明
获取追踪的数据库访问信息，显示程序执行期间的数据库操作。

## 调用方法
```json
{
  "tool": "tracesDbAccess",
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
  "dbAccess": [
    {
      "table": "VBAK",
      "operation": "SELECT",
      "time": "25ms",
      "records": 100
    }
  ]
}
```

## 使用场景
分析数据库访问性能。

---

## 相关工具
- [tracesList](tracesList.md) - 获取追踪列表
- [tracesStatements](tracesStatements.md) - 获取语句追踪
