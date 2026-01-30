# logout

从 SAP ABAP 系统登出。

## 功能说明

此工具用于终止与 SAP ABAP 系统的当前会话。登出后，无法再使用同一客户端实例进行任何操作。

## 调用方法

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

## 注意事项

1. **终止操作**: 登出后客户端实例将被标记为无效，无法再调用任何工具

2. **资源释放**: 建议在完成所有工作后主动调用 logout，以释放服务器端资源

3. **锁定清理**: 登出不会自动释放对象锁定，应在登出前确保所有对象已解锁

4. **传输请求**: 未释放的传输请求在登出后仍然存在

## 参数限制

- 无参数
- 不可逆操作，一旦登出无法重新登录同一客户端

## 与其他工具的关联性

1. **与 lock/unLock 的关系**:
   - 如果对象仍处于锁定状态，登出不会自动解锁
   - 建议在登出前检查并释放所有锁定

2. **与 dropSession 的区别**:
   - `logout`: 终止服务器端的会话
   - `dropSession`: 仅清除本地缓存，服务器会话可能仍然存在

3. **与 activateObjects 的关系**:
   - 建议在登出前激活所有未激活的对象

## 使用场景说明

### 场景 1: 正常工作流程结束
```json
// 步骤 1: 激活所有未激活对象
{"tool": "activateObjects", "arguments": {"objects": [...]}}

// 步骤 2: 解锁所有锁定对象
{"tool": "unLock", "arguments": {"objectUrl": "...", "lockHandle": "..."}}

// 步骤 3: 登出
{"tool": "logout"}
```

### 场景 2: 错误恢复
如果遇到不可恢复的错误：
```json
{"tool": "logout"}
{"tool": "dropSession"}
{"tool": "login"}
```

### 场景 3: 切换用户
需要切换到不同的 SAP 用户时：
```json
// 步骤 1: 登出当前用户
{"tool": "logout"}

// 步骤 2: 修改环境变量（SAP_USER, SAP_PASSWORD）

// 步骤 3: 清除缓存
{"tool": "dropSession"}

// 步骤 4: 重新登录
{"tool": "login"}
```

## 最佳实践

1. **工作流程结束时总是调用 logout**
2. **登出前检查对象锁定状态**
3. **登出前激活所有未激活对象**
4. **登出后如需继续工作，必须调用 dropSession 和 login**

