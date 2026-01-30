# getObjectSource

获取对象的源代码。

## 功能说明

此工具用于读取 ABAP 对象的源代码。需要提供对象的源代码 URL，通常是在对象 URL 后添加 `/source/main` 后缀。

## 调用方法

**参数**:
- `objectSourceUrl` (string, 必需): 对象源代码的 URL（需要在对象 URL 后添加 `/source/main`）
- `gitUser` (string, 可选): abapGit 仓库用户名（用于 abapGit 对象）
- `gitPassword` (string, 可选): abapGit 仓库密码（用于 abapGit 对象）

**返回值**:
```json
{
  "status": "success",
  "source": "REPORT zmy_program.\n...",
  "message": "Source code retrieved successfully"
}
```

**示例**:
```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

## 注意事项

1. **URL 格式**: 必须使用完整的源代码 URL 格式
   - 类: `/sap/bc/adt/oo/classes/{name}/source/main`
   - 程序: `/sap/bc/adt/programs/programs/{name}/source/main`
   - 接口: `/sap/bc/adt/oo/interfaces/{name}/source/main`

2. **abapGit 对象**: 对于 abapGit 管理的对象，需要提供 `gitUser` 和 `gitPassword`

3. **主包含文件**: 对于类，`source/main` 是主包含文件。类还有其他包含文件（如 test classes）

4. **权限要求**: 用户必须对对象有读取权限

5. **大文件处理**: 对于非常大的源代码文件，可能需要分批读取

6. **编码**: 返回的源代码通常为 UTF-8 编码

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| objectSourceUrl | string | 是 | 必须是有效的源代码 URL |
| gitUser | string | 否 | 仅用于 abapGit 对象 |
| gitPassword | string | 否 | 仅用于 abapGit 对象 |

## 与其他工具的关联性

1. **前置操作**:
   ```
   objectStructure → 获取 sourceUri → getObjectSource
   searchObject → 构建 URL → getObjectSource
   ```

2. **配合使用**:
   ```
   getObjectSource → 编辑 → syntaxCheckCode → setObjectSource
   ```

3. **与 classIncludes 的关系**:
   - 类有多个包含文件，可能需要多次调用 `getObjectSource`

## 使用场景说明

### 场景 1: 读取类源代码
```json
// 步骤 1: 获取对象结构
{
  "tool": "objectStructure",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 步骤 2: 读取源代码
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}
```

### 场景 2: 读取程序源代码
```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/programs/programs/zmy_prog/source/main"
  }
}
```

### 场景 3: 读取 abapGit 对象
```json
{
  "tool": "getObjectSource",
  "arguments": {
    "objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_git_class/source/main",
    "gitUser": "username",
    "gitPassword": "password"
  }
}
```

### 场景 4: 批量读取
```json
// 对搜索结果批量读取源代码
// 注意：大量读取可能影响性能，建议分批处理
```

## 源代码 URL 格式

### 类 (Class)
```
/sap/bc/adt/oo/classes/{class_name}/source/main
示例: /sap/bc/adt/oo/classes/zcl_example/source/main
```

### 程序 (Program)
```
/sap/bc/adt/programs/programs/{program_name}/source/main
示例: /sap/bc/adt/programs/programs/zprog/source/main
```

### 接口 (Interface)
```
/sap/bc/adt/oo/interfaces/{interface_name}/source/main
示例: /sap/bc/adt/oo/interfaces/zif_example/source/main
```

### 函数组 (Function Group)
```
/sap/bc/adt/fugr/fugrs/{fugr_name}/source/main
示例: /sap/bc/adt/fugr/fugrs/zfg_example/source/main
```

### 函数模块 (Function Module)
```
/sap/bc/adt/fugr/fumodules/{fugr_name}/{module_name}
示例: /sap/bc/adt/fugr/fumodules/zfg_example/zfm_module
```

## 最佳实践

1. **使用 ADTClient.mainInclude()**: 从 objectStructure 结果中自动获取主包含文件 URL

2. **缓存源代码**: 对于不常变化的对象，可以缓存源代码

3. **批量处理**: 批量读取时注意性能，考虑分批处理

4. **错误处理**: 处理权限错误、对象不存在等异常情况

5. **abapGit 处理**: 对于 abapGit 对象，确保提供正确的凭据

## 完整工作流程示例

```json
// 完整的读取-编辑-保存流程

// 1. 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}

// 2. 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": "/sap/bc/adt/oo/classes/zcl_class/source/main"}}

// 3. 语法检查
{"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "..."}}

// 4. 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "/sap/bc/adt/oo/classes/zcl_class"}}

// 5. 保存源代码
{"tool": "setObjectSource", "arguments": {"objectSourceUrl": "...", "lockHandle": "...", "source": "..."}}

// 6. 激活对象
{"tool": "activateByName", "arguments": {"object": "ZCL_CLASS", "url": "..."}}

// 7. 解锁对象
{"tool": "unLock", "arguments": {"objectUrl": "...", "lockHandle": "..."}}
```

## 常见错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 404 Not Found | URL 不正确或对象不存在 | 检查 URL 格式和对象名称 |
| 403 Forbidden | 没有读取权限 | 检查用户权限 |
| abapGit 认证失败 | 缺少凭据或凭据错误 | 提供 gitUser 和 gitPassword |
| 源代码为空 | 对象没有源代码或 URL 错误 | 验证 URL 格式

