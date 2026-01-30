# transportAddUser

向传输请求添加用户。

## 功能说明

此工具用于将用户添加到传输请求,使其可以访问和编辑传输。

## 调用方法

**参数**:
- `transportNumber` (string, 必需): 传输请求号
- `user` (string, 必需): 要添加的用户

**返回值**:
```json
{
  "status": "success",
  "added": true,
  "transport": "DEVK900001",
  "user": "USER2",
  "message": "User added to transport successfully"
}
```

**示例**:
```json
{
  "tool": "transportAddUser",
  "arguments": {
    "transportNumber": "DEVK900001",
    "user": "USER2"
  }
}
```

## 注意事项

1. **协作**: 用于多人协作开发

2. **权限**: 被添加的用户需要相应的权限

3. **未释放传输**: 只能添加到未释放的传输

4. **用户验证**: 要添加的用户必须存在

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| transportNumber | string | 是 | 有效的传输请求号 |
| user | string | 是 | 存在的用户名 |

## 与其他工具的关联性

1. **与 transportSetOwner 的关系**:
   ```
   transportSetOwner (更改所有者) vs transportAddUser (添加协作者)
   ```

2. **与 systemUsers 的关系**:
   ```
   systemUsers (获取用户列表) → transportAddUser (添加用户)
   ```

## 使用场景说明

### 场景 1: 添加协作者
```json
{
  "tool": "transportAddUser",
  "arguments": {
    "transportNumber": "DEVK900001",
    "user": "USER2"
  }
}
```

### 场景 2: 团队协作
```json
// 团队成员协作一个传输
{
  "tool": "transportAddUser",
  "arguments": {
    "transportNumber": "DEVK900001",
    "user": "TEAM_MEMBER_1"
  }
}
{
  "tool": "transportAddUser",
  "arguments": {
    "transportNumber": "DEVK900001",
    "user": "TEAM_MEMBER_2"
  }
}
```

## 最佳实践

1. **沟通**: 添加用户前与用户沟通

2. **权限**: 确保用户有适当的权限

3. **团队管理**: 管理传输的协作者列表

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 用户不存在 | 要添加的用户不存在 | 检查用户名 |
| 用户已存在 | 用户已在传输中 | 不要重复添加 |
| 权限不足 | 没有添加用户的权限 | 联系管理员 |
| 传输已释放 | 传输已释放 | 不能添加到已释放传输 |

## 高级用法

### 批量添加用户
```json
// 批量添加团队成员
for each user in teamMembers:
  {
    "tool": "transportAddUser",
    "arguments": {
      "transportNumber": "DEVK900001",
      "user": user
    }
  }
```

### 协作管理
```json
// 管理团队协作
// 定期检查传输的用户
// 添加或移除用户
```
