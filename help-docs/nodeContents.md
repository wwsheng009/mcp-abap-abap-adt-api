# nodeContents

检索 ABAP 仓库树中节点的内容。

## 功能说明

此工具用于获取 ABAP 仓库树中节点的子节点内容,类似于文件系统目录结构。

## 调用方法

**参数**:
- `parent_type` (string, 必需): 父节点类型
- `parent_name` (string, 可选): 父节点名称
- `user_name` (string, 可选): 用户名
- `parent_tech_name` (string, 可选): 父节点的技术名称
- `rebuild_tree` (boolean, 可选): 是否重建树
- `parentnodes` (array, 可选): 父节点 ID 数组

**返回值**:
```json
{
  "status": "success",
  "nodeContents": [
    {
      "name": "packages",
      "type": "category",
      "parent_type": "root",
      "children": [
        {
          "name": "Z_MY_PACKAGE",
          "type": "package",
          "url": "/sap/bc/adt/packages/z_my_package"
        }
      ]
    },
    {
      "name": "classes",
      "type": "category",
      "children": [...]
    }
  ]
}
```

**示例**:
```json
{
  "tool": "nodeContents",
  "arguments": {
    "parent_type": "root"
  }
}
```

## 注意事项

1. **节点类型**: parent_type 指定要查询的节点类型

2. **树结构**: 返回树形结构的节点内容

3. **重建树**: 可以强制重建树结构

4. **性能**: 大量节点时可能较慢

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| parent_type | string | 是 | 有效的节点类型 |
| parent_name | string | 否 | 父节点名称 |
| user_name | string | 否 | 用户名 |
| parent_tech_name | string | 否 | 技术名称 |
| rebuild_tree | boolean | 否 | 默认 false |
| parentnodes | array | 否 | 父节点 ID 数组 |

## 与其他工具的关联性

1. **与 objectStructure 的关系**:
   ```
   nodeContents (浏览仓库树) → objectStructure (对象结构)
   ```

2. **与 searchObject 的关系**:
   ```
   nodeContents (浏览) → 选择节点 → searchObject (搜索对象)
   ```

## 使用场景说明

### 场景 1: 浏览根节点
```json
{
  "tool": "nodeContents",
  "arguments": {
    "parent_type": "root"
  }
}
// 返回所有顶层节点(包、类、程序等)
```

### 场景 2: 浏览包下的内容
```json
{
  "tool": "nodeContents",
  "arguments": {
    "parent_type": "package",
    "parent_name": "Z_MY_PACKAGE"
  }
}
// 返回包下的所有对象
```

### 场景 3: 浏览用户的对象
```json
{
  "tool": "nodeContents",
  "arguments": {
    "parent_type": "user",
    "user_name": "USERNAME"
  }
}
// 返回用户的所有对象
```

## 节点类型

| 类型 | 说明 | 示例 |
|------|------|------|
| root | 根节点 | 整个 ABAP 仓库 |
| package | 包 | Z_MY_PACKAGE |
| class | 类 | ZCL_MY_CLASS |
| program | 程序 | ZMY_PROGRAM |
| table | 表 | ZTABLE |
| view | 视图 | ZVIEW |
| function_group | 函数组 | ZFG_MY_GROUP |
| user | 用户 | USERNAME |

## 最佳实践

1. **浏览导航**: 使用此工具浏览 ABAP 对象仓库

2. **性能**: 避免频繁查询大量节点

3. **缓存**: 缓存树结构以提高性能

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 节点不存在 | 父节点不存在 | 检查节点类型和名称 |
| 权限不足 | 没有查看节点的权限 | 联系管理员 |

## 高级用法

### 递归浏览
```json
// 递归浏览整个树结构
function browseNode(parentType, parentName):
  {
    "tool": "nodeContents",
    "arguments": {
      "parent_type": parentType,
      "parent_name": parentName
    }
  }
  for each child in children:
    browseNode(child.type, child.name)
```

### 树重建
```json
// 强制重建树结构
{
  "tool": "nodeContents",
  "arguments": {
    "parent_type": "root",
    "rebuild_tree": true
  }
}
```
