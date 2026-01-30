# checkRepo - 检查Git仓库状态

## 功能说明

`checkRepo` 工具用于检查 Git 仓库的当前状态，包括同步状态、未提交更改、分支信息等。这对于了解仓库的整体健康状况和需要采取的操作非常有用。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("checkRepo", {
  repo: "ABC123",
  user: "username",
  password: "password"
});
```

## 参数说明

- **repo** (string, 必需): Git 仓库的 ID 或 URL
  - 仓库 ID 从 `gitRepos` 获取
  - 也可以是仓库的 URL

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要

## 返回结果

返回 JSON 格式的仓库状态：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "status": "clean",
    "branch": "main",
    "lastSync": "2024-01-30T10:00:00Z",
    "localChanges": [
      {
        "path": "zcl_my_class.abap",
        "status": "modified",
        "staged": true
      }
    ],
    "remoteChanges": {
      "ahead": 2,
      "behind": 0
    },
    "conflicts": [],
    "stagedFiles": 1,
    "unstagedFiles": 0
  }
}
```

## 注意事项

1. 检查不会修改仓库状态
2. 返回的信息反映检查时刻的状态
3. 远程更改需要网络连接
4. 冲突信息需要特别关注

## 参数限制

- `repo` 必须是有效的仓库 ID 或 URL
- 仓库必须存在于系统中
- 如果仓库未存储凭证，必须提供用户名和密码

## 与其他工具的关联性

- 使用 `gitRepos` 获取仓库 ID
- 检查后使用 `gitPullRepo` 拉取远程更改
- 检查后使用 `pushRepo` 推送本地更改
- 使用 `stageRepo` 暂存本地更改
- 使用 `switchRepoBranch` 切换分支

## 使用场景说明

1. **状态检查**: 检查仓库是否需要同步
2. **冲突检测**: 检测是否有未解决的冲突
3. **更改审查**: 查看本地和远程的更改
4. **同步验证**: 验证同步操作的结果

## 最佳实践

1. 在推送或拉取前检查仓库状态
2. 定期检查以保持仓库健康
3. 关注冲突和未同步的更改
4. 根据检查结果采取相应操作

## 错误处理

可能的错误：
- **仓库不存在**: 指定的仓库 ID 或 URL 无效
- **认证失败**: 凭证无效或权限不足
- **网络错误**: 无法连接到远程仓库
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 检查并报告仓库健康状态
async function checkRepoHealth(repoId, credentials) {
  const result = await mcp.callTool("checkRepo", {
    repo: repoId,
    ...credentials
  });
  
  const health = {
    clean: result.result.status === 'clean',
    synced: result.result.remoteChanges.ahead === 0 && 
            result.result.remoteChanges.behind === 0,
    hasChanges: result.result.localChanges.length > 0,
    hasConflicts: result.result.conflicts.length > 0
  };
  
  console.log(`\n仓库健康检查:`);
  console.log(`  状态: ${result.result.status}`);
  console.log(`  已同步: ${health.synced ? '是' : '否'}`);
  console.log(`  本地更改: ${health.hasChanges ? '是' : '否'}`);
  console.log(`  冲突: ${health.hasConflicts ? '有' : '无'}`);
  
  return { result, health };
}

// 检查并自动同步
async function checkAndSync(repoId, credentials) {
  const { result, health } = await checkRepoHealth(repoId, credentials);
  
  // 如果有冲突，先解决
  if (health.hasConflicts) {
    console.log('\n⚠️  存在冲突，需要手动解决');
    return result;
  }
  
  // 如果有远程更改，拉取
  if (result.result.remoteChanges.behind > 0) {
    console.log(`\n发现 ${result.result.remoteChanges.behind} 个远程提交，正在拉取...`);
    await mcp.callTool("gitPullRepo", {
      repoId,
      ...credentials
    });
  }
  
  // 如果有本地更改，暂存和推送
  if (health.hasChanges && result.result.remoteChanges.ahead >= 0) {
    console.log('\n发现本地更改，正在推送...');
    const staged = await mcp.callTool("stageRepo", {
      repo: repoId,
      ...credentials
    });
    
    await mcp.callTool("pushRepo", {
      repo: repoId,
      staging: {
        message: "Auto-sync from ABAP",
        files: staged.result.stagedFiles
      },
      ...credentials
    });
  }
  
  console.log('\n同步完成');
}

// 批量检查多个仓库
async function checkMultipleRepos(repoIds, credentials) {
  const results = [];
  
  for (const repoId of repoIds) {
    try {
      const { result, health } = await checkRepoHealth(repoId, credentials);
      results.push({
        repoId,
        status: result.result.status,
        health,
        lastSync: result.result.lastSync
      });
    } catch (error) {
      results.push({
        repoId,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}
```

## 示例

```typescript
// 检查 Git 仓库状态
const repoId = "ABC123";

console.log(`检查仓库状态: ${repoId}`);
const result = await mcp.callTool("checkRepo", {
  repo: repoId,
  user: "username",
  password: "token"
});

// 显示基本信息
console.log(`\n仓库状态:`);
console.log(`  仓库 ID: ${result.result.repoId}`);
console.log(`  状态: ${result.result.status}`);
console.log(`  当前分支: ${result.result.branch}`);
console.log(`  最后同步: ${result.result.lastSync}`);

// 显示同步状态
const remote = result.result.remoteChanges;
console.log(`\n远程同步:`);
if (remote.ahead > 0) {
  console.log(`  ⚠️  本地领先 ${remote.ahead} 个提交（需要推送）`);
}
if (remote.behind > 0) {
  console.log(`  ⚠️  本地落后 ${remote.behind} 个提交（需要拉取）`);
}
if (remote.ahead === 0 && remote.behind === 0) {
  console.log(`  ✓ 已与远程同步`);
}

// 显示本地更改
if (result.result.localChanges.length > 0) {
  console.log(`\n本地更改 (${result.result.localChanges.length} 个):`);
  result.result.localChanges.forEach((change, index) => {
    const staged = change.staged ? '✓ 已暂存' : '○ 未暂存';
    console.log(`  ${index + 1}. ${change.path} - ${change.status} (${staged})`);
  });
  console.log(`  暂存: ${result.result.stagedFiles} 个`);
  console.log(`  未暂存: ${result.result.unstagedFiles} 个`);
} else {
  console.log(`\n本地更改: 无`);
}

// 显示冲突
if (result.result.conflicts.length > 0) {
  console.log(`\n⚠️  发现 ${result.result.conflicts.length} 个冲突:`);
  result.result.conflicts.forEach((conflict, index) => {
    console.log(`  ${index + 1}. ${conflict.path}`);
    console.log(`     ${conflict.description}`);
  });
  console.log('\n需要手动解决冲突后再继续');
} else {
  console.log(`\n冲突: 无`);
}

// 提供建议操作
console.log(`\n建议操作:`);
if (remote.behind > 0 && result.result.conflicts.length === 0) {
  console.log('  - 执行 gitPullRepo 拉取远程更改');
}
if (result.result.localChanges.length > 0 && remote.ahead >= 0) {
  console.log('  - 执行 stageRepo 暂存更改');
  console.log('  - 执行 pushRepo 推送更改');
}
if (result.result.conflicts.length > 0) {
  console.log('  - 手动解决冲突');
}
```
