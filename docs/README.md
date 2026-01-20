# MCP ABAP ADT API Server 文档

欢迎使用 MCP ABAP ADT API Server 参考文档。

## 概述

MCP ABAP ADT API Server 是一个基于 Model Context Protocol (MCP) 的服务器，用于将 ABAP ADT (ABAP Development Tools) API 暴露给 MCP 客户端（如 Claude、Cline 等），实现与 SAP ABAP 系统的无缝交互。

## 主要功能

- **✅ 身份验证** - 安全地连接到 ABAP 系统
- **📦 对象管理** - 创建、读取、更新、删除 ABAP 对象
- **🚚 传输管理** - 管理传输请求和配置
- **🔍 代码分析** - 语法检查、代码补全、查找定义
- **🐛 调试功能** - 设置断点、单步执行、查看变量
- **🧪 单元测试** - 运行和管理 ABAP 单元测试
- **🔍 ATC 检查** - 代码审查和静态分析
- **📊 性能追踪** - 性能分析和追踪
- **🔧 重构操作** - 重命名、提取方法等
- **📝 abapGit 集成** - Git 版本控制集成
- **🌐 服务绑定** - 管理服务绑定

## 文档索引

### 快速开始
- [快速开始指南](quickstart.md) - 5分钟快速上手指南

### 安装和配置
- [安装和配置](installation.md) - 详细的安装和配置步骤

### 服务器架构
- [服务器架构](architecture.md) - 服务器设计和架构说明
- [处理器模块](handlers.md) - 各个处理器模块的详细说明

### 工具参考
- [工具参考](tools-reference.md) - 所有可用工具的完整参考

### 开发文档
- [开发指南](development.md) - 如何扩展和开发服务器

## 快速示例

### 1. 连接到 SAP 系统

```json
{
  "tool": "login",
  "arguments": {}
}
```

### 2. 搜索对象

```json
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZCL_*",
    "objType": "CLAS",
    "max": 50
  }
}
```

### 3. 获取对象源代码

```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zmyclass/source/main"
  }
}
```

### 4. 修改源代码

```json
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zmyclass/source/main",
    "lockHandle": "...",
    "source": "NEW_SOURCE_CODE_HERE"
  }
}
```

### 5. 运行单元测试

```json
{
  "tool": "unitTestRun",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/ztest_class"
  }
}
```

## 工作流程示例

### 典型的代码修改工作流

1. **登录**: `login`
2. **搜索对象**: `searchObject`
3. **读取源代码**: `getObjectSource`
4. **获取传输信息**: `transportInfo`
5. **锁定对象**: `lock`
6. **修改源代码**: `setObjectSource`
7. **语法检查**: `syntaxCheckCode`
8. **激活对象**: `activateByName`
9. **解锁对象**: `unLock`

## 服务器要求

### 运行环境
- **Node.js**: >= 20.x
- **npm**: >= 10.x

### SAP 系统要求
- **SAP 系统**: 支持 ADT REST API
- **用户权限**: 带有 ADT 访问权限的 SAP 用户

## 版本信息

- **当前版本**: 0.1.1
- **依赖的 abap-adt-api**: ^6.2.0
- **依赖的 MCP SDK**: ^1.4.1

## 支持的客户端

此 MCP Server 可以与以下客户端集成：

- **Claude Desktop** - Anthropic 的 Claude 桌面客户端
- **Cline** - AI 编程助手
- **任何其他 MCP 兼容的客户端**

## 项目结构

```
mcp/
├── src/
│   ├── index.ts                  # 服务器入口
│   ├── handlers/                 # 工具处理器
│   │   ├── AuthHandlers.ts       # 身份验证
│   │   ├── ObjectHandlers.ts     # 对象操作
│   │   ├── TransportHandlers.ts  # 传输管理
│   │   ├── DebugHandlers.ts      # 调试功能
│   │   └── ...
│   ├── lib/                     # 工具库
│   │   └── logger.ts             # 日志系统
│   └── types/                   # 类型定义
│       └── tools.ts              # 工具类型
├── docs/                         # 文档
│   ├── README.md                 # 本文档
│   ├── quickstart.md             # 快速开始
│   ├── installation.md           # 安装指南
│   ├── architecture.md           # 架构文档
│   ├── handlers.md               # 处理器文档
│   ├── tools-reference.md        # 工具参考
│   └── development.md            # 开发指南
├── package.json
├── tsconfig.json
└── .env.example                  # 环境变量模板
```

## 核心概念

### MCP (Model Context Protocol)
MCP 是一种协议，用于 AI 模型与外部服务和资源之间的标准化通信。本服务器实现了 MCP 协议，使得 AI 模型可以通过标准化的工具接口与 SAP ABAP 系统交互。

### ADT (ABAP Development Tools)
ADT 是 SAP 提供的一组 REST API，用于访问和操作 ABAP 对象。本服务器封装了 [abap-adt-api](https://github.com/marcellourbani/abap-adt-api/) 库，提供了简化的 MCP 工具接口。

### Handler 模式
服务器采用 Handler 模式，每个功能模块（如对象操作、传输管理、调试等）都有对应的 Handler 类。这些 Handler 类继承自 `BaseHandler`，实现了统一的接口。

### 错误处理
服务器使用 `McpError` 机制报告错误，错误信息以 JSON 格式返回给客户端。

## 性能考虑

服务器实现了以下性能优化机制：

- **请求追踪**: 每个请求都被记录和追踪
- **指标收集**: 自动收集性能指标（请求数、错误数、平均响应时间）
- **速率限制**: 内置简单的速率限制机制
- **会话管理**: 支持 stateful 和 stateless 会话模式

## 安全性

- **环境变量**: 敏感信息通过环境变量配置
- **会话隔离**: 支持会话隔离和终止
- **SSL/TLS**: 支持 HTTPS 连接和自定义证书

## 故障排除

常见问题解决方案：

### 连接失败
- 检查 SAP URL、用户名和密码是否正确
- 确保 SAP 系统可访问
- 检查防火墙和网络配置

### 认证失败
- 验证用户凭据
- 检查用户权限
- 确保客户端 ID 指定正确

### 锁定失败
- 检查对象是否已被其他用户锁定
- 尝试重新获取锁
- 检查用户权限

## 相关资源

- [abap-adt-api 仓库](https://github.com/marcellourbani/abap-adt-api/)
- [MCP 协议文档](https://modelcontextprotocol.io/)
- [SAP ADT 文档](https://help.sap.com/viewer/p/SAP_ADT)
- [Claude Desktop](https://claude.ai/download)

## 贡献指南

欢迎贡献！请参阅 [开发指南](development.md) 了解如何参与开发。

## 许可证

ISC License - 详见项目根目录的 LICENSE 文件

## 获取帮助

如果遇到问题：

1. 查看 [故障排除](#故障排除) 部分
2. 提交 [Issue](https://github.com/mario-andreschak/mcp-abap-abap-adt-api/issues)
3. 查看 [现有文档](#文档索引)
