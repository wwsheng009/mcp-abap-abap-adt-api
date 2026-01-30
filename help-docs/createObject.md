# createObject

创建新的 ABAP 对象。

## 功能说明

此工具创建新的 ABAP 对象,如类、程序、函数模块、**包 (Package)** 等。

## 调用方法

**参数**:
- `objtype` (string, 必需): 对象类型 (例如 'CLAS', 'PROG', 'DEVC/K'),调用工具`objectTypes`获取所有对象类型
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
    "objtype": "CLAS",
    "name": "ZCL_MY_CLASS",
    "parentName": "Z_MY_PACKAGE",
    "description": "My class",
    "parentPath": "/sap/bc/adt/packages/z_my_package",
    "transport": "DEVK900123"
  }
}
```

## 注意事项

1. **对象类型**: objtype 必须是有效的对象类型 (包类型为 `DEVC/K`)
2. **命名规则**: 对象名称必须遵循 ABAP 命名规则
3. **包**: 父对象通常是包
4. **传输**: 普通对象需要传输请求，$TMP 本地对象不需要
5. **描述**: 提供有意义的描述

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objtype | string | 是 | 有效的对象类型 |
| name | string | 是 | 符合命名规则 |
| parentName | string | 是 | 有效的父对象名称 (根包为空) |
| description | string | 是 | 描述文本 |
| parentPath | string | 是 | 有效的父对象路径 |
| responsible | string | 否 | 用户名 |
| transport | string | 否 | 传输请求号 |
| swcomp | string | 否 | 软件组件 (包创建专用) |
| packagetype | string | 否 | 包类型 (包创建专用) |
| transportLayer | string | 否 | 传输层 (包创建专用) |

## 包创建指南 (Package Creation Guide)

创建 ABAP 包 (Package) 时有特殊的规则和参数要求。

### 1. 包类型对比与选择

| 特性 | 普通包 (Regular Package) | $TMP 包 (Local Package) |
|------|-------------------------|------------------------|
| **用途** | 生产环境使用的可传输对象 | 本地开发和测试 |
| **包名规则** | Z* 或 Y* 开头 | **必须以 $ 开头** |
| **父包 (parentName)** | 可为根级别('')或其他包 | 必须为 '$TMP' |
| **传输层** | 必需（如 ZS4H） | 留空 |
| **软件组件** | HOME | LOCAL |
| **传输请求** | 必需 | 留空 |

### 2. 创建普通包 (Regular Package)

**适用场景**: 开发可传输的功能。

**关键参数配置**:
```typescript
{
  objtype: 'DEVC/K',
  name: 'ZTEST_PACKAGE',     // Z/Y 开头
  parentName: '',            // 根包留空；子包填父包名
  swcomp: 'HOME',            // ZS4H 传输层必须用 HOME
  transportLayer: 'ZS4H',    // 必须存在于系统
  transport: 'S4HK901712',   // 必需
  packagetype: 'development'
}
```

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
    "transport": "S4HK901712",
    "swcomp": "HOME",
    "packagetype": "development",
    "transportLayer": "ZS4H",
    "responsible": "username"
  }
}
```

### 3. 创建 $TMP 子包 (Local Package)

**适用场景**: 本地测试、原型开发。

**关键参数配置**:
```typescript
{
  objtype: 'DEVC/K',
  name: '$ZTMP_TEST',        // 必须以 $ 开头
  parentName: '$TMP',        // 必须是 $TMP
  swcomp: 'LOCAL',           // 必须是 LOCAL
  transportLayer: '',        // 留空
  transport: '',             // 留空
  packagetype: 'development'
}
```

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

