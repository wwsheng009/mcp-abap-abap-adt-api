# stageRepo

暂存本地变更。

## 功能说明

此工具用于暂存（stage）本地修改的 ABAP 对象，准备推送到 Git 远程仓库。

## 调用方法

**参数**:
- `repo` (object, 必需): Git 仓库对象
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Changes staged successfully"
}
```

## 注意事项

1. **暂存区**: 暂存的变更放入 Git 暂存区

2. **仓库对象**: repo 参数包含完整的仓库信息

3. **凭据要求**: 私有仓库需要提供凭据

4. **推送准备**: 暂存是推送前的必要步骤

## 使用场景说明

### 场景 1: 暂存所有变更
```json
{
  "tool": "stageRepo",
  "arguments": {
    "repo": {
      "key": "repo1",
      "name": "Z_MY_PACKAGE",
      "url": "https://github.com/user/repo.git",
      "branch": "main"
    }
  }
}
```

## Git 工作流程

```json
// 标准 Git 工作流
gitRepos → gitPullRepo → [编辑对象] → stageRepo → pushRepo
```

