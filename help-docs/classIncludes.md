# classIncludes

获取类的包含结构。

## 功能说明

此工具用于获取 ABAP 类的包含(Include)结构信息。ABAP 类通常由多个包含组成,例如:
- 类定义部分 (Class Definition)
- 局部类型定义 (Local Types)
- 私有部分 (Private Section)
- 受保护部分 (Protected Section)
- 公共部分 (Public Section)
- 类实现部分 (Class Implementation)

了解类的包含结构有助于理解类的组织方式,定位特定的代码段。

## 调用方法

**参数**:
- `clas` (string, 必需): 类名称

**返回值**:
```json
{
  "status": "success",
  "result": {
    "includes": [
      {
        "name": "class_definition",
        "description": "Class definition",
        "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
        "type": "definition"
      },
      {
        "name": "local_types",
        "description": "Local type definitions",
        "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/locals",
        "type": "locals"
      },
      {
        "name": "test_classes",
        "description": "Local test classes",
        "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/testclasses",
        "type": "testclasses"
      },
      {
        "name": "macros",
        "description": "Macro definitions",
        "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/macros",
        "type": "macros"
      }
    ],
    "className": "ZCL_MY_CLASS",
    "mainInclude": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

**示例**:
```json
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
```

## 注意事项

1. **类名称**: 使用完整的类名称,包括命名空间前缀

2. **包含类型**:
   - `main`: 主包含(类定义)
   - `locals`: 局部类型定义
   - `testclasses`: 测试类定义
   - `macros`: 宏定义

3. **URL 结构**:
   - 返回的 URL 可用于后续读取源代码
   - 可以与 `getObjectSourceV2` 配合使用

4. **类结构理解**:
   - 了解类的包含结构有助于代码导航
   - 可以快速定位到特定的代码部分

5. **测试相关**:
   - `testclasses` 包含本地测试类
   - 可以使用 `createTestInclude` 创建测试包含

6. **与 objectStructure 的区别**:
   - `objectStructure`: 返回对象的通用结构
   - `classIncludes`: 返回类特定的包含结构

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| clas | string | 是 | 必须是有效的类名称 |

## 与其他工具的关联性

1. **与 objectStructure 的关系**:
   ```
   objectStructure: 获取对象的通用结构
   classIncludes: 获取类特定的包含结构
   ```

2. **与 getObjectSourceV2 的关系**:
   ```
   classIncludes → 获取包含 URL → getObjectSourceV2 (读取包含内容)
   ```

3. **与 classComponents 的关系**:
   ```
   classIncludes: 类的包含结构(物理结构)
   classComponents: 类的组件结构(逻辑结构:方法、属性等)
   ```

4. **与 createTestInclude 的关系**:
   ```
   classIncludes → 查看 testclasses 是否存在 → createTestInclude (创建测试包含)
   ```

5. **代码导航流程**:
   ```
   searchObject → classIncludes → getObjectSourceV2
   ```

## 使用场景说明

### 场景 1: 查看类的完整结构
```json
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 返回所有包含及其 URL
```

### 场景 2: 读取类的特定包含
```json
// 步骤 1: 获取包含结构
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 返回: { "includes": [..., { "url": "/.../source/locals" }] }

// 步骤 2: 读取局部类型定义
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/locals"
  }
}
```

### 场景 3: 检查是否有测试类
```json
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 查找 type 为 "testclasses" 的包含
// 如果不存在,使用 createTestInclude 创建
```

### 场景 4: 理解类的组织
```json
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 分析返回的包含结构:
// - main: 类定义和实现
// - locals: 局部类型
// - testclasses: 测试类
// - macros: 宏定义
```

## 包含类型详解

### 1. 主包含 (main)
```json
{
  "name": "class_definition",
  "description": "Class definition and implementation",
  "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
  "type": "main"
}
```
- 包含类定义和实现
- 通常是主要编辑目标
- 包含所有方法实现

### 2. 局部类型定义 (locals)
```json
{
  "name": "local_types",
  "description": "Local type definitions",
  "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/locals",
  "type": "locals"
}
```
- 包含局部类型定义
- 结构、表类型、常量等
- 不对外可见

### 3. 测试类 (testclasses)
```json
{
  "name": "test_classes",
  "description": "Local test classes",
  "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/testclasses",
  "type": "testclasses"
}
```
- 包含本地测试类
- 用于单元测试
- 只在测试环境中使用

### 4. 宏定义 (macros)
```json
{
  "name": "macros",
  "description": "Macro definitions",
  "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/macros",
  "type": "macros"
}
```
- 包含宏定义
- 代码复用
- 较少使用

## 完整工作流程

```json
// 类分析和编辑流程

