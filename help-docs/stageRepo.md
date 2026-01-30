# stageRepo - 暂存Git仓库更改

## 功能说明

`stageRepo` 工具用于将 ABAP 系统中的更改暂存到 Git 暂存区，准备推送到远程仓库。这是提交和推送前的准备步骤。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("stageRepo", {
  repo: {
    id: "ABC123",
    packageName: "Z_MY_PACKAGE"
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

- **user** (string, 可选): 访问仓库的用户名
  - 如果系统未存储凭证则可能需要

- **password** (string, 可选): 访问仓库的密码或访问令牌
  - 如果系统未存储凭证则可能需要

## 返回结果

返回 JSON 格式的暂存结果：

```json
{
  "status": "success",
  "result": {
    "repoId": "ABC123",
    "stagedAt": "2024-01-30T10:30:00Z",
    "stagedFiles": [
      {
        "path": "zcl_my_class.abap",
        "status": "modified",
        "size": 1234
      },
      {
        "path": "znew_prog.abap",
        "status": "new",
        "size": 567
      }
    ],
    "totalSize": 1801,
    "unstagedChanges": 0
  }
}
```

## 注意事项

1. 暂存不会立即提交或推送
2. 必须使用 `pushRepo` 推送暂存的更改
3. 暂存的更改可以在推送前取消
4. 暂存区中的更改将被包含在下一次推送中

## 参数限制

- `repo` 必须是有效的仓库对象
- 仓库必须处于链接状态
- 如果仓库未存储凭证，必须提供用户名和密码

## 与其他工具的关联性

- 使用 `gitRepos` 获取仓库信息
- 暂存后使用 `pushRepo` 推送更改
- 使用 `checkRepo` 检查仓库状态
- 使用 `gitPullRepo` 更新本地状态

## 使用场景说明

1. **准备提交**: 暂存多个更改以便一起推送
2. **选择性推送**: 选择性地暂存特定文件
3. **更改审查**: 在推送前审查暂存的更改
4. **批量操作**: 一次暂存多个相关更改

## 最佳实践

1. 在推送前暂存所有相关更改
2. 检查暂存的文件列表
3. 确保没有遗漏重要更改
4. 定期推送暂存的更改

## 错误处理

可能的错误：
- **仓库无效**: 提供的仓库对象无效
- **未链接**: 仓库未链接或已取消链接
- **认证失败**: 凭证无效或权限不足
- **无更改**: 没有待暂存的更改
- **系统错误**: ABAP 系统内部错误

## 高级用法

```typescript
// 暂存并推送
async function stageAndPush(repo, credentials) {
  console.log('1. 暂存更改...');
  const stageResult = await mcp.callTool("stageRepo", {
    repo,
    ...credentials
  });
  
  console.log(`暂存了 ${stageResult.result.stagedFiles.length} 个文件`);
  
  // 2. 准备暂存信息
  const staging = {
    message: "Update ABAP objects",
    files: stageResult.result.stagedFiles
  };
  
  // 3. 推送
  console.log('2. 推送更改...');
  const pushResult = await mcp.callTool("pushRepo", {
    repo,
    staging,
    ...credentials
  });
  
  return { stageResult, pushResult };
}

// 查看暂存的更改
async function reviewStagedChanges(repo) {
  const result = await mcp.callTool("stageRepo", { repo });
  
  console.log(`\n暂存于 ${result.result.stagedAt}:`);
  console.log(`总计大小: ${result.result.totalSize} 字节\n`);
  
  result.result.stagedFiles.forEach((file, index) => {
    const icon = file.status === 'new' ? '✓' : '⚙️';
    console.log(`${icon} ${index + 1}. ${file.path}`);
    console.log(`   状态: ${file.status}`);
    console.log(`   大小: ${file.size} 字节\n`);
  });
  
  return result;
}

// 选择性暂存
async function stageSelective(repo, filePaths, credentials) {
  // 构建自定义暂存对象
  const selectiveRepo = {
    ...repo,
    selectiveFiles: filePaths
  };
  
  return await mcp.callTool("stageRepo", {
    repo: selectiveRepo,
    ...credentials
  });
}
```

## 示例

```typescript
// 暂存仓库更改
const repo = {
  id: "ABC123",
  packageName: "Z_MY_PACKAGE"
};

console.log('暂存仓库更改...');
const result = await mcp.callTool("stageRepo", {
  repo,
  user: "username",
  password: "token"
});

// 显示暂存结果
console.log(`\n暂存时间: ${result.result.stagedAt}`);
console.log(`总大小: ${result.result.totalSize} 字节`);
console.log(`未暂存更改: ${result.result.unstagedChanges}`);

// 显示暂存的文件
if (result.result.stagedFiles.length > 0) {
  console.log(`\n暂存的文件 (${result.result.stagedFiles.length} 个):`);
  
  result.result.stagedFiles.forEach((file, index) => {
    console.log(`\n${index + 1}. ${file.path}`);
    console.log(`   状态: ${file.status}`);
    console.log(`   大小: ${file.size} 字节`);
  });
  
  // 准备推送
  console.log('\n准备推送更改...');
  const staging = {
    message: `Update ${repo.packageName}`,
    files: result.result.stagedFiles
  };
  
  const pushResult = await mcp.callTool("pushRepo", {
    repo,
    staging,
    user: "username",
    password: "token"
  });
  
  console.log(`\n✓ 推送完成！`);
  console.log(`提交信息: ${staging.message}`);
  
} else {
  console.log('\n没有文件被暂存（可能没有更改）');
}
```
