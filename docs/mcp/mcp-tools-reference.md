# 工具参考

本文档提供所有可用 MCP 工具的快速参考。

## 工具分类

### 身份验证 (Authentication)
- `login` - 登录到 SAP 系统
- `logout` - 登出 SAP 系统
- `dropSession` - 清除会话缓存

### 对象操作 (Object Operations)
- `objectStructure` - 获取对象结构
- `searchObject` - 搜索对象
- `findObjectPath` - 查找对象路径
- `objectTypes` - 获取对象类型
- `reentranceTicket` - 获取再入票据

### 对象锁定 (Object Locking)
- `lock` - 锁定对象
- `unLock` - 解锁对象

### 源代码管理 (Source Code)
- `getObjectSource` - 获取对象源代码
- `setObjectSource` - 设置对象源代码

### 对象管理 (Object Management)
- `activateObjects` - 激活对象
- `activateByName` - 按名称激活对象
- `inactiveObjects` - 获取未激活对象

### 对象注册/创建 (Object Registration)
- `objectRegistrationInfo` - 获取注册信息
- `validateNewObject` - 验证新对象
- `createObject` - 创建新对象

### 节点操作 (Node Operations)
- `nodeContents` - 获取节点内容
- `mainPrograms` - 获取主程序

### 发现 (Discovery)
- `featureDetails` - 获取功能详情
- `collectionFeatureDetails` - 获取集合功能详情
- `findCollectionByUrl` - 通过URL查找集合
- `loadTypes` - 加载类型
- `adtDiscovery` - ADT 发现
- `adtCoreDiscovery` - 核心 ADT 发现
- `adtCompatibilityGraph` - 兼容性图

### 类操作 (Class Operations)
- `classIncludes` - 获取类包含文件
- `classComponents` - 获取类组件

### 代码分析 (Code Analysis)
- `syntaxCheckCode` - 语法检查
- `syntaxCheckCdsUrl` - CDS URL 语法检查
- `codeCompletion` - 代码补全
- `findDefinition` - 查找定义
- `usageReferences` - 查找引用
- `syntaxCheckTypes` - 语法检查类型
- `codeCompletionFull` - 完整代码补全
- `runClass` - 运行类
- `codeCompletionElement` - 代码补全元素信息
- `usageReferenceSnippets` - 引用代码片段
- `fixProposals` - 快速修复建议
- `fixEdits` - 应用快速修复
- `fragmentMappings` - 片段映射
- `abapDocumentation` - ABAP 文档

### 代码格式化 (Pretty Printer)
- `prettyPrinterSetting` - 获取格式化设置
- `setPrettyPrinterSetting` - 设置格式化选项
- `prettyPrinter` - 格式化代码

### 单元测试 (Unit Testing)
- `unitTestRun` - 运行单元测试
- `unitTestEvaluation` - 评估单元测试
- `unitTestOccurrenceMarkers` - 获取测试标记
- `createTestInclude` - 创建测试包含文件

### 传输管理 (Transport Management)
- `transportInfo` - 获取传输信息
- `createTransport` - 创建传输
- `hasTransportConfig` - 检查传输配置
- `transportConfigurations` - 获取传输配置
- `getTransportConfiguration` - 获取特定传输配置
- `setTransportsConfig` - 设置传输配置
- `createTransportsConfig` - 创建传输配置
- `userTransports` - 用户传输
- `transportsByConfig` - 按配置获取传输
- `transportDelete` - 删除传输
- `transportRelease` - 释放传输
- `transportSetOwner` - 设置传输所有者
- `transportAddUser` - 添加传输用户
- `systemUsers` - 系统用户
- `transportReference` - 传输引用

### Git 集成 (abapGit)
- `gitRepos` - Git 仓库列表
- `gitExternalRepoInfo` - 外部仓库信息
- `gitCreateRepo` - 创建 Git 仓库
- `gitPullRepo` - 拉取变更
- `gitUnlinkRepo` - 取消链接仓库
- `stageRepo` - 暂存变更
- `pushRepo` - 推送变更
- `checkRepo` - 检查仓库
- `remoteRepoInfo` - 远程仓库信息(已废弃)
- `switchRepoBranch` - 切换分支

### 数据字典 (DDIC)
- `annotationDefinitions` - 注解定义
- `ddicElement` - DDIC 元素
- `ddicRepositoryAccess` - DDIC 仓库访问
- `packageSearchHelp` - 包搜索帮助

### 服务绑定 (Service Bindings)
- `publishServiceBinding` - 发布服务绑定
- `unPublishServiceBinding` - 取消发布服务绑定
- `bindingDetails` - 服务绑定详情

### 数据库查询 (Database Queries)
- `tableContents` - 表内容
- `runQuery` - 运行查询

### Feed (Feeds)
- `feeds` - 信息源
- `dumps` - Dump 列表

### 调试器 (Debugger)
- `debuggerListeners` - 调试监听器
- `debuggerListen` - 监听调试事件
- `debuggerDeleteListener` - 删除监听器
- `debuggerSetBreakpoints` - 设置断点
- `debuggerDeleteBreakpoints` - 删除断点
- `debuggerAttach` - 附加到调试
- `debuggerSaveSettings` - 保存调试设置
- `debuggerStackTrace` - 调用栈
- `debuggerVariables` - 变量
- `debuggerChildVariables` - 子变量
- `debuggerStep` - 单步执行
- `debuggerGoToStack` - 跳转栈
- `debuggerSetVariableValue` - 设置变量值

