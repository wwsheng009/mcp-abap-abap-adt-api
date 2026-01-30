# gitPullRepo - 拉取Git仓库更改

## 功能说明

`gitPullRepo` 工具用于从远程 Git 仓库拉取更改并将其同步到 ABAP 系统。这对于获取其他开发者提交的更改或保持代码同步非常重要。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("gitPullRepo", {
  repoId: "ABC123",
  branch: "main",
  transport: "K123456",
  user: "username",
  password: "password"
});
```

## 参数说明

- **repoId** (string, 必需): Git 仓库的 ID
  - 从 `gitRepos` 获取
  - 唯一标识系统中的仓库

- **branch** (string, 可选): 要拉取的分支名称
  - 如果未指定，使用仓库的默认分支
  - 可以切换到不同的分支进行拉取

- **transport** (string, 可选): 传输请求号
  - 用于记录拉取的更改
  - 建议在开发环境中提供

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要
  - 支持使用访问令牌

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要
  - 推荐使用个人访问令牌

## 返回结果

返回 JSON 格式的拉取结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "branch": "main",
    "pulledAt": "2024-01-30T10:30:00Z",
    "changes": {
      "commits": 5,
      "filesAdded": 10,
      "filesModified": 15,
      "filesDeleted": 2
    },
    "conflicts": [],
    "newObjects": [
      {
        "name": "ZCL_NEW_CLASS",
        "type": "CLAS"
      }
    ],
    "updatedObjects": [
      {
        "name": "ZCL_EXISTING_CLASS",
        "type": "CLAS"
      }
    ]
  }
}
```

## 注意事项

1. 拉取前建议先检查仓库状态
2. 如果存在冲突，需要手动解决
3. 拉取可能会覆盖本地未提交的更改
4. 大量更改可能需要较长时间
5. 传输请求用于记录拉取的对象

## 参数限制

- `repoId` 必须是系统中存在的有效仓库 ID
- 如果仓库未存储凭证，必须提供用户名和密码
- 指定的分支必须在远程仓库中存在

## 与其他工具的关联性

- 使用 `gitRepos` 获取仓库 ID
- 使用 `checkRepo` 检查仓库状态和同步需求
- 拉取后使用 `getObjectSourceV2` 查看拉取的代码
- 使用 `pushRepo` 推送本地更改
- 使用 `switchRepoBranch` 切换分支

## 使用场景说明

1. **同步更改**: 从远程仓库获取其他开发者的提交
2. **分支切换**: 拉取不同分支的代码
3. **更新依赖**: 更新包依赖的外部代码
4. **冲突解决**: 拉取并解决合并冲突

## 最佳实践

1. 在拉取前先提交或暂存本地更改
2. 定期拉取以保持代码同步
3. 检查冲突并及时解决
4. 查看拉取的更改摘要
5. 使用传输请求记录更改

## 错误处理

可能的错误：
- **仓库不存在**: 指定的仓库 ID 无效
- **分支不存在**: 指定的分支在远程仓库中不存在
- **认证失败**: 凭证无效或权限不足
- **冲突**: 存在未解决的合并冲突
- **权限不足**: 无权执行拉取操作
- **网络错误**: 无法连接到 Git 仓库

## 高级用法

```typescript
// 拉取并验证
async function pullAndVerify(repoId, options = {}) {
  console.log(`开始拉取仓库 ${repoId}...`);
  
  const result = await mcp.callTool("gitPullRepo", {
    repoId,
    ...options
  });
  
  // 验证拉取结果
  const summary = {
    commits: result.result.changes.commits,
    files: result.result.changes.filesAdded + 
            result.result.changes.filesModified +
            result.result.changes.filesDeleted,
    conflicts: result.result.conflicts.length,
    objects: result.result.newObjects.length + result.result.updatedObjects.length
  };
  
  console.log(`拉取完成:`);
  console.log(`  提交数: ${summary.commits}`);
  console.log(`  文件变更: ${summary.files}`);
  console.log(`  对象变更: ${summary.objects}`);
  console.log(`  冲突: ${summary.conflicts}`);
  
  // 检查冲突
  if (summary.conflicts > 0) {
    console.log('\n⚠️  存在合并冲突，需要手动解决');
    result.result.conflicts.forEach(conflict => {
      console.log(`  - ${conflict.path}`);
    });
  }
  
  return { result, summary };
}

// 批量拉取多个仓库
async function pullMultipleRepos(repoIds, options = {}) {
  const results = [];
  
  for (const repoId of repoIds) {
    try {
      const { result, summary } = await pullAndVerify(repoId, options);
      results.push({
        repoId,
        success: true,
        summary
      });
    } catch (error) {
      results.push({
        repoId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// 定期同步（自动化）
async function scheduleRegularSync(repoId, intervalMinutes = 60) {
  setInterval(async () => {
    console.log(`[${new Date().toISOString()}] 定期同步: ${repoId}`);
    try {
      await pullAndVerify(repoId);
      console.log('同步成功');
    } catch (error) {
      console.error('同步失败:', error.message);
    }
  }, intervalMinutes * 60 * 1000);
}
```

## 示例

```typescript
// 拉取默认分支
const result = await mcp.callTool("gitPullRepo", {
  repoId: "ABC123",
  transport: "K123456"
});

// 显示拉取摘要
const changes = result.result.changes;
console.log(`拉取时间: ${result.result.pulledAt}`);
console.log(`分支: ${result.result.branch}`);
console.log(`\n变更统计:`);
console.log(`  新提交: ${changes.commits}`);
console.log(`  新增文件: ${changes.filesAdded}`);
console.log(`  修改文件: ${changes.filesModified}`);
console.log(`  删除文件: ${changes.filesDeleted}`);

// 显示新增的对象
if (result.result.newObjects.length > 0) {
  console.log(`\n新增对象:`);
  result.result.newObjects.forEach(obj => {
    console.log(`  - ${obj.name} (${obj.type})`);
  });
}

// 显示更新的对象
if (result.result.updatedObjects.length > 0) {
  console.log(`\n更新对象:`);
  result.result.updatedObjects.forEach(obj => {
    console.log(`  - ${obj.name} (${obj.type})`);
  });
}

// 检查冲突
if (result.result.conflicts.length > 0) {
  console.log(`\n⚠️  发现 ${result.result.conflicts.length} 个冲突:`);
  result.result.conflicts.forEach((conflict, index) => {
    console.log(`  ${index + 1}. ${conflict.path}`);
    console.log(`     状态: ${conflict.status}`);
  });
  console.log('\n需要手动解决冲突后再继续');
} else {
  console.log('\n✓ 拉取成功，无冲突');
}

// 查看拉取的代码
if (result.result.newObjects.length > 0) {
  const newObj = result.result.newObjects[0];
  const source = await mcp.callTool("getObjectSourceV2", {
    url: `/sap/bc/adt/oo/classes/${newObj.name.toLowerCase()}`
  });
  console.log(`\n${newObj.name} 源代码:\n${source.content}`);
}
```
