# transportDelete

删除传输请求。

## 功能说明

此工具用于删除传输请求。删除是不可逆操作,需要谨慎使用。

## 调用方法

**参数**:
- `transportNumber` (string, 必需): 传输请求号

**返回值**:
```json
{
  "status": "success",
  "deleted": true,
  "transport": "DEVK900001",
  "message": "Transport deleted successfully"
}
```

**示例**:
```json
{
  "tool": "transportDelete",
  "arguments": {
    "transportNumber": "DEVK900001"
  }
}
```

## 注意事项

1. **不可逆**: 删除无法撤销

2. **已释放传输**: 通常不能删除已释放的传输

3. **任务检查**: 确保传输中没有重要任务

4. **权限要求**: 需要删除传输的权限

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| transportNumber | string | 是 | 有效的传输请求号 |

## 与其他工具的关联性

1. **与 transportRelease 的关系**:
   ```
   释放前: transportRelease (释放)
   删除: transportDelete (删除未释放的)
   ```

2. **与 transportsByConfig 的关系**:
   ```
   transportsByConfig (查看传输) → transportDelete (删除)
   ```

## 使用场景说明

### 场景 1: 删除不需要的传输
```json
{
  "tool": "transportDelete",
  "arguments": {
    "transportNumber": "DEVK900001"
  }
}
```

### 场景 2: 清理测试传输
```json
// 查看测试环境的传输
{
  "tool": "transportsByConfig",
  "arguments": {
    "configUri": "/sap/bc/adt/cts/transportconfigurations/test"
  }
}
// 删除测试传输
for each transport in transports:
  {
    "tool": "transportDelete",
    "arguments": {
      "transportNumber": transport.trkorr
    }
  }
```

## 删除条件

| 条件 | 说明 |
|------|------|
| 未释放 | 必须是未释放状态 |
| 无任务 | 传输中没有任务或对象 |
| 权限 | 用户必须有删除权限 |

## 最佳实践

1. **确认删除**: 删除前确认传输确实不需要

2. **检查依赖**: 检查是否有其他传输依赖此传输

3. **已释放传输**: 不要删除已释放的传输

4. **备份**: 删除前记录传输内容

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 传输已释放 | 传输已释放,无法删除 | 不能删除已释放的传输 |
| 权限不足 | 没有删除权限 | 联系管理员 |
| 传输不存在 | 传输号不存在 | 检查传输号 |
| 包含任务 | 传输中有任务 | 先删除任务或对象 |

## 高级用法

### 批量删除
```json
// 批量删除多个传输
for each transportNumber in transportNumbers:
  {
    "tool": "transportDelete",
    "arguments": {
      "transportNumber": transportNumber
    }
  }
```

### 清理旧传输
```json
// 清理超过一定时间的传输
{
  "tool": "transportsByConfig",
  "arguments": { "configUri": "..." }
}
// 过滤创建时间超过30天的传输
// 然后删除
```
