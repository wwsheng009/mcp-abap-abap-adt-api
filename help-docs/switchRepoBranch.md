# switchRepoBranch - 切换Git仓库分支

## 功能说明

`switchRepoBranch` 工具用于将 Git 集成切换到不同的分支。这对于在不同开发线之间切换、创建新分支或合并功能非常重要。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("switchRepoBranch", {
  repo: "ABC123",
  branch: "develop",
  create: false,
  user: "username",
  password: "password"
});
```

## 参数说明

- **repo** (string, 必需): Git 仓库的 ID
  - 从 `gitRepos` 获取
  - 唯一标识系统中的仓库

- **branch** (string, 必需): 要切换到的分支名称
  - 必须是有效的分支名称
  - 如果分支不存在，取决于 `create` 参数

- **create** (boolean, 可选): 如果分支不存在是否创建
  - `true`: 如果分支不存在则创建
  - `false`: 如果分支不存在则报错（默认）
  - 基于当前分支创建新分支

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要

## 返回结果

返回 JSON 格式的切换结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "previousBranch": "main",
    "currentBranch": "develop",
    "switchedAt": "2024-01-30T10:30:00Z",
    "created": false,
    "changesApplied": {
      "filesUpdated": 5,
      "conflicts": 0
    },
    "newBranchInfo": {
      "created": false,
      "baseBranch": null
    }
  }
}
```

## 注意事项

1. 切换分支会更新 ABAP 系统中的代码
2. 如果分支不存在且 `create` 为 false，会报错
3. 创建新分支基于当前分支
4. 切换可能导致暂存丢失
5. 建议切换前提交或保存更改

## 参数限制

- `repo` 必须是系统中存在的有效仓库 ID
- `branch` 必须是有效的分支名称格式
- 仓库必须处于链接状态
- 如果仓库未存储凭证，必须提供用户名和密码

## 与其他工具的关联性

- 使用 `gitRepos` 获取仓库 ID
- 使用 `remoteRepoInfo` 查看可用分支
- 使用 `gitPullRepo` 在切换后拉取新分支的代码
- 使用 `checkRepo` 检查切换后的状态
- 使用 `pushRepo` 推送到当前分支

## 使用场景说明

1. **分支切换**: 在不同开发线之间切换
2. **功能开发**: 切换到功能分支进行开发
3. **版本发布**: 切换到发布分支
4. **分支创建**: 创建新的功能或修复分支

## 最佳实践

1. 切换前检查未提交的更改
2. 使用有意义的分支名称
3. 定期合并主分支到功能分支
4. 切换后立即拉取最新代码
5. 保持分支结构清晰

## 错误处理

可能的错误：
- **仓库不存在**: 指定的仓库 ID 无效
- **分支不存在**: 指定的分支不存在且 `create` 为 false
- **分支已存在**: 创建分支时分支已存在
- **认证失败**: 凭证无效或权限不足
- **冲突**: 切换过程中发现冲突
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 切换到新分支并推送
async function switchAndPush(repoId, newBranch, credentials, message) {
  console.log(`切换到分支: ${newBranch}`);
  
  // 1. 切换分支（如果不存在则创建）
  const switchResult = await mcp.callTool("switchRepoBranch", {
    repo: repoId,
    branch: newBranch,
    create: true,
    ...credentials
  });
  
  console.log(`切换完成: ${switchResult.result.currentBranch}`);
  
  // 2. 拉取新分支的代码
  await mcp.callTool("gitPullRepo", {
    repoId: repoId,
    branch: newBranch,
    ...credentials
  });
  
  // 3. 暂存和推送更改
  const staged = await mcp.callTool("stageRepo", {
    repo: repoId,
    ...credentials
  });
  
  if (staged.result.stagedFiles.length > 0) {
    await mcp.callTool("pushRepo", {
      repo: repoId,
      staging: {
        message: message || `Switch to ${newBranch}`,
        files: staged.result.stagedFiles
      },
      ...credentials
    });
  }
  
  return switchResult;
}

