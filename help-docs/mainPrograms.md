# mainPrograms

检索给定 Include 的主程序。

## 功能说明

此工具用于查找包含指定 Include 的所有主程序。Include 是 ABAP 程序中可重用的代码片段。

## 调用方法

**参数**:
- `includeUrl` (string, 必需): Include 的 URL

**返回值**:
```json
{
  "status": "success",
  "mainPrograms": [
    {
      "name": "ZMY_PROGRAM_1",
      "url": "/sap/bc/adt/programs/programs/zmy_program_1",
      "type": "program"
    },
    {
      "name": "ZMY_PROGRAM_2",
      "url": "/sap/bc/adt/programs/programs/zmy_program_2",
      "type": "program"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "mainPrograms",
  "arguments": {
    "includeUrl": "/sap/bc/adt/programs/includes/zmy_include"
  }
}
```

## 注意事项

1. **Include URL**: 必须提供完整的 Include URL

2. **多个主程序**: 一个 Include 可能被多个主程序使用

3. **依赖关系**: 返回主程序和 Include 之间的依赖关系

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| includeUrl | string | 是 | 有效的 Include URL |

## 与其他工具的关联性

1. **与 objectStructure 的关系**:
   ```
   objectStructure (查看结构) → mainPrograms (查找主程序)
   ```

2. **与 usageReferences 的关系**:
   ```
   mainPrograms (查找主程序) → usageReferences (查看使用)
   ```

## 使用场景说明

### 场景 1: 查找使用 Include 的程序
```json
{
  "tool": "mainPrograms",
  "arguments": {
    "includeUrl": "/sap/bc/adt/programs/includes/zmy_include"
  }
}
// 返回所有使用此 Include 的主程序
```

### 场景 2: 依赖分析
```json
{
  "tool": "mainPrograms",
  "arguments": {
    "includeUrl": "/sap/bc/adt/programs/includes/zcommon_include"
  }
}
// 分析哪些程序依赖于这个公共 Include
```

## Include 类型

| 类型 | 说明 |
|------|------|
| Include | 可重用的代码片段 |
| Function Include | 函数模块的 Include |
| Class Include | 类的 Include |
| Report Include | 报告的 Include |

## 最佳实践

1. **依赖管理**: 了解 Include 的使用范围

2. **影响分析**: 修改 Include 前分析影响

3. **重构支持**: 在重构时了解依赖关系

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Include 不存在 | Include URL 无效 | 检查 Include URL |
| 权限不足 | 没有查看权限 | 联系管理员 |

## 高级用法

### 影响分析
```json
// 修改 Include 前分析影响
{
  "tool": "mainPrograms",
  "arguments": {
    "includeUrl": "/sap/bc/adt/programs/includes/zmy_include"
  }
}
// 获取所有受影响的主程序
// 然后修改 Include
// 最后测试所有受影响的程序
```

### 依赖图
```json
// 构建 Include 依赖图
for each include in includes:
  {
    "tool": "mainPrograms",
    "arguments": {
      "includeUrl": include.url
    }
  }
// 构建依赖关系图
```
