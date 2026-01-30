# transportInfo

获取对象的传输信息。

## 功能说明

此工具用于获取 ABAP 对象的传输信息，包括关联的传输请求、任务、开发类等信息。这对于理解对象的传输状态和管理传输请求非常重要。

## 调用方法

**参数**:
- `objSourceUrl` (string, 必需): 对象源代码的 URL
- `devClass` (string, 可选): 开发类（包）
- `operation` (string, 可选): 传输操作类型（"I"=插入, "D"=删除, "E"=编辑, 默认："I"）

**返回值**:
```json
{
  "status": "success",
  "transportInfo": {
    "PGMID": "R3TR",
    "OBJECT": "CLAS",
    "OBJECTNAME": "ZCL_MY_CLASS",
    "OPERATION": "I",
    "DEVCLASS": "Z_MY_PACKAGE",
    "CTEXT": "My Class",
    "KORRFLAG": "D",
    "AS4USER": "DEVELOPER",
    "PDEVCLASS": "Z_MY_PACKAGE",
    "DLVUNIT": "",
    "RESULT": "OK",
    "RECORDING": "",
    "EXISTING_REQ_ONLY": "",
    "TRANSPORTS": [
      {
        "TRKORR": "DEVK900123",
        "TRFUNCTION": "K",
        "AS4TEXT": "Transport Request",
        "AS4USER": "DEVELOPER",
        "TRSTATUS": "D",
        "TARDEVCL": "",
        "STRKORR": "DEVK900123",
        "TARSYSTEM": "P01",
        "KORRVOR": "",
        "KORRVF": "",
        "TARLAYER": "Z",
        "PARENTTR": ""
      }
    ],
    "NAMESPACE": "",
    "URI": "/sap/bc/adt/cts/transportrequests/...",
    "LOCKS": {
      "TASKS": []
    }
  }
}
```

**示例**:
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

## 注意事项

1. **源代码 URL**: 必须使用对象的源代码 URL（通常是对象 URL + `/source/main`）

2. **操作类型**: 
   - `I` (Insert): 插入新对象
   - `D` (Delete): 删除对象
   - `E` (Edit): 编辑现有对象

3. **可用传输**: `TRANSPORTS` 数组列出了所有可用的传输请求

4. **锁定信息**: `LOCKS` 包含任务锁定信息

5. **结果状态**: `RESULT` 字段指示操作是否成功

6. **开发类**: `DEVCLASS` 指定对象所属的开发类

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objSourceUrl | string | 是 | 必须是有效的源代码 URL |
| devClass | string | 否 | 开发类（包） |
| operation | string | 否 | "I", "D", 或 "E" |

## 与其他工具的关联性

1. **编辑流程**:
   ```
   transportInfo → 了解可用传输 → lock → setObjectSource（使用 transport）
   ```

2. **传输管理**:
   ```
   transportInfo → createTransport → userTransports → transportRelease
   ```

3. **对象创建**:
   ```
   validateNewObject → createObject → transportInfo
   ```

4. **与 lock 的关系**:
   ```
   transportInfo → 获取传输号 → lock（可能返回传输）
   ```

## 使用场景说明

### 场景 1: 获取可用传输
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}
// 返回可用的传输请求列表
```

### 场景 2: 检查对象传输状态
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "operation": "I"
  }
}
// 检查对象的传输状态和要求
```

### 场景 3: 准备编辑对象
```json
// 步骤 1: 获取传输信息
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 步骤 2: 选择或创建传输
// 如果 TRANSPORTS 为空，需要创建新传输

// 步骤 3: 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}
```

### 场景 4: 批量操作准备
```json
// 对多个对象批量获取传输信息
for each object:
  {"tool": "transportInfo", "arguments": {"objSourceUrl": "..."}}
```

## 传输信息详解

### 核心字段

| 字段 | 说明 | 示例 |
|------|------|------|
| PGMID | 程序 ID | R3TR |
| OBJECT | 对象类型 | CLAS |
| OBJECTNAME | 对象名称 | ZCL_MY_CLASS |
| OPERATION | 操作类型 | I, D, E |
| DEVCLASS | 开发类 | Z_MY_PACKAGE |
| AS4USER | 用户 | DEVELOPER |
| RESULT | 结果状态 | OK |
| TRANSPORTS | 可用传输列表 | 数组 |

### 传输请求字段

| 字段 | 说明 | 示例 |
|------|------|------|
| TRKORR | 传输请求号 | DEVK900123 |
| TRFUNCTION | 功能类型 | K=任务, S=请求 |
| AS4TEXT | 描述 | Transport Request |
| AS4USER | 所有者 | DEVELOPER |
| TRSTATUS | 状态 | D=可修改, R=已释放 |
| TARSYSTEM | 目标系统 | P01 |

## 传输请求类型

| TRFUNCTION | 说明 |
|-----------|------|
| K | 任务 (Task) |
| S | 请求 (Request) |
| W | 修复 (Repair) |

## 传输请求状态

| TRSTATUS | 说明 | 操作 |
|---------|------|------|
| D | 可修改 (Modifiable) | 可以添加对象 |
| L | 可修改，锁定 | 有锁定存在 |
| R | 已释放 (Released) | 无法修改 |

## 最佳实践

1. **编辑前检查**: 在编辑对象前总是检查传输信息

2. **使用正确传输**: 确保使用正确的传输请求

3. **创建新传输**: 如果没有可用传输，及时创建

4. **跟踪传输**: 记录对象使用的传输请求

5. **释放前验证**: 释放前验证所有对象都正确分配

## 完整工作流程

```json
// 标准编辑工作流

// 1. 获取对象结构
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 2. 获取传输信息
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 3. 检查可用传输
if transports.length === 0:
  // 没有可用传输，创建新传输
  {
    "tool": "createTransport",
    "arguments": {
      "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
      "REQUEST_TEXT": "Edit ZCL_CLASS",
      "DEVCLASS": "Z_MY_PACKAGE"
    }
  }
else:
  // 选择第一个可用传输
  transportNumber = transports[0].TRKORR

// 4. 读取源代码
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 5. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 6. 编辑源代码（在客户端进行）

// 7. 语法检查
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "code": "edited code"
  }
}

// 8. 保存源代码
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "lockHandle": "...",
    "source": "edited code",
    "transport": transportNumber
  }
}

// 9. 激活对象
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 10. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "..."
  }
}
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 无可用传输 | TRANSPORTS 为空 | 创建新传输 |
| 权限不足 | 用户没有传输权限 | 联系管理员 |
| 对象已锁定 | 对象被其他用户锁定 | 等待或联系对方 |
| 开发类无效 | DEVCLASS 不存在 | 使用正确的开发类 |

## 高级用法

### 自定义开发类
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "devClass": "Z_CUSTOM_PACKAGE",
    "operation": "I"
  }
}
```

### 删除操作
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "operation": "D"
  }
}
```

### 编辑操作
```json
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "operation": "E"
  }
}
```

