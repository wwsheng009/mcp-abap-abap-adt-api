# 处理器模块

本文档详细说明 MCP ABAP ADT API Server 中各个处理器模块的功能和职责。

## 处理器概览

服务器包含 25 个处理器模块，每个处理器负责一个特定领域的功能。

### 处理器总览

| # | 处理器 | 工具数 | 职责 |
|---|--------|--------|------|
| 1 | `AuthHandlers` | 3 | 身份验证（登录/登出/会话） |
| 2 | `ObjectHandlers` | 5 | 对象基本操作（搜索/结构/查找） |
| 3 | `TransportHandlers` | 15 | 传输管理完整生命周期 |
| 4 | `ObjectLockHandlers` | 2 | 对象锁定/解锁 |
| 5 | `ObjectSourceHandlers` | 2 | 源代码读写 |
| 6 | `ObjectManagementHandlers` | 3 | 对象激活和管理 |
| 7 | `ObjectRegistrationHandlers` | 3 | 对象注册和创建 |
| 8 | `NodeHandlers` | 2 | 节点内容和主程序 |
| 9 | `DiscoveryHandlers` | 7 | ADT 发现和类型信息 |
| 10 | `ClassHandlers` | 2 | 类专用操作（包含/组件） |
| 11 | `CodeAnalysisHandlers` | 15 | 代码分析（语法/补全/导航） |
| 12 | `PrettyPrinterHandlers` | 3 | ABAP 代码格式化 |
| 13 | `GitHandlers` | 10 | abapGit 完整集成 |
| 14 | `DdicHandlers` | 4 | 数据字典操作 |
| 15 | `ServiceBindingHandlers` | 3 | 服务绑定管理 |
| 16 | `QueryHandlers` | 2 | 数据库查询 |
| 17 | `FeedHandlers` | 2 | Feed 和系统 Dump |
| 18 | `DebugHandlers` | 13 | 调试器功能 |
| 19 | `RenameHandlers` | 3 | 重命名重构 |
| 20 | `AtcHandlers` | 10 | ATC 代码检查 |
| 21 | `TraceHandlers` | 10 | 性能追踪 |
| 22 | `RefactorHandlers` | 3 | 重构（提取方法） |
| 23 | `ObjectDeletionHandlers` | 1 | 对象删除 |
| 24 | `RevisionHandlers` | 1 | 版本历史 |

**总计**: 24 个处理器，121 个工具

## 详细说明

### 1. AuthHandlers - 身份验证处理器

**文件**: `src/handlers/AuthHandlers.ts`

**工具**:
- `login` - 登录到 SAP 系统
- `logout` - 从 SAP 系统登出
- `dropSession` - 清除本地会话缓存

**使用场景**:
- 初始化连接
- 用户切换
- 清理会话
- 错误恢复后重新认证

**代码示例**:
```typescript
// 登录
{ "tool": "login" }

// 登出
{ "tool": "logout" }

// 清除会话
{ "tool": "dropSession" }
```

### 2. ObjectHandlers - 对象操作处理器

**文件**: `src/handlers/ObjectHandlers.ts`

**工具**:
- `objectStructure` - 获取对象结构详情
- `searchObject` - 搜索 ABAP 对象
- `findObjectPath` - 查找对象在包层次结构中的路径
- `objectTypes` - 获取对象类型列表
- `reentranceTicket` - 获取再入票据（用于深度递归）

**典型工作流**:
1. 使用 `searchObject` 查找对象
2. 使用 `objectStructure` 获取对象详细信息
3. 使用 `findObjectPath` 了解对象在包结构中的位置

### 3. TransportHandlers - 传输管理处理器

**文件**: `src/handlers/TransportHandlers.ts`

**工具数量**: 15个

**工具**:
- `transportInfo` - 获取对象传输信息
- `createTransport` - 创建新传输请求
- `hasTransportConfig` - 检查系统是否支持传输配置
- `transportConfigurations` - 获取传输配置列表
- `getTransportConfiguration` - 获取特定传输配置
- `setTransportsConfig` - 设置传输配置
- `createTransportsConfig` - 创建传输配置
- `userTransports` - 获取用户的传输列表
- `transportsByConfig` - 按配置获取传输
- `transportDelete` - 删除传输
- `transportRelease` - 释放传输
- `transportSetOwner` - 设置传输所有者
- `transportAddUser` - 添加传输用户
- `systemUsers` - 获取系统用户列表
- `transportReference` - 获取传输引用

**核心功能**:
- 传输请求的完整生命周期管理
- 传输配置的自定义
- 传输用户和所有者管理

### 4. ObjectLockHandlers - 对象锁定处理器

