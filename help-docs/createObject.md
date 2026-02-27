# createObject

创建新的 ABAP 对象。

## 功能说明

此工具创建新的 ABAP 对象,如类、程序、函数模块、**包 (Package)** 等。

## 调用方法

**参数**:
- `objtype` (string, 必需): 对象类型 (例如 'CLAS/OC', 'PROG/P', 'DEVC/K'), **必须使用从工具`objectTypes`获取的完整类型代码**。类型代码格式为 `{主类型}/{子类型}`，如 `CLAS/OC` (类)、`PROG/P` (程序)、`TABL/DT` (表)、`DEVC/K` (包) 等
- `name` (string, 必需): 对象名称
- `parentName` (string, 必需): 父对象名称(通常是包名，**创建根包时留空**)
- `description` (string, 必需): 对象描述
- `parentPath` (string, 必需): 父对象路径 (创建包时若无父包可设为空字符串)
- `responsible` (string, 可选): 负责人
- `transport` (string, 可选): 传输请求号 (创建 $TMP 包时留空)
- `swcomp` (string, 可选): 软件组件 (创建包时必需，如 'HOME' 或 'LOCAL')
- `packagetype` (string, 可选): 包类型 (创建包时必需，通常为 'development')
- `transportLayer` (string, 可选): 传输层 (创建普通包时必需，如 'ZS4H')

**返回值**:
```json
{
  "status": "success",
  "result": {
    "object": {
      "name": "ZCL_MY_CLASS",
      "type": "CLAS",
      "url": "/sap/bc/adt/oo/classes/zcl_my_class",
      "created": true
    }
  }
}
```

**示例**:
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "CLAS/OC",
    "name": "ZCL_MY_CLASS",
    "parentName": "Z_MY_PACKAGE",
    "description": "My class",
    "parentPath": "/sap/bc/adt/packages/z_my_package",
    "transport": "DEVK900123"
  }
}
```

**成功创建$TMP包的示例**:
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "DEVC/K",
    "name": "$ZTMP_TEST",
    "parentName": "$TMP",
    "description": "Local Test Package",
    "parentPath": "/sap/bc/adt/packages/$TMP",
    "swcomp": "LOCAL",
    "packagetype": "development",
    "transportLayer": "",
    "transport": ""
  }
}
```

**重要说明**: 
- **完整类型代码**: `objtype` 参数必须使用从 `objectTypes` 工具获取的完整类型代码，格式为 `{主类型}/{子类型}`
  - 正确示例: `CLAS/OC` (类), `PROG/P` (程序), `TABL/DT` (数据库表), `DEVC/K` (包)
  - 错误示例: `CLAS`, `PROG`, `TABL`, `DEVC` (缺少子类型)
- **类型获取**: 在调用 `createObject` 前，务必先调用 `objectTypes` 工具获取系统支持的完整类型列表
- **类型准确性**: 使用不完整或错误的类型代码将导致 "Unsupported object type" 错误

## 包创建指南 (Package Creation Guide)

创建 ABAP 包 (Package) 时有特殊的规则和参数要求。

### 包类型对比与选择

| 特性 | 普通包 (Regular Package) | $TMP 包 (Local Package) |
|------|-------------------------|------------------------|
| **用途** | 生产环境使用的可传输对象 | 本地开发和测试 |
| **包名规则** | Z* 或 Y* 开头 | **必须以 $ 开头** |
| **父包 (parentName)** | 可为根级别('')或其他包 | 必须为 '$TMP' |
| **传输层** | 必需（如 ZS4H） | 留空 |
| **软件组件** | HOME | LOCAL |
| **传输请求** | 必需 | 留空 |

### 创建普通包 (Regular Package)

**适用场景**: 开发可传输的功能。

**示例**:
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "DEVC/K",
    "name": "ZTEST_PACKAGE",
    "parentName": "",
    "description": "Test Package",
    "parentPath": "",
    "transport": "<TRANSPORT_NUMBER>",
    "swcomp": "HOME",
    "packagetype": "development",
    "transportLayer": "ZS4H",
    "responsible": "username"
  }
}
```

### 创建 $TMP 子包 (Local Package)

**适用场景**: 本地测试、原型开发。

**示例**:
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "DEVC/K",
    "name": "$ZTMP_TEST",
    "parentName": "$TMP",
    "description": "Local Test Package",
    "parentPath": "/sap/bc/adt/packages/$TMP",
    "transport": "",
    "swcomp": "LOCAL",
    "packagetype": "development",
    "transportLayer": "",
    "responsible": "username"
  }
}
```

### 创建子包 (Sub-package)

**规则**: 子包的软件组件必须与父包一致。

