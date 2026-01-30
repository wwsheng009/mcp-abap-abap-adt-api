# transportReference

获取传输引用。

## 功能说明

此工具用于获取对象的传输引用信息,了解对象所在的传输请求。

## 调用方法

**参数**:
- `pgmid` (string, 必需): 程序 ID (如 "R3TR")
- `obj_wbtype` (string, 必需): 对象类型 (如 "CLAS")
- `obj_name` (string, 必需): 对象名称 (如 "ZCL_MY_CLASS")
- `tr_number` (string, 可选): 传输号

**返回值**:
```json
{
  "status": "success",
  "reference": {
    "pgmid": "R3TR",
    "objectType": "CLAS",
    "objectName": "ZCL_MY_CLASS",
    "transport": {
      "trkorr": "DEVK900001",
      "as4text": "Feature development",
      "trfunction": "K",
      "trstatus": "D"
    },
    "task": {
      "trkorr": "DEVK900002",
      "as4text": "Implementation task"
    }
  }
}
```

**示例**:
```json
{
  "tool": "transportReference",
  "arguments": {
    "pgmid": "R3TR",
    "obj_wbtype": "CLAS",
    "obj_name": "ZCL_MY_CLASS"
  }
}
```

## 注意事项

1. **对象标识**: 需要完整的对象标识 (pgmid, obj_wbtype, obj_name)

2. **传输信息**: 返回传输和任务信息

3. **多个引用**: 对象可能在不同系统中有多条引用

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| pgmid | string | 是 | 有效的程序 ID |
| obj_wbtype | string | 是 | 有效的对象类型 |
| obj_name | string | 是 | 有效的对象名称 |
| tr_number | string | 否 | 特定传输号 |

## 与其他工具的关联性

1. **与 transportInfo 的关系**:
   ```
   transportReference (对象所在传输) vs transportInfo (可用传输)
   ```

2. **与 searchObject 的关系**:
   ```
   searchObject (查找对象) → transportReference (查看传输)
   ```

## 使用场景说明

### 场景 1: 查看对象的传输
```json
{
  "tool": "transportReference",
  "arguments": {
    "pgmid": "R3TR",
    "obj_wbtype": "CLAS",
    "obj_name": "ZCL_MY_CLASS"
  }
}
```

### 场景 2: 跟踪对象来源
```json
{
  "tool": "transportReference",
  "arguments": {
    "pgmid": "R3TR",
    "obj_wbtype": "PROG",
    "obj_name": "ZMY_PROGRAM"
  }
}
// 了解对象来自哪个传输
```

## 对象标识符

| 字段 | 说明 | 示例 |
|------|------|------|
| pgmid | 程序 ID | R3TR, LIMU |
| obj_wbtype | 对象类型 | CLAS, PROG, TABL, FUGR |
| obj_name | 对象名称 | ZCL_MY_CLASS, ZMY_PROGRAM |

## 常见对象类型

| 类型代码 | 类型 | 说明 |
|---------|------|------|
| CLAS | 类 | ABAP 类 |
| PROG | 程序 | ABAP 程序 |
| TABL | 表 | 数据库表 |
| VIEW | 视图 | 数据库视图 |
| FUGR | 函数组 | 函数组 |
| DDLS | CDS | CDS 定义 |

## 最佳实践

1. **对象跟踪**: 使用此工具跟踪对象的传输历史

2. **影响分析**: 释放前分析影响范围

3. **文档记录**: 记录对象的传输信息

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象不存在 | 对象不存在 | 检查对象标识符 |
| 权限不足 | 没有查看权限 | 联系管理员 |

## 高级用法

### 依赖分析
```json
// 分析对象的依赖关系
for each dependency in object.dependencies:
  {
    "tool": "transportReference",
    "arguments": {
      "pgmid": dependency.pgmid,
      "obj_wbtype": dependency.type,
      "obj_name": dependency.name
    }
  }
// 分析依赖对象的传输状态
```

### 影响分析
```json
// 释放传输前的影响分析
{
  "tool": "transportsByConfig",
  "arguments": { "configUri": "..." }
}
// 对每个传输中的对象
for each object in transport.objects:
  {
    "tool": "transportReference",
    "arguments": {
      "pgmid": object.pgmid,
      "obj_wbtype": object.type,
      "obj_name": object.name
    }
  }
// 分析影响范围
```
