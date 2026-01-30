# usageReferences

查找使用引用。

## 功能说明

此工具用于查找 ABAP 对象中标识符的所有使用位置。例如，可以查找变量、方法、类等在哪里被使用，方便代码重构和理解影响范围。

## 调用方法

**参数**:
- `url` (string, 必需): 对象 URL（源代码 URL）
- `line` (number, 可选): 标识符所在的行号
- `column` (number, 可选): 标识符的起始列号

**返回值**:
```json
{
  "status": "success",
  "references": [
    {
      "url": "/sap/bc/adt/programs/programs/zprog1/source/main",
      "line": 25,
      "column": 10,
      "objectName": "ZPROG1",
      "objectType": "PROG"
    },
    {
      "url": "/sap/bc/adt/oo/classes/zcl_class2/source/main",
      "line": 42,
      "column": 15,
      "objectName": "ZCL_CLASS2",
      "objectType": "CLAS"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 15,
    "column": 5
  }
}
```

## 注意事项

1. **定义位置**: 通过 `url`, `line`, `column` 指定要查找的标识符的定义位置

2. **查找范围**: 搜索范围可能包括整个系统或特定包

3. **性能考虑**: 查找引用可能需要较长时间，特别是对于广泛使用的标识符

4. **结果数量**: 可能返回大量引用，考虑分页或限制

5. **跨对象**: 引用可能分布在多个不同的对象中

6. **系统限制**: 某些系统可能限制返回的结果数量

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 必须是有效的源代码 URL |
| line | number | 否 | 标识符所在行号 |
| column | number | 否 | 标识符起始列号 |

## 与其他工具的关联性

1. **与 findDefinition 的关系**:
   ```
   findDefinition: 查找定义位置（"在哪里定义的？"）
   usageReferences: 查找使用位置（"在哪里使用的？"）
   ```

2. **配合使用**:
   ```
   findDefinition → usageReferences → 分析影响范围
   ```

3. **重构前分析**:
   ```
   usageReferences → 了解影响范围 → 安全重构
   ```

4. **代码导航**:
   ```
   usageReferences → 找到所有使用位置 → 批量更新
   ```

## 使用场景说明

### 场景 1: 查找方法的所有使用
```json
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 20,
    "column": 8
  }
}
// 返回: 方法在系统中所有的使用位置
```

### 场景 2: 查找类的所有使用
```json
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_utility/source/main",
    "line": 1,
    "column": 1
  }
}
// 返回: 类的所有实例化、继承、引用等
```

### 场景 3: 查找变量的所有使用
```json
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "line": 30,
    "column": 12
  }
}
// 返回: 变量的所有读取和写入位置
```

### 场景 4: 重构前分析
```json
// 准备重命名方法前，查找所有使用
{
  "tool": "usageReferences",
  "arguments": {
    "url": "...",
    "line": 45,
    "column": 10
  }
}
// 分析影响范围，确定是否安全进行重命名
```

## 引用类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 读取 | 读取变量的值 | lv_value = lv_result |
| 写入 | 修改变量的值 | lv_count = lv_count + 1 |
| 调用 | 调用方法 | zcl_helper=>execute( ) |
| 实例化 | 创建对象实例 | DATA(lo_obj) = NEW zcl_class( ) |
| 继承 | 类继承 | zcl_child DEFINITION INHERITING FROM zcl_parent |
| 引用 | 类型声明 | DATA: lv_var TYPE REF TO zcl_class |

## 引用结果结构

```json
{
  "references": [
    {
      "url": "/sap/bc/adt/programs/programs/zprog1/source/main",
      "line": 25,
      "column": 10,
      "objectName": "ZPROG1",
      "objectType": "PROG",
      "usageType": "call",
      "codeContext": "zcl_helper=>method_name( )"
    }
  ]
}
```

## 最佳实践

1. **重构前查找**: 在重命名、删除等重构操作前查找所有使用

2. **限制范围**: 考虑限制搜索范围以提高性能

3. **分批处理**: 对于大量引用，分批处理

4. **验证结果**: 手动验证重要的引用位置

5. **影响分析**: 分析引用位置以评估重构风险

## 完整工作流程

```json
// 重构工作流：重命名方法

// 1. 查找要重命名的方法定义
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "old_method_name",
    "line": 50,
    "column": 8
  }
}

// 2. 查找所有使用
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "line": 50,
    "column": 8
  }
}
// 返回: 10 个使用位置

// 3. 分析影响范围
// 检查每个引用，确定是否安全重命名

// 4. 批量修改
for each reference:
  // a. 锁定对象
  {"tool": "lock", "arguments": {"objectUrl": "..."}}

  // b. 读取源代码
  {"tool": "getObjectSource", "arguments": {"objectSourceUrl": "..."}}

  // c. 替换方法名（在客户端进行）

  // d. 保存源代码
  {"tool": "setObjectSource", "arguments": {...}}

  // e. 解锁对象
  {"tool": "unLock", "arguments": {...}}

// 5. 激活所有修改的对象
{"tool": "activateObjects", "arguments": {"objects": [...]}}
```

## 与 findDefinition 配合使用

```json
// 完整的标识符分析

// 1. 查找定义
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "token": "method_name"
  }
}
// 返回: 定义位置

// 2. 查找所有使用
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 15,
    "column": 8
  }
}
// 返回: 所有使用位置

// 3. 分析完整信息
// 定义: 在哪里定义的
// 使用: 在哪里使用的
// 影响: 改动会影响哪些地方
```

## 性能优化

1. **限制结果**: 考虑限制返回的引用数量

2. **特定包**: 如果可能，限制搜索到特定包

3. **缓存结果**: 对于不常变化的对象，缓存引用结果

4. **分批处理**: 大量引用分批处理

5. **异步处理**: 对于长时间运行的操作，考虑异步处理

## 常见使用场景

### 场景 1: 删除方法前
```
查找方法的所有使用，确定删除是否安全
```

### 场景 2: 优化性能
```
查找高频使用的方法，考虑优化实现
```

### 场景 3: 文档生成
```
查找类的所有使用，生成依赖文档
```

### 场景 4: 代码审查
```
查找可疑代码的使用，了解其影响范围
```

## 高级用法

### 按对象类型过滤
```json
// 对返回的结果按对象类型过滤
// 例如: 只查看类中的使用，忽略程序
```

### 按使用类型过滤
```json
// 只查看特定类型的使用
// 例如: 只查看方法调用，忽略类型声明
```

### 导出报告
```json
// 将引用结果导出为报告
// 用于文档或审计
```