**文件**: `src/handlers/ObjectLockHandlers.ts`

**工具**:
- `lock` - 锁定对象（返回 lockHandle）
- `unLock` - 解锁对象（需要 lockHandle）

**重要机制**:
- lockHandle 是后续操作（如 `setObjectSource`, `unLock`）必需的
- 锁定会话可能会过期
- 其他用户可能锁定对象

### 5. ObjectSourceHandlers - 源代码处理器

**文件**: `src/handlers/ObjectSourceHandlers.ts`

**工具**:
- `getObjectSource` - 获取对象源代码
- `setObjectSource` - 设置对象源代码

**URL 规则**:
- 需要在对象 URL 后添加 `/source/main`
- 例如: `/sap/bc/adt/oo/classes/zmyclass/source/main`

### 6. ObjectManagementHandlers - 对象管理处理器

**文件**: `src/handlers/ObjectManagementHandlers.ts`

**工具**:
- `activateObjects` - 激活一个或多个对象
- `activateByName` - 按名称和 URL 激活对象
- `inactiveObjects` - 获取所有未激活对象

**激活策略**:
- 支持单个和批量激活
- 返回激活结果（成功/失败/错误消息）
- 处理依赖对象的激活

### 7. ObjectRegistrationHandlers - 对象注册处理器

**文件**: `src/handlers/ObjectRegistrationHandlers.ts`

**工具**:
- `objectRegistrationInfo` - 获取对象注册信息
- `validateNewObject` - 验证新对象配置
- `createObject` - 创建新 ABAP 对象

**支持的对象类型**:
- 程序 (PROG/P, PROG/I)
- 类 (CLAS/OC)
- 接口 (INTF/OI)
- 函数组 (FUGR/F, FUGR/FF, FUGR/I)
- 包 (DEVC/K)
- CDS 相关对象
- 等等

### 8. NodeHandlers - 节点处理器

**文件**: `src/handlers/NodeHandlers.ts`

**工具**:
- `nodeContents` - 获取节点内容（包层次结构）
- `mainPrograms` - 获取对象的主程序列表

**使用场景**:
- 浏览包结构
- 查找对象包含关系
- 获取主程序信息

### 9. DiscoveryHandlers - 发现处理器

**文件**: `src/handlers/DiscoveryHandlers.ts`

**工具**:
- `featureDetails` - 获取功能详情
- `collectionFeatureDetails` - 获取集合功能详情
- `findCollectionByUrl` - 通过 URL 查找集合
- `loadTypes` - 加载对象类型定义
- `adtDiscovery` - ADT 发现
- `adtCoreDiscovery` - 核心 ADT 发现
- `adtCompatibilityGraph` - 兼容性图

**用途**:
- 系统功能探测
- 兼容性检查
- 类型动态加载

### 10. ClassHandlers - 类处理器

**文件**: `src/handlers/ClassHandlers.ts`

**工具**:
- `classIncludes` - 获取类的包含文件（public/private/protected 等）
- `classComponents` - 获取类的组件（方法/属性/事件）

**返回信息**:
- 包含文件 URL 和类型
- 组件的完整层次结构
- 组件的可见性信息

### 11. CodeAnalysisHandlers - 代码分析处理器

**文件**: `src/handlers/CodeAnalysisHandlers.ts`

**工具数量**: 15个

**工具**:
- `syntaxCheckCode` - 执行 ABAP 语法检查
- `syntaxCheckCdsUrl` - CDS URL 语法检查
- `codeCompletion` - 获取代码补全建议
- `findDefinition` - 查找定义位置
- `usageReferences` - 查找使用引用
- `syntaxCheckTypes` - 语法检查类型
- `codeCompletionFull` - 完整代码补全
- `runClass` - 运行类
- `codeCompletionElement` - 代码补全元素信息
- `usageReferenceSnippets` - 引用代码片段
- `fixProposals` - 获取快速修复建议
- `fixEdits` - 应用快速修复
- `fragmentMappings` - 片段映射
- `abapDocumentation` - 获取 ABAP 关键字文档

**分析功能**:
- 静态代码分析
- 智能代码补全
- 代码导航
- 自动修复建议

### 12. PrettyPrinterHandlers - 代码格式化处理器

**文件**: `src/handlers/PrettyPrinterHandlers.ts`

**工具**:
- `prettyPrinterSetting` - 获取格式化设置（缩进、风格）
- `setPrettyPrinterSetting` - 设置格式化选项
- `prettyPrinter` - 格式化 ABAP 代码

**格式化风格**:
- `toLower` - 全小写
- `toUpper` - 全大写
- `keywordUpper` - 关键字大写
- `keywordLower` - 关键字小写
- 等等...

