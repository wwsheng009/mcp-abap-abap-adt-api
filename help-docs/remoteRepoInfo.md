# remoteRepoInfo - 获取远程Git仓库信息

## 功能说明

`remoteRepoInfo` 工具用于获取已链接 Git 仓库的远程仓库详细信息。这与 `gitExternalRepoInfo` 不同，它是针对已链接到 ABAP 系统的仓库。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("remoteRepoInfo", {
  repo: "ABC123",
  user: "username",
  password: "password"
});
```

## 参数说明

- **repo** (string, 必需): Git 仓库的 ID
  - 从 `gitRepos` 获取
  - 唯一标识系统中的仓库

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要

## 返回结果

返回 JSON 格式的远程仓库信息：

```json
{
  "status": "success",
  "repoInfo": {
    "repoId": "ABC123",
    "url": "https://github.com/company/repo.git",
    "type": "https",
    "accessible": true,
    "branch": "main",
    "branches": [
      {
        "name": "main",
        "default": true,
        "lastCommit": "abc123",
        "lastCommitDate": "2024-01-30T10:00:00Z"
      },
      {
        "name": "develop",
        "default": false,
        "lastCommit": "def456",
        "lastCommitDate": "2024-01-29T15:30:00Z"
      }
    ],
    "metadata": {
      "name": "repo",
      "owner": "company",
      "description": "ABAP package repository",
      "language": "ABAP",
      "isPrivate": true,
      "stars": 10,
      "forks": 5
    },
    "syncStatus": {
      "lastSync": "2024-01-30T09:00:00Z",
      "behind": 2,
      "ahead": 0
    }
  }
}
```

## 注意事项

1. 只能获取已链接仓库的信息
2. 需要有效的凭证才能访问私有仓库
3. 返回的信息可能因 Git 托管服务而异
4. 某些元数据可能不可用

## 参数限制

- `repo` 必须是系统中存在的有效仓库 ID
- 仓库必须处于链接状态
- 如果仓库未存储凭证，必须提供用户名和密码

## 与其他工具的关联性

- 使用 `gitRepos` 获取仓库 ID
- 使用 `gitExternalRepoInfo` 验证未链接的仓库
- 使用 `switchRepoBranch` 切换到显示的分支
- 使用 `gitPullRepo` 拉取远程更改

## 使用场景说明

1. **信息查询**: 查询远程仓库的详细信息
2. **分支管理**: 查看和管理远程分支
3. **同步检查**: 检查同步状态和落后情况
4. **元数据获取**: 获取仓库的描述和统计信息

## 最佳实践

1. 定期检查同步状态
2. 查看分支信息以选择合适的工作分支
3. 关注仓库元数据以了解项目状态
4. 使用信息做出同步和分支切换决策

## 错误处理

可能的错误：
- **仓库不存在**: 指定的仓库 ID 无效
- **未链接**: 仓库未链接或已取消链接
- **认证失败**: 凭证无效或权限不足
- **网络错误**: 无法连接到远程仓库
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 比较本地和远程状态
async function compareRepoStatus(repoId, credentials) {
  const remoteInfo = await mcp.callTool("remoteRepoInfo", {
    repo: repoId,
    ...credentials
  });
  
  const localCheck = await mcp.callTool("checkRepo", {
    repo: repoId,
    ...credentials
  });
  
  return {
    remote: remoteInfo.repoInfo,
    local: localCheck.result,
    needsPull: localCheck.result.remoteChanges.behind > 0,
    needsPush: localCheck.result.remoteChanges.ahead > 0
  };
}

// 获取活跃分支列表
async function getActiveBranches(repoId, credentials, daysThreshold = 30) {
  const result = await mcp.callTool("remoteRepoInfo", {
    repo: repoId,
    ...credentials
  });
  
  const threshold = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  
  const activeBranches = result.repoInfo.branches.filter(
    b => new Date(b.lastCommitDate) > threshold
  );
  
  return activeBranches;
}

// 生成仓库状态报告
async function generateRepoReport(repoId, credentials) {
  const info = await mcp.callTool("remoteRepoInfo", {
    repo: repoId,
    ...credentials
  });
  
  const remote = info.repoInfo;
  
  return {
    repository: {
      name: `${remote.metadata.owner}/${remote.metadata.name}`,
      url: remote.url,
      private: remote.metadata.isPrivate,
      description: remote.metadata.description
    },
    branch: {
      current: remote.branch,
      total: remote.branches.length,
      activeBranches: remote.branches.filter(b => b.default || 
        new Date(b.lastCommitDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    },
    sync: {
      lastSync: remote.syncStatus.lastSync,
      behind: remote.syncStatus.behind,
      ahead: remote.syncStatus.ahead,
      status: remote.syncStatus.behind === 0 && 
               remote.syncStatus.ahead === 0 ? 'synced' : 'out of sync'
    },
    statistics: {
      stars: remote.metadata.stars,
      forks: remote.metadata.forks,
      language: remote.metadata.language
    }
  };
}
```

