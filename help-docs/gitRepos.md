# gitRepos - 获取Git仓库列表

## 功能说明

`gitRepos` 工具用于获取当前 ABAP 系统中所有已配置的 Git 仓库列表。这对于了解系统中有哪些 Git 集成以及管理这些仓库非常有用。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("gitRepos", {});
```

## 参数说明

无需参数。

## 返回结果

返回 JSON 格式的仓库列表：

```json
{
  "status": "success",
  "repos": [
    {
      "id": "ABC123",
      "name": "Z_MY_PACKAGE",
      "url": "https://github.com/company/z_my_package.git",
      "branch": "main",
      "status": "linked",
      "lastSync": "2024-01-30T10:00:00Z"
    },
    {
      "id": "DEF456",
      "name": "Z_OTHER_PACKAGE",
      "url": "https://gitlab.com/team/z_other_package.git",
      "branch": "develop",
      "status": "linked",
      "lastSync": "2024-01-29T15:30:00Z"
    }
  ]
}
```

## 注意事项

1. 返回的列表仅包含已链接到 ABAP 系统的仓库
2. 未链接的仓库不会显示在列表中
3. 某些仓库信息可能因权限限制而不完整
4. 仓库列表的顺序可能因系统配置而异

## 参数限制

无。

## 与其他工具的关联性

- 使用 `gitCreateRepo` 创建新仓库
- 使用 `gitUnlinkRepo` 取消链接仓库
- 使用 `gitPullRepo` 拉取仓库更改
- 使用 `pushRepo` 推送更改到仓库
- 使用 `switchRepoBranch` 切换仓库分支
- 使用 `checkRepo` 检查特定仓库状态
- 使用 `remoteRepoInfo` 获取远程仓库详情

## 使用场景说明

1. **仓库浏览**: 查看系统中有哪些 Git 仓库集成
2. **仓库管理**: 管理和维护 Git 集成
3. **同步检查**: 检查仓库的同步状态
4. **审计追踪**: 追踪 Git 集成的历史和状态

## 最佳实践

1. 定期检查仓库列表以确保集成正常
2. 监控仓库的 `lastSync` 时间戳
3. 检查仓库状态是否为 "linked"
4. 验证仓库 URL 和分支配置

## 错误处理

可能的错误：
- **权限不足**: 无权访问 Git 仓库列表
- **系统错误**: ABAP 系统内部错误
- **未配置**: 系统未配置 Git 集成功能

## 高级用法

```typescript
// 查找特定包的仓库
function findRepoByPackage(repos, packageName) {
  return repos.find(repo => repo.name === packageName);
}

// 按同步时间排序
function sortReposBySyncTime(repos) {
  return [...repos].sort((a, b) => 
    new Date(b.lastSync) - new Date(a.lastSync)
  );
}

// 查找需要同步的仓库（超过一定时间未同步）
function findReposNeedingSync(repos, thresholdHours = 24) {
  const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
  return repos.filter(repo => new Date(repo.lastSync) < threshold);
}

// 生成仓库状态报告
async function generateRepoReport() {
  const result = await mcp.callTool("gitRepos", {});
  const repos = result.repos;
  
  return {
    total: repos.length,
    linked: repos.filter(r => r.status === 'linked').length,
    recentSync: sortReposBySyncTime(repos).slice(0, 5),
    needsSync: findReposNeedingSync(repos)
  };
}
```

## 示例

```typescript
// 获取所有 Git 仓库
const result = await mcp.callTool("gitRepos", {});

// 显示仓库数量
console.log(`已配置的 Git 仓库数量: ${result.repos.length}`);

// 显示每个仓库的信息
console.log('\n仓库列表:');
result.repos.forEach((repo, index) => {
  console.log(`\n${index + 1}. ${repo.name}`);
  console.log(`   ID: ${repo.id}`);
  console.log(`   URL: ${repo.url}`);
  console.log(`   分支: ${repo.branch}`);
  console.log(`   状态: ${repo.status}`);
  console.log(`   最后同步: ${repo.lastSync}`);
});

// 查找特定仓库
const myRepo = result.repos.find(r => r.name === 'Z_MY_PACKAGE');
if (myRepo) {
  console.log(`\n找到仓库: ${myRepo.url}`);
} else {
  console.log('\n未找到指定仓库');
}

// 识别需要同步的仓库
const thresholdHours = 24;
const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
const oldSyncs = result.repos.filter(r => new Date(r.lastSync) < threshold);

if (oldSyncs.length > 0) {
  console.log(`\n⚠️  以下仓库超过 ${thresholdHours} 小时未同步:`);
  oldSyncs.forEach(repo => {
    const hoursOld = Math.floor(
      (Date.now() - new Date(repo.lastSync).getTime()) / (60 * 60 * 1000)
    );
    console.log(`  - ${repo.name} (${hoursOld} 小时前)`);
  });
}
```