### 13. GitHandlers - Git 集成处理器

**文件**: `src/handlers/GitHandlers.ts`

**工具数量**: 10个

**工具**:
- `gitRepos` - 列出所有 abapGit 仓库
- `gitExternalRepoInfo` - 获取外部仓库信息
- `gitCreateRepo` - 创建新仓库
- `gitPullRepo` - 拉取远程变更
- `gitUnlinkRepo` - 取消链接仓库
- `stageRepo` - 暂存本地变更
- `pushRepo` - 推送到远程仓库
- `checkRepo` - 检查仓库
- `remoteRepoInfo` - 获取远程仓库信息 (已废弃)
- `switchRepoBranch` - 切换分支

**Git 操作**:
- 仓库管理
- 分支操作
- 暂存和提交
- 远程仓库交互

### 14. DdicHandlers - 数据字典处理器

**文件**: `src/handlers/DdicHandlers.ts`

**工具**:
- `annotationDefinitions` - 获取注解定义
- `ddicElement` - 获取 DDIC 元素（表/结构信息）
- `ddicRepositoryAccess` - DDIC 仓库访问
- `packageSearchHelp` - 包搜索帮助

**用途**:
- 查看表结构
- 获取字段信息
- 数据字典导航

### 15. ServiceBindingHandlers - 服务绑定处理器

**文件**: `src/handlers/ServiceBindingHandlers.ts`

**工具**:
- `publishServiceBinding` - 发布服务绑定
- `unPublishServiceBinding` - 取消发布
- `bindingDetails` - 获取服务绑定详情

**服务绑定类型**:
- OData V2 Web API
- OData V2 UI
- 其他服务类型

### 16. QueryHandlers - 查询处理器

**文件**: `src/handlers/QueryHandlers.ts`

**工具**:
- `tableContents` - 读取表内容
- `runQuery` - 执行 SQL 查询

**数据库操作**:
- 表数据读取
- 自定义 SQL 查询
- 结果解码

### 17. FeedHandlers - Feed 处理器

**文件**: `src/handlers/FeedHandlers.ts`

**工具**:
- `feeds` - 获取信息源
- `dumps` - 获取系统 dump 列表

**监控功能**:
- 系统错误追踪
- 事件监控
- 性能数据收集

### 18. DebugHandlers - 调试处理器

**文件**: `src/handlers/DebugHandlers.ts`

**工具**:
- `debuggerSetBreakpoints` - 设置断点
- `debuggerListen` - 监听调试事件
- `debuggerAttach` - 附加到调试会话
- `debuggerStep` - 单步执行
- `debuggerStackTrace` - 调用栈
- `debuggerVariables` - 变量查看
- 等等...

**调试功能**:
- 断点管理
- 单步调试
- 变量检查
- 调用栈分析

### 19. RenameHandlers - 重命名处理器

**文件**: `src/handlers/RenameHandlers.ts`

**工具**:
- `renameEvaluate` - 评估重命名影响
- `renamePreview` - 预览重命名结果
- `renameExecute` - 执行重命名

**重构工作流**:
1. 评估影响范围
2. 预览变更
3. 执行重命名
4. 自动激活受影响对象

### 20. AtcHandlers - ATC 检查处理器

**文件**: `src/handlers/AtcHandlers.ts`

**工具**:
- `atcCustomizing` - ATC 自定义设置
- `createAtcRun` - 创建并运行 ATC 检查
- `atcWorklists` - 获取 ATC 工作列表
- `atcExemptProposal` - 获取豁免建议
- `atcRequestExemption` - 请求豁免批准
- 等等...

**代码质量**:
- 静态代码分析
- 最佳实践检查
- 代码审查自动化

### 21. TraceHandlers - 追踪处理器

**文件**: `src/handlers/TraceHandlers.ts`

**工具**:
- `tracesList` - 列出追踪
- `tracesHitList` - 获取命中列表
- `tracesDbAccess` - 数据库访问追踪
- `tracesStatements` - SQL 语句追踪
- `tracesSetParameters` - 设置追踪参数
- 等等...

**性能分析**:
- 执行时间追踪
- SQL 性能分析
- 数据库访问模式分析
- 性能瓶颈识别

### 22. RefactorHandlers - 重构处理器

**文件**: `src/handlers/RefactorHandlers.ts`

**工具**:
- `extractMethodEvaluate` - 评估方法提取
- `extractMethodPreview` - 预览提取结果
- `extractMethodExecute` - 执行方法提取

**重构操作**:
- 提取方法
- 评估影响
- 自动重构

### 23. ObjectDeletionHandlers - 对象删除处理器