// 功能分支工作流
async function featureBranchWorkflow(repoId, featureName, credentials) {
  const branchName = `feature/${featureName}`;
  
  // 1. 从主分支创建功能分支
  console.log('1. 切换到主分支...');
  await mcp.callTool("switchRepoBranch", {
    repo: repoId,
    branch: "main",
    ...credentials
  });
  
  // 2. 拉取最新代码
  console.log('2. 拉取最新代码...');
  await mcp.callTool("gitPullRepo", {
    repoId: repoId,
    ...credentials
  });
  
  // 3. 创建功能分支
  console.log(`3. 创建功能分支: ${branchName}`);
  const result = await mcp.callTool("switchRepoBranch", {
    repo: repoId,
    branch: branchName,
    create: true,
    ...credentials
  });
  
  console.log(`功能分支 ${branchName} 已创建并激活`);
  
  return result;
}

// 安全切换（带检查）
async function safeSwitchBranch(repoId, newBranch, credentials) {
  // 1. 检查当前状态
  const check = await mcp.callTool("checkRepo", {
    repo: repoId,
    ...credentials
  });
  
  if (check.result.localChanges.length > 0) {
    console.log('⚠️  存在未提交的更改');
    console.log('建议：');
    console.log('  1. 暂存并推送更改');
    console.log('  2. 或使用 stash 功能保存更改');
    
    // 询问用户是否继续
    const continueSwitch = await prompt('是否继续切换？更改可能丢失');
    if (!continueSwitch) {
      throw new Error('取消分支切换');
    }
  }
  
  // 2. 执行切换
  const result = await mcp.callTool("switchRepoBranch", {
    repo: repoId,
    branch: newBranch,
    ...credentials
  });
  
  // 3. 验证切换
  const verify = await mcp.callTool("checkRepo", {
    repo: repoId,
    ...credentials
  });
  
  if (verify.result.branch !== newBranch) {
    throw new Error('分支切换失败');
  }
  
  console.log(`✓ 成功切换到分支: ${newBranch}`);
  
  return result;
}
```

## 示例

```typescript
// 切换到现有分支
const repoId = "ABC123";

console.log(`切换仓库 ${repoId} 的分支`);

// 查看当前状态
const checkBefore = await mcp.callTool("checkRepo", {
  repo: repoId,
  user: "username",
  password: "token"
});

console.log(`\n当前状态:`);
console.log(`  分支: ${checkBefore.result.branch}`);
console.log(`  未提交更改: ${checkBefore.result.localChanges.length} 个`);

// 切换到 develop 分支
const result = await mcp.callTool("switchRepoBranch", {
  repo: repoId,
  branch: "develop",
  create: false,
  user: "username",
  password: "token"
});

// 显示切换结果
console.log(`\n切换完成！`);
console.log(`前一个分支: ${result.result.previousBranch}`);
console.log(`当前分支: ${result.result.currentBranch}`);
console.log(`切换时间: ${result.result.switchedAt}`);
console.log(`新建分支: ${result.result.created ? '是' : '否'}`);

// 显示应用的更改
const changes = result.result.changesApplied;
console.log(`\n更改统计:`);
console.log(`  更新文件: ${changes.filesUpdated}`);
console.log(`  冲突: ${changes.conflicts}`);

if (changes.conflicts > 0) {
  console.log('\n⚠️  存在冲突，需要手动解决');
} else {
  console.log('\n✓ 切换成功，无冲突');
}

// 验证切换
const checkAfter = await mcp.callTool("checkRepo", {
  repo: repoId,
  user: "username",
  password: "token"
});

console.log(`\n验证结果:`);
console.log(`  当前分支: ${checkAfter.result.branch}`);

if (checkAfter.result.branch === "develop") {
  console.log('\n✓ 分支切换验证成功');
  
  // 拉取新分支的最新代码
  console.log('\n正在拉取最新代码...');
  await mcp.callTool("gitPullRepo", {
    repoId: repoId,
    branch: "develop",
    user: "username",
    password: "token"
  });
  
  console.log('✓ 代码同步完成');
} else {
  console.log('\n✗ 分支切换验证失败');
}

// 创建并切换到新分支
console.log('\n创建新功能分支示例:');
const featureBranch = "feature/new-functionality";

const newBranchResult = await mcp.callTool("switchRepoBranch", {
  repo: repoId,
  branch: featureBranch,
  create: true,
  user: "username",
  password: "token"
});

console.log(`\n创建并切换到分支: ${featureBranch}`);
console.log(`基于分支: ${newBranchResult.result.previousBranch}`);
console.log(`创建时间: ${newBranchResult.result.switchedAt}`);
```
