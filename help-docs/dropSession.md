# dropSession

清除本地会话缓存。

## 功能说明

此工具用于清除本地客户端的会话缓存，而不影响服务器端的会话状态。通常用于错误恢复或会话清理。

## 调用方法

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

## 注意事项

1. **仅本地清除**: 此操作只清除本地缓存，服务器端的会话仍然存在

2. **CSRF Token**: 清除缓存也会清除 CSRF token，下次操作需要重新获取

3. **不终止会话**: 与 `logout` 不同，此工具不会终止服务器端的会话

4. **重复调用安全**: 多次调用不会产生副作用

## 参数限制

- 无参数
- 不影响服务器状态

## 与其他工具的关联性

1. **与 login/logout 的关系**:
   ```
   dropSession + login → 创建新的本地会话
   logout → 终止服务器会话
   ```

2. **错误恢复流程**:
   ```
   dropSession → login → 重新开始工作
   ```

3. **并发场景**:
   - 使用 `statelessClone` 时，每个克隆实例可以有自己的会话状态

## 使用场景说明

### 场景 1: 错误恢复
当遇到会话相关错误时：
```json
// 步骤 1: 清除本地缓存
{"tool": "dropSession"}

// 步骤 2: 重新登录
{"tool": "login"}
```

### 场景 2: 切换环境
需要切换到不同的 SAP 系统或用户：
```json
// 步骤 1: 清除旧会话缓存
{"tool": "dropSession"}

// 步骤 2: 修改环境变量（SAP_URL, SAP_USER, SAP_PASSWORD）

// 步骤 3: 重新登录
{"tool": "login"}
```

### 场景 3: 内存清理
长时间运行后释放本地缓存：
```json
{"tool": "dropSession"}
{"tool": "login"}
```

### 场景 4: Token 过期处理
当 CSRF token 过期导致操作失败：
```json
{"tool": "dropSession"}
{"tool": "login"}
```

## 最佳实践

1. **遇到认证相关错误时，首先尝试 dropSession + login**
2. **在切换 SAP 系统或用户时使用 dropSession**
3. **定期清理长时间运行的会话缓存**
4. **dropSession 后必须重新 login 才能继续操作**

## 常见错误处理

| 错误 | 解决方案 |
|------|----------|
| 401 Unauthorized | dropSession → login |
| CSRF token 无效 | dropSession → login |
| 会话超时 | dropSession → login |
| 并发冲突 | dropSession → login |