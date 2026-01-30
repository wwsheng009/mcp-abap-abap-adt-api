# gitExternalRepoInfo - 获取外部Git仓库信息

## 功能说明

`gitExternalRepoInfo` 工具用于获取外部 Git 仓库的详细信息，而无需先将其链接到 ABAP 系统。这对于在创建链接前验证仓库可访问性和检查仓库配置非常有用。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("gitExternalRepoInfo", {
  repourl: "https://github.com/company/repo.git",
  user: "username",
  password: "password"
});
```

## 参数说明

- **repourl** (string, 必需): 外部 Git 仓库的 URL 地址
  - 支持 HTTPS 和 SSH 格式
  - 必须是完整的仓库 URL
  - 例如: `https://github.com/company/repo.git`

- **user** (string, 可选): 访问仓库的用户名
  - 对于私有仓库通常需要
  - 某些托管服务支持 token 认证

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 对于私有仓库通常需要
  - 推荐使用个人访问令牌而非密码

## 返回结果

返回 JSON 格式的仓库信息：

```json
{
  "status": "success",
  "repoInfo": {
    "url": "https://github.com/company/repo.git",
    "accessible": true,
    "type": "https",
    "authentication": "basic",
    "branches": [
      {
        "name": "main",
        "default": true
      },
      {
        "name": "develop",
        "default": false
      }
    ],
    "metadata": {
      "name": "repo",
      "owner": "company",
      "description": "Project repository",
      "language": "ABAP",
      "isPrivate": true
    }
  }
}
```

## 注意事项

1. 仅验证仓库可访问性，不建立链接
2. 凭证信息在请求中使用，不会被存储
3. 对于私有仓库必须提供有效的凭证
4. 某些 Git 托管服务可能有特定的认证要求

## 参数限制

- `repourl` 必须是有效的 Git 仓库 URL
- 如果是私有仓库，必须提供有效的用户名和密码
- URL 必须使用支持的协议（HTTPS 或 SSH）

## 与其他工具的关联性

- 使用 `gitCreateRepo` 在验证后创建仓库链接
- 使用 `gitRepos` 查看已链接的仓库列表
- 验证通过后可以使用 `gitPullRepo` 拉取代码

## 使用场景说明

1. **预验证**: 在链接仓库前验证其可访问性
2. **信息获取**: 获取仓库的分支和元数据信息
3. **权限检查**: 验证凭证是否有效
4. **配置规划**: 基于仓库信息规划集成配置

## 最佳实践

1. 在创建仓库链接前使用此工具验证
2. 使用个人访问令牌而非密码
3. 验证仓库的默认分支
4. 检查仓库的分支结构

## 错误处理

可能的错误：
- **URL 无效**: 提供的仓库 URL 格式不正确
- **仓库不存在**: 指定的仓库不存在或已被删除
- **认证失败**: 提供的凭证无效或权限不足
- **网络错误**: 无法连接到 Git 仓库
- **不支持**: 仓库类型或托管服务不支持

## 高级用法

```typescript
// 验证多个仓库
async function validateMultipleRepos(repoUrls, credentials) {
  const results = await Promise.all(
    repoUrls.map(url => 
      mcp.callTool("gitExternalRepoInfo", {
        repourl: url,
        ...credentials
      })
    )
  );
  return results.map((r, i) => ({
    url: repoUrls[i],
    accessible: r.repoInfo.accessible,
    branches: r.repoInfo.branches
  }));
}

// 查找默认分支
function findDefaultBranch(repoInfo) {
  const branch = repoInfo.branches.find(b => b.default);
  return branch ? branch.name : 'main';
}

// 生成仓库验证报告
async function generateValidationReport(repos) {
  const report = {
    total: repos.length,
    accessible: 0,
    inaccessible: 0,
    errors: []
  };
  
  for (const repo of repos) {
    try {
      const result = await mcp.callTool("gitExternalRepoInfo", repo);
      if (result.repoInfo.accessible) {
        report.accessible++;
      } else {
        report.inaccessible++;
      }
    } catch (error) {
      report.inaccessible++;
      report.errors.push({
        url: repo.repourl,
        error: error.message
      });
    }
  }
  
  return report;
}
```

## 示例

```typescript
// 验证仓库可访问性
const result = await mcp.callTool("gitExternalRepoInfo", {
  repourl: "https://github.com/company/my-abap-package.git",
  user: "myusername",
  password: "mytoken"
});

// 显示验证结果
console.log(`仓库 URL: ${result.repoInfo.url}`);
console.log(`可访问性: ${result.repoInfo.accessible ? '✓ 可访问' : '✗ 不可访问'}`);

if (result.repoInfo.accessible) {
  // 显示仓库元数据
  const meta = result.repoInfo.metadata;
  console.log(`\n仓库信息:`);
  console.log(`  名称: ${meta.name}`);
  console.log(`  所有者: ${meta.owner}`);
  console.log(`  描述: ${meta.description || '无'}`);
  console.log(`  语言: ${meta.language}`);
  console.log(`  私有: ${meta.isPrivate ? '是' : '否'}`);
  
  // 显示分支列表
  console.log(`\n可用分支:`);
  result.repoInfo.branches.forEach(branch => {
    const marker = branch.default ? ' (默认)' : '';
    console.log(`  - ${branch.name}${marker}`);
  });
  
  // 获取默认分支
  const defaultBranch = result.repoInfo.branches.find(b => b.default);
  console.log(`\n默认分支: ${defaultBranch ? defaultBranch.name : '未设置'}`);
} else {
  console.log('\n⚠️  仓库不可访问，请检查 URL 和凭证');
}
```
