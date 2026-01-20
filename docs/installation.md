# 安装和配置

本文档提供详细的安装和配置步骤。

## 系统要求

### 运行环境

| 组件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 20.x | 20.x LTS 或更高 |
| npm | 10.x | 10.x 或更高 |
| 操作系统 | Windows 10+, macOS 10.15+, Ubuntu 18.04+ | 任意支持 Node.js 的系统 |

### SAP 系统要求

- **SAP 系统**: 支持 ADT REST API 的 SAP NetWeaver（NW 7.40+ 或更高）
- **网络连接**: 稳定的网络连接到 SAP 系统
- **用户权限**: 具有 ADT 访问权限的 SAP 用户账号

## 安装方式

### 方式一: 从源码安装

#### 1. 克隆仓库

```bash
git clone https://github.com/mario-andreschak/mcp-abap-abap-adt-api.git
cd mcp-abap-abap-adt-api
```

#### 2. 安装依赖

```bash
npm install
```

这将安装以下依赖：
- `@modelcontextprotocol/sdk` - MCP SDK 核心
- `@types/node` - Node.js 类型定义
- `abap-adt-api` - ABAP ADT API 客户端库
- `dotenv` - 环境变量管理
- `typescript` - TypeScript 编译器

#### 3. 构建项目

```bash
npm run build
```

这会将 TypeScript 源代码编译到 `dist/` 目录。

### 方式二: 使用 NPM 全局安装（如果已发布）

```bash
npm install -g mcp-abap-abap-adt-api
```

### 方式三: 使用 Docker

#### 1. Dockerfile 说明

项目包含 Dockerfile，支持容器化部署。

#### 2. 构建镜像

```bash
docker build -t mcp-abap-abap-adt-api .
```

#### 3. 运行容器

```bash
docker run \
  -e SAP_URL="https://your-sap-server.com:44300" \
  -e SAP_USER="your-username" \
  -e SAP_PASSWORD="your-password" \
  -v $(pwd)/dist:/app/dist \
  mcp-abap-abap-adt-api
```

## 配置

### 环境变量配置

#### 1. 创建配置文件

```bash
cp .env.example .env
```

#### 2. 配置说明

编辑 `.env` 文件：

```env
# ========== 必填配置 ==========

# SAP 系统 URL（包含协议和端口）
SAP_URL=https://vhcalnplci.local:8000

# SAP 用户名
SAP_USER=DEVELOPER

# SAP 密码
SAP_PASSWORD=YourPassword123

# ========== 可选配置 ==========

# SAP 客户端 ID（默认: 800）
SAP_CLIENT=800

# 语言代码（默认: EN）
SAP_LANGUAGE=EN

# ========== 高级配置 ==========

# SSL/TLS 设置（仅开发环境使用！）
# 设置为 "0" 允许自签名证书（不推荐生产环境）
NODE_TLS_REJECT_UNAUTHORIZED="1"
```

#### 3. 环境变量详细说明

| 变量名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `SAP_URL` | string | ✅ | - | SAP 系统的完整 URL，例如 `https://host:port` |
| `SAP_USER` | string | ✅ | - | SAP 系统的用户名 |
| `SAP_PASSWORD` | string | ✅ | - | SAP 系统的密码 |
| `SAP_CLIENT` | string | ❌ | "" | SAP 客户端 ID (如 "800") |
| `SAP_LANGUAGE` | string | ❌ | "" | 语言代码 (如 "EN", "DE") |
| `NODE_TLS_REJECT_UNAUTHORIZED` | string | ❌ | "1" | 是否拒绝未授权的证书，"0"=允许(开发), "1"=拒绝(生产) |

### SAP 权限要求

确保 SAP 用户具有以下权限：

| 权限 | 说明 | 相关工具 |
|------|------|----------|
| `S_ABAP_DEVELOP` | ABAP 开发权限 | 对象创建、修改 |
| `S_ADMI_FCD` | 系统管理权限 | 传输管理 |
| `S_DEVELOP` | 开发权限 | 基本开发操作 |
| `S_RTCTS` | CTS 传输权限 | 传输请求操作 |
| `S_RFC` | RFC 权限 | 远程函数调用 |

### 网络配置

#### 防火墙设置

确保以下端口开放：

| 用途 | 端口 | 说明 |
|------|------|------|
| HTTP | 8000, 8080 等 | 用于 HTTP 连接 |
| HTTPS | 44300, 44301 等 | 用于 HTTPS 连接 |

#### 代理配置（如果需要）

```env
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=https://proxy-server:port
NO_PROXY=localhost,127.0.0.1
```

## 集成配置

### Claude Desktop 集成

#### 配置文件位置

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 配置示例

```json
{
  "mcpServers": {
    "mcp-abap-abap-adt-api": {
      "command": "node",
      "args": [
        "E:/projects/abap/abap-adt-api/mcp-abap-abap-adt-api/dist/index.js"
      ],
      "env": {
        "SAP_URL": "https://vhcalnplci.local:8000",
        "SAP_USER": "DEVELOPER",
        "SAP_PASSWORD": "YourPassword123",
        "SAP_CLIENT": "800",
        "SAP_LANGUAGE": "EN"
      }
    }
  }
}
```

