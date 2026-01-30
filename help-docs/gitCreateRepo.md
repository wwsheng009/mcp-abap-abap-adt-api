# gitCreateRepo - 创建Git仓库

## 功能说明

`gitCreateRepo` 工具用于在 ABAP 包和 Git 仓库之间建立链接，创建新的 Git 集成。这允许将 ABAP 开发对象的更改与 Git 仓库同步。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("gitCreateRepo", {
  packageName: "Z_MY_PACKAGE",
  repourl: "https://github.com/company/repo.git",
  branch: "main",
  transport: "K123456",
  user: "username",
  password: "password"
});
```

## 参数说明

- **packageName** (string, 必需): ABAP 包的名称
  - 必须是系统中存在的有效包
  - 包必须具有 Git 集成能力

- **repourl** (string, 必需): Git 仓库的 URL 地址
  - 支持 HTTPS 和 SSH 格式
  - 必须是完整的仓库 URL
  - 例如: `https://github.com/company/repo.git`

- **branch** (string, 可选): 要使用的分支名称
  - 默认通常是 'main' 或 'master'
  - 如果指定分支不存在，取决于系统配置可能创建或失败

- **transport** (string, 可选): 传输请求号
  - 用于记录配置更改
  - 建议在开发环境中提供

- **user** (string, 可选): 访问仓库的用户名
  - 对于私有仓库通常需要
  - 支持使用访问令牌

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 对于私有仓库通常需要
  - 推荐使用个人访问令牌而非密码

## 返回结果

返回 JSON 格式的创建结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "packageName": "Z_MY_PACKAGE",
    "url": "https://github.com/company/repo.git",
    "branch": "main",
    "status": "linked",
    "createdAt": "2024-01-30T10:30:00Z",
    "transport": "K123456"
  }
}
```

## 注意事项

1. ABAP 包必须支持 Git 集成
2. 创建链接不会立即同步所有内容
3. 传输请求用于记录配置更改
4. 凭证信息可能被系统存储用于后续访问
5. 包不能链接到多个 Git 仓库

## 参数限制

- `packageName` 必须是有效的 ABAP 包名
- `repourl` 必须是有效的 Git 仓库 URL
- 如果是私有仓库，必须提供有效的凭证
- 包必须尚未链接到其他仓库

## 与其他工具的关联性

- 使用 `gitExternalRepoInfo` 在创建前验证仓库
- 使用 `gitRepos` 查看新创建的仓库链接
- 创建后使用 `gitPullRepo` 拉取代码
- 使用 `pushRepo` 推送更改到仓库
- 使用 `gitUnlinkRepo` 取消链接

## 使用场景说明

1. **新项目集成**: 为新的 ABAP 项目设置 Git 集成
2. **迁移到Git**: 将现有 ABAP 项目迁移到 Git
3. **团队协作**: 设置团队的 Git 版本控制
4. **CI/CD集成**: 为持续集成配置 Git 集成

## 最佳实践

1. 在创建前使用 `gitExternalRepoInfo` 验证仓库
2. 使用传输请求记录配置更改
3. 为不同环境使用不同的分支
4. 保护凭证信息的安全
5. 创建后验证链接状态

## 错误处理

可能的错误：
- **包不存在**: 指定的包在系统中不存在
- **已链接**: 包已经链接到其他仓库
- **仓库不可访问**: 无法访问指定的 Git 仓库
- **权限不足**: 无权创建 Git 集成
- **包不支持**: 包类型不支持 Git 集成
- **传输无效**: 提供的传输请求号无效

## 高级用法

```typescript
// 创建仓库链接的完整流程
async function setupGitIntegration(packageName, repoUrl, credentials, transport) {
  // 1. 验证仓库
  console.log('验证仓库可访问性...');
  const verify = await mcp.callTool("gitExternalRepoInfo", {
    repourl: repoUrl,
    ...credentials
  });
  
  if (!verify.repoInfo.accessible) {
    throw new Error('仓库不可访问');
  }
  
  // 2. 获取默认分支
  const defaultBranch = verify.repoInfo.branches.find(b => b.default)?.name || 'main';
  
  // 3. 创建链接
  console.log(`创建仓库链接，使用分支: ${defaultBranch}`);
  const result = await mcp.callTool("gitCreateRepo", {
    packageName,
    repourl: repoUrl,
    branch: defaultBranch,
    transport,
    ...credentials
  });
  
  return result;
}

// 批量创建多个包的 Git 集成
async function setupMultipleIntegrations(configurations) {
  const results = [];
  
  for (const config of configurations) {
    try {
      const result = await setupGitIntegration(
        config.packageName,
        config.repoUrl,
        config.credentials,
        config.transport
      );
      results.push({
        package: config.packageName,
        success: true,
        repoId: result.result.repoId
      });
    } catch (error) {
      results.push({
        package: config.packageName,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// 验证创建结果
async function verifyRepoCreation(repoId, packageName) {
  const repos = await mcp.callTool("gitRepos", {});
  const created = repos.repos.find(r => 
    r.id === repoId && r.name === packageName
  );
  
  return created ? { success: true, repo: created } : { success: false };
}
```

## 示例

```typescript
// 创建新的 Git 仓库链接
const result = await mcp.callTool("gitCreateRepo", {
  packageName: "Z_MY_PACKAGE",
  repourl: "https://github.com/company/my-abap-package.git",
  branch: "main",
  transport: "K123456",
  user: "myusername",
  password: "mytoken"
});

// 显示创建结果
console.log('Git 仓库链接创建成功！');
console.log(`\n仓库 ID: ${result.result.repoId}`);
console.log(`包名称: ${result.result.packageName}`);
console.log(`仓库 URL: ${result.result.url}`);
console.log(`分支: ${result.result.branch}`);
console.log(`状态: ${result.result.status}`);
console.log(`创建时间: ${result.result.createdAt}`);
console.log(`传输请求: ${result.result.transport}`);

// 验证链接
const repos = await mcp.callTool("gitRepos", {});
const myRepo = repos.repos.find(r => r.id === result.result.repoId);

if (myRepo) {
  console.log('\n✓ 仓库链接已成功创建并可用');
  
  // 执行初始拉取
  console.log('\n正在执行初始拉取...');
  const pullResult = await mcp.callTool("gitPullRepo", {
    repoId: result.result.repoId,
    transport: "K123456"
  });
  
  console.log('初始拉取完成');
} else {
  console.log('\n✗ 仓库链接创建失败或未找到');
}
```
