# API 参考手册

本文档提供了 MCP ABAP ADT API Server 所有工具的详细参考信息，包括参数、返回值和使用示例。

## 目录

1. [身份验证 (Authentication)](#1-身份验证-authentication)
2. [对象操作 (Object Operations)](#2-对象操作-object-operations)
3. [传输管理 (Transport Management)](#3-传输管理-transport-management)
4. [对象锁定 (Object Locking)](#4-对象锁定-object-locking)
5. [源代码管理 (Source Code Management)](#5-源代码管理-source-code-management)
6. [对象管理 (Object Management)](#6-对象管理-object-management)
7. [对象注册 (Object Registration)](#7-对象注册-object-registration)
8. [类操作 (Class Operations)](#8-类操作-class-operations)
9. [代码分析 (Code Analysis)](#9-代码分析-code-analysis)
10. [代码格式化 (Pretty Printer)](#10-代码格式化-pretty-printer)
11. [单元测试 (Unit Testing)](#11-单元测试-unit-testing)
12. [Git 集成 (Git Integration)](#12-git-集成-git-integration)
13. [数据字典 (DDIC)](#13-数据字典-ddic)
14. [服务绑定 (Service Bindings)](#14-服务绑定-service-bindings)
15. [数据库查询 (Database Queries)](#15-数据库查询-database-queries)
16. [Feed (Feeds)](#16-feed-feeds)
17. [调试器 (Debugger)](#17-调试器-debugger)
18. [节点操作 (Node Operations)](#18-节点操作-node-operations)
19. [发现 (Discovery)](#19-发现-discovery)
20. [重命名 (Rename Refactoring)](#20-重命名-rename-refactoring)
21. [ATC 检查 (ATC)](#21-atc-检查-atc)
22. [性能追踪 (Traces)](#22-性能追踪-traces)
23. [重构 (Refactoring)](#23-重构-refactoring)
24. [版本历史 (Revisions)](#24-版本历史-revisions)

---

## 1. 身份验证 (Authentication)

### login

登录到 SAP ABAP 系统。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "message": "登录成功"
}
```

**示例**:
```json
{
  "tool": "login",
  "arguments": {}
}
```

---

### logout

从 SAP ABAP 系统登出。

**参数**: 无

**返回值**:
```json
{
  "status": "Logged out successfully"
}
```

**示例**:
```json
{
  "tool": "logout",
  "arguments": {}
}
```

---

### dropSession

清除本地会话缓存。

**参数**: 无

**返回值**:
```json
{
  "status": "Session cleared"
}
```

**示例**:
```json
{
  "tool": "dropSession",
  "arguments": {}
}
```

---

## 2. 对象操作 (Object Operations)

### objectStructure

获取 ABAP 对象的结构详情。

**参数**:
- `objectUrl` (string, 必需): 对象的 URL
- `version` (string, 可选): 对象版本

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

---

### searchObject

搜索 ABAP 对象。

**参数**:
- `query` (string, 必需): 搜索查询字符串（支持通配符 * 和 ?）
- `objType` (string, 可选): 对象类型过滤（例如：CLAS, PROG, INTF）
- `max` (number, 可选): 最大结果数（默认：50）

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

---

### findObjectPath

查找对象在包层次结构中的路径。

**参数**:
- `objectUrl` (string, 必需): 对象的 URL

**返回值**:
```json
{
  "status": "success",
  "path": [
    {
      "name": "$TMP",
      "type": "DEVC"
    },
    {
      "name": "Z_MY_PACKAGE",
      "type": "DEVC"
    }
  ],
  "message": "Object path found successfully"
}
```

**示例**:
```json
{
  "tool": "findObjectPath",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

---

### objectTypes

获取系统中可用的对象类型列表。

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

---

### reentranceTicket

获取再入票据，用于深度递归操作。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "ticket": "ticket_string_here",
  "message": "Reentrance ticket retrieved successfully"
}
```

---

## 3. 传输管理 (Transport Management)

### transportInfo

获取对象的传输信息。

**参数**:
- `objSourceUrl` (string, 必需): 对象源代码的 URL
- `devClass` (string, 可选): 开发类
- `operation` (string, 可选): 传输操作类型

**返回值**:
```json
{
  "status": "success",
  "transportInfo": {
    "transport": "DEVK900123",
    "task": "DEVK900124",
    "owner": "DEVELOPER",
    "status": "D"
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

---

### createTransport

创建新的传输请求。

**参数**:
- `objSourceUrl` (string, 必需): 对象源代码的 URL
- `REQUEST_TEXT` (string, 必需): 传输请求的描述
- `DEVCLASS` (string, 必需): 开发类
- `transportLayer` (string, 可选): 传输层

**返回值**:
```json
{
  "status": "success",
  "transportNumber": "DEVK900125",
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

---

### hasTransportConfig

检查系统是否支持传输配置。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "hasConfig": true
}
```

---

### transportConfigurations

获取所有传输配置。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "configurations": [
    {
      "name": "Standard",
      "uri": "/sap/bc/adt/transport/configurations/standard"
    }
  ]
}
```

---

### userTransports

获取用户的传输列表。

**参数**:
- `user` (string, 必需): 用户名
- `targets` (boolean, 可选): 是否包含目标系统

**返回值**:
```json
{
  "status": "success",
  "transports": [
    {
      "number": "DEVK900123",
      "description": "Feature X",
      "status": "D",
      "owner": "USER1"
    }
  ]
}
```

---

### transportRelease

释放传输请求。

**参数**:
- `transportNumber` (string, 必需): 传输号
- `ignoreLocks` (boolean, 可选): 是否忽略锁定
- `IgnoreATC` (boolean, 可选): 是否忽略 ATC 检查

**返回值**:
```json
{
  "status": "success",
  "result": "Transport released successfully"
}
```

**示例**:
```json
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}
```

---

## 4. 对象锁定 (Object Locking)

### lock

锁定 ABAP 对象。

**参数**:
- `objectUrl` (string, 必需): 对象的 URL

**返回值**:
```json
{
  "status": "success",
  "lockHandle": "lock_handle_string",
  "message": "Object locked successfully"
}
```

**示例**:
```json
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

---

### unLock

解锁 ABAP 对象。

**参数**:
- `objectUrl` (string, 必需): 对象的 URL
- `lockHandle` (string, 必需): 锁定句柄（从 lock 操作获得）

**返回值**:
```json
{
  "status": "success",
  "message": "Object unlocked successfully"
}
```

**示例**:
```json
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "lock_handle_string"
  }
}
```

---

## 5. 源代码管理 (Source Code Management)

### getObjectSource

获取对象的源代码。

**参数**:
- `objectSourceUrl` (string, 必需): 对象源代码的 URL（需要在对象 URL 后添加 `/source/main`）

**返回值**:
```json
{
  "status": "success",
  "source": "REPORT zmy_program.\n...",
  "message": "Source code retrieved successfully"
}
```

**示例**:
```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

---

### setObjectSource

设置对象的源代码。

**参数**:
- `objectSourceUrl` (string, 必需): 对象源代码的 URL
- `lockHandle` (string, 必需): 锁定句柄
- `source` (string, 必需): 新的源代码

**返回值**:
```json
{
  "status": "success",
  "message": "Source code updated successfully"
}
```

**示例**:
```json
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "lockHandle": "lock_handle_string",
    "source": "CLASS zcl_my_class DEFINITION.\n  PUBLIC SECTION.\n    METHODS: my_method.\nENDCLASS."
  }
}
```

---

## 6. 对象管理 (Object Management)

### activateObjects

激活一个或多个对象。

**参数**:
- `objects` (array, 必需): 要激活的对象列表
- `transport` (string, 可选): 传输请求

**返回值**:
```json
{
  "status": "success",
  "results": [
    {
      "object": "/sap/bc/adt/oo/classes/zcl_my_class",
      "success": true,
      "messages": []
    }
  ]
}
```

---

### activateByName

按名称和 URL 激活对象。

**参数**:
- `object` (string, 必需): 对象名称
- `url` (string, 必需): 对象 URL

**返回值**:
```json
{
  "status": "success",
  "activated": true,
  "messages": []
}
```

**示例**:
```json
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}
```

---

### inactiveObjects

获取所有未激活的对象。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "inactiveObjects": [
    {
      "name": "ZCL_MY_CLASS",
      "url": "/sap/bc/adt/oo/classes/zcl_my_class"
    }
  ]
}
```

---

## 9. 代码分析 (Code Analysis)

### syntaxCheckCode

执行 ABAP 代码语法检查。

**参数**:
- `url` (string, 必需): 对象 URL
- `code` (string, 必需): 要检查的代码

**返回值**:
```json
{
  "status": "success",
  "results": [
    {
      "line": 10,
      "message": "Syntax error",
      "severity": "error"
    }
  ]
}
```

---

### codeCompletion

获取代码补全建议。

**参数**:
- `url` (string, 必需): 对象 URL
- `code` (string, 必需): 代码上下文
- `line` (number, 必需): 行号
- `column` (number, 必需): 列号

**返回值**:
```json
{
  "status": "success",
  "suggestions": [
    {
      "label": "WRITE",
      "kind": "keyword",
      "detail": "ABAP keyword"
    }
  ]
}
```

---

### findDefinition

查找定义位置。

**参数**:
- `url` (string, 必需): 对象 URL
- `token` (string, 必需): 要查找的标识符

**返回值**:
```json
{
  "status": "success",
  "definition": {
    "url": "/sap/bc/adt/oo/classes/zcl_another_class",
    "line": 15,
    "column": 5
  }
}
```

---

### usageReferences

查找使用引用。

**参数**:
- `url` (string, 必需): 对象 URL
- `token` (string, 必需): 要查找的标识符

**返回值**:
```json
{
  "status": "success",
  "references": [
    {
      "url": "/sap/bc/adt/programs/programs/zprog1",
      "line": 25,
      "column": 10
    }
  ]
}
```

---

## 12. Git 集成 (Git Integration)

### gitRepos

列出所有 abapGit 仓库。

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "repos": [
    {
      "key": "repo1",
      "name": "Z_MY_PACKAGE",
      "url": "https://github.com/user/repo.git",
      "branch": "main"
    }
  ]
}
```

---

### gitCreateRepo

创建新的 abapGit 仓库。

**参数**:
- `packageName` (string, 必需): 包名
- `repourl` (string, 必需): Git 仓库 URL
- `branch` (string, 可选): 分支名（默认：main）
- `transport` (string, 可选): 传输请求
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Repository created successfully"
}
```

**示例**:
```json
{
  "tool": "gitCreateRepo",
  "arguments": {
    "packageName": "Z_MY_PACKAGE",
    "repourl": "https://github.com/user/repo.git",
    "branch": "main"
  }
}
```

---

### gitPullRepo

从远程仓库拉取变更。

**参数**:
- `repoId` (string, 必需): 仓库 ID
- `branch` (string, 可选): 分支名
- `transport` (string, 可选): 传输请求
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Pull completed successfully"
}
```

---

### stageRepo

暂存本地变更。

**参数**:
- `repo` (object, 必需): Git 仓库对象
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Changes staged successfully"
}
```

---

### pushRepo

推送变更到远程仓库。

**参数**:
- `repo` (object, 必需): Git 仓库对象
- `staging` (object, 必需): 暂存信息对象
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Push completed successfully"
}
```

---

## 17. 调试器 (Debugger)

### debuggerSetBreakpoints

设置断点。

**参数**:
- `debuggingMode` (string, 必需): 调试模式
- `terminalId` (string, 必需): 终端 ID
- `ideId` (string, 必需): IDE ID
- `clientId` (string, 必需): 客户端 ID
- `breakpoints` (array, 必需): 断点数组
- `user` (string, 必需): 用户名
- `scope` (string, 可选): 调试器范围
- `systemDebugging` (boolean, 可选): 是否启用系统调试
- `deactivated` (boolean, 可选): 是否停用断点

**返回值**:
```json
{
  "status": "success",
  "result": "Breakpoints set successfully"
}
```

---

### debuggerListen

监听调试事件。

**参数**:
- `debuggingMode` (string, 必需): 调试模式
- `terminalId` (string, 必需): 终端 ID
- `ideId` (string, 必需): IDE ID
- `user` (string, 必需): 用户名
- `checkConflict` (boolean, 可选): 是否检查冲突
- `isNotifiedOnConflict` (boolean, 可选): 冲突时是否通知

**返回值**:
```json
{
  "status": "success",
  "result": "Debug listener started"
}
```

---

### debuggerStackTrace

获取调试调用栈。

**参数**:
- `semanticURIs` (boolean, 可选): 是否使用语义 URI

**返回值**:
```json
{
  "status": "success",
  "result": {
    "stackFrames": [
      {
        "uri": "/sap/bc/adt/oo/classes/zcl_my_class",
        "line": 25,
        "method": "MY_METHOD"
      }
    ]
  }
}
```

---

### debuggerVariables

获取调试变量。

**参数**:
- `parents` (array, 必需): 父变量名数组

**返回值**:
```json
{
  "status": "success",
  "result": {
    "variables": [
      {
        "name": "lv_variable",
        "value": "123",
        "type": "I"
      }
    ]
  }
}
```

---

### debuggerStep

执行单步调试。

**参数**:
- `steptype` (string, 必需): 步骤类型（stepInto, stepOver, stepReturn, stepRunToLine, stepJumpToLine）
- `url` (string, 可选): 用于 stepRunToLine 或 stepJumpToLine 的 URL

**返回值**:
```json
{
  "status": "success",
  "result": "Step executed"
}
```

---

## 21. ATC 检查 (ATC)

### createAtcRun

创建并运行 ATC 检查。

**参数**:
- `variant` (string, 必需): 检查变体
- `mainUrl` (string, 必需): 主对象 URL

**返回值**:
```json
{
  "status": "success",
  "runResultId": "atc_run_id",
  "message": "ATC check started"
}
```

---

### atcWorklists

获取 ATC 工作列表。

**参数**:
- `runResultId` (string, 必需): 运行结果 ID

**返回值**:
```json
{
  "status": "success",
  "worklists": [
    {
      "objectId": "ZCL_MY_CLASS",
      "objectType": "CLAS",
      "findings": 5
    }
  ]
}
```

---

## 错误处理

所有工具可能返回以下错误格式：

```json
{
  "error": "Error message",
  "code": -32603
}
```

### 常见错误码

| 错误码 | 名称 | 描述 |
|--------|------|------|
| -32600 | InvalidRequest | 无效的请求 |
| -32601 | MethodNotFound | 工具不存在 |
| -32602 | InvalidParams | 无效的参数 |
| -32603 | InternalError | 内部服务器错误 |
| 429 | TooManyRequests | 速率限制超出 |

---

## 使用建议

### 1. 始终先登录
在执行任何操作前，先调用 `login` 工具。

### 2. 正确处理锁定
修改对象前必须先锁定，修改完成后记得解锁。

### 3. 使用传输请求
大多数修改操作需要传输请求，先创建或获取传输信息。

### 4. 错误恢复
如果操作失败，可以：
- 清除会话 (`dropSession`)
- 重新登录 (`login`)
- 重试操作

### 5. 批量操作
对于大量操作，考虑分批处理以避免超时。

---

## 相关文档

- [快速开始](quickstart.md)
- [工具参考](tools-reference.md)
- [处理器模块](handlers.md)
- [服务器架构](architecture.md)
