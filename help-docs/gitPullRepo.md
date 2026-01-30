# gitPullRepo

从远程仓库拉取变更。

## 功能说明

此工具用于从 Git 远程仓库拉取变更到 SAP ABAP 系统，更新本地仓库对象。

## 调用方法

**参数**:
- `repoId` (string, 必需): 仓库 ID（从 gitRepos 获取）
- `branch` (string, 可选): 分支名（默认：refs/heads/main）
- `transport` (string, 可选): 传输请求号
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Pull completed successfully"
}
```

## 注意事项

1. **仓库 ID**: 使用 `gitRepos` 返回的仓库 key 作为 repoId

2. **冲突处理**: 如果有冲突，需要手动解决

3. **传输请求**: 拉取的变更可能需要传输请求

4. **凭据要求**: 私有仓库需要提供凭据

5. **对象激活**: 拉取的对象可能需要激活

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| repoId | string | 是 | 有效的仓库 ID |
| branch | string | 否 | 默认 refs/heads/main |
| transport | string | 否 | 可选的传输号 |
| user | string | 否 | Git 用户名 |
| password | string | 否 | Git 密码 |

## 使用场景说明

### 场景 1: 拉取最新代码
```json
{
  "tool": "gitPullRepo",
  "arguments": {
    "repoId": "repo1",
    "branch": "main"
  }
}
```

### 场景 2: 拉取特定分支
```json
{
  "tool": "gitPullRepo",
  "arguments": {
    "repoId": "repo1",
    "branch": "refs/heads/develop"
  }
}
```

