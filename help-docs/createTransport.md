# createTransport

创建新的传输请求。

## 功能说明

此工具用于创建新的 ABAP 传输请求，用于管理和跟踪对象的变更。传输请求是 ABAP 变更管理的基本单元。

## 调用方法

**参数**:
- `objSourceUrl` (string, 必需): 对象源代码的 URL
- `REQUEST_TEXT` (string, 必需): 传输请求的描述
- `DEVCLASS` (string, 必需): 开发类（包）
- `transportLayer` (string, 可选): 传输层

**返回值**:
```json
{
  "status": "success",
  "transportNumber": "DEVK900125",
  "taskNumber": "DEVK900126",
  "message": "Transport created successfully"
}
```

**示例**:
```json
{
  "tool": "createTransport",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "REQUEST_TEXT": "新增功能开发",
    "DEVCLASS": "Z_MY_PACKAGE"
  }
}
```

## 注意事项

1. **传输描述**: `REQUEST_TEXT` 应该清晰地描述传输的内容和目的

2. **开发类**: `DEVCLASS` 决定传输的目标系统和路径

3. **传输层**: 传输层决定传输的路由规则

4. **创建规则**: 只有当 `transportInfo` 返回的 `TRANSPORTS` 为空时才需要创建新传输

5. **传输类型**: 通常创建工作台传输（Workbench Request）

6. **权限要求**: 用户必须有创建传输的权限

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objSourceUrl | string | 是 | 必须是有效的源代码 URL |
| REQUEST_TEXT | string | 是 | 传输描述文本 |
| DEVCLASS | string | 是 | 有效的开发类 |
| transportLayer | string | 否 | 可选的传输层 |

## 与其他工具的关联性

1. **传输管理流程**:
   ```
   transportInfo（无可用传输）→ createTransport → lock → setObjectSource
   ```

2. **与 userTransports 的关系**:
   - 创建的传输会出现在用户的传输列表中

3. **与 transportRelease 的关系**:
   - 创建的传输需要在使用后释放

## 使用场景说明

### 场景 1: 创建新传输
```json
{
  "tool": "createTransport",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_new_class/source/main",
    "REQUEST_TEXT": "创建新类 ZCL_NEW_CLASS",
    "DEVCLASS": "Z_MY_PACKAGE"
  }
}
```

### 场景 2: 指定传输层
```json
{
  "tool": "createTransport",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "REQUEST_TEXT": "功能开发",
    "DEVCLASS": "Z_MY_PACKAGE",
    "transportLayer": "Z"
  }
}
```

### 场景 3: 检查后创建
```json
// 步骤 1: 检查是否有可用传输
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 步骤 2: 如果没有可用传输，创建新传输
if transports.length === 0:
  {
    "tool": "createTransport",
    "arguments": {
      "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
      "REQUEST_TEXT": "编辑 ZCL_CLASS",
      "DEVCLASS": "Z_MY_PACKAGE"
    }
  }
```

## 传输描述最佳实践

好的传输描述应该：

- **清晰**: 明确说明做了什么
- **简洁**: 简洁但信息充分
- **标准**: 遵循组织的命名约定
- **可追踪**: 便于后续查找和追踪

### 示例

| 好的描述 | 不好的描述 |
|---------|-----------|
| "新增客户管理功能 - 创建 ZCL_CUSTOMER_MANAGER 类" | "新类" |
| "修复订单查询性能问题" | "修 bug" |
| "重构支付流程 - 重构 ZCL_PAYMENT 类" | "重构" |

## 传输类型

| 类型 | 用途 | 示例 |
|------|------|------|
| Workbench (K/S) | 工作台变更（程序、类） | 开发新功能 |
| Customizing (K/S) | 自定义变更（配置） | 修改配置表 |

## 开发类选择

| DEVCLASS | 用途 | 目标系统 |
|---------|------|---------|
| $TMP | 本地开发 | 不传输 |
| Z* | 客户开发 | 生产系统 |
| Y* | SAP 预留 | SAP 系统 |

## 完整工作流程

```json
// 创建和使用传输的完整流程

// 1. 检查传输信息
{
  "tool": "transportInfo",
  "arguments": {
    "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"
  }
}

// 2. 如果没有可用传输，创建新传输
if transports.length === 0:
  {
    "tool": "createTransport",
    "arguments": {
      "objSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
      "REQUEST_TEXT": "编辑 ZCL_CLASS - 新增方法",
      "DEVCLASS": "Z_MY_PACKAGE"
    }
  }
  transportNumber = "DEVK900125"
else:
  transportNumber = transports[0].TRKORR

// 3. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 4. 编辑对象
// [编辑代码...]

// 5. 保存对象
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main",
    "lockHandle": "...",
    "source": "new code",
    "transport": transportNumber
  }
}

// 6. 激活对象
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_class"
  }
}

// 7. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "lockHandle": "..."
  }
}

// 8. 释放传输
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": transportNumber
  }
}
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 开发类无效 | DEVCLASS 不存在 | 使用正确的开发类 |
| 权限不足 | 用户没有创建传输权限 | 联系管理员 |
| 传输层无效 | transportLayer 不存在 | 使用正确的传输层 |
| 描述太长 | REQUEST_TEXT 超过限制 | 缩短描述 |

## 最佳实践

1. **先检查后创建**: 总是先使用 `transportInfo` 检查是否有可用传输

2. **描述规范**: 使用标准化的传输描述格式

3. **合理分组**: 将相关的变更放在同一个传输中

4. **及时释放**: 完成后及时释放传输

5. **文档记录**: 记录传输的详细信息和变更内容

## 传输命名约定

建议的传输描述格式：

```
<操作类型> - <功能名称> - <具体描述>

示例:
- 新增 - 客户管理 - 创建 ZCL_CUSTOMER_MANAGER 类
- 修复 - 订单查询 - 优化查询性能
- 重构 - 支付流程 - 重构 ZCL_PAYMENT 类
```

