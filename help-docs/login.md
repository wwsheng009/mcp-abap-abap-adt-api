# login

登录到 SAP ABAP 系统。

## 功能说明

此工具用于建立与 SAP ABAP 系统的认证会话。在执行任何其他 MCP ABAP 工具之前，必须先调用此工具进行登录。

## 调用方法

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

## 注意事项

1. **先决条件**: 登录前必须在环境变量中配置正确的 SAP 凭据：
   - `SAP_URL`: SAP 系统的 URL (如 `http://vhcalnplci.local:8000`)
   - `SAP_USER`: SAP 用户名
   - `SAP_PASSWORD`: SAP 密码

2. **会话管理**: 
   - 登录后会创建一个有状态或无状态的会话
   - 会话状态由 `client.stateful` 属性控制
   - 有状态会话适合连续操作，无状态会话适合高并发

3. **并发限制**: 
   - 每个用户同时只能有一个活动会话
   - 如果之前的会话未正确关闭，可能导致登录失败

4. **认证方式**: 支持基本认证和 Bearer Token 认证

## 参数限制

- 无参数
- 依赖环境变量配置
- 无法在运行时动态更改凭据

## 与其他工具的关联性

1. **必需的前置操作**:
   - 几乎所有其他工具都依赖 `login` 建立的会话
   - 如果未登录，其他工具调用将返回认证错误

2. **会话清理**:
   - 使用 `logout` 工具可以主动终止会话
   - 使用 `dropSession` 工具可以清除本地会话缓存

3. **工具依赖链**:
   ```
   login → searchObject → objectStructure → getObjectSource
   login → transportInfo → lock → setObjectSource
   ```

## 使用场景说明

### 场景 1: 初次连接
```json
// 步骤 1: 登录系统
{"tool": "login"}

// 步骤 2: 搜索对象
{"tool": "searchObject", "arguments": {"query": "ZCL_*", "objType": "CLAS"}}
```

### 场景 2: 会话恢复
如果之前的会话超时或断开：
```json
// 清除缓存后重新登录
{"tool": "dropSession"}
{"tool": "login"}
```

### 场景 3: 批量操作前准备
在进行大批量对象操作前，建议重新登录以确保会话稳定性：
```json
{"tool": "login"}
// 执行批量操作...
```

## 错误处理

常见错误及解决方法：

1. **认证失败**
   - 原因: 用户名或密码错误
   - 解决: 检查环境变量 `SAP_USER` 和 `SAP_PASSWORD`

2. **连接超时**
   - 原因: SAP 系统不可访问或网络问题
   - 解决: 检查 `SAP_URL` 配置和网络连接

3. **会话冲突**
   - 原因: 已有活动会话
   - 解决: 先调用 `dropSession` 清除缓存

## 最佳实践

1. **在开始任何工作流程时首先调用 login**
2. **长时间运行的批量操作前重新登录**
3. **工作结束后调用 logout 释放资源**
4. **遇到认证问题时使用 dropSession 后重试**

