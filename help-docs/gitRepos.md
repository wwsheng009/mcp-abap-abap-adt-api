# gitRepos

列出所有 abapGit 仓库。

## 功能说明

此工具用于获取 SAP ABAP 系统中所有已配置的 abapGit 仓库列表。abapGit 是 ABAP 的 Git 版本控制工具，允许将 ABAP 对象与 Git 仓库同步。

## 调用方法

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
      "branch": "main",
      "packageName": "Z_MY_PACKAGE",
      "status": "ok",
      "isRemote": true,
      "branch": "refs/heads/main"
    }
  ]
}
```

**示例**:
```json
{
  "tool": "gitRepos",
  "arguments": {}
}
```

## 注意事项

1. **仓库列表**: 返回当前用户有权限访问的所有 abapGit 仓库

2. **仓库状态**: 包含仓库的当前状态信息

3. **分支信息**: 显示仓库当前所在的分支

4. **权限要求**: 用户必须对包有读取权限才能看到对应的仓库

5. **远程仓库**: 显示 Git 远程仓库的 URL

6. **同步状态**: 可能包含仓库与远程的同步状态

## 参数限制

- 无参数

## 与其他工具的关联性

1. **仓库管理流程**:
   ```
   gitRepos → gitCreateRepo（创建新仓库）
   gitRepos → gitPullRepo（拉取更新）
   gitRepos → stageRepo → pushRepo（提交和推送）
   ```

2. **版本控制**:
   ```
   gitRepos → 选择仓库 → gitPullRepo → pullRepo（拉取）
   ```

3. **与对象操作的关系**:
   - 仓库中的对象可以通过标准对象操作工具访问
   - 修改对象后需要使用 git 相关工具提交

## 使用场景说明

### 场景 1: 查看所有仓库
```json
{
  "tool": "gitRepos",
  "arguments": {}
}
// 返回系统中所有 abapGit 仓库
```

### 场景 2: 查找特定包的仓库
```json
{
  "tool": "gitRepos",
  "arguments": {}
}
// 在返回的列表中查找特定包
```

### 场景 3: 仓库状态检查
```json
{
  "tool": "gitRepos",
  "arguments": {}
}
// 检查每个仓库的状态
// 确定哪些仓库需要同步
```

### 场景 4: 同步前准备
```json
// 步骤 1: 查看所有仓库
{"tool": "gitRepos", "arguments": {}}

// 步骤 2: 对需要同步的仓库进行拉取
{"tool": "gitPullRepo", "arguments": {"repoId": "repo1"}}
```

## 仓库信息结构

```json
{
  "key": "唯一仓库标识符",
  "name": "包名称",
  "packageName": "包名称",
  "url": "Git 远程仓库 URL",
  "branch": "当前分支",
  "isRemote": "是否为远程仓库",
  "status": "仓库状态（ok, error, etc.）",
  "headSha": "最新提交的 SHA",
  "localSha": "本地提交的 SHA",
  "dirty": "是否有未提交的更改"
}
```

## 仓库状态

| 状态 | 说明 | 操作 |
|------|------|------|
| ok | 仓库正常，与远程同步 | 可以继续操作 |
| error | 仓库有错误 | 需要检查和修复 |
| dirty | 有未提交的更改 | 需要 stageRepo 和 pushRepo |
| behind | 本地落后于远程 | 需要 gitPullRepo |
| ahead | 本地领先于远程 | 需要 pushRepo |

## 最佳实践

1. **定期检查**: 定期检查仓库状态，确保同步

2. **同步策略**: 建立定期的同步策略（如每日或每周）

3. **分支管理**: 管理好分支，避免在主分支上直接开发

4. **冲突处理**: 及时处理冲突，避免积累

5. **权限管理**: 确保适当的仓库访问权限

## 完整工作流程

```json
// Git 工作流程

// 1. 查看所有仓库
{"tool": "gitRepos", "arguments": {}}
// 返回: 仓库列表

// 2. 选择需要操作的仓库
const repo = repos[0] // 选择第一个仓库

// 3. 拉取远程更改
{
  "tool": "gitPullRepo",
  "arguments": {
    "repoId": repo.key,
    "user": "git_username",
    "password": "git_password"
  }
}

// 4. 修改 ABAP 对象
// [使用标准对象操作工具修改代码...]

// 5. 暂存更改
{
  "tool": "stageRepo",
  "arguments": {
    "repo": repo,
    "user": "git_username",
    "password": "git_password"
  }
}

// 6. 推送到远程
{
  "tool": "pushRepo",
  "arguments": {
    "repo": repo,
    "staging": {...},
    "user": "git_username",
    "password": "git_password"
  }
}
```

## 分支操作

### 查看分支
仓库信息中包含当前分支：
```json
{
  "branch": "refs/heads/main",
  "localBranches": ["main", "develop", "feature/test"],
  "remoteBranches": ["main", "develop"]
}
```

### 切换分支
```json
{
  "tool": "switchRepoBranch",
  "arguments": {
    "repo": repo,
    "branch": "refs/heads/develop",
    "create": false
  }
}
```

### 创建新分支
```json
{
  "tool": "switchRepoBranch",
  "arguments": {
    "repo": repo,
    "branch": "refs/heads/feature/new-feature",
    "create": true
  }
}
```

## 常见问题

### Q1: 为什么仓库显示 dirty 状态？
**A**: 有未提交的更改。需要使用 `stageRepo` 和 `pushRepo` 提交更改。

### Q2: 如何同步多个仓库？
**A**: 对每个仓库执行 `gitPullRepo`，或使用批处理。

### Q3: 仓库连接失败怎么办？
**A**: 检查 Git 凭据、网络连接和仓库 URL 是否正确。

### Q4: 如何删除仓库？
**A**: 使用 `gitUnlinkRepo` 取消仓库链接。

## 安全考虑

1. **凭据管理**: 安全地存储和管理 Git 用户名和密码

2. **访问控制**: 确保只有授权用户可以访问仓库

3. **敏感数据**: 避免在仓库中存储敏感信息

4. **审计日志**: 记录仓库操作以便审计

## 性能优化

1. **批量操作**: 对多个仓库进行批量操作时，考虑并发处理

2. **增量同步**: 对于大型仓库，只同步更改的部分

3. **缓存**: 缓存仓库信息以提高性能

4. **网络优化**: 在高延迟网络中，减少不必要的操作

