# tracesDelete

## 功能说明
删除追踪记录，释放存储空间。

## 调用方法
```json
{
  "tool": "tracesDelete",
  "arguments": {
    "id": "trace_001"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 追踪ID |

## 返回结果示例
```json
{
  "status": "success",
  "deleted": true
}
```

## 使用场景
删除不再需要的追踪记录。

---

## 相关工具
- [tracesList](tracesList.md) - 获取追踪列表
- [tracesCreateConfiguration](tracesCreateConfiguration.md) - 创建追踪配置
