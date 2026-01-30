# hasTransportConfig

检查系统是否支持传输配置。

## 功能说明

此工具用于检查 SAP 系统是否支持传输配置功能。并非所有系统都支持此功能。

## 调用方法

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "hasConfig": true
}
```

**示例**:
```json
{
  "tool": "hasTransportConfig",
  "arguments": {}
}
```

## 注意事项

1. **系统依赖**: 不同版本的 SAP 系统可能支持程度不同

2. **功能检测**: 此工具用于检测功能可用性

3. **版本要求**: 通常需要较新的 SAP 版本

## 参数限制

- 无参数

## 与其他工具的关联性

1. **功能检测**:
   ```
   hasTransportConfig → (如果 true) → transportConfigurations
   ```

2. **降级处理**:
   ```
   hasTransportConfig → false → 使用 userTransports
   ```

## 使用场景说明

### 场景 1: 检查功能支持
```json
{
  "tool": "hasTransportConfig",
  "arguments": {}
}
// 如果返回 true，可以使用传输配置功能
```

### 场景 2: 条件使用
```json
{
  "tool": "hasTransportConfig",
  "arguments": {}
}
// 根据返回值决定使用哪些工具
```

## 功能支持情况

| SAP 版本 | 支持 | 说明 |
|---------|------|------|
| 7.40+ | 是 | 完整支持 |
| 7.30-7.39 | 部分 | 部分功能支持 |
| <7.30 | 否 | 不支持 |