### 4. 创建子包 (Sub-package)

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
    "transport": "S4HK901712",
    "swcomp": "HOME",
    "packagetype": "development",
    "transportLayer": "ZS4H"
  }
}
```

### 5. 常见错误与解决方案 (Troubleshooting)

以下列出创建包时常见的错误信息及其解决方案，供 Agent 参考。

#### 错误 1: 传输层不存在
- **错误信息**: `Transport layer ZSAP does not exist`
- **原因**: 指定的传输层在系统中不存在。
- **解决方案**: 使用 `getTransportLayers` 工具查询可用传输层 (如 ZS4H)。

#### 错误 2: 软件组件不匹配
- **错误信息**: `Must assign package to software component HOME`
- **原因**: 传输层 (如 ZS4H) 要求特定的软件组件 (HOME)，但提供了其他的 (如 LOCAL)。
- **解决方案**: 普通包使用 `swcomp: 'HOME'`。

#### 错误 3: 父包软件组件冲突
- **错误信息**: `Software component 'HOME' not allowed; parent has software component 'LOCAL'`
- **原因**: 试图将普通包 (HOME) 放在 $TMP (LOCAL) 下作为子包。
- **解决方案**: 
  - 如果是普通包，`parentName` 不要设为 `$TMP`。
  - 如果是本地测试包，请使用 `swcomp: 'LOCAL'` 并以 `$` 命名。

#### 错误 4: 包名格式错误 ($TMP)
- **错误信息**: `Only use '/' as name separator` 或 `Package name does not conform to naming conventions`
- **原因**: 包名中包含路径 (如 `$TMP/$MYPKG`) 或 $TMP 包未以 `$` 开头。
- **解决方案**: 
  - 包名只写包名本身: `$MYPKG`。
  - 父包关系通过 `parentName` 参数指定。
  - $TMP 子包必须以 `$` 开头。

### 6. 快速参考表 (Quick Reference)

| 场景 | name | parentName | swcomp | transportLayer | transport |
|------|------|------------|--------|----------------|-----------|
| **根级别普通包** | `ZTEST_XXX` | `''` | `HOME` | `ZS4H` | `S4HK9...` |
| **普通包子包** | `ZTEST_SUB` | `ZTEST_XXX` | `HOME` | `ZS4H` | `S4HK9...` |
| **$TMP 子包** | `$ZTMP_XXX` | `$TMP` | `LOCAL` | `''` | `''` |

---

## 与其他工具的关联性

1. **与 validateNewObject 的关系**:
   ```
   validateNewObject (验证) → createObject (创建)
   ```

2. **与 activateByName 的关系**:
   ```
   createObject (创建) → 添加代码 → activateByName (激活)
   ```

## 使用场景说明

### 场景 1: 创建新类
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "CLAS",
    "name": "ZCL_MY_CLASS",
    "parentName": "Z_MY_PACKAGE",
    "description": "My class",
    "parentPath": "/sap/bc/adt/packages/z_my_package"
  }
}
```

### 场景 2: 创建新程序
```json
{
  "tool": "createObject",
  "arguments": {
    "objtype": "PROG",
    "name": "ZMY_PROGRAM",
    "parentName": "Z_MY_PACKAGE",
    "description": "My program",
    "parentPath": "/sap/bc/adt/packages/z_my_package"
  }
}
```

## 对象类型列表

| 类型代码 | 类型 | 说明 |
|---------|------|------|
| CLAS | 类 | ABAP 类 |
| PROG | 程序 | ABAP 程序 |
| FUGR | 函数组 | 函数组 |
| TABL | 表 | 数据库表 |
| VIEW | 视图 | 数据库视图 |
| DDLS | CDS | CDS 定义 |
| **DEVC/K** | **包** | **ABAP 包** |

## 最佳实践

1. **创建前验证**: 先验证参数
2. **命名规范**: 遵循命名规范 (普通包 Z/Y，本地包 $)
3. **描述清晰**: 提供清晰的描述
4. **传输请求**: 使用正确的传输请求
5. **测试**: 创建后立即测试
6. **环境变量**: 将传输层、软件组件等配置在环境变量中

## 完整工作流程

```json
// 创建新对象的完整流程

// 1. 验证参数
{
  "tool": "validateNewObject",
  "arguments": {
    "options": "{\"objtype\":\"CLAS\",\"name\":\"ZCL_MY_CLASS\",\"parentName\":\"Z_MY_PACKAGE\",\"description\":\"My class\",\"parentPath\":\"/sap/bc/adt/packages/z_my_package\"}"
  }
}

// 2. 获取传输信息
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/packages/z_my_package/source/main"
  }
}

// 3. 创建对象
{
  "tool": "createObject",
  "arguments": {
    "objtype": "CLAS",
    "name": "ZCL_MY_CLASS",
    "parentName": "Z_MY_PACKAGE",
    "description": "My class",
    "parentPath": "/sap/bc/adt/packages/z_my_package",
    "transport": "DEVK900123"
  }
}

// 4. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 5. 添加代码
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "token": "...",
    "startLine": 1,
    "endLine": 10,
    "content": "CLASS zcl_my_class DEFINITION\n  PUBLIC\n  FINAL\n  CREATE PUBLIC.\nENDCLASS.\n\nCLASS zcl_my_class IMPLEMENTATION.\nENDCLASS.",
    "lockHandle": "lock123"
  }
}

// 6. 激活对象
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 7. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "lock123"
  }
}
```
