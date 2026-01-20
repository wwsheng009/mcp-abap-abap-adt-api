# 快速开始指南

本指南将帮助你在 5 分钟内快速上手 MCP ABAP ADT API Server。

## 前提条件

在开始之前，请确保已安装：

- **Node.js**: >= 20.x ([下载地址](https://nodejs.org/))
- **npm**: >= 10.x (随 Node.js 一起安装)
- **访问 SAP 系统** 的权限
- **SAP 凭据**: 用户名和密码

## 步骤 1: 安装

### 克隆仓库

```bash
git clone https://github.com/mario-andreschak/mcp-abap-abap-adt-api.git
cd mcp-abap-abap-adt-api
```

### 安装依赖

```bash
npm install
```

## 步骤 2: 配置环境变量

### 创建配置文件

```bash
cp .env.example .env
```

### 编辑配置

打开 `.env` 文件并配置 SAP 连接信息：

```env
# SAP 系统连接信息
SAP_URL=https://your-sap-server.com:44300
SAP_USER=YOUR_SAP_USERNAME
SAP_PASSWORD=YOUR_SAP_PASSWORD

# 可选配置
SAP_CLIENT=YOUR_SAP_CLIENT      # 默认: 800
SAP_LANGUAGE=YOUR_SAP_LANGUAGE  # 默认: EN

# 如果使用自签名证书（不推荐生产环境）
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**配置参数说明：**

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `SAP_URL` | ✅ | SAP 系统 URL | `https://vhcalnplci.local:8000` |
| `SAP_USER` | ✅ | SAP 用户名 | `DEVELOPER` |
| `SAP_PASSWORD` | ✅ | SAP 密码 | `YourPassword123` |
| `SAP_CLIENT` | ❌ | SAP 客户端 ID | `800` |
| `SAP_LANGUAGE` | ❌ | 语言代码 | `EN` |

**安全提示:** ⚠️ 永远不要将 `.env` 文件提交到版本控制系统！

## 步骤 3: 构建服务器

```bash
npm run build
```

这将编译 TypeScript 代码到 `dist/` 目录。

## 步骤 4: 运行服务器

### 标准运行

```bash
npm run start
```

服务器将在 stdio 上启动，并显示：
```
MCP ABAP ADT API server running on stdio
```

### 开发模式运行

```bash
npm run dev
```

这将启动 MCP Inspector，提供交互式 UI 用于测试工具。

## 步骤 5: 测试连接

### 使用 healthcheck 工具

```json
{
  "tool": "healthcheck",
  "arguments": {}
}
```

**预期响应：**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

### 登录测试

```json
{
  "tool": "login",
  "arguments": {}
}
```

如果配置正确，应该返回成功的登录响应。

## 步骤 6: 首次使用 - 搜索对象

```json
{
  "tool": "searchObject",
  "arguments": {
    "query": "Z*",
    "objType": "CLAS",
    "max": 10
  }
}
```

这将搜索以 Z 开头的 ABAP 类。

## 集成到 Claude Desktop

### 步骤 1: 安装 Smithery（可选但推荐）

```bash
npx -y @smithery/cli install @mario-andreschak/mcp-abap-abap-adt-api --client claude
```

### 步骤 2: 手动配置（不使用 Smithery）

编辑 Claude Desktop 配置文件：

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

添加以下配置：

```json
{
  "mcpServers": {
    "mcp-abap-abap-adt-api": {
      "command": "node",
      "args": [
        "PATH_TO/mcp-abap-abap-adt-api/dist/index.js"
      ],
      "env": {
        "SAP_URL": "https://your-sap-server.com:44300",
        "SAP_USER": "YOUR_SAP_USERNAME",
        "SAP_PASSWORD": "YOUR_SAP_PASSWORD"
      }
    }
  }
}
```

将环境变量替换为你的实际配置。

### 步骤 3: 重启 Claude Desktop

重启后，你就可以在 Claude 中使用 ABAP MCP 工具了。

## 集成到 Cline

在 VSCode 中安装 Cline 扩展，然后配置 MCP 服务器。

编辑 Cline 配置文件（通常是项目根目录的 `.cline` 或通过 Cline 设置界面）：

```json
{
  "mcpServers": {
    "mcp-abap-abap-adt-api": {
      "command": "node",
      "args": [
        "PATH_TO/mcp-abap-abap-adt-api/dist/index.js"
      ]
    }
  }
}
```

注意：环境变量需要在 `.env` 文件中配置。

## 快速工作流示例

### 场景：查看并修改 ABAP 类

#### 1. 搜索类

```
用户：搜索名为 ZCL_INVOICE 的类
```

Claude 将调用：
```json
{
  "tool": "searchObject",
  "arguments": {
    "query": "ZCL_INVOICE",
    "objType": "CLAS"
  }
}
```

#### 2. 获取对象结构

```
用户：获取这个类的结构
```

Claude 将调用：
```json
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/z_invoice"
  }
}
```

#### 3. 读取源代码

```
用户：显示源代码
```

Claude 将调用：
```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/z_invoice/source/main"
  }
}
```

#### 4. 锁定对象

```
用户：锁定对象以便修改
```

Claude 将调用：
```json
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/z_invoice"
  }
}
```

#### 5. 修改代码

```
用户：修改源代码...
```

Claude 将调用：
```json
{
  "tool": "setObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/z_invoice/source/main",
    "lockHandle": "..."
  }
}
```

#### 6. 语法检查

```
用户：检查语法
```

Claude 将调用：
```json
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/z_invoice",
    "code": "MODIFIED_SOURCE_CODE"
  }
}
```

## 常见问题

### Q: 如何确认服务器是否正常运行？

A: 运行 `healthcheck` 工具：
```json
{
  "tool": "healthcheck"
}
```

如果返回 `"status": "healthy"`，说明服务器正常。

### Q: 连接失败怎么办？

A: 检查以下几点：
1. SAP URL 格式是否正确（需要包含协议和端口）
2. 用户名和密码是否正确
3. 网络是否可达
4. 如果使用 HTTPS，证书是否受信任

### Q: 如何查看日志？

A: 日志直接输出到 stderr，以 JSON 格式：
```json
{
  "timestamp": "2025-01-20T10:00:00.000Z",
  "level": "info",
  "service": "AuthHandlers",
  "message": "Request completed",
  "duration": 123.45,
  "success": true
}
```

### Q: 如何处理证书错误？

A: 如果使用自签名证书，在开发环境中可以设置：
```env
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**⚠️ 警告:** 这不推荐在生产环境中使用！

### Q: 如何切换用户？

A: 需要先 `logout`，然后更新 `.env` 文件，最后重新 `login`。

### Q: 支持多用户并发吗？

A: 是的，服务器支持并发请求。每个请求都被独立处理。

## 下一步

- 📖 阅读完整的 [工具参考](tools-reference.md)
- 🏗️ 了解 [服务器架构](architecture.md)
- 🔧 查看 [安装和配置](installation.md)
- 💻 开始 [开发](development.md)

## 获取帮助

如果遇到问题：

1. 查阅本文档的 [常见问题](#常见问题) 部分
2. 查看 [故障排除](README.md#故障排除)
3. 提交 Issue 到 [GitHub](https://github.com/mario-andreschak/mcp-abap-abap-adt-api/issues)
4. 查看 [主 README](../README.md) 获取更多信息
