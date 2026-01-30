# findDefinition

查找定义位置。

## 功能说明

此工具用于查找 ABAP 对象中标识符的定义位置。例如，可以查找变量、方法、类等的定义，方便代码导航和理解。

## 调用方法

**参数**:
- `url` (string, 必需): 对象 URL（源代码 URL）
- `token` (string, 必需): 要查找的标识符
- `source` (string, 可选): 源代码（某些系统需要）
- `line` (number, 可选): 标识符所在的行号
- `column` (number, 可选): 标识符的起始列号
- `endColumn` (number, 可选): 标识符的结束列号

**返回值**:
```json
{
  "status": "success",
  "definition": {
    "url": "/sap/bc/adt/oo/classes/zcl_another_class/source/main",
    "line": 15,
    "column": 5
  }
}
```

**示例**:
```json
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "token": "zcl_helper",
    "line": 25,
    "column": 10
  }
}
```

## 注意事项

1. **标识符**: `token` 参数是要查找的标识符名称

2. **位置精确**: 如果提供 `line` 和 `column`，结果会更精确

3. **源代码**: 某些系统可能需要提供完整的源代码

4. **跨对象**: 可以跳转到不同对象的定义

5. **类型信息**: 结果包含定义的对象类型和位置

6. **未找到**: 如果找不到定义，会返回错误

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| url | string | 是 | 必须是有效的源代码 URL |
| token | string | 是 | 标识符名称 |
| source | string | 否 | 完整的源代码（可选） |
| line | number | 否 | 标识符所在行号 |
| column | number | 否 | 标识符起始列号 |
| endColumn | number | 否 | 标识符结束列号 |

## 与其他工具的关联性

1. **与 usageReferences 的关系**:
   ```
   findDefinition: 查找定义位置（"在哪里定义的？"）
   usageReferences: 查找使用位置（"在哪里使用的？"）
   ```

2. **配合使用**:
   ```
   getObjectSource → findDefinition → 跳转到定义
   ```

3. **代码导航**:
   ```
   findDefinition → 获取定义位置 → 打开/读取定义的文件
   ```

## 使用场景说明

### 场景 1: 查找变量定义
```json
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "lv_my_variable",
    "line": 50,
    "column": 15
  }
}
// 返回: 变量的定义位置
```

### 场景 2: 查找方法定义
```json
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "token": "perform_my_operation"
  }
}
// 返回: 方法的定义位置
```

### 场景 3: 查找类定义
```json
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class1/source/main",
    "token": "zcl_helper"
  }
}
// 返回: zcl_helper 类的定义位置
```

### 场景 4: 查找接口定义
```json
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "token": "zif_example_interface"
  }
}
// 返回: 接口的定义位置
```

## 可查找的标识符类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 局部变量 | 方法或程序中定义的变量 | lv_value, gs_instance |
| 类属性 | 类的实例属性或静态属性 | mv_attribute, sv_static_attr |
| 方法 | 类的方法 | execute, calculate |
| 函数模块 | 函数模块 | zfm_function |
| 类 | ABAP 类 | zcl_helper, cl_abap_unit_assert |
| 接口 | ABAP 接口 | zif_example |
| 常量 | 常量 | co_default_value |
| 表 | 数据库表 | ztable, mara |
| 类型 | ABAP 类型 | ty_structure, tt_table |

## 定义位置结构

```json
{
  "definition": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 25,
    "column": 8,
    "name": "zcl_helper",
    "type": "CLAS"
  }
}
```

## 最佳实践

1. **精确提供位置**: 提供 `line` 和 `column` 以获得更精确的结果

2. **处理跨对象跳转**: 结果可能在不同的文件中

3. **错误处理**: 处理找不到定义的情况

4. **用户界面**: 在编辑器中实现"转到定义"功能

5. **配合用法查找**: 与 `usageReferences` 配合使用

## 完整工作流程

```json
// 编辑器中的"转到定义"流程

// 1. 用户在代码中点击标识符
// 例如: 点击 "zcl_helper"

// 2. 调用 findDefinition
{
  "tool": "findDefinition",
  "arguments": {
    "url": "/sap/bc/adt/programs/programs/zprog/source/main",
    "token": "zcl_helper",
    "line": 42,
    "column": 10
  }
}

// 3. 获取定义位置
{
  "definition": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 10,
    "column": 1,
    "name": "zcl_helper",
    "type": "CLAS"
  }
}

// 4. 在编辑器中打开定义位置
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_helper/source/main"
  }
}

// 5. 跳转到指定行和列（在编辑器 UI 中实现）
```

## 与 usageReferences 配合使用

```json
// 分析标识符的完整信息

// 1. 查找定义
{
  "tool": "findDefinition",
  "arguments": {
    "url": "...",
    "token": "zcl_helper"
  }
}
// 返回: 定义位置

// 2. 查找所有使用
{
  "tool": "usageReferences",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_helper/source/main",
    "line": 10,
    "column": 1
  }
}
// 返回: 所有使用位置
```

## 常见错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 标识符未找到 | 标识符不存在或拼写错误 | 检查标识符名称 |
| 多个定义 | 标识符有多个可能的定义 | 提供更精确的位置信息 |
| 权限不足 | 没有访问定义的权限 | 检查用户权限 |
| 源代码无效 | 提供的源代码有语法错误 | 提供正确的源代码 |

## 高级用法

### 重载查找
```json
// 对于有重载的方法，提供精确的位置信息
{
  "tool": "findDefinition",
  "arguments": {
    "url": "...",
    "token": "execute",
    "line": 100,
    "column": 20
  }
}
// 可以精确到特定的重载方法
```

### 继承层次
```json
// 可以查找父类或接口中的定义
{
  "tool": "findDefinition",
  "arguments": {
    "url": "...",
    "token": "interface_method"
  }
}
// 可能跳转到接口中的方法定义
```