## 示例

```typescript
// 获取远程仓库信息
const repoId = "ABC123";

console.log(`获取远程仓库信息: ${repoId}`);
const result = await mcp.callTool("remoteRepoInfo", {
  repo: repoId,
  user: "username",
  password: "token"
});

// 显示仓库基本信息
const info = result.repoInfo;
console.log(`\n仓库信息:`);
console.log(`  仓库 ID: ${info.repoId}`);
console.log(`  URL: ${info.url}`);
console.log(`  类型: ${info.type}`);
console.log(`  可访问: ${info.accessible ? '是' : '否'}`);
console.log(`  当前分支: ${info.branch}`);

// 显示仓库元数据
const meta = info.metadata;
console.log(`\n元数据:`);
console.log(`  名称: ${meta.name}`);
console.log(`  所有者: ${meta.owner}`);
console.log(`  描述: ${meta.description || '无'}`);
console.log(`  语言: ${meta.language}`);
console.log(`  私有: ${meta.isPrivate ? '是' : '否'}`);
if (meta.stars !== undefined) {
  console.log(`  Stars: ${meta.stars}`);
}
if (meta.forks !== undefined) {
  console.log(`  Forks: ${meta.forks}`);
}

// 显示分支列表
console.log(`\n分支列表:`);
info.branches.forEach((branch, index) => {
  const defaultMarker = branch.default ? ' (默认)' : '';
  const lastCommit = new Date(branch.lastCommitDate);
  const daysAgo = Math.floor((Date.now() - lastCommit.getTime()) / (24 * 60 * 60 * 1000));
  
  console.log(`  ${index + 1}. ${branch.name}${defaultMarker}`);
  console.log(`     最后提交: ${daysAgo === 0 ? '今天' : `${daysAgo} 天前`}`);
  console.log(`     SHA: ${branch.lastCommit.substring(0, 7)}`);
});

// 显示同步状态
const sync = info.syncStatus;
console.log(`\n同步状态:`);
console.log(`  最后同步: ${sync.lastSync}`);

if (sync.behind > 0) {
  console.log(`  ⚠️  落后 ${sync.behind} 个提交（建议拉取）`);
} else {
  console.log(`  ✓ 未落后远程`);
}

if (sync.ahead > 0) {
  console.log(`  ⚠️  领先 ${sync.ahead} 个提交（建议推送）`);
} else {
  console.log(`  ✓ 无未推送的提交`);
}

// 提供操作建议
console.log(`\n建议操作:`);
if (sync.behind > 0) {
  console.log('  1. 执行 gitPullRepo 拉取远程更改');
}
if (sync.ahead > 0) {
  console.log('  2. 执行 stageRepo 暂存本地更改');
  console.log('  3. 执行 pushRepo 推送更改');
}
if (sync.behind === 0 && sync.ahead === 0) {
  console.log('  ✓ 仓库状态良好，无需立即操作');
}

// 查看其他可用分支
const otherBranches = info.branches.filter(b => !b.default);
if (otherBranches.length > 0) {
  console.log(`\n可用分支切换:`);
  otherBranches.forEach(branch => {
    console.log(`  - ${branch.name}`);
  });
}
```
