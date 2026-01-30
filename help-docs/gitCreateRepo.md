# gitCreateRepo

创建新的 abapGit 仓库。

## 功能说明

此工具用于在 SAP ABAP 系统中创建新的 abapGit 仓库，将 ABAP 包与 Git 远程仓库关联。

## 调用方法

**参数**:
- `packageName` (string, 必需): 包名
- `repourl` (string, 必需): Git 仓库 URL
- `branch` (string, 可选): 分支名（默认：refs/heads/main）
- `transport` (string, 可选): 传输请求号
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

## 注意事项

1. **包必须存在**: 指定的包必须在系统中存在

2. **Git URL**: 必须是有效的 Git 仓库 URL

3. **分支格式**: 分支格式为 `refs/heads/branch_name`

4. **传输请求**: 创建仓库可能需要传输请求

5. **凭据要求**: 私有仓库需要提供 Git 用户名和密码

6. **唯一性**: 每个包只能关联一个 Git 仓库

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| packageName | string | 是 | 必须是有效的包名 |
| repourl | string | 是 | 必须是有效的 Git URL |
| branch | string | 否 | 默认 refs/heads/main |
| transport | string | 否 | 可选的传输号 |
| user | string | 否 | Git 用户名 |
| password | string | 否 | Git 密码 |

## 使用场景说明

### 场景 1: 创建标准仓库
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

### 场景 2: 创建带传输的仓库
```json
{
  "tool": "gitCreateRepo",
  "arguments": {
    "packageName": "Z_MY_PACKAGE",
    "repourl": "https://github.com/user/repo.git",
    "branch": "main",
    "transport": "TR123456"
  }
}
```

## 完整工作流程

```json
// Git 仓库创建和使用流程

// 1. 创建仓库
{
  "tool": "gitCreateRepo",
  "arguments": {
    "packageName": "Z_MY_PACKAGE",
    "repourl": "https://github.com/user/repo.git",
    "branch": "main"
  }
}

// 2. 编辑 ABAP 对象
// [使用标准对象操作工具编辑代码...]

// 3. 暂存变更
{
  "tool": "stageRepo",
  "arguments": {
    "repo": {...},
    "user": "git_user",
    "password": "git_pass"
  }
}

// 4. 推送到远程
{
  "tool": "pushRepo",
  "arguments": {
    "repo": {...},
    "staging": {...}
  }
}
```

