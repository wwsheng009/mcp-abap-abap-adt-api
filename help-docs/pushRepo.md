# pushRepo

推送变更到远程仓库。

## 功能说明

此工具用于将暂存的本地变更推送到 Git 远程仓库。

## 调用方法

**参数**:
- `repo` (object, 必需): Git 仓库对象
- `staging` (object, 必需): 暂存信息对象
- `user` (string, 可选): Git 用户名
- `password` (string, 可选): Git 密码

**返回值**:
```json
{
  "status": "success",
  "result": "Push completed successfully"
}
```

## 注意事项

1. **必须先暂存**: 推送前必须使用 `stageRepo` 暂存变更

2. **暂存信息**: staging 参数包含暂存的变更详情

3. **凭据要求**: 私有仓库需要提供凭据

4. **冲突处理**: 推送可能遇到冲突，需要处理

## 使用场景说明

### 场景 1: 推送所有变更
```json
{
  "tool": "pushRepo",
  "arguments": {
    "repo": {
      "key": "repo1",
      "name": "Z_MY_PACKAGE",
      "url": "https://github.com/user/repo.git"
    },
    "staging": {
      "files": [...]
    }
  }
}
```

## Git 工作流程

```json
// 完整 Git 工作流
[编辑对象] → stageRepo → pushRepo
```

---

## 17. 调试器 (Debugger)