**文件**: `src/handlers/ObjectDeletionHandlers.ts`

**工具**:
- `deleteObject` - 删除 ABAP 对象

**注意事项**:
- 需要先锁定对象
- 需要传输请求
- 删除操作不可逆

### 24. RevisionHandlers - 版本处理器

**文件**: `src/handlers/RevisionHandlers.ts`

**工具**:
- `revisions` - 获取对象的版本历史

**版本信息**:
- 版本号
- 创建日期
- 操作类型
- 作者信息
- 描述

## BaseHandler 基类

所有处理器都继承自 `BaseHandler`，提供的通用功能：

### 功能

1. **日志记录**
```typescript
this.logger.info('操作完成', { param: value })
this.logger.warn('警告信息')
this.logger.error('错误信息')
```

2. **指标收集**
```typescript
const metrics = this.getMetrics()
// { requestCount, successCount, errorCount, totalTime, averageTime }
```

3. **请求追踪**
```typescript
this.trackRequest(startTime, success)
```

4. **速率限制**
```typescript
this.checkRateLimit('client-id')
```

## 工具注册流程

每个 Handler 通过以下方式注册工具：

```typescript
// 1. 定义工具
getTools(): ToolDefinition[] {
  return [{
    name: 'toolName',
    description: 'Tool description',
    inputSchema: { /* JSON Schema */ }
  }];
}

// 2. 处理请求
async handle(toolName: string, args: any): Promise<any> {
  switch (toolName) {
    case 'toolName':
      return this.handleTool(args);
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
}

// 3. 在主服务器中注册
this.myHandlers = new MyHandler(this.adtClient);
```

## 工作流整合

### 典型的代码修改工作流

```
AuthHandlers.login()
  ↓
ObjectHandlers.searchObject()
  ↓
ObjectHandlers.objectStructure()
  ↓
ObjectSourceHandlers.getObjectSource()
  ↓
TransportHandlers.transportInfo()
  ↓
ObjectLockHandlers.lock()
  ↓
ObjectSourceHandlers.setObjectSource()
  ↓
CodeAnalysisHandlers.syntaxCheckCode()
  ↓
ObjectManagementHandlers.activateByName()
  ↓
ObjectLockHandlers.unLock()
```

### 调试工作流

```
DebugHandlers.debuggerSetBreakpoints()
  ↓
DebugHandlers.debuggerListen()
  ↓
DebugHandlers.debuggerAttach()
  ↓
DebugHandlers.debuggerStackTrace()
  ↓
DebugHandlers.debuggerVariables()
  → DebugHandlers.debuggerChildVariables()
  ↓
[执行操作]
  → DebugHandlers.debuggerStep()
  ↓
DebugHandlers.debuggerDeleteBreakpoints()
```

### Git 工作流

```
GitHandlers.gitRepos()
  ↓
GitHandlers.gitExternalRepoInfo()
  ↓
GitHandlers.gitCreateRepo()
  ↓
ObjectSourceHandlers.getObjectSource() / 修改代码
  ↓
GitHandlers.stageRepo()
  ↓
GitHandlers.pushRepo()
  ↓
ObjectManagementHandlers.activateByName()
```

## 扩展 Handler

### 添加新 Handler 步骤

1. 创建新的 Handler 类文件
2. 继承 `BaseHandler`
3. 实现 `getTools()` 方法
4. 实现 `handle()` 方法
5. 在 `index.ts` 中导入和注册
6. 添加工具路由

### Handler 最佳实践

1. **单一职责**: 每个 Handler 负责一个明确的功能领域
2. **错误处理**: 使用 `McpError` 标准化错误
3. **日志记录**: 记录关键操作和错误
4. **性能考虑**: 追踪请求性能
5. **类型安全**: 使用 TypeScript 类型定义

## 错误处理策略

### Handler 内部错误处理

```typescript
async handleTool(args: any): Promise<any> {
  const startTime = performance.now();
  
  try {
    // 验证参数
    if (!this.validateArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid parameters'
      );
    }
    
    // 执行操作
    const result = await this.adtclient.someMethod(args);
    
    this.trackRequest(startTime, true);
    return result;
    
  } catch (error) {
    this.trackRequest(startTime, false);
    
    // 根据错误类型处理
    if (error instanceof McpError) throw error;
    
    // 转换为 MCP 错误
    throw new McpError(
      ErrorCode.InternalError,
      error.message
    );
  }
}
```

## 相关文档

- [服务器架构](architecture.md) - 了解整体设计
- [工具参考](tools-reference.md) - 完整工具列表
- [开发指南](development.md) - 如何扩展 Handler
