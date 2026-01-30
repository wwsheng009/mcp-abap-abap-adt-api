# fragmentMappings

检索片段映射。

## 功能说明

此工具用于获取对象的片段映射信息,了解对象的组成部分及其位置。

## 调用方法

**参数**:
- `url` (string, 必需): 对象 URL
- `type` (string, 必需): 片段类型
- `name` (string, 必需): 片段名称

**返回值**:
```json
{
  "status": "success",
  "result": {
    "fragment": {
      "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
      "type": "method",
      "name": "execute",
      "lineStart": 10,
      "lineEnd": 20,
      "offset": 150
    }
  }
}
```

**示例**:
```json
{
  "tool": "fragmentMappings",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "type": "method",
    "name": "execute"
  }
}
```

## 注意事项

1. **片段类型**: 可以是 method, attribute, type 等

2. **位置信息**: 返回片段的行范围

3. **偏移**: 返回字节偏移量

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 有效的对象 URL |
| type | string | 是 | 片段类型 |
| name | string | 是 | 片段名称 |

## 与其他工具的关联性

1. **与 classComponents 的关系**:
   ```
   classComponents (获取组件) → fragmentMappings (获取位置)
   ```

2. **与 getObjectSourceV2 的关系**:
   ```
   fragmentMappings → 获取行范围 → getObjectSourceV2
   ```

## 使用场景说明

### 场景 1: 定位方法
```json
{
  "tool": "fragmentMappings",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "type": "method",
    "name": "execute"
  }
}
// 返回方法的行范围
```

## 片段类型

| 类型 | 说明 |
|------|------|
| method | 方法 |
| attribute | 属性 |
| type | 类型 |
| interface | 接口 |

## 最佳实践

1. **精确定位**: 用于精确定位代码片段

2. **代码导航**: 配合代码导航功能使用

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 片段不存在 | 指定的片段不存在 | 检查名称和类型 |

## 高级用法

### 代码重构
```json
// 在重构时精确定位代码
{
  "tool": "fragmentMappings",
  "arguments": {
    "url": "...",
    "type": "method",
    "name": "old_method"
  }
}
// 获取旧方法的位置,然后替换
```