**示例**:
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "DEVC/K",
    "name": "ZTEST_SUB_PKG",
    "parentName": "ZTEST_PACKAGE",
    "description": "Sub Package",
    "parentPath": "/sap/bc/adt/packages/ztest_package",
    "transport": "<TRANSPORT_NUMBER>",
    "swcomp": "HOME",
    "packagetype": "development",
    "transportLayer": "ZS4H"
  }
}
```

### 常见错误与解决方案 (Troubleshooting)

#### 错误 1: 传输层不存在
- **错误信息**: `Transport layer ZSAP does not exist`
- **解决方案**: 使用 `getTransportLayers` 工具查询可用传输层 (如 ZS4H)。

#### 错误 2: 软件组件不匹配
- **错误信息**: `Must assign package to software component HOME`
- **解决方案**: 普通包使用 `swcomp: 'HOME'`。

#### 错误 3: 父包软件组件冲突
- **错误信息**: `Software component 'HOME' not allowed; parent has software component 'LOCAL'`
- **解决方案**: 
  - 如果是普通包，`parentName` 不要设为 `$TMP`。
  - 如果是本地测试包，请使用 `swcomp: 'LOCAL'` 并以 `$` 命名。

#### 错误 4: 包名格式错误 ($TMP)
- **错误信息**: `Only use '/' as name separator` 或 `Package name does not conform to naming conventions`
- **解决方案**: 
  - 包名只写包名本身: `$MYPKG`。
  - 父包关系通过 `parentName` 参数指定。
  - $TMP 子包必须以 `$` 开头。

### 快速参考表 (Quick Reference)

| 场景 | name | parentName | swcomp | transportLayer | transport |
|------|------|------------|--------|----------------|-----------|
| **根级别普通包** | `ZTEST_XXX` | `''` | `HOME` | `ZS4H` | `<TRANSPORT_NUMBER>` |
| **普通包子包** | `ZTEST_SUB` | `ZTEST_XXX` | `HOME` | `ZS4H` | `<TRANSPORT_NUMBER>` |
| **$TMP 子包** | `$ZTMP_XXX` | `$TMP` | `LOCAL` | `''` | `''` |

## 使用场景说明

### 场景 1: 创建新类
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "CLAS/OC",
    "name": "ZCL_MY_CLASS",
    "parentName": "Z_MY_PACKAGE",
    "description": "My class",
    "parentPath": "/sap/bc/adt/packages/z_my_package"
  }
}
```
**注意**: `objtype` 必须使用完整类型代码 `CLAS/OC` 而非简化版 `CLAS`。

### 场景 2: 创建新程序
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "PROG/P",
    "name": "ZMY_PROGRAM",
    "parentName": "Z_MY_PACKAGE",
    "description": "My program",
    "parentPath": "/sap/bc/adt/packages/z_my_package"
  }
}
```
**注意**: `objtype` 必须使用完整类型代码 `PROG/P` 而非简化版 `PROG`。

## 对象类型列表

| 类型代码 | 类型 | 说明 |
|---------|------|------|
| CLAS/OC | 类 | ABAP 类 (完整类型) |
| PROG/P | 程序 | ABAP 程序 (完整类型) |
| FUGR/F | 函数组 | 函数组 (完整类型) |
| TABL/DT | 表 | 数据库表 (完整类型) |
| VIEW/DV | 视图 | 数据库视图 (完整类型) |
| DDLS/DF | CDS | CDS 定义 (完整类型) |
| **DEVC/K** | **包** | **ABAP 包 (完整类型)** |

## 最佳实践

1. **命名规范**: 遵循命名规范 (普通包 Z/Y，本地包 $)
2. **描述清晰**: 提供清晰的描述
3. **完整类型**: 始终使用从 `objectTypes` 工具获取的完整类型代码 (格式为 `{主类型}/{子类型}`) 而非简化的类型代码
4. **包创建参数**: 创建包（DEVC/K）时，请使用以下额外参数：
    - `swcomp`: 软件组件（如 'LOCAL'）
    - `transportLayer`: 传输层（如 '$TMP'）
    - `packagetype`: 包类型（'development', 'structure', 或 'main'）

## 删除对象的流程

```json
// 删除对象的推荐流程

// 1. 锁定对象（使用MODIFY模式）
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "accessMode": "MODIFY"
  }
}

// 2. 删除对象（使用上一步返回的lockHandle）
{
  "tool": "deleteObject", 
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "从上一步获得的句柄"
  }
}

// 3. 处理失败情况 - 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "从第一步获得的句柄"
  }
}
```

## 修复说明

### 父包名称大小写敏感性问题修复

以前，`createObject` 工具存在一个重要的bug：在处理父包名称（如`$TMP`）时，会在URL构建过程中强制转换为小写（`$tmp`），导致SAP系统无法找到实际存在的大写包名，从而报错"父包 '$TMP' 不存在"。

**问题根源**：在abap-adt-api库的`objectcreator.ts`文件中，[createObject](file:///e:/projects/abap/abap-adt-api/src/api/objectcreator.ts#L297-L321)函数错误地使用了`.toLowerCase()`方法处理`parentName`参数。

**修复方案**：已从代码中移除不必要的`.toLowerCase()`转换，保留包名的原始大小写格式。

**影响**：此修复解决了创建包及依赖特定父包的对象（如类、程序等）时出现的"父包不存在"错误。

