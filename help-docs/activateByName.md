# activateByName

按名称和 URL 激活对象。

## 功能说明

此工具用于按对象名称和 URL 激活单个 ABAP 对象。与 `activateObjects` 不同，此工具用于激活单个对象，提供更简洁的接口。

## 调用方法

**参数**:
- `object` (string, 必需): 对象名称
- `url` (string, 必需): 对象 URL
- `mainInclude` (string, 可选): 主包含文件 URL
- `preauditRequested` (boolean, 可选): 是否请求预审计，默认 false

**返回值**:
```json
{
  "status": "success",
  "activated": true,
  "messages": []
}
```

**示例**:
```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

## 注意事项

1. **对象名称**: 必须使用对象的完整名称，区分大小写

2. **URL 格式**: 必须使用完整的对象 URL

3. **主包含文件**: 对于类，最好提供主包含文件 URL

4. **预审计**: 设置 `preauditRequested` 为 true 可以在激活前进行检查

5. **依赖激活**: 激活对象可能自动激活依赖对象

6. **激活状态**: 只有未激活的对象才需要激活

7. **语法要求**: 激活前必须确保对象语法正确

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| object | string | 是 | 必须是有效的对象名称 |
| url | string | 是 | 必须是有效的对象 URL |
| mainInclude | string | 否 | 推荐提供，用于类对象 |
| preauditRequested | boolean | 否 | 默认 false |

## 与其他工具的关联性

1. **前置操作**:
   ```
   setObjectSource → activateByName
   syntaxCheckCode → activateByName
   ```

2. **后续操作**:
   ```
   activateByName → unLock
   ```

3. **与 activateObjects 的关系**:
   - `activateByName`: 激活单个对象
   - `activateObjects`: 批量激活多个对象

## 使用场景说明

### 场景 1: 激活类
```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class",
    "mainInclude": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

### 场景 2: 激活程序
```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZMY_PROGRAM",
    "url": "/sap/bc/adt/programs/programs/zmy_program"
  }
}
```

### 场景 3: 带预审计的激活
```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class",
    "preauditRequested": true
  }
}
```

### 场景 4: 检查激活结果
```json
// 调用 activateByName
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
// 返回: {"activated": true, "messages": []}
```

## 完整工作流程

```json
// 标准编辑-激活工作流

// 1. 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}

// 2. 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"}}

// 3. 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}
// 返回: {"lockHandle": "abc123"}

// 4. 语法检查
{"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "new source"}}
// 返回: {"results": []}

// 5. 保存源代码
{"tool": "setObjectSource", "arguments": {"objectSourceUrl": "...", "lockHandle": "abc123", "source": "..."}}

// 6. 激活对象
{"tool": "activateByName", "arguments": {"object": "ZCL_CLASS", "url": "/sap/bc/adt/oo/classes/zcl_class"}}
// 返回: {"activated": true, "messages": []}

// 7. 解锁对象
{"tool": "unLock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class", "lockHandle": "abc123"}}
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 语法错误 | 对象有语法错误 | 使用 syntaxCheckCode 检查并修复 |
| 对象未找到 | URL 或名称不正确 | 验证 URL 和对象名称 |
| 锁定冲突 | 对象被锁定 | 联系锁定方或等待 |
| 已激活 | 对象已经是激活状态 | 无需重复激活 |
| 权限不足 | 没有激活权限 | 检查用户权限 |

## 激活结果解析

```json
// 成功激活
{
  "activated": true,
  "messages": [],
  "status": "success"
}

// 激活失败
{
  "activated": false,
  "messages": [
    {
      "line": 42,
      "message": "Syntax error: unexpected token",
      "severity": "error"
    }
  ],
  "status": "failed"
}

// 带警告的激活
{
  "activated": true,
  "messages": [
    {
      "message": "Used obsolete statement",
      "severity": "warning"
    }
  ],
  "status": "success"
}
```

## 最佳实践

1. **激活前语法检查**: 使用 `syntaxCheckCode` 确保对象语法正确

2. **提供主包含文件**: 对于类，提供 `mainInclude` 参数

3. **检查激活结果**: 检查返回的 `activated` 和 `messages` 字段

4. **处理警告**: 即使 `activated` 为 true，也要检查 `messages` 中的警告

5. **错误恢复**: 如果激活失败，修复错误后重试

6. **与 unlock 配合**: 激活后记得解锁对象

## 批量激活建议

对于需要激活多个对象的情况，有两种策略：

### 策略 1: 逐个激活
```json
// 优点: 更好的错误处理
// 缺点: 调用次数多
for each object:
  activateByName
  check result
  handle errors
```

### 策略 2: 批量激活
```json
// 优点: 高效
// 缺点: 错误处理较复杂
activateObjects
// 然后检查每个对象的激活结果
```

## 对象激活顺序

当激活有依赖关系的多个对象时，建议按以下顺序：

1. **基础对象**: 数据字典对象（表、结构、域、数据元素）
2. **接口对象**: 接口定义
3. **类对象**: 类定义
4. **程序对象**: 程序
5. **服务对象**: 服务绑定等

## 预审计功能

设置 `preauditRequested: true` 可以在激活前进行检查：

```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class",
    "preauditRequested": true
  }
}
```

预审计可以:
- 在实际激活前发现问题
- 减少激活失败的风险
- 提供更详细的诊断信息

