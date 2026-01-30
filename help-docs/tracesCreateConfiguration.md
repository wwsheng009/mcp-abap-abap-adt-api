# tracesCreateConfiguration

## 功能说明
创建追踪配置，保存追踪的设置供以后使用。

## 调用方法
```json
{
  "tool": "tracesCreateConfiguration",
  "arguments": {
    "config": {
      "name": "DEBUG_CONFIG",
      "duration": 60,
      "level": "detail"
    }
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| config | object | 是 | 配置对象 |

## 返回结果示例
```json
{
  "status": "success",
  "created": true,
  "configId": "config_001"
}
```

## 使用场景
创建可重用的追踪配置。

---

## 相关工具
- [tracesSetParameters](tracesSetParameters.md) - 设置追踪参数
- [tracesDeleteConfiguration](tracesDeleteConfiguration.md) - 删除配置