**注意**：
- 路径需要根据你的实际情况修改
- 建议使用绝对路径
- Windows 路径可以使用正斜杠 `/` 或双反斜杠 `\\`

#### 环境变量的两种方式

1. **配置文件中直接指定**（如上示例）
2. **使用 .env 文件**（推荐）

如果使用 `.env` 文件，配置会自动加载：

```json
{
  "mcpServers": {
    "mcp-abap-abap-adt-api": {
      "command": "node",
      "args": [
        "E:/projects/abap/abap-adt-api/mcp-abap-abap-adt-api/dist/index.js"
      ]
    }
  }
}
```

### Cline VSCode 扩展集成

#### 方法一：.cline 文件

在项目根目录创建 `.cline` 文件：

```json
{
  "mcpServers": {
    "mcp-abap-abap-adt-api": {
      "command": "node",
      "args": ["E:/projects/abap/abap-adt-api/mcp-abap-abap-adt-api/dist/index.js"]
    }
  }
}
```

#### 方法二：Cline 设置界面

1. 打开 Cline 设置（可通过命令面板）
2. 找到 "MCP Servers" 部分
3. 添加服务器配置：
   - Name: `mcp-abap-abap-adt-api`
   - Command: `node`
   - Arguments: 完整路径到 `dist/index.js`

### MCP Inspector

MCP Inspector 是一个交互式界面，用于测试和调试 MCP 服务器。

#### 启动 Inspector

```bash
npm run dev
```

这会自动打开浏览器，展示：
- 可用工具列表
- 工具输入表单
- 执行结果
- 工具日志

#### Inspector 使用

1. 在工具列表中选择一个工具
2. 填写参数
3. 点击 "Call Tool"
4. 查看结果和日志

## 验证安装

### 1. 验证依赖

```bash
npm list --depth=0
```

应该显示关键依赖已安装：
- `@modelcontextprotocol/sdk`
- `abap-adt-api`
- `dotenv`
- `typescript`

### 2. 验证构建

```bash
npm run build
```

检查 `dist/` 目录是否包含编译后的文件。

### 3. 验证运行

```bash
npm run start
```

应该看到：
```
MCP ABAP ADT API server running on stdio
```

### 4. 验证工具列表

使用 MCP Inspector 或客户端，调用：

```json
{
  "tool": "healthcheck"
}
```

应该返回：
```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

## 故障排除

### 问题 1: 找不到模块

**错误信息**:
```
Error: Cannot find module 'abap-adt-api'
```

**解决方案**:
```bash
npm install
```

### 问题 2: 编译错误

**错误信息**:
```
TS2307: Cannot find module 'xyz'
```

**解决方案**:
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

### 问题 3: 连接 SAP 失败

**错误信息**:
```
Login failed: Unable to connect to SAP system
```

**检查项**:
1. `SAP_URL` 是否正确
2. 网络是否可达
3. 防火墙是否阻止连接
4. SAP 系统是否支持 ADT

### 问题 4: 证书错误

**错误信息**:
```
Error: self signed certificate
```

**解决方案（仅开发环境）**:
```env
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**生产环境解决方案**:
- 将证书添加到系统信任存储
- 使用受信任的 CA 颁发的证书
- 配置正确的 SSL/TLS 设置

### 问题 5: 权限错误

**错误信息**:
```
Error: Insufficient privileges
```

**解决方案**:
1. 检查 SAP 用户权限
2. 确保用户具有必要的开发权限
3. 联系 SAP 管理员

### 问题 6: Claude Desktop 找不到服务器

**症状**: 配置文件正确但仍然无法使用

**检查项**:
1. Claude Desktop 是否重启
2. 配置文件路径是否正确
3. JSON 格式是否有效
4. 路径是否使用正确的分隔符

## 安全最佳实践

### 1. 环境变量安全

- ✅ 使用 `.env` 文件（已加入 `.gitignore`）
- ✅ 不要在代码中硬编码凭据
- ✅ 定期轮换密码
- ❌ 不要将 `.env` 提交到版本控制
- ❌ 不要在配置文件中存储明文密码

### 2. 访问控制

- ✅ 使用最小权限原则配置 SAP 用户
- ✅ 定期审计用户权限
- ✅ 记录所有访问日志

### 3. 网络安全

- ✅ 使用 HTTPS
- ✅ 配置防火墙规则
- ✅ 限制 IP 访问（如果需要）
- ✅ 使用 VPN 进行远程访问

## 更新和升级

### 检查更新

```bash
git pull origin main
```

### 更新依赖

```bash
npm update
```

### 重新构建

```bash
npm run build
```

## 卸载

### 完全卸载

```bash
# 停止服务器
Ctrl+C

# 删除文件
rm -rf node_modules package-lock.json dist

# 如果从源码安装的
cd ..
rm -rf mcp-abap-abap-adt-api
```
