# createObject

创建新的 ABAP 对象。

## 功能说明

此工具创建新的 ABAP 对象,如类、程序、函数模块等。

## 调用方法

**参数**:
- `objtype` (string, 必需): 对象类型
- `name` (string, 必需): 对象名称
- `parentName` (string, 必需): 父对象名称(通常是包名)
- `description` (string, 必需): 对象描述
- `parentPath` (string, 必需): 父对象路径
- `responsible` (string, 可选): 负责人
- `transport` (string, 可选): 传输请求号

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

1. **对象类型**: objtype 必须是有效的对象类型

2. **命名规则**: 对象名称必须遵循 ABAP 命名规则

3. **包**: 父对象通常是包

4. **传输**: 需要传输请求

5. **描述**: 提供有意义的描述

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objtype | string | 是 | 有效的对象类型 |
| name | string | 是 | 符合命名规则 |
| parentName | string | 是 | 有效的父对象名称 |
| description | string | 是 | 描述文本 |
| parentPath | string | 是 | 有效的父对象路径 |
| responsible | string | 否 | 用户名 |
| transport | string | 否 | 传输请求号 |

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

## 对象类型

| 类型代码 | 类型 | 说明 |
|---------|------|------|
| CLAS | 类 | ABAP 类 |
| PROG | 程序 | ABAP 程序 |
| FUGR | 函数组 | 函数组 |
| TABL | 表 | 数据库表 |
| VIEW | 视图 | 数据库视图 |
| DDLS | CDS | CDS 定义 |

## 最佳实践

1. **创建前验证**: 先验证参数

2. **命名规范**: 遵循命名规范

3. **描述清晰**: 提供清晰的描述

4. **传输请求**: 使用正确的传输请求

5. **测试**: 创建后立即测试

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

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象已存在 | 对象名称已存在 | 使用不同的名称 |
| 参数无效 | 参数值无效 | 检查参数 |
| 权限不足 | 没有创建权限 | 联系管理员 |
| 传输无效 | 传输请求无效 | 使用正确的传输 |

## 高级用法

### 批量创建
```json
// 批量创建多个对象
for each objDef in objectDefinitions:
  {
    "tool": "validateNewObject",
    "arguments": {
      "options": JSON.stringify(objDef)
    }
  }
  {
    "tool": "createObject",
    "arguments": objDef
  }
```

### 模板创建
```json
// 从模板创建对象
{
  "tool": "createObject",
  "arguments": {
    "objtype": "CLAS",
    "name": "ZCL_TEMPLATE_BASED",
    "parentName": "Z_MY_PACKAGE",
    "description": "Template based class",
    "parentPath": "/sap/bc/adt/packages/z_my_package"
  }
}
// 然后从模板复制代码
```
