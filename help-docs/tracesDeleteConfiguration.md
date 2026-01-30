# tracesDeleteConfiguration

## 功能说明
删除追踪配置。

## 调用方法
```json
{
  "tool": "tracesDeleteConfiguration",
  "arguments": {
    "id": "config_001"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 配置ID |

## 返回结果示例
```json
{
  "status": "success",
  "deleted": true
}
```

## 使用场景
删除不再需要的追踪配置。

---

## 相关工具
- [tracesCreateConfiguration](tracesCreateConfiguration.md) - 创建追踪配置
- [tracesList](tracesList.md) - 获取追踪列表
