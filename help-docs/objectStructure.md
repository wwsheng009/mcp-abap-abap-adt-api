# objectStructure

获取 ABAP 对象的结构详情。

## 功能说明

此工具用于检索 ABAP 对象的完整结构信息，包括元数据、包含文件、对象类型、所属包等。这是进行任何对象操作前必须的准备工作。

## 调用方法

**参数**:
- `objectUrl` (string, 必需): 对象的 URL
- `version` (string, 可选): 对象版本，默认为当前版本

**返回值**:
```json
{
  "status": "success",
  "structure": {
    "name": "ZCL_MY_CLASS",
    "type": "CLAS",
    "description": "My Class",
    "package": "Z_MY_PACKAGE"
  },
  "message": "Object structure retrieved successfully"
}
```

**示例**:
```json
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

## 注意事项

1. **对象 URL 格式**: 必须使用完整的 ADT URL 格式
   - 类: `/sap/bc/adt/oo/classes/{name}`
   - 程序: `/sap/bc/adt/programs/programs/{name}`
   - 接口: `/sap/bc/adt/oo/interfaces/{name}`

2. **版本控制**: `version` 参数通常不需要指定，除非需要查看历史版本

3. **对象存在性**: 如果对象不存在，会返回错误

4. **权限检查**: 用户必须对对象有读取权限

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectUrl | string | 是 | 必须是有效的 ADT URL |
| version | string | 否 | 通常为 "active" 或不指定 |

## 与其他工具的关联性

1. **依赖此工具的操作**:
   - `getObjectSource`: 需要先获取结构来确定源代码 URL
   - `lock`: 需要对象 URL 来锁定
   - `activateByName`: 需要对象名称和 URL

2. **常用工作流程**:
   ```
   objectStructure → ADTClient.mainInclude → getObjectSource
   objectStructure → transportInfo → lock → setObjectSource
   ```

3. **返回数据的重要字段**:
   - `metaData["adtcore:name"]`: 对象名称
   - `metaData["adtcore:type"]`: 对象类型
   - `metaData["abapsource:sourceUri"]`: 源代码 URI

## 使用场景说明

### 场景 1: 获取源代码
```json
// 步骤 1: 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"}}

// 步骤 2: 使用返回的 sourceUri 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"}}
```

### 场景 2: 查看对象信息
```json
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/programs/programs/zprog"}}
// 返回包含程序名称、类型、包、作者等信息
```

### 场景 3: 准备编辑对象
```json
// 步骤 1: 获取结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}

// 步骤 2: 获取传输信息
{"tool": "transportInfo", "arguments": {"objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"}}

// 步骤 3: 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}
```

### 场景 4: 批量处理
```json
// 先搜索对象，然后逐个获取结构
{"tool": "searchObject", "arguments": {"query": "ZCL_*", "objType": "CLAS", "max": 10}}
// 对返回的每个对象调用 objectStructure
```

## 最佳实践

1. **编辑对象前总是先调用 objectStructure**
2. **从返回的元数据中提取关键信息（名称、类型、包）**
3. **使用静态方法 ADTClient.mainInclude() 获取源代码 URL**
4. **缓存结构信息以避免重复调用**

## 常见对象 URL 格式

| 对象类型 | URL 模式 | 示例 |
|---------|----------|------|
| 类 (Class) | `/sap/bc/adt/oo/classes/{name}` | `/sap/bc/adt/oo/classes/zcl_example` |
| 程序 (Program) | `/sap/bc/adt/programs/programs/{name}` | `/sap/bc/adt/programs/programs/zprog` |
| 接口 (Interface) | `/sap/bc/adt/oo/interfaces/{name}` | `/sap/bc/adt/oo/interfaces/zif_example` |
| 函数组 (Function Group) | `/sap/bc/adt/fugr/fugrs/{name}` | `/sap/bc/adt/fugr/fugrs/zfg_example` |
| 数据库表 (Table) | `/sap/bc/adt/ddic/tables/tables/{name}` | `/sap/bc/adt/ddic/tables/tables/ztab` |