### 重命名 (Rename Refactoring)
- `renameEvaluate` - 评估重命名
- `renamePreview` - 预览重命名
- `renameExecute` - 执行重命名

### ATC 检查 (ATC)
- `atcCustomizing` - ATC 自定义
- `atcCheckVariant` - ATC 检查变体
- `createAtcRun` - 创建 ATC 运行
- `atcWorklists` - ATC 工作列表
- `atcUsers` - ATC 用户
- `atcExemptProposal` - 豁免建议
- `atcRequestExemption` - 请求豁免
- `isProposalMessage` - 是否提案消息
- `atcContactUri` - ATC 联系 URI
- `atcChangeContact` - 更改联系人

### 性能追踪 (Traces)
- `tracesList` - 追踪列表
- `tracesListRequests` - 追踪请求列表
- `tracesHitList` - 追踪命中列表
- `tracesDbAccess` - 数据库访问追踪
- `tracesStatements` - SQL 语句追踪
- `tracesSetParameters` - 设置追踪参数
- `tracesCreateConfiguration` - 创建追踪配置
- `tracesDeleteConfiguration` - 删除追踪配置
- `tracesDelete` - 删除追踪

### 重构 (Refactoring)
- `extractMethodEvaluate` - 评估提取方法
- `extractMethodPreview` - 预览提取方法
- `extractMethodExecute` - 执行提取方法

### 版本控制 (Revisions)
- `revisions` - 版本历史

### 健康检查 (Health)
- `healthcheck` - 健康检查

## 常用工作流示例

### 查看并修改 ABAP 对象

```json
// 1. 登录
{"tool": "login"}

// 2. 搜索对象
{"tool": "searchObject", "arguments": {"query": "Z*", "objType": "CLAS"}}

// 3. 获取对象结构
{"tool": "objectStructure", "arguments": {"objectUrl": "..."}}

// 4. 读取源代码
{"tool": "getObjectSource", "arguments": {"objectSourceUrl": ".../source/main"}}

// 5. 获取传输信息
{"tool": "transportInfo", "arguments": {"objSourceUrl": "..."}}

// 6. 锁定对象
{"tool": "lock", "arguments": {"objectUrl": "..."}}

// 7. 修改源代码
{"tool": "setObjectSource", "arguments": {"objectSourceUrl": "...", "source": "...", "lockHandle": "..."}}

// 8. 语法检查
{"tool": "syntaxCheckCode", "arguments": {"url": "...", "code": "..."}}

// 9. 激活对象
{"tool": "activateByName", "arguments": {"object": "...", "url": "..."}}

// 10. 解锁对象
{"tool": "unLock", "arguments": {"objectUrl": "...", "lockHandle": "..."}}
```

### 运行单元测试

```json
// 运行测试
{"tool": "unitTestRun", "arguments": {"url": "..."}}
```

### 传输管理

```json
// 获取传输信息
{"tool": "transportInfo", "arguments": {"objSourceUrl": "..."}}

// 创建传输
{"tool": "createTransport", "arguments": {"objSourceUrl": "...", "REQUEST_TEXT": "...", "DEVCLASS": "..."}}

// 释放传输
{"tool": "transportRelease", "arguments": {"transportNumber": "..."}}
```

### 调试

```json
// 设置断点
{"tool": "debuggerSetBreakpoints", "arguments": {"breakpoints": ["..."]}}

// 监听调试
{"tool": "debuggerListen", "arguments": {}}

// 查看调用栈
{"tool": "debuggerStackTrace", "arguments": {}}

// 单步执行
{"tool": "debuggerStep", "arguments": {"steptype": "stepOver"}}
```

### Git 操作

```json
// 列出仓库
{"tool": "gitRepos"}

// 创建仓库
{"tool": "gitCreateRepo", "arguments": {"packageName": "...", "repourl": "..."}}

// 拉取
{"tool": "gitPullRepo", "arguments": {"repoId": "..."}}

// 推送
{"tool": "pushRepo", "arguments": {"repo": {...}, "staging": {...}"}}
```

### ATC 检查

```json
// 运行 ATC 检查
{"tool": "createAtcRun", "arguments": {"variant": "...", "mainUrl": "..."}}

// 获取结果
{"tool": "atcWorklists", "arguments": {"runResultId": "..."}}
```

## 参数快速参考

### 通用模式

#### 对象 URL 模式
- 程序: `/sap/bc/adt/programs/programs/{name}`
- 类: `/sap/bc/adt/oo/classes/{name}`
- 接口: `/sap/bc/adt/oo/interfaces/{name}`
- CDS 视图: `/sap/bc/adt/ddic/ddlx/sources/{name}`

#### 源代码 URL 模式
- 主程序: `{objectUrl}/source/main`

## 错误处理

所有工具可能返回以下错误格式：

```json
{
  "error": "Error message",
  "code": -32603
}
```

常见错误码：
- `32603` (`InternalError`) - 内部服务器错误
- `32601` (`MethodNotFound`) - 工具不存在
- `429` (`TooManyRequests`) - 速率限制超出

## 性能提示

1. **批量操作** - 尽量批量处理对象
2. **缓存查询** - 缓存对象类型、权限等不常变化的数据
3. **异步处理** - 对于长时间运行的操作，考虑分批处理
4. **限制结果** - 使用 `max` 参数限制返回结果数量

## 相关文档

- [快速开始](quickstart.md)
- [服务器架构](architecture.md)
- [安装和配置](installation.md)
