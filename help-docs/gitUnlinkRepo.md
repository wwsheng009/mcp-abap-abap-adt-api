# gitUnlinkRepo - 取消链接Git仓库

## 功能说明

`gitUnlinkRepo` 工具用于取消 ABAP 包与 Git 仓库之间的链接。这将停止自动同步，但不会删除仓库本身或 ABAP 包中的任何代码。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("gitUnlinkRepo", {
  repoId: "ABC123"
});
```

## 参数说明

- **repoId** (string, 必需): 要取消链接的 Git 仓库 ID
  - 从 `gitRepos` 获取
  - 唯一标识系统中的仓库

## 返回结果

返回 JSON 格式的取消结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "unlinkedAt": "2024-01-30T10:30:00Z",
    "packageName": "Z_MY_PACKAGE",
    "status": "unlinked"
  }
}
```

## 注意事项

1. 取消链接不会删除 Git 仓库本身
2. 取消链接不会删除 ABAP 包中的代码
3. 取消后无法再使用 `gitPullRepo` 或 `pushRepo`
4. 可以使用 `gitCreateRepo` 重新建立链接
5. 取消操作可能需要传输请求

## 参数限制

- `repoId` 必须是系统中存在的有效仓库 ID
- 仓库必须处于链接状态

## 与其他工具的关联性

- 使用 `gitRepos` 查看仓库列表和获取 ID
- 使用 `gitCreateRepo` 重新建立链接
- 取消链接后可以查看 ABAP 包的源代码

## 使用场景说明

1. **停用集成**: 临时或永久停止 Git 集成
2. **更换仓库**: 取消当前链接以便链接到不同仓库
3. **环境切换**: 在不同环境间切换 Git 集成
4. **清理清理**: 移除不再需要的 Git 集成

## 最佳实践

1. 在取消前确保本地更改已提交
2. 考虑使用传输请求记录取消操作
3. 取消前查看仓库的当前状态
4. 保存重要信息以便重新链接

## 错误处理

可能的错误：
- **仓库不存在**: 指定的仓库 ID 无效
- **未链接**: 仓库已经处于未链接状态
- **权限不足**: 无权取消链接
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 安全取消链接（带验证）
async function safeUnlinkRepo(repoId) {
  // 1. 获取仓库信息
  const repos = await mcp.callTool("gitRepos", {});
  const repo = repos.repos.find(r => r.id === repoId);
  
  if (!repo) {
    throw new Error(`仓库 ${repoId} 不存在`);
  }
  
  console.log(`准备取消链接: ${repo.name}`);
  console.log(`仓库 URL: ${repo.url}`);
  console.log(`最后同步: ${repo.lastSync}`);
  
  // 2. 执行取消
  const result = await mcp.callTool("gitUnlinkRepo", { repoId });
  
  console.log(`取消链接完成: ${result.result.unlinkedAt}`);
  
  return result;
}

// 批量取消多个仓库
async function unlinkMultipleRepos(repoIds) {
  const results = [];
  
  for (const repoId of repoIds) {
    try {
      const result = await safeUnlinkRepo(repoId);
      results.push({
        repoId,
        success: true,
        packageName: result.result.packageName
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

// 取消并重新链接到新仓库
async function switchRepo(oldRepoId, newRepoUrl, packageName, credentials, transport) {
  console.log('1. 取消旧仓库链接...');
  await mcp.callTool("gitUnlinkRepo", { repoId: oldRepoId });
  
  console.log('2. 验证新仓库...');
  const verify = await mcp.callTool("gitExternalRepoInfo", {
    repourl: newRepoUrl,
    ...credentials
  });
  
  if (!verify.repoInfo.accessible) {
    throw new Error('新仓库不可访问');
  }
  
  console.log('3. 创建新仓库链接...');
  const newResult = await mcp.callTool("gitCreateRepo", {
    packageName,
    repourl: newRepoUrl,
    transport,
    ...credentials
  });
  
  console.log(`4. 切换完成，新仓库 ID: ${newResult.result.repoId}`);
  return newResult;
}
```

## 示例

```typescript
// 取消 Git 仓库链接
const repoId = "ABC123";

console.log(`准备取消仓库链接: ${repoId}`);

// 显示取消前的仓库信息
const repos = await mcp.callTool("gitRepos", {});
const repoToUnlink = repos.repos.find(r => r.id === repoId);

if (repoToUnlink) {
  console.log(`\n仓库信息:`);
  console.log(`  包名称: ${repoToUnlink.name}`);
  console.log(`  仓库 URL: ${repoToUnlink.url}`);
  console.log(`  分支: ${repoToUnlink.branch}`);
  console.log(`  最后同步: ${repoToUnlink.lastSync}`);
  console.log(`  状态: ${repoToUnlink.status}`);
}

// 执行取消链接
const result = await mcp.callTool("gitUnlinkRepo", { repoId });

// 显示取消结果
console.log(`\n取消链接完成！`);
console.log(`仓库 ID: ${result.result.repoId}`);
console.log(`包名称: ${result.result.packageName}`);
console.log(`取消时间: ${result.result.unlinkedAt}`);
console.log(`当前状态: ${result.result.status}`);

// 验证取消
const updatedRepos = await mcp.callTool("gitRepos", {});
const stillLinked = updatedRepos.repos.find(r => r.id === repoId);

if (!stillLinked) {
  console.log('\n✓ 仓库已成功取消链接');
  
  // 提示重新链接
  console.log('\n如需重新链接，可以使用 gitCreateRepo 工具:');
  console.log(`  await mcp.callTool("gitCreateRepo", {`);
  console.log(`    packageName: "${result.result.packageName}",`);
  console.log(`    repourl: "https://github.com/company/repo.git"`);
  console.log(`  });`);
} else {
  console.log('\n✗ 取消链接失败，仓库仍然存在');
}

// 查看包中的代码（仍然存在）
console.log(`\n包 ${result.result.packageName} 中的代码未被删除`);
```