// 1. 查找类
{
  "tool": "searchObject",
  "arguments": {
    "name": "ZCL_MY_CLASS",
    "type": "CLAS"
  }
}

// 2. 获取类的包含结构
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 返回所有包含的 URL

// 3. 获取类组件(逻辑结构)
{
  "tool": "classComponents",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
// 返回方法、属性等组件

// 4. 读取主包含
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}

// 5. 读取局部类型(可选)
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/locals"
  }
}

// 6. 检查测试类
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/testclasses"
  }
}
// 如果没有测试类,使用 createTestInclude 创建

// 7. 锁定并编辑(如果需要)
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 8. 编辑代码...

// 9. 保存并激活
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    ...
  }
}
```

## 最佳实践

1. **先获取结构**: 在编辑类之前先了解其包含结构

2. **使用正确包含**: 根据需求选择正确的包含进行编辑

3. **测试类分离**: 将测试类放在 `testclasses` 包含中

4. **局部类型使用**: 在 `locals` 包含中定义局部类型

5. **配合 classComponents**: 使用 `classComponents` 理解逻辑结构

6. **URL 缓存**: 缓存包含 URL 以便后续使用

7. **完整性检查**: 编辑后确保所有包含都正确

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 类不存在 | 类名称错误 | 检查类名称 |
| 权限不足 | 没有读取权限 | 联系管理员 |
| 不是类对象 | 提供的对象不是类 | 使用正确的类名称 |
| URL 无效 | 返回的 URL 无效 | 检查 URL 格式 |

## 高级用法

### 动态分析类结构
```json
// 分析类的复杂度
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 检查有多少包含,评估类的复杂度
```

### 批量读取所有包含
```json
// 读取类的所有包含
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 然后对每个包含调用 getObjectSourceV2
for each include in includes:
  {
    "tool": "getObjectSourceV2",
    "arguments": {
      "sourceUrl": include.url
    }
  }
```

### 检查测试覆盖
```json
// 检查类是否有测试
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}
// 检查是否有 testclasses 包含
// 如果没有,使用 createTestInclude 创建
```

## 与类组件对比

| 特性 | classIncludes | classComponents |
|------|---------------|-----------------|
| 结构 | 物理结构(包含文件) | 逻辑结构(方法、属性) |
| URL | 每个包含有独立 URL | 整个类共用 URL |
| 用途 | 读取特定包含 | 理解类的组件 |
| 编辑 | 编辑特定包含 | 了解组件位置 |

## 代码分析示例

```json
// 分析类的组织方式
{
  "tool": "classIncludes",
  "arguments": {
    "clas": "ZCL_MY_CLASS"
  }
}

// 分析结果:
{
  "includes": [
    { "type": "main", "url": "..." },
    { "type": "locals", "url": "..." },
    { "type": "testclasses", "url": "..." }
  ]
}

// 结论:
// - 类有主包含(定义和实现)
// - 有局部类型定义
// - 有测试类
// - 类结构良好,遵循 ABAP 最佳实践
```

## 性能优化建议

1. **缓存结果**: 缓存包含结构,避免重复查询

2. **按需读取**: 只读取需要的包含,不要一次性读取所有

3. **并行请求**: 对多个包含使用并行请求

4. **URL 复用**: 保存返回的 URL 以便后续使用
