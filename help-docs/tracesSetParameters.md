# tracesSetParameters

## 功能说明
设置追踪参数，配置追踪的选项和行为。

## 调用方法
```json
{
  "tool": "tracesSetParameters",
  "arguments": {
    "parameters": {
      "duration": 60,
      "level": "detail",
      "includeSystem": false
    }
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parameters | object | 是 | 追踪参数对象 |

## 返回结果示例
```json
{
  "status": "success",
  "set": true,
  "parameters": {
    "duration": 60,
    "level": "detail",
    "includeSystem": false
  }
}
```

## 使用场景
配置追踪选项。

---

## 相关工具
- [tracesCreateConfiguration](tracesCreateConfiguration.md) - 创建追踪配置
- [tracesList](tracesList.md) - 获取追踪列表
