# searchObject

搜索 ABAP 对象。

## 功能说明

此工具用于在 SAP ABAP 系统中搜索符合特定条件的对象，支持通配符和对象类型过滤。这是查找和定位 ABAP 对象的主要工具。

## 调用方法

**参数**:
- `query` (string, 必需): 搜索查询字符串（支持通配符 * 和 ?）
- `objType` (string, 可选): 对象类型过滤（例如：CLAS, PROG, INTF）
- `max` (number, 可选): 最大结果数（默认：50，最大建议值：100）

**返回值**:
```json
{
  "status": "success",
  "results": [
    {
      "name": "ZCL_MY_CLASS",
      "type": "CLAS",
      "description": "My Class"
    }
  ],
  "message": "Object search completed successfully"
}
```

**示例**:
```json
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZCL_*",
    "objType": "CLAS",
    "max": 100
  }
}
```

## 注意事项

1. **通配符使用**:
   - `*`: 匹配任意数量的字符
   - `?`: 匹配单个字符
   - 示例: `ZCL_*` 匹配所有以 ZCL_ 开头的类

2. **性能考虑**:
   - 不指定 `max` 可能返回大量结果
   - 建议 `max` 值不超过 100 以保证性能
   - 复杂的通配符模式可能导致搜索变慢

3. **对象类型**: 常见对象类型包括:
   - `CLAS` - 类
   - `PROG` - 程序
   - `INTF` - 接口
   - `FUGR` - 函数组
   - `TABL` - 表

4. **大小写敏感**: 搜索对大小写不敏感，但对象名称本身大小写敏感

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| query | string | 是 | 必须提供，支持通配符 |
| objType | string | 否 | 必须是有效的对象类型代码 |
| max | number | 否 | 建议 1-100，默认 50 |

## 与其他工具的关联性

1. **常用工作流程**:
   ```
   searchObject → objectStructure → getObjectSource
   searchObject → findObjectPath
   searchObject → activateByName
   ```

2. **批量处理**:
   - 搜索结果可以用于批量操作
   - 每个结果对象可以进一步处理

3. **与 objectTypes 的关系**:
   - 使用 `objectTypes` 工具获取所有可用的对象类型
   - 然后使用特定类型进行搜索

## 使用场景说明

### 场景 1: 查找特定类
```json
// 查找所有以 ZCL_ 开头的类
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZCL_*",
    "objType": "CLAS",
    "max": 50
  }
}
```

### 场景 2: 模糊搜索
```json
// 查找名称包含 "REPORT" 的程序
{
  "tool": "searchObject",
  "arguments": {
    "query": "*REPORT*",
    "objType": "PROG",
    "max": 20
  }
}
```

### 场景 3: 单字符通配
```json
// 查找 ZCL_ 后跟单个字符，然后是 _TEST 的类
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZCL_?_TEST",
    "objType": "CLAS"
  }
}
```

### 场景 4: 全局搜索
```json
// 在所有对象类型中搜索
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZMY*",
    "max": 100
  }
}
```

### 场景 5: 批量处理流程
```json
// 步骤 1: 搜索对象
{"tool": "searchObject", "arguments": {"query": "ZCL_*", "objType": "CLAS", "max": 10}}

// 步骤 2: 对每个结果获取结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_first"}}

// 步骤 3: 对每个对象执行操作
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "..."}}
```

## 最佳实践

1. **总是指定对象类型以提高搜索效率**
2. **设置合理的 max 值避免返回过多结果**
3. **使用精确的通配符模式**
4. **对于大型系统，使用更具体的查询条件**
5. **先查看可用对象类型: objectTypes 工具**

## 搜索技巧

| 需求 | 查询示例 | 说明 |
|------|----------|------|
| 查找所有 Z 开头的对象 | `Z*` | 匹配所有以 Z 开头的对象 |
| 查找特定包的对象 | `Z_MY_PACKAGE*` | 匹配特定包下的对象 |
| 查找测试对象 | `*_TEST` | 匹配以 _TEST 结尾的对象 |
| 查找特定前缀的类 | `ZCL_*` | 仅搜索类对象 |
| 精确匹配 | `ZCL_EXACT` | 不使用通配符进行精确查找 |

## 常见对象类型代码

| 代码 | 描述 |
|------|------|
| CLAS/OC | 类 |
| PROG/P | 程序 |
| INTF/OI | 接口 |
| FUGR/F | 函数组 |
| TABL/DT | 数据库表 |
| DDLS/DF | CDS 数据定义 |
| VIEW/D | 视图 |
| DTEL/DE | 数据元素 |
| DOMA/D | 定义域 |
| DEVC/K | 开发包 |

## 性能建议

1. **使用对象类型过滤** - 大幅提高搜索速度
2. **限制结果数量** - 避免返回不必要的大量数据
3. **避免过宽的通配符** - 如 `*` 会返回整个系统
4. **先缩小范围** - 使用更具体的查询条件
5. **缓存常用搜索结果** - 对于重复的查询

