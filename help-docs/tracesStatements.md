# tracesStatements

## 功能说明
获取追踪的语句信息，显示程序执行的详细语句记录。

## 调用方法
```json
{
  "tool": "tracesStatements",
  "arguments": {
    "id": "trace_001",
    "options": "DETAIL"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 追踪ID |
| options | string | 否 | 选项（如DETAIL、SUMMARY） |

## 返回结果示例
```json
{
  "status": "success",
  "statements": [
    {
      "line": 50,
      "statement": "SELECT * FROM VBAK WHERE VBELN = @lv_vbeln",
      "time": "25ms"
    }
  ]
}
```

## 使用场景
详细分析程序执行过程。

---

## 相关工具
- [tracesList](tracesList.md) - 获取追踪列表
- [tracesDbAccess](tracesDbAccess.md) - 获取数据库访问信息
