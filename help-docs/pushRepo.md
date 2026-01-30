# pushRepo - 推送更改到Git仓库

## 功能说明

`pushRepo` 工具用于将 ABAP 系统中的更改推送到远程 Git 仓库。这会将暂存的更改提交到 Git 并推送到远程仓库。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("pushRepo", {
  repo: {
    id: "ABC123",
    packageName: "Z_MY_PACKAGE"
  },
  staging: {
    message: "Update ABAP objects",
    files: [...]
  },
  user: "username",
  password: "password"
});
```

## 参数说明

- **repo** (object, 必需): Git 仓库对象
  - **id** (string): 仓库 ID
  - **packageName** (string): 包名称
  - 其他仓库相关属性

- **staging** (object, 必需): 暂存信息对象
  - **message** (string): 提交消息
  - **files** (array): 要推送的文件列表
  - 每个文件应包含路径和状态

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要

## 返回结果

返回 JSON 格式的推送结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "pushedAt": "2024-01-30T10:30:00Z",
    "commit": {
      "sha": "abc123def456",
      "message": "Update ABAP objects",
      "author": "developer",
      "date": "2024-01-30T10:30:00Z"
    },
    "stats": {
      "filesPushed": 5,
      "additions": 120,
      "deletions": 45
    },
    "branch": "main",
    "remoteUrl": "https://github.com/company/repo.git"
  }
}
```

## 注意事项

1. 推送前建议先使用 `stageRepo` 暂存更改
2. 推送将创建新的 Git 提交
3. 提交消息应清晰描述更改
4. 推送到受保护的分支可能需要权限
5. 如果存在冲突，推送可能失败

## 参数限制

- `repo` 必须是有效的仓库对象
- `staging` 必须包含有效的提交消息和文件列表
- 仓库必须处于链接状态
- 如果仓库未存储凭证，必须提供用户名和密码

## 与其他工具的关联性

- 使用 `stageRepo` 暂存更改
- 使用 `gitRepos` 获取仓库信息
- 推送后可以使用 `checkRepo` 查看状态
- 使用 `gitPullRepo` 拉取其他开发者的更改

## 使用场景说明

1. **代码提交**: 提交本地更改到远程仓库
2. **协作开发**: 与团队共享代码更改
3. **持续集成**: 在 CI/CD 流程中推送代码
4. **版本发布**: 推送发布版本到仓库

## 最佳实践

1. 在推送前暂存所有相关更改
2. 使用清晰的提交消息
3. 推送前拉取最新更改
4. 定期推送以避免大量未提交更改
5. 检查推送结果和统计信息

## 错误处理

可能的错误：
- **仓库无效**: 提供的仓库对象无效
- **未暂存**: 没有待推送的更改
- **冲突**: 存在合并冲突
- **认证失败**: 凭证无效或权限不足
- **分支保护**: 无法推送到受保护的分支
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 完整的推送流程
async function pushWorkflow(repo, message, credentials) {
  // 1. 暂存更改
  console.log('1. 暂存更改...');
  const stageResult = await mcp.callTool("stageRepo", {
    repo,
    ...credentials
  });
  
  if (stageResult.result.stagedFiles.length === 0) {
    console.log('没有更改需要推送');
    return null;
  }
  
  // 2. 准备推送
  const staging = {
    message,
    files: stageResult.result.stagedFiles
  };
  
  // 3. 推送
  console.log(`2. 推送 ${staging.files.length} 个文件...`);
  const pushResult = await mcp.callTool("pushRepo", {
    repo,
    staging,
    ...credentials
  });
  
  return pushResult;
}

// 批量推送到多个仓库
async function pushMultiple(repos, message, credentials) {
  const results = [];
  
  for (const repo of repos) {
    try {
      const result = await pushWorkflow(repo, message, credentials);
      if (result) {
        results.push({
          repoId: repo.id,
          success: true,
          commit: result.result.commit.sha
        });
      }
    } catch (error) {
      results.push({
        repoId: repo.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// 带冲突检查的推送
async function pushWithConflictCheck(repo, message, credentials) {
  // 先拉取
  console.log('检查远程更改...');
  const pullResult = await mcp.callTool("gitPullRepo", {
    repoId: repo.id,
    ...credentials
  });
  
  // 检查冲突
  if (pullResult.result.conflicts.length > 0) {
    throw new Error('存在冲突，请先解决');
  }
  
  // 推送
  return await pushWorkflow(repo, message, credentials);
}
```

## 示例

```typescript
// 推送更改到 Git 仓库
const repo = {
  id: "ABC123",
  packageName: "Z_MY_PACKAGE"
};

// 先暂存更改
console.log('1. 暂存更改...');
const stageResult = await mcp.callTool("stageRepo", {
  repo,
  user: "username",
  password: "token"
});

if (stageResult.result.stagedFiles.length === 0) {
  console.log('没有更改需要推送');
} else {
  console.log(`暂存了 ${stageResult.result.stagedFiles.length} 个文件`);
  
  // 推送更改
  console.log('\n2. 推送更改...');
  const pushResult = await mcp.callTool("pushRepo", {
    repo,
    staging: {
      message: "Update ABAP classes and programs",
      files: stageResult.result.stagedFiles
    },
    user: "username",
    password: "token"
  });
  
  // 显示推送结果
  console.log('\n推送完成！');
  console.log(`推送时间: ${pushResult.result.pushedAt}`);
  console.log(`分支: ${pushResult.result.branch}`);
  console.log(`远程 URL: ${pushResult.result.remoteUrl}`);
  
  // 显示提交信息
  const commit = pushResult.result.commit;
  console.log(`\n提交信息:`);
  console.log(`  SHA: ${commit.sha}`);
  console.log(`  消息: ${commit.message}`);
  console.log(`  作者: ${commit.author}`);
  console.log(`  日期: ${commit.date}`);
  
  // 显示统计信息
  const stats = pushResult.result.stats;
  console.log(`\n统计:`);
  console.log(`  推送文件: ${stats.filesPushed}`);
  console.log(`  新增行数: ${stats.additions}`);
  console.log(`  删除行数: ${stats.deletions}`);
  
  // 在 GitHub/GitLab 中查看
  console.log(`\n在以下位置查看更改:`);
  console.log(`${pushResult.result.remoteUrl}/commit/${commit.sha}`);
}
```
