# objectTypes

获取系统中可用的对象类型列表。

## 功能说明

此工具用于获取 SAP ABAP 系统支持的所有对象类型及其描述。这对于了解系统的对象结构和正确使用 searchObject 工具非常重要。

## 调用方法

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "types": [
    {
      "name": "CLAS",
      "description": "Class"
    },
    {
      "name": "PROG",
      "description": "Program"
    }
  ],
  "message": "Object types retrieved successfully"
}
```

**示例**:
```json
{
  "tool": "objectTypes",
  "arguments": {}
}
```

## 注意事项

1. **缓存建议**: 对象类型列表通常不经常变化，建议缓存结果

2. **系统差异**: 不同 SAP 系统版本可能支持不同的对象类型

3. **类型格式**: 返回的类型代码是 searchObject 工具所需的精确格式

4. **完整列表**: 包含所有可创建和可搜索的对象类型

## 参数限制

- 无参数
- 结果大小取决于系统配置

## 与其他工具的关联性

1. **与 searchObject 的关系**:
   ```
   objectTypes → 获取类型代码 → searchObject（使用特定类型）
   ```

2. **与 validateNewObject 的关系**:
   - 创建新对象时需要知道可用的对象类型

3. **工作流程**:
   ```
   objectTypes → searchObject → objectStructure
   ```

## 使用场景说明

### 场景 1: 探索对象类型
```json
{
  "tool": "objectTypes",
  "arguments": {}
}
// 查看系统支持的所有对象类型
```

### 场景 2: 准备搜索
```json
// 步骤 1: 获取对象类型
{"tool": "objectTypes", "arguments": {}}

// 步骤 2: 使用特定类型搜索
{"tool": "searchObject", "arguments": {"query": "ZCL_*", "objType": "CLAS"}}
```

### 场景 3: 对象创建准备
```json
// 步骤 1: 查看可用类型
{"tool": "objectTypes", "arguments": {}}

// 步骤 2: 选择类型并创建
{"tool": "createObject", "arguments": {"objtype": "CLAS/OC", ...}}
```

### 场景 4: 系统分析
```json
// 分析系统支持的对象类型
{"tool": "objectTypes", "arguments": {}}
// 结果可用于生成文档或了解系统能力
```

## 常见对象类型

### 核心对象类型

| 类型代码 | 描述 | URL 模式 |
|---------|------|----------|
| CLAS/OC | 类 | /sap/bc/adt/oo/classes/{name} |
| PROG/P | 程序 | /sap/bc/adt/programs/programs/{name} |
| INTF/OI | 接口 | /sap/bc/adt/oo/interfaces/{name} |
| FUGR/F | 函数组 | /sap/bc/adt/fugr/fugrs/{name} |
| FUGR/FF | 函数模块 | - |

### 数据字典类型

| 类型代码 | 描述 | URL 模式 |
|---------|------|----------|
| TABL/DT | 数据库表 | /sap/bc/adt/ddic/tables/tables/{name} |
| TABL/INT | 结构体 | - |
| VIEW/D | 数据库视图 | - |
| DTEL/DE | 数据元素 | - |
| DOMA/D | 定义域 | - |

### CDS 类型

| 类型代码 | 描述 | URL 模式 |
|---------|------|----------|
| DDLS/DF | CDS 数据定义 | /sap/bc/adt/ddic/ddlx/sources/{name} |
| DCLS/DL | CDS 访问控制 | - |
| DDLX/EX | CDS 元数据扩展 | - |

### 开发组织类型

| 类型代码 | 描述 | URL 模式 |
|---------|------|----------|
| DEVC/K | 开发包 | /sap/bc/adt/packages/{name} |
| DEVC/S | 子包 | - |

## 最佳实践

1. **在首次使用系统时调用此工具** - 了解系统支持的对象类型
2. **缓存结果** - 对象类型列表通常不变
3. **配合文档使用** - 结合 ABAP 文档了解各类型的用途
4. **用于搜索过滤** - 使用正确的类型代码提高搜索效率

## 类型代码格式说明

对象类型代码通常采用 `{主类型}/{子类型}` 的格式：
- 主类型: 对象大类（如 CLAS, PROG, TABL）
- 子类型: 具体对象子类型（如 OC, P, DT）

示例:
- `CLAS/OC`: 类（Object Class）
- `PROG/P`: 程序（Program）
- `TABL/DT`: 表（Data Table）

